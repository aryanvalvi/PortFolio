const slugify = require("slugify")
const sanitizeHtml = require("sanitize-html")

// ── Slug ─────────────────────────────────────────────────────────────────────

function createBaseSlug(value, fallbackPrefix) {
  const base = slugify(value || "", { lower: true, strict: true, trim: true })
  return base || `${fallbackPrefix}-${Date.now()}`
}

async function generateUniqueSlug(modelDelegate, value, fallbackPrefix) {
  const base = createBaseSlug(value, fallbackPrefix)
  let candidate = base
  let counter = 1

  while (await modelDelegate.findUnique({ where: { slug: candidate } })) {
    candidate = `${base}-${counter}`
    counter++
  }

  return candidate
}

// ── Sanitize / Excerpt ────────────────────────────────────────────────────────

const SANITIZE_OPTIONS = {
  allowedTags: ["p","br","strong","em","u","s","blockquote","ul","ol","li","h1","h2","h3","h4","pre","code","img","a"],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "title"],
    code: ["class"],
    pre: ["class"],
  },
  allowedSchemes: ["http", "https", "data"],
  allowedSchemesByTag: { img: ["http", "https", "data"] },
}

function sanitizeBlogHtml(html) {
  return sanitizeHtml(html, SANITIZE_OPTIONS)
}

function makeExcerpt(html, title) {
  const text = sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, " ")
    .trim()

  if (!text) return `${title} blog post`
  if (text.length <= 180) return text
  return `${text.slice(0, 177).trim()}...`
}

module.exports = { generateUniqueSlug, sanitizeBlogHtml, makeExcerpt }
