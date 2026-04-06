const fs = require("fs/promises")
const path = require("path")
const {uploadToCloudinary, isCloudinaryConfigured} = require("../lib/cloudinary")

async function uploadImage(request, response, next) {
  try {
    if (!request.file) {
      response.status(400).json({message: "Please choose an image to upload."})
      return
    }

    const fileExtension = path.extname(request.file.originalname) || ".png"
    const safeFilename = `${Date.now()}-${Math.round(Math.random() * 1e9)}`

    if (isCloudinaryConfigured) {
      const uploadedAsset = await uploadToCloudinary(
        request.file.buffer,
        safeFilename
      )

      response.status(201).json({
        imageUrl: uploadedAsset.secure_url,
        provider: "cloudinary",
      })
      return
    }

    const uploadsDirectory = path.join(__dirname, "..", "..", "uploads")
    await fs.mkdir(uploadsDirectory, {recursive: true})

    const filename = `${safeFilename}${fileExtension}`
    await fs.writeFile(path.join(uploadsDirectory, filename), request.file.buffer)
    const imageUrl = `${request.protocol}://${request.get("host")}/uploads/${filename}`

    response.status(201).json({
      imageUrl,
      provider: "local",
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  uploadImage,
}
