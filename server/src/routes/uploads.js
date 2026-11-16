const { Router } = require("express")
const requireAuth = require("../middleware/auth")
const upload = require("../middleware/multer")
const handleImageUpload = require("../middleware/cloudinary")
const { uploadImage } = require("../controllers/uploadController")

const router = Router()

router.post("/image", requireAuth, upload.single("image"), handleImageUpload, uploadImage)

module.exports = router

