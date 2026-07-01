const prisma = require("../lib/prismaClient")
const { generateUniqueSlug } = require("../lib/prismaConfig")

const subjectInclude = {
  chapters: {
    orderBy: { name: "asc" },
    include: { _count: { select: { blogs: true } } },
  },
  _count: { select: { blogs: true, chapters: true } },
}

async function listSubjects(_req, res, next) {
  try {
    const subjects = await prisma.subject.findMany({
      orderBy: { name: "asc" },
      include: subjectInclude,
    })
    res.json({ subjects })
  } catch (err) {
    next(err)
  }
}

async function createSubject(req, res, next) {
  try {
    const existing = await prisma.subject.findFirst({
      where: { name: { equals: req.body.name } },
    })

    if (existing) {
      return res.status(409).json({ message: "That subject already exists." })
    }

    const slug = await generateUniqueSlug(prisma.subject, req.body.name, "subject")
    const subject = await prisma.subject.create({
      data: { name: req.body.name, description: req.body.description || null, slug },
      include: subjectInclude,
    })

    res.status(201).json({ subject })
  } catch (err) {
    next(err)
  }
}

module.exports = { listSubjects, createSubject }
