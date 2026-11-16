const { Router } = require("express")
const requireAuth = require("../middleware/auth")
const {
  listBlogs,
  listAdminBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog
} = require("../controllers/blogController")

const router = Router()

// Admin list route (must be before /:slug so "admin" is not treated as a slug)
router.get("/admin", requireAuth, listAdminBlogs)

// Public routes
router.get("/", listBlogs)
router.get("/:slug", getBlogBySlug)

// Protected CRUD routes
router.post("/", requireAuth, createBlog)
router.put("/:id", requireAuth, updateBlog)
router.delete("/:id", requireAuth, deleteBlog)

module.exports = router
