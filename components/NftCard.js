import { useState } from "react"
import AuctionNft from "./AuctionNft"

const NftCard = (props) => {

    const [price, setPrice] = useState()

    return (
        <div>
            <div className="border rounded-xl overflow-hidden h-fit">
                <img src={props.nft.image} />
                <div className="bg-red-100 p-2">
                    <p className="font-medium text-xl lg:text-2xl xl:text-3xl 2xl:text-5xl">{props.nft.name}</p>
                    <p className="text-lg xl:text-xl 2xl:text-2xl">{props.nft.desc}</p>
                </div>
                <div className="bg-green-100 p-2">
                    {props.pageName !== 'auctionedNfts' && (
                        <p className="text-xl">Price: {props.nft.price.toString()} MATIC</p>
                    )}
                    {props.pageName === 'index' && (
                        <button className="mt-2 py-1 w-full bg-yellow-200 text-md lg:text-lg xl:text-xl 2xl:text-2xl rounded-lg" onClick={() => props.buyNft(props.nft.tokenId, props.nft.price)}>BUY</button>
                    )}
                    {props.pageName === 'auctionedNfts' && (
                        <>
                            <p className="text-xl">Last Bid: {props.nft.lastBidPrice.toString()} MATIC</p>
                            <p className="text-xl">Quick Buy: {props.nft.quickBuyPrice.toString()} MATIC</p>
                            <input
                                className='text-white p-1 mt-1 rounded'
                                style={{ backgroundColor: '#111111' }}
                                placeholder="Set your price"
                                onChange={e => setPrice(e.target.value)}
                            />
                            <div className="flex gap-3">
                                <button className="mt-2 py-1 w-1/2 bg-yellow-200 text-md lg:text-lg xl:text-xl 2xl:text-2xl rounded-lg" onClick={() => props.placeBid(props.nft.tokenId, price)}>BID</button>
                                <button className="mt-2 py-1 w-1/2 bg-yellow-200 text-md lg:text-lg xl:text-xl 2xl:text-2xl rounded-lg" onClick={() => props.quickBuy(props.nft.tokenId)}>QUICK BUY</button>
                            </div>
                        </>
                    )}
                    {props.pageName === 'collections' && (
                        <>
                            <input
                                className='text-white p-1 mt-1 rounded'
                                style={{ backgroundColor: '#111111' }}
                                placeholder="Set your price"
                                onChange={e => setPrice(e.target.value)}
                            />
                            <button className="mt-2 py-1 w-full bg-yellow-200 text-md lg:text-lg xl:text-xl 2xl:text-2xl rounded-lg" onClick={() => props.reSellToken(props.nft.tokenId, price)}>RESELL</button>
                        </>
                    )}
                    {props.pageName === 'dashboard' && (
                        <>
                            <p className="text-xl">Status: {props.nft.approvedStatus === 0 ? 'Pending' : props.nft.approvedStatus === 2 ? 'Approved' : 'Declined'}</p>
                            {/* add a popup option for auction and provide proper args in function */}
                            <AuctionNft nft={props.nft} setTokenForAuction={props.setTokenForAuction} />
                            {/* <button  onClick={() => props.setTokenForAuction(props.nft.tokenId, 'missing arg')}>AUCTION</button> */}
                            {!props.nft.isAuctioned && (
                                <button className="mt-2 py-1 w-full bg-yellow-200 text-md lg:text-lg xl:text-xl 2xl:text-2xl rounded-lg" onClick={() => props.removeListing(props.nft.tokenId)}>REMOVE LISTING</button>
                            )}
                        </>
                    )}
                    {props.pageName === 'requests' && (
                        <div className="flex gap-3">
                            <button className="mt-2 py-1 w-1/2 bg-yellow-200 text-md lg:text-lg xl:text-xl 2xl:text-2xl rounded-lg" onClick={() => props.updateTokenStatus(props.nft.tokenId, 1)}>DECLINE</button>
                            <button className="mt-2 py-1 w-1/2 bg-yellow-200 text-md lg:text-lg xl:text-xl 2xl:text-2xl rounded-lg" onClick={() => props.updateTokenStatus(props.nft.tokenId, 2)}>APPROVE</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default NftCard;