import axios from "axios"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import Web3Modal from 'web3modal'

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
          price,
          tokenId: i.tokenId.toNumber(),
          name: metadata.name,
          desc: metadata.description,
          image: metadata.image
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

  async function buyNft(tokenId) {
    try {
      // if (typeof web3 == 'undefined') {
      //   throw "Metamask Wallet Not Found"
      // }
      const web3Modal = new Web3Modal()
      const connection = await web3Modal.connect()
      const provider = new ethers.providers.Web3Provider(connection)
      const signer = provider.getSigner()
      const contract = new ethers.Contract(nftMarketplaceAddress, NFTMarketplace.abi, signer)
      const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')
      setLoading(null)
      const transaction = await contract.buyToken(nft.tokenId, {
        value: price
      })
      await transaction.wait()
    }
    catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="bg-blue-200 flex">
      <div className="border rounded-xl overflow-hidden m-4">
        <img src="https://image.binance.vision/editor-uploads-original/9c15d9647b9643dfbc5e522299d13593.png" width={300} height={300} />
        <div className="bg-red-100">
          <p className="px-2 pt-2 text-xl">Bayc</p>
          <p className="px-2 pt-1 text-md">Bored ape yatch club</p>
          <p className="px-2 pt-1 text-xl">0.4 MATIC</p>
        </div>
        <button className="p-2 bg-yellow-200 w-full">Buy</button>
      </div>
    </div>
  )
}

