const slugify = require("slugify")

function createBaseSlug(value, fallbackPrefix) {
  const baseSlug = slugify(value || "", {
    lower: true,
    strict: true,
    trim: true,
  })

  if (baseSlug) {
    return baseSlug
  }

  return `${fallbackPrefix}-${Date.now()}`
}

async function generateUniqueSlug(modelDelegate, value, fallbackPrefix) {
  const baseSlug = createBaseSlug(value, fallbackPrefix)
  let candidate = baseSlug
  let counter = 1

  while (await modelDelegate.findUnique({where: {slug: candidate}})) {
    candidate = `${baseSlug}-${counter}`
    counter += 1
  }

  return candidate
}

module.exports = {
  generateUniqueSlug,
}
