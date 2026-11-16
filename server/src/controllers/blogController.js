const slugify = require("slugify")
const prisma = require("../lib/prismaClient")

function createSlug(text) {
  return slugify(text || "", { lower: true, strict: true, trim: true }) || `post-${Date.now()}`
}

function createExcerpt(html, fallbackTitle) {
  const text = (html || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
  if (!text) return fallbackTitle || "Blog post"
  return text.length <= 160 ? text : `${text.slice(0, 157)}...`
}

const blogInclude = {
  subject: true,
  module: true,
  author: {
    select: { id: true, name: true, email: true }
  }
}

function normalizeBlog(blog) {
  if (!blog) return null
  return {
    ...blog,
    chapter: blog.module, // backwards-compatibility alias
  }
}

// ── GET /api/blogs (Public blogs) ─────────────────────────────────────────────
async function listBlogs(req, res, next) {
  try {
    const blogs = await prisma.blog.findMany({
      where: { isPublished: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      include: blogInclude
    })

    res.json({ blogs: blogs.map(normalizeBlog) })
  } catch (err) {
    next(err)
  }
}

// ── GET /api/blogs/admin (All blogs for admin) ────────────────────────────────
async function listAdminBlogs(req, res, next) {
  try {
    const blogs = await prisma.blog.findMany({
      orderBy: [{ createdAt: "desc" }],
      include: blogInclude
    })

    res.json({ blogs: blogs.map(normalizeBlog) })
  } catch (err) {
    next(err)
  }
}

// ── GET /api/blogs/:slug (Single blog details) ────────────────────────────────
async function getBlogBySlug(req, res, next) {
  try {
    const { slug } = req.params

    const blog = await prisma.blog.findUnique({
      where: { slug },
      include: blogInclude
    })

    if (!blog || !blog.isPublished) {
      return res.status(404).json({ message: "Blog not found." })
    }

    res.json({ blog: normalizeBlog(blog) })
  } catch (err) {
    next(err)
  }
}

// ── POST /api/blogs (Create blog / topic) ─────────────────────────────────────
async function createBlog(req, res, next) {
  try {
    const {
      title,
      excerpt,
      subjectId,
      moduleId,
      chapterId, // legacy alias
      newModuleName,
      newChapterName, // legacy alias
      coverImage,
      contentHtml,
      contentJson,
      isPublished,
      order
    } = req.body

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Blog title is required." })
    }

    if (!subjectId) {
      return res.status(400).json({ message: "Subject is required." })
    }

    const subject = await prisma.subject.findUnique({ where: { id: subjectId } })
    if (!subject) {
      return res.status(404).json({ message: "Subject not found." })
    }

    // Determine target module
    let targetModuleId = moduleId || chapterId || null
    const desiredModuleName = (newModuleName || newChapterName || "").trim()

    if (desiredModuleName) {
      const moduleSlug = `${createSlug(desiredModuleName)}-${Date.now().toString().slice(-4)}`
      const newModule = await prisma.module.create({
        data: {
          name: desiredModuleName,
          slug: moduleSlug,
          subjectId
        }
      })
      targetModuleId = newModule.id
    }

    // Generate unique slug for blog
    let slug = createSlug(title)
    const existingSlug = await prisma.blog.findUnique({ where: { slug } })
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`
    }

    const publishState = isPublished ?? true

    const blog = await prisma.blog.create({
      data: {
        title: title.trim(),
        slug,
        excerpt: (excerpt && excerpt.trim()) || createExcerpt(contentHtml, title),
        coverImage: coverImage || null,
        contentHtml: contentHtml || "",
        contentJson: contentJson ? JSON.stringify(contentJson) : null,
        isPublished: publishState,
        publishedAt: publishState ? new Date() : null,
        order: typeof order === "number" ? order : 0,
        subjectId,
        moduleId: targetModuleId,
        authorId: req.user.id
      },
      include: blogInclude
    })

    res.status(201).json({ blog: normalizeBlog(blog) })
  } catch (err) {
    next(err)
  }
}

// ── PUT /api/blogs/:id (Update blog / topic) ──────────────────────────────────
async function updateBlog(req, res, next) {
  try {
    const { id } = req.params
    const {
      title,
      excerpt,
      subjectId,
      moduleId,
      chapterId,
      newModuleName,
      newChapterName,
      coverImage,
      contentHtml,
      contentJson,
      isPublished,
      order
    } = req.body

    const existingBlog = await prisma.blog.findUnique({ where: { id } })
    if (!existingBlog) {
      return res.status(404).json({ message: "Blog not found." })
    }

    const finalSubjectId = subjectId || existingBlog.subjectId

    let targetModuleId =
      moduleId !== undefined
        ? moduleId
        : chapterId !== undefined
        ? chapterId
        : existingBlog.moduleId

    const desiredModuleName = (newModuleName || newChapterName || "").trim()
    if (desiredModuleName) {
      const moduleSlug = `${createSlug(desiredModuleName)}-${Date.now().toString().slice(-4)}`
      const newModule = await prisma.module.create({
        data: {
          name: desiredModuleName,
          slug: moduleSlug,
          subjectId: finalSubjectId
        }
      })
      targetModuleId = newModule.id
    }

    const publishState = isPublished !== undefined ? isPublished : existingBlog.isPublished
    let publishedAt = existingBlog.publishedAt
    if (publishState && !publishedAt) {
      publishedAt = new Date()
    } else if (!publishState) {
      publishedAt = null
    }

    const blog = await prisma.blog.update({
      where: { id },
      data: {
        title: title ? title.trim() : existingBlog.title,
        excerpt: excerpt !== undefined ? excerpt : (contentHtml ? createExcerpt(contentHtml, title || existingBlog.title) : existingBlog.excerpt),
        coverImage: coverImage !== undefined ? coverImage : existingBlog.coverImage,
        contentHtml: contentHtml !== undefined ? contentHtml : existingBlog.contentHtml,
        contentJson: contentJson !== undefined ? JSON.stringify(contentJson) : existingBlog.contentJson,
        isPublished: publishState,
        publishedAt,
        order: typeof order === "number" ? order : existingBlog.order,
        subjectId: finalSubjectId,
        moduleId: targetModuleId
      },
      include: blogInclude
    })

    res.json({ blog: normalizeBlog(blog) })
  } catch (err) {
    next(err)
  }
}

// ── DELETE /api/blogs/:id (Delete blog / topic) ───────────────────────────────
async function deleteBlog(req, res, next) {
  try {
    const { id } = req.params

    const existingBlog = await prisma.blog.findUnique({ where: { id } })
    if (!existingBlog) {
      return res.status(404).json({ message: "Blog not found." })
    }

    await prisma.blog.delete({ where: { id } })
    res.json({ message: "Blog deleted successfully." })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  listBlogs,
  listAdminBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog
}
