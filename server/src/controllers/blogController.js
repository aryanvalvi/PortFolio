const {z} = require("zod")
const {prisma} = require("../lib/prisma")
const {generateUniqueSlug} = require("../lib/slug")
const {makeExcerpt, sanitizeBlogHtml} = require("../lib/sanitize")

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
const blogIdSchema = z.coerce.number().int().positive()

const blogInclude = {
  subject: true,
  chapter: true,
  author: {
    select: {id: true, name: true, email: true},
  },
}

async function resolveChapter(subjectId, payload) {
  const newChapterName = payload.newChapterName?.trim()

  if (newChapterName) {
    const existingChapter = await prisma.chapter.findFirst({
      where: {
        subjectId,
        name: {
          equals: newChapterName,
          mode: "insensitive",
        },
      },
    })

    if (existingChapter) {
      return existingChapter
    }

    const slug = await generateUniqueSlug(prisma.chapter, newChapterName, "chapter")

    return prisma.chapter.create({
      data: {
        name: newChapterName,
        slug,
        subjectId,
      },
    })
  }

  if (!payload.chapterId) {
    return null
  }

  const chapter = await prisma.chapter.findUnique({
    where: {id: payload.chapterId},
  })

  if (!chapter || chapter.subjectId !== subjectId) {
    const error = new Error("Chapter not found for the selected subject.")
    error.statusCode = 400
    throw error
  }

  return chapter
}

async function listPublishedBlogs(_request, response, next) {
  try {
    const blogs = await prisma.blog.findMany({
      where: {isPublished: true},
      orderBy: [{publishedAt: "desc"}, {createdAt: "desc"}],
      include: blogInclude,
    })

    response.json({blogs})
  } catch (error) {
    next(error)
  }
}

async function listAdminBlogs(_request, response, next) {
  try {
    const blogs = await prisma.blog.findMany({
      orderBy: [{createdAt: "desc"}],
      include: blogInclude,
    })

    response.json({blogs})
  } catch (error) {
    next(error)
  }
}

async function getPublishedBlogBySlug(request, response, next) {
  try {
    const blog = await prisma.blog.findUnique({
      where: {slug: request.params.slug},
      include: blogInclude,
    })

    if (!blog || !blog.isPublished) {
      response.status(404).json({message: "Blog not found."})
      return
    }

    response.json({blog})
  } catch (error) {
    next(error)
  }
}

async function createBlog(request, response, next) {
  try {
    const payload = blogSchema.parse(request.body)
    const subject = await prisma.subject.findUnique({
      where: {id: payload.subjectId},
    })

    if (!subject) {
      response.status(404).json({message: "Subject not found."})
      return
    }

    const chapter = await resolveChapter(payload.subjectId, payload)
    const slug = await generateUniqueSlug(prisma.blog, payload.title, "blog")
    const sanitizedHtml = sanitizeBlogHtml(payload.contentHtml)
    const excerpt = payload.excerpt || makeExcerpt(sanitizedHtml, payload.title)
    const isPublished = payload.isPublished ?? true

    const blog = await prisma.blog.create({
      data: {
        title: payload.title,
        slug,
        excerpt,
        subjectId: payload.subjectId,
        chapterId: chapter?.id || null,
        authorId: request.user.id,
        coverImage: payload.coverImage || null,
        contentHtml: sanitizedHtml,
        contentJson:
          payload.contentJson === undefined
            ? null
            : JSON.stringify(payload.contentJson),
        isPublished,
        publishedAt: isPublished ? new Date() : null,
      },
      include: blogInclude,
    })

    response.status(201).json({blog})
  } catch (error) {
    next(error)
  }
}

async function updateBlog(request, response, next) {
  try {
    const blogId = blogIdSchema.parse(request.params.id)
    const existingBlog = await prisma.blog.findUnique({
      where: {id: blogId},
    })

    if (!existingBlog) {
      response.status(404).json({message: "Topic not found."})
      return
    }

    const payload = blogSchema.parse(request.body)
    const subject = await prisma.subject.findUnique({
      where: {id: payload.subjectId},
    })

    if (!subject) {
      response.status(404).json({message: "Subject not found."})
      return
    }

    const chapter = await resolveChapter(payload.subjectId, payload)
    const sanitizedHtml = sanitizeBlogHtml(payload.contentHtml)
    const excerpt = payload.excerpt || makeExcerpt(sanitizedHtml, payload.title)
    const isPublished = payload.isPublished ?? existingBlog.isPublished

    const blog = await prisma.blog.update({
      where: {id: blogId},
      data: {
        title: payload.title,
        excerpt,
        subjectId: payload.subjectId,
        chapterId: chapter?.id || null,
        coverImage: payload.coverImage || null,
        contentHtml: sanitizedHtml,
        contentJson:
          payload.contentJson === undefined
            ? null
            : JSON.stringify(payload.contentJson),
        isPublished,
        publishedAt: isPublished ? existingBlog.publishedAt || new Date() : null,
      },
      include: blogInclude,
    })

    response.json({blog})
  } catch (error) {
    next(error)
  }
}

async function deleteBlog(request, response, next) {
  try {
    const blogId = blogIdSchema.parse(request.params.id)
    const existingBlog = await prisma.blog.findUnique({
      where: {id: blogId},
    })

    if (!existingBlog) {
      response.status(404).json({message: "Topic not found."})
      return
    }

    await prisma.blog.delete({
      where: {id: blogId},
    })

    response.json({message: "Topic deleted successfully."})
  } catch (error) {
    next(error)
  }
}

module.exports = {
  listPublishedBlogs,
  listAdminBlogs,
  getPublishedBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
}
