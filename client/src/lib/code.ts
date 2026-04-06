import highlight from "highlight.js/lib/core"
import bash from "highlight.js/lib/languages/bash"
import css from "highlight.js/lib/languages/css"
import javascript from "highlight.js/lib/languages/javascript"
import json from "highlight.js/lib/languages/json"
import sql from "highlight.js/lib/languages/sql"
import typescript from "highlight.js/lib/languages/typescript"
import xml from "highlight.js/lib/languages/xml"
import {createLowlight} from "lowlight"

const LANGUAGE_DEFINITIONS = {
  javascript,
  typescript,
  html: xml,
  xml,
  css,
  json,
  bash,
  sql,
}

const LANGUAGE_LABELS = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  html: "HTML",
  xml: "XML",
  css: "CSS",
  json: "JSON",
  bash: "Bash",
  sql: "SQL",
} as const

const LANGUAGE_ALIASES = {
  js: "javascript",
  ts: "typescript",
  sh: "bash",
  shell: "bash",
} as const

let hasRegisteredHighlightJs = false

export const codeLanguageOptions = Object.entries(LANGUAGE_LABELS).map(
  ([value, label]) => ({
    value,
    label,
  })
)

export function createCodeLowlight() {
  const lowlight = createLowlight()
  lowlight.register(LANGUAGE_DEFINITIONS)
  return lowlight
}

function normalizeCodeLanguage(language?: string | null) {
  if (!language) {
    return null
  }

  const normalized = language.toLowerCase().trim()

  return (
    LANGUAGE_ALIASES[normalized as keyof typeof LANGUAGE_ALIASES] || normalized
  )
}

function registerHighlightJs() {
  if (hasRegisteredHighlightJs) {
    return
  }

  Object.entries(LANGUAGE_DEFINITIONS).forEach(([language, definition]) => {
    highlight.registerLanguage(language, definition)
  })

  hasRegisteredHighlightJs = true
}

export function extractCodeLanguage(className?: string | null) {
  if (!className) {
    return null
  }

  const languageClass = className
    .split(/\s+/)
    .find(token => token.startsWith("language-"))

  return normalizeCodeLanguage(languageClass?.replace("language-", ""))
}

export function formatCodeLanguage(language?: string | null) {
  const normalized = normalizeCodeLanguage(language)

  if (!normalized) {
    return "Plain text"
  }

  return (
    LANGUAGE_LABELS[normalized as keyof typeof LANGUAGE_LABELS] ||
    normalized.charAt(0).toUpperCase() + normalized.slice(1)
  )
}

export function highlightCode(code: string, language?: string | null) {
  registerHighlightJs()

  const normalizedLanguage = normalizeCodeLanguage(language)

  if (normalizedLanguage && highlight.getLanguage(normalizedLanguage)) {
    return {
      html: highlight.highlight(code, {language: normalizedLanguage}).value,
      language: normalizedLanguage,
    }
  }

  const autoHighlighted = highlight.highlightAuto(code)

  return {
    html: autoHighlighted.value,
    language: normalizeCodeLanguage(autoHighlighted.language),
  }
}
