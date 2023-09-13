import axios from "axios"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import Web3Modal from "web3modal"
import NftCard from "../components/NftCard"

import NFTMarketplace from "../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json"
const nftMarketplaceAddress = process.env.NEXT_PUBLIC_NFT_MARKETPLACE_ADDRESS

export default function Collections() {

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
            console.log("contract", contract)
            const data = await contract.fetchOwnedTokens()
            console.log("data", data)
            const tokens = await Promise.all(data.map(async i => {
                const tokenURI = await contract.tokenURI(i.tokenId)
                const metadata = await axios.get(tokenURI)
                const token = {
                    price: i.price.toString(),
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

    async function reSellToken(tokenId, newPrice) {
        try {
            const contract = await getContract()
            const price = ethers.utils.parseUnits(newPrice, 'ether')
            let listingFee = await contract.MINTING_FEE()
            listingFee = listingFee.toString()
            const transaction = await contract.reSellToken(tokenId, price, { value: listingFee })
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
                    <p className="text-white text-2xl">No Nfts owned</p>
                )}
                {Boolean(nfts.length) && (
                    nfts.map((nft, i) => (
                        <NftCard key={i} nft={nft} reSellToken={reSellToken} pageName='collections' />
                    ))
                )}
            </div>
        </div >
    )
}
