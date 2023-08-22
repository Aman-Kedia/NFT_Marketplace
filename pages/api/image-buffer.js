import fs from 'fs'

export default function handler(req, res) {
  const buffer = fs.readFileSync('/home/amankedia1402/nft-marketplace/nft.png')
  res.status(200).json({ "buffer": buffer })
}
