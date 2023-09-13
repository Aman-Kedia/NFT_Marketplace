import axios from "axios"
import { ethers } from "ethers"
import { useEffect, useState } from "react"
import Web3Modal from "web3modal"
import { NFTStorage, File } from "nft.storage"

import NFTMarketplace from "../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json"
const API_KEY = process.env.NEXT_PUBLIC_IPFS_API_KEY
const client = new NFTStorage({ token: API_KEY })
const nftMarketplaceAddress = process.env.NEXT_PUBLIC_NFT_MARKETPLACE_ADDRESS

export default function Mint() {

    const [formInput, updateFormInput] = useState({
        name: "",
        description: "",
        price: "",
    });
    const [image, setImage] = useState(null)
    // const [imageBuffer, setImageBuffer] = useState(null)

    useEffect(() => {
        document.title = "Mint"
    }, [])

    const handleImageChange = async (e) => {
        e.preventDefault()
        const selectedImage = e.target.files[0]
        // setImage(selectedImage)
        const formData = new FormData()
        formData.append('image', selectedImage)
        const response = await axios.post('/api/process-image', {
            body: formData,
        })
        if (response.ok) {
            // const meta = await axios.get('http://20.207.204.243/api/image-buffer')
            // setImageBuffer(meta.data.buffer.data)
            // const file = new File(['/home/amankedia1402/NFT_Marketplace/nft.png'], 'nft', { type: 'image/png' })
            // const added = await client.storeBlob(file)
            // const added = await client.store({
            //   name: 'test',
            //   description: 'test description',
            //   image: file,
            // })
            // console.log(added)
            console.log("Image processed successfully.")
        } else {
            // Handle error, e.g., show an error message
            console.error('Error uploading and processing image')
        }
    }

    function validate() {

    }

    async function listToken(price, url) {
        try {
            const web3Modal = new Web3Modal()
            const connection = await web3Modal.connect()
            const provider = new ethers.providers.Web3Provider(connection)
            const signer = provider.getSigner()
            const contract = new ethers.Contract(nftMarketplaceAddress, NFTMarketplace.abi, signer)
            let listingFee = await contract.MINTING_FEE()
            listingFee = listingFee.toString()
            const transaction = await contract.mintToken(price, url, { value: listingFee })
            await transaction.wait()
        }
        catch (error) {
            console.log(error)
        }
    }

    return (
        <div className="dark:bg-slate-800">
            <div className="flex flex-col opacity-100" style={{ marginLeft: "5%", marginRight: "10%" }}>
                <p className="mt-12 text-left font-bold text-white text-3xl" style={{ fontFamily: "poppins" }}>Mint NFT</p>
                <p className="mt-6 text-left text-white text-base" style={{ fontFamily: "poppins" }}>Name</p>
                <input
                    className="mt-1 rounded p-2 text-white"
                    style={{ background: "#FFFFFF40 0% 0% no-repeat padding-box" }}
                    maxLength="20"
                    onChange={(e) =>
                        updateFormInput({ ...formInput, name: e.target.value })
                    }
                />

                <p className="mt-4 text-left text-white text-base" style={{ fontFamily: "poppins" }}>Description</p>
                <input
                    className="mt-1 rounded p-2 text-white"
                    style={{ background: "#FFFFFF40 0% 0% no-repeat padding-box" }}
                    maxLength="40"
                    onChange={(e) =>
                        updateFormInput({ ...formInput, description: e.target.value })
                    }
                />

                <p className="mt-4 text-left text-white text-base" style={{ fontFamily: "poppins" }}>Price</p>
                <input
                    className="mt-1 rounded p-2 text-white"
                    style={{ background: "#FFFFFF40 0% 0% no-repeat padding-box" }}
                    type="number"
                    onWheel={(e) => e.target.blur()}
                    placeholder="Asset Price in Matic between 0 and 1"
                    onChange={(e) =>
                        updateFormInput({ ...formInput, price: e.target.value })
                    }
                />

                <input
                    className="mt-6 uppercase text-[#FFFFFF]"
                    type="file"
                    accept="image/*"
                    name="Asset"
                    id="Asset"
                    onChange={handleImageChange}
                />

                {image && (
                    <img className="rounded mt-4" width="350" src={image} />
                )}

                <button
                    onClick={validate}
                    className="mt-8 mb-12 rounded uppercase p-3 font-medium border"
                    style={{ background: "transparent linear-gradient(90deg, #1929C1 0%, #0D1243 100%) 0% 0% no-repeat padding-box" }}
                >
                    Create Digital Asset
                </button>
            </div>
        </div>
    )
}
