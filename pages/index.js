import axios from "axios"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import Web3Modal from "web3modal"
import NftCard from "../components/NftCard"

import NFTMarketplace from "../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json"
const nftMarketplaceAddress = process.env.NEXT_PUBLIC_NFT_MARKETPLACE_ADDRESS

export default function Home() {

  const [nfts, setNfts] = useState([])

  useEffect(() => {
    loadNFTs()
  }, [])

  async function loadNFTs() {
    try {
      const provider = new ethers.providers.JsonRpcProvider("https://rpc-mumbai.maticvigil.com/")
      const contract = new ethers.Contract(nftMarketplaceAddress, NFTMarketplace.abi, provider)
      const data = await contract.fetchMarketTokens()
      const tokens = await Promise.all(data.map(async i => {
        const tokenURI = await contract.tokenURI(i.tokenId)
        const metadata = await axios.get(tokenURI)
        const price = ethers.utils.formatUnits(i.price.toString(), 'ether')
        const token = {
          price: price,
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

  async function buyNft(tokenId, nftPrice) {
    try {
      const web3Modal = new Web3Modal()
      const connection = await web3Modal.connect()
      const provider = new ethers.providers.Web3Provider(connection)
      const signer = provider.getSigner()
      const contract = new ethers.Contract(nftMarketplaceAddress, NFTMarketplace.abi, signer)
      const price = ethers.utils.parseUnits(nftPrice.toString(), 'ether')
      const transaction = await contract.buyToken(tokenId, {
        value: price
      })
      await transaction.wait()
    }
    catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="dark:bg-slate-800 flex p-4" style={{ minHeight: '89vh' }}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Boolean(!nfts.length) && (
          <p className="text-white text-2xl">No Nfts</p>
        )}
        {Boolean(nfts.length) && (
          nfts.map((nft, i) => (
            <NftCard key={i} nft={nft} buyNft={buyNft} pageName={'index'} />
          ))
        )}
      </div>
    </div >
  )
}
