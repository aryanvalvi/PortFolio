const express = require("express")
const {
  listPublishedBlogs,
  listAdminBlogs,
  getPublishedBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
} = require("../controllers/blogController")
const {requireAuth} = require("../middleware/auth")

const router = express.Router()

router.get("/", listPublishedBlogs)

router.get("/admin", requireAuth, listAdminBlogs)

router.get("/:slug", getPublishedBlogBySlug)

router.post("/", requireAuth, createBlog)
router.put("/:id", requireAuth, updateBlog)
router.delete("/:id", requireAuth, deleteBlog)

module.exports = router
