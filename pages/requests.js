import { useEffect, useState } from "react"
import { ethers } from "ethers"
import Web3Modal from "web3modal"

import NFTMarketplace from "../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json"
const nftMarketplaceAddress = process.env.NEXT_PUBLIC_NFT_MARKETPLACE_ADDRESS

export default function Requests() {

    const [nfts, setNfts] = useState([])
    const [isOwner, setIsOwner] = useState(true)

    useEffect(() => {
        loadRequests()
    }, [])

    async function getContract() {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(nftMarketplaceAddress, NFTMarketplace.abi, signer)
        const userAddress = await signer.getAddress()
        const contractOwnerAddress = await contract.i_owner()
        if (userAddress != contractOwnerAddress) {
            setIsOwner(false)
            return null
        };
        return contract
    }

    async function loadRequests() {
        try {
            const contract = await getContract()
            const data = await contract.fetchTokensForApproval()
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
            setNfts(tokens)
        }
        catch (error) {
            console.log(error)
        }
    }

    async function updateTokenRequests(tokenId, statusCode) {
        try {
            const contract = await getContract()
            const transaction = await contract.updateTokenStatus(tokenId, statusCode)
            await transaction.wait()
        }
        catch (error) {
            console.log(error)
        }
    }

    return (
        <div className="dark:bg-slate-800 flex p-4 min-h-screen">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* display proper message if not owner or no nft available */}
                {Boolean(!isOwner) && Boolean(!nfts.length) && (
                    <p className="text-white text-2xl">No Nfts</p>
                )}
                {Boolean(isOwner) && Boolean(nfts.length) && (
                    nfts.map((nft, i) => (
                        <NftCard key={i} nft={nft} updateTokenRequests={updateTokenRequests} pageName='requests' />
                    ))
                )}
            </div>
        </div >
    )
}
