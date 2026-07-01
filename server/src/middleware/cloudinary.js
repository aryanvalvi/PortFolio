const { v2: cloudinary } = require("cloudinary")
const streamifier = require("streamifier")
const fs = require("fs/promises")
const path = require("path")

const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
)

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
}

function uploadToCloudinary(buffer, filename) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "portfolio/blogs", public_id: filename, resource_type: "image" },
      (err, result) => (err ? reject(err) : resolve(result))
    )
    streamifier.createReadStream(buffer).pipe(stream)
  })
}

async function handleImageUpload(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please choose an image to upload." })
    }

    const safeFilename = `${Date.now()}-${Math.round(Math.random() * 1e9)}`

    if (isCloudinaryConfigured) {
      const result = await uploadToCloudinary(req.file.buffer, safeFilename)
      req.imageUrl = result.secure_url
      req.imageProvider = "cloudinary"
      return next()
    }

    const ext = path.extname(req.file.originalname) || ".png"
    const filename = `${safeFilename}${ext}`
    const uploadsDir = path.join(__dirname, "..", "..", "uploads")

    await fs.mkdir(uploadsDir, { recursive: true })
    await fs.writeFile(path.join(uploadsDir, filename), req.file.buffer)

    req.imageUrl = `${req.protocol}://${req.get("host")}/uploads/${filename}`
    req.imageProvider = "local"
    next()
  } catch (err) {
    next(err)
  }
}

module.exports = handleImageUpload
