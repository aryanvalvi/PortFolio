"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react"
import RichTextEditor from "@/components/admin/RichTextEditor"
import { useAuth } from "@/components/providers/AuthProvider"
import {
  type ApiBlog,
  type ApiSubject,
  type ApiModule,
  apiRequest,
  formatDate,
  resolveAssetUrl,
  uploadImage,
} from "@/lib/api"
import {
  FiEdit3,
  FiFolderPlus,
  FiList,
  FiPlus,
  FiTrash2,
  FiEye,
  FiCheck,
  FiUploadCloud,
  FiX,
  FiLayers,
  FiExternalLink
} from "react-icons/fi"

type EditorValue = {
  html: string
  json: unknown
}

type AdminTab = "write" | "structure" | "posts"

export default function AdminDashboard() {
  const router = useRouter()
  const { user, token, isCheckingSession, logout } = useAuth()

  // Navigation & Tabs
  const [activeTab, setActiveTab] = useState<AdminTab>("write")

  // Data
  const [subjects, setSubjects] = useState<ApiSubject[]>([])
  const [blogs, setBlogs] = useState<ApiBlog[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [statusMessage, setStatusMessage] = useState("")

  // Post Editor state
  const [editingBlogId, setEditingBlogId] = useState<string | number | null>(null)
  const [title, setTitle] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [selectedSubjectId, setSelectedSubjectId] = useState("")
  const [selectedModuleId, setSelectedModuleId] = useState("")
  const [newModuleName, setNewModuleName] = useState("")
  const [showNewModuleInput, setShowNewModuleInput] = useState(false)
  const [coverImage, setCoverImage] = useState("")
  const [isPublished, setIsPublished] = useState(true)
  const [editorInitialContent, setEditorInitialContent] = useState("")
  const [editorValue, setEditorValue] = useState<EditorValue>({ html: "", json: null })
  const [editorKey, setEditorKey] = useState(1)
  const [isSavingBlog, setIsSavingBlog] = useState(false)
  const [isUploadingCover, setIsUploadingCover] = useState(false)
  const [deletingBlogId, setDeletingBlogId] = useState<string | number | null>(null)

  // Subject / Module Manager state
  const [newSubjectName, setNewSubjectName] = useState("")
  const [newSubjectDescription, setNewSubjectDescription] = useState("")
  const [isCreatingSubject, setIsCreatingSubject] = useState(false)

  const [activeSubjectForModules, setActiveSubjectForModules] = useState<string>("")
  const [createModuleName, setCreateModuleName] = useState("")
  const [createModuleDesc, setCreateModuleDesc] = useState("")
  const [isCreatingModule, setIsCreatingModule] = useState(false)

  // Search in posts tab
  const [postSearch, setPostSearch] = useState("")

  // Load Dashboard Data
  useEffect(() => {
    if (isCheckingSession) return
    if (!user || !token) {
      setIsLoadingData(false)
      return
    }

    let ignore = false

    async function loadData() {
      try {
        setIsLoadingData(true)
        setErrorMessage("")

        const [subsRes, blogsRes] = await Promise.all([
          apiRequest<{ subjects: ApiSubject[] }>("/subjects"),
          apiRequest<{ blogs: ApiBlog[] }>("/blogs/admin", { token: token || undefined }),
        ])

        if (!ignore) {
          setSubjects(subsRes.subjects || [])
          setBlogs(blogsRes.blogs || [])

          if (subsRes.subjects?.length > 0) {
            const firstSubId = String(subsRes.subjects[0].id)
            setSelectedSubjectId(curr => curr || firstSubId)
            setActiveSubjectForModules(curr => curr || firstSubId)
          }
        }
      } catch (err) {
        if (!ignore) {
          setErrorMessage(err instanceof Error ? err.message : "Failed to load dashboard.")
        }
      } finally {
        if (!ignore) setIsLoadingData(false)
      }
    }

    loadData()
    return () => { ignore = true }
  }, [isCheckingSession, token, user])

  useEffect(() => {
    if (!isCheckingSession && !user) {
      router.replace("/login")
    }
  }, [isCheckingSession, router, user])

  // Get modules for currently selected subject in post form
  const availableModules = useMemo(() => {
    const sub = subjects.find(s => String(s.id) === selectedSubjectId)
    return sub?.modules || sub?.chapters || []
  }, [subjects, selectedSubjectId])

  // Reset selected module when subject changes
  const handleSubjectChange = (newSubId: string) => {
    setSelectedSubjectId(newSubId)
    setSelectedModuleId("")
    setShowNewModuleInput(false)
    setNewModuleName("")
  }

  // Inline image upload for rich text editor
  const handleInlineImageUpload = async (file: File) => {
    if (!token) throw new Error("Please log in to upload an image.")
    const result = await uploadImage(file, token)
    return result.imageUrl
  }

  // Cover image upload
  const handleCoverUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !token) return

    try {
      setIsUploadingCover(true)
      setErrorMessage("")
      const result = await uploadImage(file, token)
      setCoverImage(result.imageUrl)
      setStatusMessage("Cover image uploaded successfully.")
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Cover upload failed.")
    } finally {
      setIsUploadingCover(false)
      e.target.value = ""
    }
  }

  // Create Subject
  const handleCreateSubject = async (e: FormEvent) => {
    e.preventDefault()
    if (!token || !newSubjectName.trim()) return

    try {
      setIsCreatingSubject(true)
      setErrorMessage("")

      const res = await apiRequest<{ subject: ApiSubject }>("/subjects", {
        method: "POST",
        token,
        json: {
          name: newSubjectName.trim(),
          description: newSubjectDescription.trim() || undefined,
        },
      })

      setSubjects(prev => [...prev, res.subject])
      setSelectedSubjectId(String(res.subject.id))
      setActiveSubjectForModules(String(res.subject.id))
      setNewSubjectName("")
      setNewSubjectDescription("")
      setStatusMessage(`Subject "${res.subject.name}" created!`)
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to create subject.")
    } finally {
      setIsCreatingSubject(false)
    }
  }

  // Create Module in Structure tab
  const handleCreateModuleUnderSubject = async (e: FormEvent) => {
    e.preventDefault()
    if (!token || !createModuleName.trim() || !activeSubjectForModules) return

    try {
      setIsCreatingModule(true)
      setErrorMessage("")

      const res = await apiRequest<{ module: ApiModule }>("/modules", {
        method: "POST",
        token,
        json: {
          name: createModuleName.trim(),
          description: createModuleDesc.trim() || undefined,
          subjectId: activeSubjectForModules,
        },
      })

      // Update subject in local state
      setSubjects(prev =>
        prev.map(s => {
          if (String(s.id) === activeSubjectForModules) {
            const currentModules = s.modules || s.chapters || []
            return {
              ...s,
              modules: [...currentModules, res.module],
            }
          }
          return s
        })
      )

      setCreateModuleName("")
      setCreateModuleDesc("")
      setStatusMessage(`Module "${res.module.name}" added to subject!`)
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to create module.")
    } finally {
      setIsCreatingModule(false)
    }
  }

  // Start Editing a Blog
  const startEditingBlog = (blog: ApiBlog) => {
    setEditingBlogId(blog.id)
    setTitle(blog.title)
    setExcerpt(blog.excerpt || "")
    setSelectedSubjectId(String(blog.subject.id))
    const mod = blog.module || blog.chapter
    setSelectedModuleId(mod ? String(mod.id) : "")
    setShowNewModuleInput(false)
    setNewModuleName("")
    setCoverImage(blog.coverImage || "")
    setIsPublished(blog.isPublished)
    setEditorInitialContent(blog.contentHtml)
    setEditorValue({ html: blog.contentHtml, json: blog.contentJson })
    setEditorKey(k => k + 1)
    setActiveTab("write")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Cancel Editing
  const cancelEditing = () => {
    setEditingBlogId(null)
    setTitle("")
    setExcerpt("")
    setSelectedModuleId("")
    setShowNewModuleInput(false)
    setNewModuleName("")
    setCoverImage("")
    setIsPublished(true)
    setEditorInitialContent("")
    setEditorValue({ html: "", json: null })
    setEditorKey(k => k + 1)
  }

  // Save / Update Blog
  const handleSaveBlog = async (e: FormEvent) => {
    e.preventDefault()
    if (!token) return

    if (!title.trim()) {
      setErrorMessage("Please enter a title.")
      return
    }

    if (!selectedSubjectId) {
      setErrorMessage("Please select a subject.")
      return
    }

    if (!editorValue.html || !editorValue.html.trim()) {
      setErrorMessage("Please add some content to your post.")
      return
    }

    try {
      setIsSavingBlog(true)
      setErrorMessage("")
      setStatusMessage("")

      const payload = {
        title: title.trim(),
        excerpt: excerpt.trim() || undefined,
        subjectId: selectedSubjectId,
        moduleId: selectedModuleId || undefined,
        newModuleName: showNewModuleInput && newModuleName.trim() ? newModuleName.trim() : undefined,
        coverImage: coverImage || undefined,
        contentHtml: editorValue.html,
        contentJson: editorValue.json,
        isPublished,
      }

      const res = await apiRequest<{ blog: ApiBlog }>(
        editingBlogId ? `/blogs/${editingBlogId}` : "/blogs",
        {
          method: editingBlogId ? "PUT" : "POST",
          token,
          json: payload,
        }
      )

      // Refresh subjects list so module count is up to date
      const updatedSubs = await apiRequest<{ subjects: ApiSubject[] }>("/subjects")
      setSubjects(updatedSubs.subjects || [])

      setBlogs(prev => {
        if (editingBlogId) {
          return prev.map(b => (b.id === res.blog.id ? res.blog : b))
        }
        return [res.blog, ...prev]
      })

      setStatusMessage(editingBlogId ? "Topic updated successfully!" : "Topic published successfully!")
      cancelEditing()
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to save topic.")
    } finally {
      setIsSavingBlog(false)
    }
  }

  // Delete Blog
  const handleDeleteBlog = async (blogId: string | number) => {
    if (!token || !confirm("Are you sure you want to delete this topic?")) return

    try {
      setDeletingBlogId(blogId)
      await apiRequest(`/blogs/${blogId}`, {
        method: "DELETE",
        token,
      })

      setBlogs(prev => prev.filter(b => b.id !== blogId))
      if (editingBlogId === blogId) cancelEditing()
      setStatusMessage("Topic deleted.")
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to delete topic.")
    } finally {
      setDeletingBlogId(null)
    }
  }

  // Filtered blogs for Posts tab
  const filteredPosts = useMemo(() => {
    if (!postSearch.trim()) return blogs
    const q = postSearch.toLowerCase().trim()
    return blogs.filter(b =>
      b.title.toLowerCase().includes(q) ||
      b.subject?.name?.toLowerCase().includes(q) ||
      b.module?.name?.toLowerCase().includes(q) ||
      b.chapter?.name?.toLowerCase().includes(q)
    )
  }, [blogs, postSearch])

  if (isCheckingSession || isLoadingData) {
    return (
      <div className="py-24 text-center text-sm text-neutral-500 animate-pulse">
        Loading Admin Studio...
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* ── Studio Header Bar ────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-[28px] border border-neutral-200/80 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 backdrop-blur">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs uppercase font-bold tracking-widest text-neutral-400">
              Admin Studio
            </span>
          </div>
          <h1 className="mt-1 text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">
            Knowledge Base & Notes Manager
          </h1>
          <p className="mt-1 text-xs md:text-sm text-neutral-500">
            Signed in as <span className="font-semibold text-neutral-800 dark:text-neutral-200">{user.name}</span> ({user.email})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/blog"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            <span>View Public Hub</span>
            <FiExternalLink />
          </Link>
          <button
            type="button"
            onClick={logout}
            className="px-4 py-2 rounded-full text-xs font-semibold bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:opacity-90 transition cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>

      {/* ── Tabs Navigation ─────────────────────────────────────────────────── */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800 gap-2 md:gap-4">
        <button
          type="button"
          onClick={() => setActiveTab("write")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition cursor-pointer ${
            activeTab === "write"
              ? "border-neutral-900 text-neutral-900 dark:border-neutral-100 dark:text-white"
              : "border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
          }`}
        >
          <FiEdit3 />
          <span>{editingBlogId ? "Edit Topic" : "Write Topic"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("structure")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition cursor-pointer ${
            activeTab === "structure"
              ? "border-neutral-900 text-neutral-900 dark:border-neutral-100 dark:text-white"
              : "border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
          }`}
        >
          <FiLayers />
          <span>Subjects & Modules</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("posts")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition cursor-pointer ${
            activeTab === "posts"
              ? "border-neutral-900 text-neutral-900 dark:border-neutral-100 dark:text-white"
              : "border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
          }`}
        >
          <FiList />
          <span>All Topics ({blogs.length})</span>
        </button>
      </div>

      {/* ── Status / Error messages ─────────────────────────────────────────── */}
      {(errorMessage || statusMessage) && (
        <div
          className={`flex items-center justify-between p-4 rounded-2xl text-sm ${
            errorMessage
              ? "bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-200"
              : "bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-200"
          }`}
        >
          <span>{errorMessage || statusMessage}</span>
          <button
            onClick={() => { setErrorMessage(""); setStatusMessage("") }}
            className="text-xs opacity-60 hover:opacity-100"
          >
            <FiX />
          </button>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* TAB 1: WRITE / EDIT TOPIC                                                */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {activeTab === "write" && (
        <form onSubmit={handleSaveBlog} className="space-y-6">
          <div className="rounded-[28px] border border-neutral-200/80 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 p-6 md:p-8 space-y-6 shadow-sm">
            {/* Header info */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200/60 dark:border-neutral-800/60">
              <div>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                  {editingBlogId ? "Edit Topic" : "Create a New Topic or Module Guide"}
                </h2>
                <p className="mt-1 text-xs text-neutral-500">
                  Select the subject, assign it to a module (e.g. JavaScript), and start writing.
                </p>
              </div>

              {editingBlogId && (
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="px-3 py-1.5 rounded-full border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-2">
                Topic Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. JavaScript Basics, or Event Loop & Microtasks"
                className="w-full px-4 py-3 rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-base focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
                required
              />
            </div>

            {/* Subject & Module Selection */}
            <div className="grid gap-4 md:grid-cols-2 p-5 rounded-2xl bg-neutral-50/80 dark:bg-neutral-950/40 border border-neutral-200/80 dark:border-neutral-800/80">
              {/* Subject selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-2">
                  1. Subject *
                </label>
                {subjects.length > 0 ? (
                  <select
                    value={selectedSubjectId}
                    onChange={e => handleSubjectChange(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white focus:outline-none"
                    required
                  >
                    <option value="" disabled>Select a subject</option>
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="text-xs text-amber-600 dark:text-amber-400">
                    No subjects yet. Go to the "Subjects & Modules" tab to create your first subject!
                  </div>
                )}
              </div>

              {/* Module selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                    2. Module (e.g. JavaScript)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowNewModuleInput(prev => !prev)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    {showNewModuleInput ? "Pick existing" : "+ Create new module"}
                  </button>
                </div>

                {!showNewModuleInput ? (
                  <select
                    value={selectedModuleId}
                    onChange={e => setSelectedModuleId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white focus:outline-none"
                  >
                    <option value="">No module (Standalone Article)</option>
                    {availableModules.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={newModuleName}
                    onChange={e => setNewModuleName(e.target.value)}
                    placeholder="Enter module name (e.g. React, JavaScript)"
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white focus:outline-none"
                  />
                )}
                <p className="mt-1.5 text-[11px] text-neutral-400">
                  Tip: A module with 1 topic appears as a Single Guide. Add more topics to make it a series!
                </p>
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-2">
                Summary / Excerpt (Optional)
              </label>
              <textarea
                value={excerpt}
                onChange={e => setExcerpt(e.target.value)}
                rows={2}
                placeholder="Brief summary to show in topic cards (auto-generated from content if left blank)"
                className="w-full px-4 py-2.5 rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm focus:outline-none"
              />
            </div>

            {/* Cover Image */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-2">
                Cover Image (Optional)
              </label>
              <div className="flex flex-wrap items-center gap-4">
                <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 hover:border-neutral-500 bg-white dark:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer">
                  <FiUploadCloud className="text-base" />
                  <span>{isUploadingCover ? "Uploading..." : "Upload Cover Image"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    disabled={isUploadingCover}
                    className="hidden"
                  />
                </label>

                {coverImage && (
                  <div className="flex items-center gap-2 p-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800">
                    <img
                      src={resolveAssetUrl(coverImage)}
                      alt="Cover preview"
                      className="h-10 w-16 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setCoverImage("")}
                      className="p-1 text-neutral-400 hover:text-rose-500"
                    >
                      <FiX />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Content Editor */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-2">
                Topic Content *
              </label>
              <RichTextEditor
                editorKey={editorKey}
                initialContent={editorInitialContent}
                onChange={value => setEditorValue(value)}
                onUploadImage={handleInlineImageUpload}
              />
            </div>

            {/* Publish Actions Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-neutral-200/80 dark:border-neutral-800">
              <label className="flex items-center gap-2.5 text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={e => setIsPublished(e.target.checked)}
                  className="h-4 w-4 rounded accent-neutral-900 dark:accent-neutral-100"
                />
                <span className="font-medium">Publish immediately (visible to visitors)</span>
              </label>

              <button
                type="submit"
                disabled={isSavingBlog}
                className="px-6 py-3 rounded-full text-sm font-bold bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:opacity-90 disabled:opacity-50 transition cursor-pointer shadow-sm"
              >
                {isSavingBlog
                  ? "Saving Topic..."
                  : editingBlogId
                  ? "Update Topic"
                  : "Publish Topic"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* TAB 2: SUBJECTS & MODULES MANAGER                                        */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {activeTab === "structure" && (
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Create & View Subjects */}
          <div className="rounded-[28px] border border-neutral-200/80 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 p-6 md:p-8 space-y-6 shadow-sm">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Structure Level 1
              </span>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                Subjects (Categories)
              </h2>
              <p className="mt-1 text-xs text-neutral-500">
                e.g. Frontend Development, Backend Development, DevOps
              </p>
            </div>

            {/* Add Subject form */}
            <form onSubmit={handleCreateSubject} className="space-y-3 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950/40 border border-neutral-200/80 dark:border-neutral-800">
              <input
                type="text"
                value={newSubjectName}
                onChange={e => setNewSubjectName(e.target.value)}
                placeholder="New Subject Name (e.g. Frontend Development)"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white focus:outline-none"
                required
              />
              <input
                type="text"
                value={newSubjectDescription}
                onChange={e => setNewSubjectDescription(e.target.value)}
                placeholder="Optional description"
                className="w-full px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white focus:outline-none"
              />
              <button
                type="submit"
                disabled={isCreatingSubject || !newSubjectName.trim()}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:opacity-90 disabled:opacity-50 transition cursor-pointer"
              >
                {isCreatingSubject ? "Creating..." : "+ Add Subject"}
              </button>
            </form>

            {/* Subject List */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Existing Subjects
              </span>
              {subjects.map(s => {
                const isSelected = String(s.id) === activeSubjectForModules
                const moduleCount = (s.modules || s.chapters || []).length
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setActiveSubjectForModules(String(s.id))}
                    className={`w-full text-left p-3.5 rounded-2xl border transition flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900 shadow-sm"
                        : "border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:border-neutral-400"
                    }`}
                  >
                    <div>
                      <p className="font-bold text-sm">{s.name}</p>
                      {s.description && (
                        <p className="text-xs opacity-70 line-clamp-1 mt-0.5">{s.description}</p>
                      )}
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full opacity-70 bg-black/10 dark:bg-white/10">
                      {moduleCount} {moduleCount === 1 ? "module" : "modules"}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Create & View Modules under selected Subject */}
          <div className="rounded-[28px] border border-neutral-200/80 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 p-6 md:p-8 space-y-6 shadow-sm">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Structure Level 2
              </span>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                Modules in {subjects.find(s => String(s.id) === activeSubjectForModules)?.name || "Subject"}
              </h2>
              <p className="mt-1 text-xs text-neutral-500">
                e.g. JavaScript, React, CSS. Each module can hold a single guide or multiple sub-topics.
              </p>
            </div>

            {/* Add Module form */}
            {activeSubjectForModules ? (
              <form onSubmit={handleCreateModuleUnderSubject} className="space-y-3 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950/40 border border-neutral-200/80 dark:border-neutral-800">
                <input
                  type="text"
                  value={createModuleName}
                  onChange={e => setCreateModuleName(e.target.value)}
                  placeholder="New Module Name (e.g. JavaScript, HTML & CSS)"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white focus:outline-none"
                  required
                />
                <input
                  type="text"
                  value={createModuleDesc}
                  onChange={e => setCreateModuleDesc(e.target.value)}
                  placeholder="Optional description"
                  className="w-full px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isCreatingModule || !createModuleName.trim()}
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:opacity-90 disabled:opacity-50 transition cursor-pointer"
                >
                  {isCreatingModule ? "Adding..." : "+ Add Module to Subject"}
                </button>
              </form>
            ) : (
              <div className="p-4 text-xs text-neutral-500">Select a subject on the left first.</div>
            )}

            {/* Modules List */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Modules in Selected Subject
              </span>
              {(() => {
                const currentSub = subjects.find(s => String(s.id) === activeSubjectForModules)
                const mods = currentSub?.modules || currentSub?.chapters || []
                if (mods.length === 0) {
                  return (
                    <div className="p-4 text-xs text-neutral-400 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl text-center">
                      No modules added to this subject yet.
                    </div>
                  )
                }
                return mods.map(m => (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-800 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-sm text-neutral-900 dark:text-white">{m.name}</p>
                      {m.description && (
                        <p className="text-xs text-neutral-500 line-clamp-1">{m.description}</p>
                      )}
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 font-medium">
                      {m._count?.blogs ?? 0} topics
                    </span>
                  </div>
                ))
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* TAB 3: MANAGE ALL POSTS                                                  */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {activeTab === "posts" && (
        <div className="rounded-[28px] border border-neutral-200/80 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 p-6 md:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200/60 dark:border-neutral-800/60">
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                All Published & Draft Topics ({blogs.length})
              </h2>
              <p className="mt-1 text-xs text-neutral-500">
                Edit, view, or delete any post in your library.
              </p>
            </div>

            <input
              type="text"
              value={postSearch}
              onChange={e => setPostSearch(e.target.value)}
              placeholder="Search topics..."
              className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white focus:outline-none w-full sm:w-64"
            />
          </div>

          {filteredPosts.length === 0 ? (
            <div className="p-8 text-center text-sm text-neutral-500">
              No topics found.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPosts.map(blog => {
                const mod = blog.module || blog.chapter
                return (
                  <div
                    key={blog.id}
                    className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-850 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-neutral-400 dark:hover:border-neutral-700 transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${blog.isPublished ? "bg-emerald-500" : "bg-amber-500"}`} />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                          {blog.subject?.name} {mod ? `• ${mod.name}` : "• Standalone"}
                        </span>
                        <span className="text-[11px] text-neutral-400">
                          • {formatDate(blog.publishedAt || blog.createdAt)}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                        {blog.title}
                      </h3>
                      {blog.excerpt && (
                        <p className="text-xs text-neutral-500 line-clamp-1 max-w-2xl">
                          {blog.excerpt}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={`/blog/${blog.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                      >
                        <FiEye />
                        <span>View</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => startEditingBlog(blog)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-xs font-semibold hover:opacity-90 transition cursor-pointer"
                      >
                        <FiEdit3 />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteBlog(blog.id)}
                        disabled={deletingBlogId === blog.id}
                        className="p-2 rounded-lg border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs transition cursor-pointer"
                        title="Delete topic"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
