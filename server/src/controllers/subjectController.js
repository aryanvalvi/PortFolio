const slugify = require("slugify")
const prisma = require("../lib/prismaClient")

function createSlug(text) {
  return slugify(text || "", { lower: true, strict: true, trim: true }) || `item-${Date.now()}`
}

const subjectInclude = {
  modules: {
    orderBy: { name: "asc" },
    include: {
      _count: { select: { blogs: true } }
    }
  },
  _count: { select: { blogs: true, modules: true } }
}

// ── GET /api/subjects (List all subjects with their modules) ─────────────────
async function listSubjects(req, res, next) {
  try {
    const subjects = await prisma.subject.findMany({
      orderBy: { name: "asc" },
      include: subjectInclude
    })

    // Backwards-compatibility: provide both `modules` and `chapters` so older client code doesn't break
    const normalized = subjects.map(s => ({
      ...s,
      chapters: s.modules,
      _count: {
        blogs: s._count?.blogs || 0,
        modules: s._count?.modules || 0,
        chapters: s._count?.modules || 0
      }
    }))

    res.json({ subjects: normalized })
  } catch (err) {
    next(err)
  }
}

// ── POST /api/subjects (Create a new subject) ─────────────────────────────────
async function createSubject(req, res, next) {
  try {
    const { name, description } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Subject name is required." })
    }

    const trimmedName = name.trim()
    const existing = await prisma.subject.findUnique({
      where: { name: trimmedName }
    })

    if (existing) {
      return res.status(409).json({ message: "That subject already exists." })
    }

    let slug = createSlug(trimmedName)
    const existingSlug = await prisma.subject.findUnique({ where: { slug } })
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`
    }

    const subject = await prisma.subject.create({
      data: {
        name: trimmedName,
        slug,
        description: description?.trim() || null
      },
      include: subjectInclude
    })

    res.status(201).json({
      subject: {
        ...subject,
        chapters: subject.modules
      }
    })
  } catch (err) {
    next(err)
  }
}

// ── GET /api/modules (List modules, optional ?subjectId=...) ─────────────────
async function listModules(req, res, next) {
  try {
    const { subjectId } = req.query
    const where = subjectId ? { subjectId } : {}

    const modules = await prisma.module.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        subject: { select: { id: true, name: true, slug: true } },
        _count: { select: { blogs: true } }
      }
    })

    res.json({ modules })
  } catch (err) {
    next(err)
  }
}

// ── POST /api/modules (Create a module under a subject) ──────────────────────
async function createModule(req, res, next) {
  try {
    const { name, description, subjectId } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Module name is required." })
    }

    if (!subjectId) {
      return res.status(400).json({ message: "Subject is required for this module." })
    }

    const trimmedName = name.trim()
    let slug = createSlug(trimmedName)
    const existingSlug = await prisma.module.findUnique({ where: { slug } })
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`
    }

    const moduleItem = await prisma.module.create({
      data: {
        name: trimmedName,
        slug,
        description: description?.trim() || null,
        subjectId
      },
      include: {
        subject: true,
        _count: { select: { blogs: true } }
      }
    })

    res.status(201).json({
      module: moduleItem,
      chapter: moduleItem // backwards compatibility
    })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  listSubjects,
  createSubject,
  listModules,
  createModule
}
