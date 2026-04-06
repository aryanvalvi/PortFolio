const {z} = require("zod")
const {prisma} = require("../lib/prisma")
const {generateUniqueSlug} = require("../lib/slug")

const subjectSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(240).optional().or(z.literal("")),
})

async function listSubjects(_request, response, next) {
  try {
    const subjects = await prisma.subject.findMany({
      orderBy: {name: "asc"},
      include: {
        chapters: {
          orderBy: {name: "asc"},
          include: {
            _count: {
              select: {blogs: true},
            },
          },
        },
        _count: {
          select: {blogs: true, chapters: true},
        },
      },
    })

    response.json({subjects})
  } catch (error) {
    next(error)
  }
}

async function createSubject(request, response, next) {
  try {
    const payload = subjectSchema.parse(request.body)
    const existingSubject = await prisma.subject.findFirst({
      where: {
        name: {
          equals: payload.name,
        },
      },
    })

    if (existingSubject) {
      response.status(409).json({message: "That subject already exists."})
      return
    }

    const slug = await generateUniqueSlug(prisma.subject, payload.name, "subject")
    const subject = await prisma.subject.create({
      data: {
        name: payload.name,
        description: payload.description || null,
        slug,
      },
      include: {
        chapters: {
          include: {
            _count: {
              select: {blogs: true},
            },
          },
        },
        _count: {
          select: {blogs: true, chapters: true},
        },
      },
    })

    response.status(201).json({subject})
  } catch (error) {
    next(error)
  }
}

module.exports = {
  listSubjects,
  createSubject,
}
