const { z } = require("zod")
const prisma = require("../lib/prismaClient")
const { generateUniqueSlug, sanitizeBlogHtml, makeExcerpt } = require("../lib/prismaConfig")

const blogIdSchema = z.coerce.number().int().positive()

const blogInclude = {
  subject: true,
  chapter: true,
  author: { select: { id: true, name: true, email: true } },
}

async function resolveChapter(subjectId, payload) {
  const newName = payload.newChapterName?.trim()

  if (newName) {
    const existing = await prisma.chapter.findFirst({
      where: { subjectId, name: { equals: newName, mode: "insensitive" } },
    })
    if (existing) return existing

    const slug = await generateUniqueSlug(prisma.chapter, newName, "chapter")
    return prisma.chapter.create({ data: { name: newName, slug, subjectId } })
  }

  if (!payload.chapterId) return null

  const chapter = await prisma.chapter.findUnique({ where: { id: payload.chapterId } })

  if (!chapter || chapter.subjectId !== subjectId) {
    const err = new Error("Chapter not found for the selected subject.")
    err.statusCode = 400
    throw err
  }

  return chapter
}

async function listBlogs(_req, res, next) {
  try {
    const blogs = await prisma.blog.findMany({
      where: { isPublished: true },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      include: blogInclude,
    })
    res.json({ blogs })
  } catch (err) {
    next(err)
  }
}

async function listAdminBlogs(_req, res, next) {
  try {
    const blogs = await prisma.blog.findMany({
      orderBy: [{ createdAt: "desc" }],
      include: blogInclude,
    })
    res.json({ blogs })
  } catch (err) {
    next(err)
  }
}

async function getBlogBySlug(req, res, next) {
  try {
    const blog = await prisma.blog.findUnique({
      where: { slug: req.params.slug },
      include: blogInclude,
    })

    if (!blog || !blog.isPublished) {
      return res.status(404).json({ message: "Blog not found." })
    }

    res.json({ blog })
  } catch (err) {
    next(err)
  }
}

async function createBlog(req, res, next) {
  try {
    const subject = await prisma.subject.findUnique({ where: { id: req.body.subjectId } })
    if (!subject) return res.status(404).json({ message: "Subject not found." })

    const chapter = await resolveChapter(req.body.subjectId, req.body)
    const slug = await generateUniqueSlug(prisma.blog, req.body.title, "blog")
    const contentHtml = sanitizeBlogHtml(req.body.contentHtml)
    const excerpt = req.body.excerpt || makeExcerpt(contentHtml, req.body.title)
    const isPublished = req.body.isPublished ?? true

    const blog = await prisma.blog.create({
      data: {
        title: req.body.title,
        slug,
        excerpt,
        subjectId: req.body.subjectId,
        chapterId: chapter?.id || null,
        authorId: req.user.id,
        coverImage: req.body.coverImage || null,
        contentHtml,
        contentJson: req.body.contentJson ? JSON.stringify(req.body.contentJson) : null,
        isPublished,
        publishedAt: isPublished ? new Date() : null,
      },
      include: blogInclude,
    })

    res.status(201).json({ blog })
  } catch (err) {
    next(err)
  }
}

async function updateBlog(req, res, next) {
  try {
    const blogId = blogIdSchema.parse(req.params.id)
    const existing = await prisma.blog.findUnique({ where: { id: blogId } })
    if (!existing) return res.status(404).json({ message: "Blog not found." })

    const subject = await prisma.subject.findUnique({ where: { id: req.body.subjectId } })
    if (!subject) return res.status(404).json({ message: "Subject not found." })

    const chapter = await resolveChapter(req.body.subjectId, req.body)
    const contentHtml = sanitizeBlogHtml(req.body.contentHtml)
    const excerpt = req.body.excerpt || makeExcerpt(contentHtml, req.body.title)
    const isPublished = req.body.isPublished ?? existing.isPublished

    const blog = await prisma.blog.update({
      where: { id: blogId },
      data: {
        title: req.body.title,
        excerpt,
        subjectId: req.body.subjectId,
        chapterId: chapter?.id || null,
        coverImage: req.body.coverImage || null,
        contentHtml,
        contentJson: req.body.contentJson ? JSON.stringify(req.body.contentJson) : null,
        isPublished,
        publishedAt: isPublished ? existing.publishedAt || new Date() : null,
      },
      include: blogInclude,
    })

    res.json({ blog })
  } catch (err) {
    next(err)
  }
}

async function deleteBlog(req, res, next) {
  try {
    const blogId = blogIdSchema.parse(req.params.id)
    const existing = await prisma.blog.findUnique({ where: { id: blogId } })
    if (!existing) return res.status(404).json({ message: "Blog not found." })

    await prisma.blog.delete({ where: { id: blogId } })
    res.json({ message: "Blog deleted successfully." })
  } catch (err) {
    next(err)
  }
}

module.exports = { listBlogs, listAdminBlogs, getBlogBySlug, createBlog, updateBlog, deleteBlog }
