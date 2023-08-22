import formidable from 'formidable'
import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { fileTypeFromBuffer } from 'file-type'
import { NFTStorage, File } from 'nft.storage'

const API_KEY = process.env.NEXT_PUBLIC_IPFS_API_KEY
const client = new NFTStorage({ token: API_KEY })

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end(); // Method Not Allowed
  }

  const form = formidable()
  form.parse(req, async (err, fields, files) => {
    try {
      if (err) {
        return res.status(500).json({ error: 'Image processing failed.' })
      }
      if (!files.image) {
        return res.status(400).json({ error: 'No image file provided.' })
      }
      const imgBuffer = fs.readFileSync(files.image[0].filepath)
      const fileType = await fileTypeFromBuffer(imgBuffer)
      if (!fileType || !fileType.mime.startsWith('image/')) {
        return res.status(400).json({ error: 'Inavlid file type.' })
      }
      const pngImageBuffer = await sharp(imgBuffer).toFormat('png', { quality: 30 }).toFile('nft.png')
    
      // const file = new File([pngImageBuffer], 'nft.png', { type: 'image/png' })
      // const cid = await client.storeBlob(file)

      res.status(200).json({ message: 'Image processed successfully.' })
    } catch(error) {
      console.log(error)
      return res.status(500).json({ error: 'Image processing failed.' })
    }
  })
}
