import axios from "axios"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import Web3Modal from "web3modal"
import NftCard from "../components/NftCard"

import NFTMarketplace from "../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json"
const nftMarketplaceAddress = process.env.NEXT_PUBLIC_NFT_MARKETPLACE_ADDRESS

export default function Dashboard() {

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
            const contract = await getContract()
            const data = await contract.fetchListedTokens()
            console.log(data)
            const tokens = await Promise.all(data.map(async i => {
                const tokenURI = await contract.tokenURI(i.tokenId)
                const metadata = await axios.get(tokenURI)
                const token = {
                    price: i.price.toString(),
                    tokenId: i.tokenId.toNumber(),
                    name: metadata.data.name,
                    desc: metadata.data.description,
                    image: metadata.data.image,
                    approvedStatus: i.approvedStatus.toNumber(),
                    auctionStatus: i.isAuctioned
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

    async function setTokenForAuction(tokenId, bPrice, qBPrice, days) {
        try {
            if (bPrice === 0 || qBPrice === 0 || days === 0) throw 'Invalid Input';
            const contract = await getContract()
            const basePrice = ethers.utils.parseUnits(bPrice, 'ether')
            const quickBuyPrice = ethers.utils.parseUnits(qBPrice, 'ether')
            let listingFee = await contract.MINTING_FEE()
            listingFee = listingFee.toString()
            const transaction = await contract.auctionToken(tokenId, basePrice, quickBuyPrice, days, { value: listingFee })
            await transaction.wait()
        }
        catch (error) {
            console.log(error)
        }
    }

    async function removeListing(tokenId) {
        try {
            const contract = await getContract()
            const transaction = await contract.removeTokenListing(tokenId)
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
                    <p className="text-white text-2xl">No Nfts listed</p>
                )}
                {Boolean(nfts.length) && (
                    nfts.map((nft, i) => (
                        <NftCard key={i} nft={nft} setTokenForAuction={setTokenForAuction} removeListing={removeListing} pageName='dashboard' />
                    ))
                )}
            </div>
        </div >
    )
}
