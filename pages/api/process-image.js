import formidable from 'formidable'
// import sharp from 'sharp'
// const { NFTStorage, File } = require('nft.storage')

export const config = {
  api: {
    bodyParser: false,
  },
}

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end(); // Method Not Allowed
  }
  const form = formidable()
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: 'Image processing failed!' })
    }
    // convert to png and upload to ipfs
    // const { image } = files
    console.log("adadvsdv", files)
    res.status(200).json({ message: 'Image processed!' })
  })
}
