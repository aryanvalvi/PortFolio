const { Router } = require("express")
const { getHealth } = require("../controllers/healthController")
const authRoutes = require("./auth")
const blogRoutes = require("./blogs")
const subjectRoutes = require("./subjects")
const uploadRoutes = require("./uploads")
const { listModules, createModule } = require("../controllers/subjectController")
const requireAuth = require("../middleware/auth")

const router = Router()

router.get("/health", getHealth)
router.use("/auth", authRoutes)
router.use("/blogs", blogRoutes)
router.use("/subjects", subjectRoutes)
router.use("/uploads", uploadRoutes)

// Direct /modules route convenience
router.get("/modules", listModules)
router.post("/modules", requireAuth, createModule)

module.exports = router
