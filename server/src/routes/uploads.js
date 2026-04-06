const express = require("express")
const multer = require("multer")
const {uploadImage} = require("../controllers/uploadController")
const {requireAuth} = require("../middleware/auth")

const router = express.Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 8 * 1024 * 1024,
  },
  fileFilter: (_request, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      callback(new Error("Only image uploads are allowed."))
      return
    }

    callback(null, true)
  },
})

router.post(
  "/image",
  requireAuth,
  upload.single("image"),
  uploadImage
)

module.exports = router
