"use client"

import DOMPurify from "dompurify"
import Link from "next/link"
import {useParams} from "next/navigation"
import {useEffect, useState, type MouseEvent} from "react"
import Container from "@/components/container"
import {
  extractCodeLanguage,
  formatCodeLanguage,
  highlightCode,
} from "@/lib/code"
import {
  type ApiBlog,
  apiRequest,
  formatDate,
  resolveAssetUrl,
} from "@/lib/api"

function normalizeCodeText(text: string) {
  return text.replace(/\u00a0/g, " ")
}

function scoreCodeLine(text: string) {
  const normalized = normalizeCodeText(text)
  const trimmed = normalized.trim()

  if (!trimmed) {
    return 0
  }

  let score = 0

  if (/^\s/.test(normalized)) {
    score += 1
  }

  if (
    /^\s*(const|let|var|function|if|else|for|while|switch|case|return|import|export|class|interface|type|async|await|try|catch|throw|new|SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|FROM|WHERE)\b/i.test(
      trimmed
    )
  ) {
    score += 3
  }

  if (/^\s*(\/\/|\/\*|\*\/|#include|#define|# |--)/.test(trimmed)) {
    score += 3
  }

  if (/[{}[\];]/.test(trimmed)) {
    score += 2
  }

  if (/\(|\)|=>|===|!==|&&|\|\||\.\w+\(/.test(trimmed)) {
    score += 1
  }

  if (/^[{}[\])(;,]+$/.test(trimmed)) {
    score += 2
  }

  if (/^[a-z_$][\w$]*\s*=/.test(trimmed)) {
    score += 1
  }

  return score
}

function shouldConvertParagraphGroup(paragraphs: HTMLParagraphElement[]) {
  const lines = paragraphs.map(paragraph =>
    normalizeCodeText(paragraph.textContent || "")
  )
  const nonEmptyLines = lines.filter(line => line.trim())
  const scores = nonEmptyLines.map(scoreCodeLine)
  const strongLines = scores.filter(score => score >= 2).length
  const totalScore = scores.reduce((sum, score) => sum + score, 0)

  if (nonEmptyLines.length < 2) {
    return false
  }

  return strongLines >= 2 && totalScore >= Math.max(5, nonEmptyLines.length * 2)
}

function convertCodeParagraphGroups(root: Element, document: Document) {
  const children = Array.from(root.children)
  let currentGroup: HTMLParagraphElement[] = []

  const flushGroup = () => {
    const trimmedGroup = [...currentGroup]

    while (
      trimmedGroup.length > 0 &&
      !(trimmedGroup[0].textContent || "").trim()
    ) {
      trimmedGroup.shift()
    }

    while (
      trimmedGroup.length > 0 &&
      !(trimmedGroup[trimmedGroup.length - 1].textContent || "").trim()
    ) {
      trimmedGroup.pop()
    }

    if (!shouldConvertParagraphGroup(trimmedGroup)) {
      currentGroup = []
      return
    }

    const code = document.createElement("code")
    code.textContent = trimmedGroup
      .map(paragraph => normalizeCodeText(paragraph.textContent || ""))
      .join("\n")

    const pre = document.createElement("pre")
    pre.append(code)

    trimmedGroup[0].before(pre)
    currentGroup.forEach(paragraph => paragraph.remove())
    currentGroup = []
  }

  children.forEach(child => {
    if (child.tagName !== "P") {
      flushGroup()
      return
    }

    const paragraph = child as HTMLParagraphElement
    const score = scoreCodeLine(paragraph.textContent || "")
    const isEmpty = !(paragraph.textContent || "").trim()

    if (score >= 2 || (currentGroup.length > 0 && (isEmpty || score >= 1))) {
      currentGroup.push(paragraph)
      return
    }

    flushGroup()
  })

  flushGroup()
}

function enhanceBlogHtml(html: string) {
  const sanitizedHtml = DOMPurify.sanitize(html, {
    ADD_ATTR: ["class"],
  })
  const parser = new DOMParser()
  const document = parser.parseFromString(
    `<div class="blog-html-root">${sanitizedHtml}</div>`,
    "text/html"
  )
  const root = document.body.firstElementChild

  if (!root) {
    return sanitizedHtml
  }

  convertCodeParagraphGroups(root, document)

  root.querySelectorAll("pre").forEach(pre => {
    const code = pre.querySelector("code")
    const currentCode = code || document.createElement("code")
    const rawCode = code?.textContent || pre.textContent || ""
    const codeLanguage = extractCodeLanguage(
      currentCode.getAttribute("class") || pre.getAttribute("class")
    )
    const highlighted = highlightCode(rawCode, codeLanguage)

    currentCode.innerHTML = highlighted.html
    currentCode.className = [currentCode.className, "hljs"].filter(Boolean).join(" ")

    if (!code) {
      pre.textContent = ""
      pre.append(currentCode)
    }

    const shell = document.createElement("div")
    shell.className = "code-block-shell not-prose"

    const toolbar = document.createElement("div")
    toolbar.className = "code-block-toolbar"

    const languageLabel = document.createElement("span")
    languageLabel.className = "code-block-language"
    languageLabel.textContent = formatCodeLanguage(
      codeLanguage || highlighted.language
    )

    const copyButton = document.createElement("button")
    copyButton.type = "button"
    copyButton.className = "code-copy-button"
    copyButton.setAttribute("data-copy-code", "true")
    copyButton.textContent = "Copy"

    toolbar.append(languageLabel, copyButton)
    pre.replaceWith(shell)
    shell.append(toolbar, pre)
  })

  return root.innerHTML
}

async function copyCodeToClipboard(code: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(code)
    return
  }

  const textArea = document.createElement("textarea")
  textArea.value = code
  textArea.setAttribute("readonly", "true")
  textArea.style.position = "absolute"
  textArea.style.left = "-9999px"
  document.body.append(textArea)
  textArea.select()
  document.execCommand("copy")
  textArea.remove()
}

export default function BlogDetails() {
  const params = useParams<{slug: string}>()
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug

  const [blog, setBlog] = useState<ApiBlog | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [renderedHtml, setRenderedHtml] = useState("")

  useEffect(() => {
    if (!slug) {
      return
    }

    let shouldIgnore = false

    const loadBlog = async () => {
      try {
        const response = await apiRequest<{blog: ApiBlog}>(`/blogs/${slug}`)

        if (!shouldIgnore) {
          setBlog(response.blog)
        }
      } catch (error) {
        if (!shouldIgnore) {
          setErrorMessage(
            error instanceof Error ? error.message : "Could not load this blog."
          )
        }
      } finally {
        if (!shouldIgnore) {
          setIsLoading(false)
        }
      }
    }

    loadBlog()

    return () => {
      shouldIgnore = true
    }
  }, [slug])

  useEffect(() => {
    if (!blog) {
      setRenderedHtml("")
      return
    }

    setRenderedHtml(enhanceBlogHtml(blog.contentHtml))
  }, [blog])

  const handleContentClick = async (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement
    const button = target.closest<HTMLButtonElement>("[data-copy-code]")

    if (!button) {
      return
    }

    const code = button
      .closest(".code-block-shell")
      ?.querySelector("pre code")
      ?.textContent

    if (!code) {
      return
    }

    try {
      await copyCodeToClipboard(code)
      button.dataset.copyState = "copied"
      button.textContent = "Copied"
    } catch {
      button.dataset.copyState = "error"
      button.textContent = "Failed"
    }

    window.setTimeout(() => {
      button.dataset.copyState = "idle"
      button.textContent = "Copy"
    }, 1800)
  }

  if (isLoading) {
    return (
      <Container className="min-h-screen px-4 pb-12 pt-24 md:px-8 md:pt-32">
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 text-sm text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
          Loading blog post...
        </div>
      </Container>
    )
  }

  if (errorMessage || !blog) {
    return (
      <Container className="min-h-screen px-4 pb-12 pt-24 md:px-8 md:pt-32">
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-900">
          <p className="text-sm text-secondary dark:text-secondary-dark">
            {errorMessage || "Blog not found."}
          </p>
          <Link
            href="/blog"
            className="mt-4 inline-flex rounded-full bg-neutral-900 px-4 py-2 text-sm text-white dark:bg-neutral-100 dark:text-neutral-900"
          >
            Back to blogs
          </Link>
        </div>
      </Container>
    )
  }

  return (
    <Container className="min-h-screen px-4 pb-16 pt-24 md:px-8 md:pt-32">
      <article className="mx-auto max-w-4xl">
        <Link
          href="/blog"
          className="inline-flex rounded-full border border-neutral-200 px-4 py-2 text-sm text-neutral-700 dark:border-neutral-700 dark:text-neutral-200"
        >
          Back to blogs
        </Link>

        <div className="mt-8 rounded-[32px] border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-900 md:p-10">
          <p className="text-xs uppercase tracking-[0.2em] text-secondary dark:text-secondary-dark">
            {blog.subject.name}
            {blog.chapter ? ` • ${blog.chapter.name}` : " • Independent topic"} •{" "}
            {formatDate(blog.publishedAt || blog.createdAt)}
          </p>
          <h1 className="mt-4 text-3xl font-semibold text-primary dark:text-primary-dark md:text-5xl">
            {blog.title}
          </h1>
          <p className="mt-4 text-base text-secondary dark:text-secondary-dark">
            {blog.excerpt}
          </p>
          <p className="mt-4 text-sm text-secondary dark:text-secondary-dark">
            Written by {blog.author.name}
          </p>

          {blog.coverImage && (
            <img
              src={resolveAssetUrl(blog.coverImage)}
              alt={blog.title}
              className="mt-8 h-auto w-full rounded-[28px] object-cover"
            />
          )}

          <div
            className="rich-content prose prose-neutral mt-10 max-w-none dark:prose-invert"
            onClick={handleContentClick}
            dangerouslySetInnerHTML={{__html: renderedHtml}}
          />
        </div>
      </article>
    </Container>
  )
}
