"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import Container from "@/components/container"
import {
  type ApiBlog,
  apiRequest,
  formatDate,
  resolveAssetUrl,
} from "@/lib/api"
import { FiBookOpen, FiSearch, FiFolder, FiLayers, FiArrowRight, FiFileText } from "react-icons/fi"

type ModuleGroup = {
  key: string
  name: string
  description: string | null
  topics: ApiBlog[]
}

type SubjectGroup = {
  id: string | number
  name: string
  slug: string
  description: string | null
  modules: ModuleGroup[]
  standaloneTopics: ApiBlog[]
  totalTopics: number
}

function organizeLibrary(blogs: ApiBlog[]): SubjectGroup[] {
  const subjectMap = new Map<string, SubjectGroup>()

  blogs.forEach(blog => {
    const subjectId = String(blog.subject?.id || "other")
    const subjectName = blog.subject?.name || "General"
    const subjectSlug = blog.subject?.slug || "general"
    const subjectDesc = blog.subject?.description || null

    if (!subjectMap.has(subjectId)) {
      subjectMap.set(subjectId, {
        id: subjectId,
        name: subjectName,
        slug: subjectSlug,
        description: subjectDesc,
        modules: [],
        standaloneTopics: [],
        totalTopics: 0
      })
    }

    const group = subjectMap.get(subjectId)!
    group.totalTopics += 1

    const mod = blog.module || blog.chapter
    if (mod) {
      const moduleKey = String(mod.id || mod.slug || mod.name)
      let targetModule = group.modules.find(m => m.key === moduleKey)
      if (!targetModule) {
        targetModule = {
          key: moduleKey,
          name: mod.name,
          description: mod.description || null,
          topics: []
        }
        group.modules.push(targetModule)
      }
      targetModule.topics.push(blog)
    } else {
      group.standaloneTopics.push(blog)
    }
  })

  // Sort modules alphabetically
  const result = Array.from(subjectMap.values())
  result.forEach(s => {
    s.modules.sort((a, b) => a.name.localeCompare(b.name))
  })

  return result.sort((a, b) => a.name.localeCompare(b.name))
}

export default function BlogIndex() {
  const [blogs, setBlogs] = useState<ApiBlog[]>([])
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    let ignore = false

    async function loadBlogs() {
      try {
        const response = await apiRequest<{ blogs: ApiBlog[] }>("/blogs")
        if (!ignore) {
          setBlogs(response.blogs || [])
        }
      } catch (err) {
        if (!ignore) {
          setErrorMessage(err instanceof Error ? err.message : "Failed to load posts.")
        }
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    loadBlogs()
    return () => { ignore = true }
  }, [])

  const filteredBlogs = useMemo(() => {
    if (!searchQuery.trim()) return blogs
    const q = searchQuery.toLowerCase().trim()
    return blogs.filter(b =>
      b.title.toLowerCase().includes(q) ||
      b.excerpt?.toLowerCase().includes(q) ||
      b.subject?.name?.toLowerCase().includes(q) ||
      b.module?.name?.toLowerCase().includes(q) ||
      b.chapter?.name?.toLowerCase().includes(q)
    )
  }, [blogs, searchQuery])

  const subjects = useMemo(() => organizeLibrary(filteredBlogs), [filteredBlogs])

  const activeSubjects = useMemo(() => {
    if (selectedSubjectId === "all") return subjects
    return subjects.filter(s => String(s.id) === selectedSubjectId)
  }, [subjects, selectedSubjectId])

  const allSubjectTabs = useMemo(() => {
    const raw = organizeLibrary(blogs)
    return raw.map(s => ({
      id: String(s.id),
      name: s.name,
      count: s.totalTopics
    }))
  }, [blogs])

  return (
    <Container className="min-h-screen px-4 pb-20 pt-28 md:px-8 md:pt-36">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="max-w-6xl mx-auto space-y-10"
      >
        {/* ── Top Header ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-neutral-200/80 dark:border-neutral-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-neutral-200/60 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
              <FiBookOpen className="text-neutral-500" />
              <span>Developer Knowledge Hub</span>
            </div>
            <h1 className="mt-4 text-3xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Notes & Technical Guides
            </h1>
            <p className="mt-3 text-base text-neutral-600 dark:text-neutral-400 max-w-2xl">
              Organized by subjects and modules. Choose a module to read a single comprehensive guide or step through its sub-topics.
            </p>
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-80">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search topics, modules..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-white/70 dark:bg-neutral-900/70 backdrop-blur text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100 transition"
            />
          </div>
        </div>

        {/* ── Subject Filter Pills ────────────────────────────────────────────── */}
        {allSubjectTabs.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedSubjectId("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition cursor-pointer ${
                selectedSubjectId === "all"
                  ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-sm"
                  : "bg-neutral-200/60 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300/70 dark:hover:bg-neutral-700"
              }`}
            >
              All Subjects ({blogs.length})
            </button>
            {allSubjectTabs.map(sub => (
              <button
                key={sub.id}
                type="button"
                onClick={() => setSelectedSubjectId(sub.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition cursor-pointer flex items-center gap-1.5 ${
                  selectedSubjectId === sub.id
                    ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-sm"
                    : "bg-neutral-200/60 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300/70 dark:hover:bg-neutral-700"
                }`}
              >
                <span>{sub.name}</span>
                <span className="text-xs opacity-60">({sub.count})</span>
              </button>
            ))}
          </div>
        )}

        {/* ── Loading / Error / Empty ─────────────────────────────────────────── */}
        {isLoading && (
          <div className="py-20 text-center text-sm text-neutral-500 dark:text-neutral-400 animate-pulse">
            Loading your knowledge library...
          </div>
        )}

        {!isLoading && errorMessage && (
          <div className="rounded-3xl border border-rose-300 bg-rose-50/70 dark:bg-rose-950/30 p-6 text-sm text-rose-700 dark:text-rose-300">
            {errorMessage}
          </div>
        )}

        {!isLoading && !errorMessage && activeSubjects.length === 0 && (
          <div className="rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-800 p-12 text-center">
            <FiFolder className="mx-auto text-4xl text-neutral-400 mb-3" />
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">No topics found</h3>
            <p className="mt-1 text-sm text-neutral-500">
              {searchQuery ? `No posts matched "${searchQuery}".` : "Publish your first module and topics from the admin panel."}
            </p>
          </div>
        )}

        {/* ── Structured Subjects & Modules List ──────────────────────────────── */}
        {!isLoading && !errorMessage && activeSubjects.map(subject => (
          <section
            key={subject.id}
            className="rounded-[32px] border border-neutral-200/80 dark:border-neutral-800/80 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-sm p-6 md:p-8 space-y-8 shadow-sm"
          >
            {/* Subject Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-neutral-200/60 dark:border-neutral-800/60 pb-5">
              <div>
                <span className="text-xs font-bold tracking-widest text-neutral-400 uppercase">
                  Subject
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">
                  {subject.name}
                </h2>
                {subject.description && (
                  <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400 max-w-3xl">
                    {subject.description}
                  </p>
                )}
              </div>
              <span className="self-start md:self-auto text-xs px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-medium">
                {subject.totalTopics} {subject.totalTopics === 1 ? "article" : "articles"}
              </span>
            </div>

            {/* Modules inside Subject */}
            <div className="space-y-8">
              {subject.modules.map(mod => {
                const isSingleGuide = mod.topics.length === 1
                const singleBlog = mod.topics[0]

                return (
                  <div
                    key={mod.key}
                    className="rounded-3xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/40 p-5 md:p-6 space-y-5"
                  >
                    {/* Module Title Banner */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-sm">
                          <FiLayers />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                            {mod.name}
                          </h3>
                          {mod.description && (
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                              {mod.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                        isSingleGuide
                          ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50"
                          : "bg-neutral-200/80 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                      }`}>
                        {isSingleGuide ? "Single Comprehensive Guide" : `${mod.topics.length} Sub-topics`}
                      </span>
                    </div>

                    {/* CASE 1: Single Guide (No sub-topics) -> Clean Featured Card */}
                    {isSingleGuide && (
                      <Link
                        href={`/blog/${singleBlog.slug}`}
                        className="group flex flex-col md:flex-row gap-6 items-stretch rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 md:p-5 transition hover:border-neutral-400 dark:hover:border-neutral-600 hover:shadow-md"
                      >
                        {singleBlog.coverImage ? (
                          <div className="w-full md:w-64 h-40 md:h-auto rounded-xl overflow-hidden shrink-0">
                            <img
                              src={resolveAssetUrl(singleBlog.coverImage)}
                              alt={singleBlog.title}
                              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                            />
                          </div>
                        ) : (
                          <div className="w-full md:w-48 h-32 md:h-auto rounded-xl bg-neutral-200/50 dark:bg-neutral-800/50 flex items-center justify-center text-neutral-400 shrink-0">
                            <FiFileText className="text-3xl" />
                          </div>
                        )}

                        <div className="flex flex-col justify-between flex-1 py-1">
                          <div className="space-y-2">
                            <span className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                              {formatDate(singleBlog.publishedAt || singleBlog.createdAt)}
                            </span>
                            <h4 className="text-xl font-bold text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                              {singleBlog.title}
                            </h4>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
                              {singleBlog.excerpt}
                            </p>
                          </div>

                          <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-white">
                            <span>Read Complete Guide</span>
                            <FiArrowRight className="transition transform group-hover:translate-x-1" />
                          </div>
                        </div>
                      </Link>
                    )}

                    {/* CASE 2: Multiple Sub-topics -> Grid of numbered topic cards */}
                    {!isSingleGuide && (
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {mod.topics.map((topic, index) => (
                          <Link
                            key={topic.id}
                            href={`/blog/${topic.slug}`}
                            className="group flex flex-col justify-between rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 transition hover:-translate-y-1 hover:border-neutral-400 dark:hover:border-neutral-600 hover:shadow-md"
                          >
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs font-bold text-neutral-700 dark:text-neutral-300">
                                  {String(index + 1).padStart(2, "0")}
                                </span>
                                <span className="text-[11px] font-medium text-neutral-400">
                                  {formatDate(topic.publishedAt || topic.createdAt)}
                                </span>
                              </div>

                              {topic.coverImage && (
                                <div className="h-32 w-full rounded-xl overflow-hidden">
                                  <img
                                    src={resolveAssetUrl(topic.coverImage)}
                                    alt={topic.title}
                                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                  />
                                </div>
                              )}

                              <h4 className="text-base font-bold text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition line-clamp-2">
                                {topic.title}
                              </h4>

                              <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2">
                                {topic.excerpt}
                              </p>
                            </div>

                            <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                              <span>Read Topic</span>
                              <FiArrowRight className="transition transform group-hover:translate-x-1" />
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Standalone topics without a module */}
              {subject.standaloneTopics.length > 0 && (
                <div className="rounded-3xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/40 p-5 md:p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <FiFileText className="text-neutral-400" />
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                      Standalone Articles
                    </h3>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {subject.standaloneTopics.map(topic => (
                      <Link
                        key={topic.id}
                        href={`/blog/${topic.slug}`}
                        className="group flex flex-col justify-between rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 transition hover:-translate-y-1 hover:border-neutral-400 dark:hover:border-neutral-600 hover:shadow-md"
                      >
                        <div className="space-y-3">
                          <span className="text-[11px] font-medium text-neutral-400">
                            {formatDate(topic.publishedAt || topic.createdAt)}
                          </span>

                          {topic.coverImage && (
                            <div className="h-32 w-full rounded-xl overflow-hidden">
                              <img
                                src={resolveAssetUrl(topic.coverImage)}
                                alt={topic.title}
                                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                              />
                            </div>
                          )}

                          <h4 className="text-base font-bold text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition line-clamp-2">
                            {topic.title}
                          </h4>

                          <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2">
                            {topic.excerpt}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                          <span>Read Article</span>
                          <FiArrowRight className="transition transform group-hover:translate-x-1" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        ))}
      </motion.div>
    </Container>
  )
}
