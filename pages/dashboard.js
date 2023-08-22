import axios from "axios"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import Web3Modal from 'web3modal'

const nftMarketplaceAddress = process.env.NEXT_PUBLIC_NFT_MARKETPLACE_ADDRESS

export default function Dashboard() {

    const [nfts, setNfts] = useStateState([])

    useEffectfect(() => {
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
            const contract = getContract()
            const data = await contract.fetchListedTokens()
            const tokens = await Promise.all(data.map(async i => {
                const tokenURI = await contract.tokenURI(i.tokenId)
                const metadata = await axios.get(tokenURI)
                const price = ethers.utils.formatUnits(i.price.toString(), 'ether')
                const token = {
                    price,
                    tokenId: i.tokenId.toNumber(),
                    name: metadata.name,
                    desc: metadata.description,
                    image: metadata.image,
                    approvedStatus: i.approvedStatus.toNumber(),
                    auctionStatus: i.isAuctioned.toNumber()
                }
                return token
            }
            ))
            setNfts(tokens)
        }
        catch (error) {
            console.log(error)
        }
    }

    async function setTokenForAuction(tokenId, basePrice, days) {
        try {
            const contract = getContract()
            const price = ethers.utils.parseUnits(basePrice, 'ether')
            let listingFee = await contract.MINTING_FEE()
            listingFee = listingFee.toString()
            const transaction = await contract.auctionToken(tokenId, price, days, { value: listingFee })
            await transaction.wait()
        }
        catch (error) {
            console.log(error)
        }
    }

    async function removeListing(tokenId) {
        try {
            const contract = getContract()
            const transaction = await contract.removeTokenListing(tokenId)
            await transaction.wait()
        }
        catch (error) {
            console.log(error)
        }
    }

    return (
        <>
            Dashboard
        </>
    )
}
