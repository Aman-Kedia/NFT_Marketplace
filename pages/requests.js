import { useEffect, useState } from "react"

const nftMarketplaceAddress = process.env.NEXT_PUBLIC_NFT_MARKETPLACE_ADDRESS

export default function Requests() {

    const [requests, setRequests] = useState([])
    const [isOwner, setIsOwner] = useState(false)

    useEffect(() => {
        loadRequests()
    }, [])

    async function getContract() {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(nftMarketplaceAddress, NFTMarketplace.abi, signer)
        //check id platform owner of not
        return contract
    }

    async function loadRequests() {
        try {
            const contract = getContract()
            const data = await contract.fetchTokensForApproval()
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
            setRequests(tokens)
        }
        catch (error) {
            console.log(error)
        }
    }

    async function updateTokenRequests(tokenId, statusCode) {
        try {
            const contract = getContract()
            const transaction = await contract.updateTokenStatus(tokenId, statusCode)
            await transaction.wait()
        }
        catch (error) {
            console.log(error)
        }
    }

    return (
        <>
            Requests
        </>
    )
}
