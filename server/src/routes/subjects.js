const express = require("express")
const {
  listSubjects,
  createSubject,
} = require("../controllers/subjectController")
const {requireAuth} = require("../middleware/auth")

const router = express.Router()

router.get("/", listSubjects)

router.post("/", requireAuth, createSubject)

module.exports = router
