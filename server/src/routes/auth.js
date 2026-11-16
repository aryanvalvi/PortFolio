const { Router } = require("express")
const requireAuth = require("../middleware/auth")
const { login, getCurrentUser } = require("../controllers/authController")

const router = Router()

router.post("/login", login)
router.get("/me", requireAuth, getCurrentUser)

module.exports = router

