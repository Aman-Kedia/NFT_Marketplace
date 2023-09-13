import axios from "axios"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import Web3Modal from "web3modal"
import NftCard from "../components/NftCard"

import NFTMarketplace from "../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json"
const nftMarketplaceAddress = process.env.NEXT_PUBLIC_NFT_MARKETPLACE_ADDRESS

export default function Auctions() {
    const [nfts, setNfts] = useState([])

    useEffect(() => {
        loadNFTs()
    }, [])

    async function getContract() {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(nftMarketplaceAddress, NFTMarketplace.abi, signer)
        return contract
    }

    async function loadNFTs() {
        try {
            const provider = new ethers.providers.JsonRpcProvider("https://rpc-mumbai.maticvigil.com/")
            const contract = new ethers.Contract(nftMarketplaceAddress, NFTMarketplace.abi, provider)
            const data = await contract.fetchAuctionedTokens()
            const tokens = await Promise.all(data.map(async i => {
                const tokenURI = await contract.tokenURI(i.tokenId)
                const metadata = await axios.get(tokenURI)
                const token = {
                    lastBidPrice: i.lastBidPrice.toString(),
                    quickBuyPrice: i.quickBuyPrice.toString(),
                    tokenId: i.tokenId.toNumber(),
                    name: metadata.data.name,
                    desc: metadata.data.description,
                    image: metadata.data.image
                }
                return token
            }
            ))
            console.log(tokens)
            setNfts(tokens)
        }
        catch (error) {
            console.log(error)
        }
    }

    async function placeBid(tokenId, bidPrice) {
        try {
            const contract = await getContract()
            const price = ethers.utils.parseUnits(bidPrice, 'ether')
            const transaction = await contract.placeBids(tokenId, price, { value: price })
            await transaction.wait()
        }
        catch (error) {
            console.log(error)
        }
    }

    async function quickBuy(tokenId, quickBuyPrice) {
        try {
            const contract = await getContract()
            const price = ethers.utils.parseUnits(quickBuyPrice.toString(), 'ether')
            const transaction = await contract.quickBuyToken(tokenId, {
                value: price
            })
            await transaction.wait()
        }
        catch (error) {
            console.log(error)
        }
    }

    return (
        <div className="dark:bg-slate-800 flex p-4 min-h-screen">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Boolean(!nfts.length) && (
                    <p className="text-white text-2xl">No Nfts Auctioned</p>
                )}
                {Boolean(nfts.length) && (
                    nfts.map((nft, i) => (
                        <NftCard key={i} nft={nft} placeBid={placeBid} quickBuy={quickBuy} pageName='auctionedNfts' />
                    ))
                )}
            </div>
        </div >
    )
}
