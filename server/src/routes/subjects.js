const { Router } = require("express")
const requireAuth = require("../middleware/auth")
const {
  listSubjects,
  createSubject,
  listModules,
  createModule
} = require("../controllers/subjectController")

const router = Router()

// Subject routes
router.get("/", listSubjects)
router.post("/", requireAuth, createSubject)

// Module routes
router.get("/modules", listModules)
router.post("/modules", requireAuth, createModule)

module.exports = router
