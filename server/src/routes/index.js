const { Router } = require("express")
const { z } = require("zod")

const requireAuth = require("../middleware/auth")
const validate = require("../middleware/validate")
const upload = require("../middleware/multer")
const handleImageUpload = require("../middleware/cloudinary")

const { login, getCurrentUser, createAdmin } = require("../controllers/authController")
const { uploadImage } = require("../controllers/uploadController")
const { getHealth } = require("../controllers/healthController")
const { listSubjects, createSubject } = require("../controllers/subjectController")
const { listBlogs, listAdminBlogs, getBlogBySlug, createBlog, updateBlog, deleteBlog } = require("../controllers/blogController")

const router = Router()

// ── Schemas ───────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const adminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1).optional().default("Portfolio Admin"),
})

const subjectSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(240).optional().or(z.literal("")),
})

const blogSchema = z.object({
  title: z.string().trim().min(3).max(180),
  excerpt: z.string().trim().max(240).optional().or(z.literal("")),
  subjectId: z.coerce.number().int().positive(),
  chapterId: z.coerce.number().int().positive().nullable().optional(),
  newChapterName: z.string().trim().max(80).optional().or(z.literal("")),
  coverImage: z.string().trim().max(500).optional().or(z.literal("")),
  contentHtml: z.string().trim().min(20),
  contentJson: z.any().optional(),
  isPublished: z.boolean().optional(),
})

// ── Health ────────────────────────────────────────────────────────────────────

router.get("/health", getHealth)

// ── Auth ──────────────────────────────────────────────────────────────────────

router.post("/auth/login", validate(loginSchema), login)
router.get("/auth/me", requireAuth, getCurrentUser)
router.post("/auth/create-admin", validate(adminSchema), createAdmin) // delete once admin is set up

// ── Subjects ──────────────────────────────────────────────────────────────────

router.get("/subjects", listSubjects)
router.post("/subjects", requireAuth, validate(subjectSchema), createSubject)

// ── Blogs ─────────────────────────────────────────────────────────────────────

router.get("/blogs", listBlogs)
router.get("/blogs/admin", requireAuth, listAdminBlogs)
router.get("/blogs/:slug", getBlogBySlug)
router.post("/blogs", requireAuth, validate(blogSchema), createBlog)
router.put("/blogs/:id", requireAuth, validate(blogSchema), updateBlog)
router.delete("/blogs/:id", requireAuth, deleteBlog)

// ── Uploads ───────────────────────────────────────────────────────────────────

router.post("/uploads/image", requireAuth, upload.single("image"), handleImageUpload, uploadImage)

module.exports = router
