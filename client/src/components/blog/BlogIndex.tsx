"use client"

import Link from "next/link"
import {useEffect, useState} from "react"
import {motion} from "motion/react"
import Container from "@/components/container"
import {
  type ApiBlog,
  apiRequest,
  formatDate,
  resolveAssetUrl,
} from "@/lib/api"

type ChapterBucket = {
  key: string
  name: string
  slug: string
  description: string | null
  topics: ApiBlog[]
}

type SubjectBucket = {
  id: number
  name: string
  slug: string
  description: string | null
  chapters: ChapterBucket[]
}

const INDEPENDENT_TOPICS_KEY = "independent-topics"

function buildLibrary(blogs: ApiBlog[]) {
  const subjectMap = new Map<number, SubjectBucket>()

  blogs.forEach(blog => {
    const existingSubject = subjectMap.get(blog.subject.id) || {
      id: blog.subject.id,
      name: blog.subject.name,
      slug: blog.subject.slug,
      description: blog.subject.description,
      chapters: [],
    }

    let chapter = existingSubject.chapters.find(currentChapter =>
      blog.chapter
        ? currentChapter.key === String(blog.chapter.id)
        : currentChapter.key === `${INDEPENDENT_TOPICS_KEY}-${blog.subject.id}`
    )

    if (!chapter) {
      chapter = blog.chapter
        ? {
            key: String(blog.chapter.id),
            name: blog.chapter.name,
            slug: blog.chapter.slug,
            description: blog.chapter.description,
            topics: [],
          }
        : {
            key: `${INDEPENDENT_TOPICS_KEY}-${blog.subject.id}`,
            name: "Independent topics",
            slug: INDEPENDENT_TOPICS_KEY,
            description:
              "Standalone topics that are not grouped under a chapter yet.",
            topics: [],
          }

      existingSubject.chapters.push(chapter)
    }

    chapter.topics.push(blog)
    subjectMap.set(blog.subject.id, existingSubject)
  })

  return [...subjectMap.values()]
    .map(subject => ({
      ...subject,
      chapters: subject.chapters.sort((firstChapter, secondChapter) => {
        if (firstChapter.slug === INDEPENDENT_TOPICS_KEY) {
          return 1
        }

        if (secondChapter.slug === INDEPENDENT_TOPICS_KEY) {
          return -1
        }

        return firstChapter.name.localeCompare(secondChapter.name)
      }),
    }))
    .sort((firstSubject, secondSubject) =>
      firstSubject.name.localeCompare(secondSubject.name)
    )
}

export default function BlogIndex() {
  const [blogs, setBlogs] = useState<ApiBlog[]>([])
  const [selectedSubjectSlug, setSelectedSubjectSlug] = useState("")
  const [selectedChapterKey, setSelectedChapterKey] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    let shouldIgnore = false

    const loadBlogs = async () => {
      try {
        const response = await apiRequest<{blogs: ApiBlog[]}>("/blogs")

        if (!shouldIgnore) {
          setBlogs(response.blogs)
        }
      } catch (error) {
        if (!shouldIgnore) {
          setErrorMessage(
            error instanceof Error ? error.message : "Could not load blogs."
          )
        }
      } finally {
        if (!shouldIgnore) {
          setIsLoading(false)
        }
      }
    }

    loadBlogs()

    return () => {
      shouldIgnore = true
    }
  }, [])

  useEffect(() => {
    const library = buildLibrary(blogs)

    if (library.length === 0) {
      setSelectedSubjectSlug("")
      setSelectedChapterKey("")
      return
    }

    const subject =
      library.find(currentSubject => currentSubject.slug === selectedSubjectSlug) ||
      library[0]

    if (subject.slug !== selectedSubjectSlug) {
      setSelectedSubjectSlug(subject.slug)
    }

    const chapter =
      subject.chapters.find(currentChapter => currentChapter.key === selectedChapterKey) ||
      subject.chapters[0]

    const nextChapterKey = chapter?.key || ""

    if (nextChapterKey !== selectedChapterKey) {
      setSelectedChapterKey(nextChapterKey)
    }
  }, [blogs, selectedChapterKey, selectedSubjectSlug])

  const library = buildLibrary(blogs)
  const selectedSubject =
    library.find(subject => subject.slug === selectedSubjectSlug) || library[0]
  const selectedChapter =
    selectedSubject?.chapters.find(chapter => chapter.key === selectedChapterKey) ||
    selectedSubject?.chapters[0]

  return (
    <Container className="min-h-screen px-4 pb-12 pt-24 md:px-8 md:pb-16 md:pt-32">
      <motion.div
        initial={{opacity: 0, filter: "blur(10px)", y: 10}}
        whileInView={{opacity: 1, filter: "blur(0px)", y: 0}}
        transition={{duration: 0.3, ease: "easeInOut"}}
      >
        <h1 className="text-3xl font-semibold text-primary dark:text-primary-dark md:text-5xl">
          Subject library
        </h1>
        <p className="mt-4 max-w-3xl text-sm text-secondary dark:text-secondary-dark md:text-base">
          Browse notes the way you study them: choose a subject, open a chapter,
          then pick the exact topic you want to read.
        </p>

        {isLoading && (
          <div className="mt-10 rounded-3xl border border-neutral-200 bg-white p-6 text-sm text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
            Loading your subject library...
          </div>
        )}

        {!isLoading && errorMessage && (
          <div className="mt-10 rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
            {errorMessage}
          </div>
        )}

        {!isLoading && !errorMessage && library.length === 0 && (
          <div className="mt-10 rounded-3xl border border-neutral-200 bg-white p-6 text-sm text-secondary dark:border-neutral-700 dark:bg-neutral-900 dark:text-secondary-dark">
            No topics yet. Login to the admin panel and publish your first one.
          </div>
        )}

        {!isLoading && !errorMessage && library.length > 0 && (
          <div className="mt-10 grid gap-6 xl:grid-cols-[0.95fr_0.95fr_1.2fr]">
            <section className="rounded-[28px] border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-900">
              <p className="text-xs uppercase tracking-[0.22em] text-secondary dark:text-secondary-dark">
                Subjects
              </p>
              <div className="mt-4 space-y-3">
                {library.map(subject => {
                  const isActive = subject.slug === selectedSubject?.slug
                  const topicCount = subject.chapters.reduce(
                    (count, chapter) => count + chapter.topics.length,
                    0
                  )

                  return (
                    <button
                      key={subject.id}
                      type="button"
                      onClick={() => {
                        setSelectedSubjectSlug(subject.slug)
                        setSelectedChapterKey(subject.chapters[0]?.key || "")
                      }}
                      className={`w-full rounded-3xl border p-4 text-left transition ${
                        isActive
                          ? "border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900"
                          : "border-neutral-200 text-neutral-700 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-200"
                      }`}
                    >
                      <p className="text-lg font-semibold">{subject.name}</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.18em] opacity-75">
                        {subject.chapters.length} chapter
                        {subject.chapters.length === 1 ? "" : "s"} • {topicCount} topic
                        {topicCount === 1 ? "" : "s"}
                      </p>
                      <p className="mt-3 text-sm opacity-80">
                        {subject.description || "No description added yet."}
                      </p>
                    </button>
                  )
                })}
              </div>
            </section>

            <section className="rounded-[28px] border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-900">
              <p className="text-xs uppercase tracking-[0.22em] text-secondary dark:text-secondary-dark">
                {selectedSubject ? `${selectedSubject.name} chapters` : "Chapters"}
              </p>

              {!selectedSubject && (
                <p className="mt-4 text-sm text-secondary dark:text-secondary-dark">
                  Select a subject to view its chapters.
                </p>
              )}

              {selectedSubject && (
                <div className="mt-4 space-y-3">
                  {selectedSubject.chapters.map(chapter => {
                    const isActive = chapter.key === selectedChapter?.key

                    return (
                      <button
                        key={chapter.key}
                        type="button"
                        onClick={() => setSelectedChapterKey(chapter.key)}
                        className={`w-full rounded-3xl border p-4 text-left transition ${
                          isActive
                            ? "border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900"
                            : "border-neutral-200 text-neutral-700 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-200"
                        }`}
                      >
                        <p className="text-base font-semibold">{chapter.name}</p>
                        <p className="mt-2 text-xs uppercase tracking-[0.18em] opacity-75">
                          {chapter.topics.length} topic
                          {chapter.topics.length === 1 ? "" : "s"}
                        </p>
                        <p className="mt-3 text-sm opacity-80">
                          {chapter.description || "Open this chapter to view its topics."}
                        </p>
                      </button>
                    )
                  })}
                </div>
              )}
            </section>

            <section className="rounded-[28px] border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-900">
              <p className="text-xs uppercase tracking-[0.22em] text-secondary dark:text-secondary-dark">
                {selectedChapter ? `${selectedChapter.name} topics` : "Topics"}
              </p>

              {selectedSubject && selectedChapter && (
                <div className="mt-4 rounded-3xl border border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-700 dark:bg-neutral-950/40">
                  <p className="text-sm font-medium text-primary dark:text-primary-dark">
                    {selectedSubject.name} / {selectedChapter.name}
                  </p>
                  <p className="mt-2 text-sm text-secondary dark:text-secondary-dark">
                    {selectedChapter.description ||
                      "Choose a topic below to open the full write-up."}
                  </p>
                </div>
              )}

              {!selectedChapter && (
                <p className="mt-4 text-sm text-secondary dark:text-secondary-dark">
                  Select a chapter to view its topics.
                </p>
              )}

              {selectedChapter && (
                <div className="mt-4 space-y-4">
                  {selectedChapter.topics.map(topic => (
                    <Link
                      key={topic.id}
                      href={`/blog/${topic.slug}`}
                      className="group block overflow-hidden rounded-[28px] border border-neutral-200 bg-white transition hover:-translate-y-1 hover:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900"
                    >
                      {topic.coverImage ? (
                        <img
                          src={resolveAssetUrl(topic.coverImage)}
                          alt={topic.title}
                          className="h-48 w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                        />
                      ) : (
                        <div className="flex h-32 items-end bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.14),_transparent_56%),linear-gradient(135deg,_#f8fafc,_#e2e8f0)] p-5 dark:bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.12),_transparent_56%),linear-gradient(135deg,_#111827,_#020617)]">
                          <span className="rounded-full bg-white/70 px-3 py-1 text-xs uppercase tracking-[0.2em] text-neutral-700 backdrop-blur dark:bg-white/10 dark:text-neutral-100">
                            {selectedChapter.name}
                          </span>
                        </div>
                      )}

                      <div className="space-y-3 p-6">
                        <p className="text-xs uppercase tracking-[0.2em] text-secondary dark:text-secondary-dark">
                          {selectedSubject?.name} • {formatDate(topic.publishedAt || topic.createdAt)}
                        </p>
                        <h2 className="text-xl font-semibold text-primary dark:text-primary-dark">
                          {topic.title}
                        </h2>
                        <p className="text-sm text-secondary dark:text-secondary-dark">
                          {topic.excerpt}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </motion.div>
    </Container>
  )
}
