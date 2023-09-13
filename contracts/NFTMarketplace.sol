// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTMarketplace is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    mapping(uint256 => MintedToken) private idToMintedToken;
    mapping(uint256 => AuctionToken) private idToAuctionToken;
    mapping(uint256 => Bidder[]) private idToBidders;

    struct MintedToken {
        uint256 tokenId;
        uint256 price;
        uint256 approvedStatus; //0-minted, 1-rejected, 2-approved
        address payable seller;
        address payable creator;
        bool isAuctioned;
    }

    struct AuctionToken {
        uint256 tokenId;
        uint256 startTime;
        uint256 endTime;
        uint256 basePrice;
        uint256 lastBidPrice;
        uint256 quickBuyPrice;
    }

    struct Bidder {
        uint256 tokenId;
        uint256 price;
        address payable bidder;
    }

    uint256 private nextCheckTime;
    uint256 public constant MINTING_FEE = 0.0025 ether;
    address public immutable i_owner;

    constructor() ERC721("AKToken", "AK") {
        i_owner = payable(msg.sender);
        nextCheckTime = block.timestamp + 30 minutes;
    }

    function mintToken(
        uint256 _price,
        string memory _tokenURI
    ) external payable {
        require(_price > 0);
        require(msg.value == MINTING_FEE);

        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, _tokenURI);
        _setApprovalForAll(msg.sender, address(this), true);
        _transfer(msg.sender, address(this), tokenId);

        idToMintedToken[tokenId] = MintedToken(
            tokenId,
            _price,
            0,
            payable(msg.sender),
            payable(msg.sender),
            false
        );
    }

    function updateTokenStatus(
        uint256 _tokenId,
        uint256 _statusValue
    ) external {
        require(msg.sender == i_owner);
        idToMintedToken[_tokenId].approvedStatus = _statusValue;
    }

    function buyToken(uint256 _tokenId) external payable {
        uint256 price = idToMintedToken[_tokenId].price;

        require(msg.value == price);
        require(idToMintedToken[_tokenId].approvedStatus == 2);
        require(address(this) == _ownerOf(_tokenId));
        require(idToMintedToken[_tokenId].isAuctioned == false);

        _transfer(_ownerOf(_tokenId), msg.sender, _tokenId);

        uint256 royaltyFee = (price * 10) / 100;
        payable(idToMintedToken[_tokenId].creator).transfer(royaltyFee);
        payable(idToMintedToken[_tokenId].seller).transfer(price - royaltyFee);
    }

    function reSellToken(uint256 _tokenId, uint256 _price) external payable {
        require(_price > 0);
        require(msg.value == MINTING_FEE);
        require(msg.sender == _ownerOf(_tokenId));

        _transfer(msg.sender, address(this), _tokenId);
        idToMintedToken[_tokenId].seller = payable(msg.sender);
        idToMintedToken[_tokenId].price = _price;
    }

    function removeTokenListing(uint256 _tokenId) external {
        require(msg.sender == idToMintedToken[_tokenId].seller);
        require(address(this) == _ownerOf(_tokenId));
        require(idToMintedToken[_tokenId].approvedStatus == 2);

        _safeTransfer(address(this), msg.sender, _tokenId, "");
        idToMintedToken[_tokenId].seller = payable(address(0));
    }

    function auctionToken(
        uint256 _tokenId,
        uint256 _basePrice,
        uint256 _quickBuyPrice,
        uint256 _days
    ) external payable {
        require(idToMintedToken[_tokenId].approvedStatus == 2);
        require(_basePrice > 0);
        require(msg.value == MINTING_FEE);
        require(msg.sender == idToMintedToken[_tokenId].seller);
        require(address(this) == _ownerOf(_tokenId));
        require(_days >= 1);

        idToMintedToken[_tokenId].isAuctioned = true;

        idToAuctionToken[_tokenId] = AuctionToken(
            _tokenId,
            block.timestamp,
            block.timestamp + (_days * (1 days)),
            _basePrice,
            _basePrice,
            _quickBuyPrice
        );
    }

    function placeBids(uint256 _tokenId, uint256 _price) external payable {
        require(msg.value == _price);
        require(idToMintedToken[_tokenId].isAuctioned == true);
        require(_price > idToAuctionToken[_tokenId].lastBidPrice);
        require(msg.sender != idToMintedToken[_tokenId].seller);
        require(idToAuctionToken[_tokenId].endTime >= block.timestamp);

        idToBidders[_tokenId].push(
            Bidder(_tokenId, _price, payable(msg.sender))
        );
        idToAuctionToken[_tokenId].lastBidPrice = _price;
    }

    function quickBuyToken(uint256 _tokenId) external payable {
        uint256 price = idToAuctionToken[_tokenId].quickBuyPrice;

        require(idToAuctionToken[_tokenId].endTime >= block.timestamp);
        require(msg.value == price);
        require(idToMintedToken[_tokenId].isAuctioned == true);
        require(msg.sender != idToMintedToken[_tokenId].seller);

        for (uint256 i = 0; i < idToBidders[_tokenId].length; i++) {
            payable(idToBidders[_tokenId][i].bidder).transfer(
                idToBidders[_tokenId][i].price
            );
        }

        _transfer(_ownerOf(_tokenId), msg.sender, _tokenId);

        uint256 royaltyFee = (price * 10) / 100;
        payable(idToMintedToken[_tokenId].creator).transfer(royaltyFee);
        payable(idToMintedToken[_tokenId].seller).transfer(price - royaltyFee);

        idToMintedToken[_tokenId].isAuctioned = false;
        idToMintedToken[_tokenId].price = idToAuctionToken[_tokenId]
            .quickBuyPrice;

        delete idToAuctionToken[_tokenId];
        delete idToBidders[_tokenId];
    }

    function checkTokenAuction() external {
        require(block.timestamp > nextCheckTime);

        for (
            uint256 tokenId = 1;
            tokenId < _tokenIdCounter.current() + 1;
            tokenId++
        ) {
            if (
                _exists(tokenId) &&
                idToMintedToken[tokenId].isAuctioned == true &&
                _ownerOf(tokenId) == address(this)
            ) {
                if (block.timestamp > idToAuctionToken[tokenId].endTime) {
                    for (uint256 i = 0; i < idToBidders[tokenId].length; i++) {
                        if (
                            idToBidders[tokenId][i].price ==
                            idToAuctionToken[tokenId].lastBidPrice
                        ) {
                            _safeTransfer(
                                address(this),
                                idToBidders[tokenId][i].bidder,
                                tokenId,
                                ""
                            );
                            uint256 royaltyFee = (idToAuctionToken[tokenId]
                                .lastBidPrice * 10) / 100;
                            payable(idToMintedToken[tokenId].creator).transfer(
                                royaltyFee
                            );
                            payable(idToMintedToken[tokenId].seller).transfer(
                                idToAuctionToken[tokenId].lastBidPrice -
                                    royaltyFee
                            );
                        } else {
                            payable(idToBidders[tokenId][i].bidder).transfer(
                                idToBidders[tokenId][i].price
                            );
                        }
                    }

                    idToMintedToken[tokenId].isAuctioned = false;
                    idToMintedToken[tokenId].price = idToAuctionToken[tokenId]
                        .lastBidPrice;

                    delete idToAuctionToken[tokenId];
                    delete idToBidders[tokenId];
                }
            }
        }

        nextCheckTime = block.timestamp + 30 minutes;
    }

    function withdraw(uint256 _amount) external {
        require(msg.sender == i_owner);
        payable(i_owner).transfer(_amount);
    }

    function fetchMarketTokens() external view returns (MintedToken[] memory) {
        uint256 totalTokens = _tokenIdCounter.current();
        uint256 mintedTokens = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 1; i < totalTokens + 1; i++) {
            if (
                _exists(i) &&
                idToMintedToken[i].isAuctioned == false &&
                _ownerOf(i) == address(this) &&
                idToMintedToken[i].approvedStatus == 2
            ) {
                mintedTokens++;
            }
        }

        MintedToken[] memory tokens = new MintedToken[](mintedTokens);

        for (uint256 i = 1; i < totalTokens + 1; i++) {
            if (
                _exists(i) &&
                idToMintedToken[i].isAuctioned == false &&
                _ownerOf(i) == address(this) &&
                idToMintedToken[i].approvedStatus == 2
            ) {
                tokens[currentIndex] = idToMintedToken[i];
                currentIndex++;
            }
        }

        return tokens;
    }

    function fetchAuctionedTokens()
        external
        view
        returns (AuctionToken[] memory)
    {
        uint256 totalTokens = _tokenIdCounter.current();
        uint256 auctionedTokens = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 1; i < totalTokens + 1; i++) {
            if (
                _exists(i) &&
                idToMintedToken[i].isAuctioned == true &&
                _ownerOf(i) == address(this)
            ) {
                auctionedTokens++;
            }
        }

        AuctionToken[] memory tokens = new AuctionToken[](auctionedTokens);

        for (uint256 i = 1; i < totalTokens + 1; i++) {
            if (
                _exists(i) &&
                idToMintedToken[i].isAuctioned == true &&
                _ownerOf(i) == address(this)
            ) {
                tokens[currentIndex] = idToAuctionToken[i];
                currentIndex++;
            }
        }

        return tokens;
    }

    function fetchOwnedTokens() external view returns (MintedToken[] memory) {
        uint256 totalTokens = _tokenIdCounter.current();
        uint256 currentIndex = 0;

        MintedToken[] memory tokens = new MintedToken[](balanceOf(msg.sender));

        for (uint256 i = 1; i < totalTokens + 1; i++) {
            if (_exists(i) && _ownerOf(i) == msg.sender) {
                tokens[currentIndex] = idToMintedToken[i];
                currentIndex++;
            }
        }

        return tokens;
    }

    function fetchListedTokens() external view returns (MintedToken[] memory) {
        uint256 totalTokens = _tokenIdCounter.current();
        uint256 listedTokens = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 1; i < totalTokens + 1; i++) {
            if (
                _exists(i) &&
                (idToMintedToken[i].seller == msg.sender ||
                    idToMintedToken[i].creator == msg.sender)
            ) {
                listedTokens++;
            }
        }

        MintedToken[] memory tokens = new MintedToken[](listedTokens);

        for (uint256 i = 1; i < totalTokens + 1; i++) {
            if (
                _exists(i) &&
                (idToMintedToken[i].seller == msg.sender ||
                    idToMintedToken[i].creator == msg.sender)
            ) {
                tokens[currentIndex] = idToMintedToken[i];
                currentIndex++;
            }
        }

        return tokens;
    }

    function fetchTokensForApproval()
        external
        view
        returns (MintedToken[] memory)
    {
        require(msg.sender == i_owner);
        uint256 totalTokens = _tokenIdCounter.current();
        uint256 uncheckedTokens = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 1; i < totalTokens + 1; i++) {
            if (_exists(i) && idToMintedToken[i].approvedStatus == 0) {
                uncheckedTokens++;
            }
        }

        MintedToken[] memory tokens = new MintedToken[](uncheckedTokens);

        for (uint256 i = 1; i < totalTokens + 1; i++) {
            if (_exists(i) && idToMintedToken[i].approvedStatus == 0) {
                tokens[currentIndex] = idToMintedToken[i];
                currentIndex++;
            }
        }
        return tokens;
    }
}
