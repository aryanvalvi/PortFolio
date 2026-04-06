const sanitizeHtml = require("sanitize-html")

const SANITIZE_OPTIONS = {
  allowedTags: [
    "p",
    "br",
    "strong",
    "em",
    "u",
    "s",
    "blockquote",
    "ul",
    "ol",
    "li",
    "h1",
    "h2",
    "h3",
    "h4",
    "pre",
    "code",
    "img",
    "a",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "title"],
    code: ["class"],
    pre: ["class"],
  },
  allowedSchemes: ["http", "https", "data"],
  allowedSchemesByTag: {
    img: ["http", "https", "data"],
  },
}

function sanitizeBlogHtml(html) {
  return sanitizeHtml(html, SANITIZE_OPTIONS)
}

function stripHtml(html) {
  return sanitizeHtml(html, {
    allowedTags: [],
    allowedAttributes: {},
  })
}

function makeExcerpt(html, title) {
  const strippedText = stripHtml(html).replace(/\s+/g, " ").trim()

  if (!strippedText) {
    return `${title} blog post`
  }

  if (strippedText.length <= 180) {
    return strippedText
  }

  return `${strippedText.slice(0, 177).trim()}...`
}

module.exports = {
  sanitizeBlogHtml,
  makeExcerpt,
}
