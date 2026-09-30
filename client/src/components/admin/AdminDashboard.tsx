"use client"

import Link from "next/link"
import {useRouter} from "next/navigation"
import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react"
import RichTextEditor from "@/components/admin/RichTextEditor"
import {useAuth} from "@/components/providers/AuthProvider"
import {
  type ApiBlog,
  type ApiChapter,
  type ApiSubject,
  apiRequest,
  formatDate,
  resolveAssetUrl,
  uploadImage,
} from "@/lib/api"

type EditorValue = {
  html: string
  json: unknown
}

export default function AdminDashboard() {
  const router = useRouter()
  const {user, token, isCheckingSession, logout} = useAuth()
  const [subjects, setSubjects] = useState<ApiSubject[]>([])
  const [blogs, setBlogs] = useState<ApiBlog[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [statusMessage, setStatusMessage] = useState("")

  const [editingBlogId, setEditingBlogId] = useState<number | null>(null)
  const [title, setTitle] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [selectedSubjectId, setSelectedSubjectId] = useState("")
  const [selectedChapterId, setSelectedChapterId] = useState("")
  const [newChapterName, setNewChapterName] = useState("")
  const [coverImage, setCoverImage] = useState("")
  const [isPublished, setIsPublished] = useState(true)
  const [editorInitialContent, setEditorInitialContent] = useState("")
  const [editorValue, setEditorValue] = useState<EditorValue>({
    html: "",
    json: null,
  })
  const [editorKey, setEditorKey] = useState(1)

  const [newSubjectName, setNewSubjectName] = useState("")
  const [newSubjectDescription, setNewSubjectDescription] = useState("")
  const [isCreatingSubject, setIsCreatingSubject] = useState(false)
  const [isSavingBlog, setIsSavingBlog] = useState(false)
  const [deletingBlogId, setDeletingBlogId] = useState<number | null>(null)
  const [isUploadingCover, setIsUploadingCover] = useState(false)

  useEffect(() => {
    if (isCheckingSession) {
      return
    }

    if (!user || !token) {
      setIsLoadingData(false)
      return
    }

    let shouldIgnore = false

    const loadDashboard = async () => {
      try {
        setIsLoadingData(true)
        setErrorMessage("")

        const [subjectsResponse, blogsResponse] = await Promise.all([
          apiRequest<{subjects: ApiSubject[]}>("/subjects"),
          apiRequest<{blogs: ApiBlog[]}>("/blogs/admin", {token}),
        ])

        if (shouldIgnore) {
          return
        }

        setSubjects(subjectsResponse.subjects)
        setBlogs(blogsResponse.blogs)
        setSelectedSubjectId(currentValue => {
          if (currentValue) {
            return currentValue
          }

          const firstSubject = subjectsResponse.subjects[0]
          return firstSubject ? String(firstSubject.id) : ""
        })
      } catch (error) {
        if (!shouldIgnore) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Could not load admin data."
          )
        }
      } finally {
        if (!shouldIgnore) {
          setIsLoadingData(false)
        }
      }
    }

    loadDashboard()

    return () => {
      shouldIgnore = true
    }
  }, [isCheckingSession, token, user])

  useEffect(() => {
    if (!isCheckingSession && !user) {
      router.replace("/login")
    }
  }, [isCheckingSession, router, user])

  useEffect(() => {
    const currentSubject = subjects.find(
      subject => String(subject.id) === selectedSubjectId
    )

    if (!currentSubject) {
      setSelectedChapterId("")
      return
    }

    setSelectedChapterId(currentValue => {
      if (
        currentSubject.chapters?.some(
          chapter => String(chapter.id) === currentValue
        )
      ) {
        return currentValue
      }

      return ""
    })
  }, [selectedSubjectId, subjects])

  const resetEditor = (nextContent = "") => {
    setEditorInitialContent(nextContent)
    setEditorValue({html: "", json: null})
    setEditorKey(currentValue => currentValue + 1)
  }

  const resetBlogForm = () => {
    setEditingBlogId(null)
    setTitle("")
    setExcerpt("")
    setSelectedChapterId("")
    setNewChapterName("")
    setCoverImage("")
    setIsPublished(true)
    resetEditor()
  }

  const handleCreateSubject = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!token) {
      return
    }

    if (!newSubjectName.trim()) {
      setErrorMessage("Enter a subject name first.")
      return
    }

    try {
      setIsCreatingSubject(true)
      setErrorMessage("")
      setStatusMessage("")

      const response = await apiRequest<{subject: ApiSubject}>("/subjects", {
        method: "POST",
        token,
        json: {
          name: newSubjectName,
          description: newSubjectDescription,
        },
      })

      setSubjects(currentSubjects =>
        [...currentSubjects, response.subject].sort((first, second) =>
          first.name.localeCompare(second.name)
        )
      )
      setSelectedSubjectId(String(response.subject.id))
      setSelectedChapterId("")
      setNewChapterName("")
      setNewSubjectName("")
      setNewSubjectDescription("")
      setStatusMessage(
        `Subject "${response.subject.name}" is ready. Add chapters or publish independent topics under it.`
      )
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not create subject."
      )
    } finally {
      setIsCreatingSubject(false)
    }
  }

  const handleCoverUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file || !token) {
      return
    }

    try {
      setIsUploadingCover(true)
      setErrorMessage("")

      const response = await uploadImage(file, token)
      setCoverImage(response.imageUrl)
      setStatusMessage("Cover image uploaded.")
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not upload cover image."
      )
    } finally {
      setIsUploadingCover(false)
      event.target.value = ""
    }
  }

  const handleInlineImageUpload = async (file: File) => {
    if (!token) {
      throw new Error("Please login first.")
    }

    const response = await uploadImage(file, token)
    setStatusMessage("Image inserted into the editor.")
    return response.imageUrl
  }

  const handleEditBlog = (blog: ApiBlog) => {
    setEditingBlogId(blog.id)
    setTitle(blog.title)
    setExcerpt(blog.excerpt)
    setSelectedSubjectId(String(blog.subject.id))
    setSelectedChapterId(blog.chapter ? String(blog.chapter.id) : "")
    setNewChapterName("")
    setCoverImage(blog.coverImage || "")
    setIsPublished(blog.isPublished)
    setEditorInitialContent(blog.contentHtml)
    setEditorValue({html: blog.contentHtml, json: null})
    setEditorKey(currentValue => currentValue + 1)
    setErrorMessage("")
    setStatusMessage(`Editing "${blog.title}". Save when you're ready.`)
    window.scrollTo({top: 0, behavior: "smooth"})
  }

  const handleDeleteBlog = async (blog: ApiBlog) => {
    if (!token) {
      setErrorMessage("Please login again.")
      return
    }

    const shouldDelete = window.confirm(
      `Delete "${blog.title}"? This cannot be undone.`
    )

    if (!shouldDelete) {
      return
    }

    try {
      setDeletingBlogId(blog.id)
      setErrorMessage("")
      setStatusMessage("")

      await apiRequest<{message: string}>(`/blogs/${blog.id}`, {
        method: "DELETE",
        token,
      })

      const subjectsResponse = await apiRequest<{subjects: ApiSubject[]}>(
        "/subjects"
      )

      setBlogs(currentBlogs => currentBlogs.filter(current => current.id !== blog.id))
      setSubjects(subjectsResponse.subjects)

      if (editingBlogId === blog.id) {
        resetBlogForm()
      }

      setStatusMessage(`"${blog.title}" was deleted.`)
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not delete the topic."
      )
    } finally {
      setDeletingBlogId(null)
    }
  }

  const handleCreateBlog = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!token) {
      setErrorMessage("Please login again.")
      return
    }

    if (!selectedSubjectId) {
      setErrorMessage("Create or select a subject first.")
      return
    }

    const plainText = editorValue.html.replace(/<[^>]+>/g, "").trim()

    if (plainText.length < 20) {
      setErrorMessage("Write a little more content before publishing.")
      return
    }

    try {
      setIsSavingBlog(true)
      setErrorMessage("")
      setStatusMessage("")

      const response = await apiRequest<{blog: ApiBlog}>(
        editingBlogId ? `/blogs/${editingBlogId}` : "/blogs",
        {
          method: editingBlogId ? "PUT" : "POST",
          token,
          json: {
            title,
            excerpt,
            subjectId: Number(selectedSubjectId),
            chapterId: selectedChapterId ? Number(selectedChapterId) : null,
            newChapterName,
            coverImage,
            contentHtml: editorValue.html,
            contentJson: editorValue.json,
            isPublished,
          },
        }
      )

      const subjectsResponse = await apiRequest<{subjects: ApiSubject[]}>(
        "/subjects"
      )

      setBlogs(currentBlogs => {
        if (editingBlogId) {
          return currentBlogs.map(currentBlog =>
            currentBlog.id === response.blog.id ? response.blog : currentBlog
          )
        }

        return [response.blog, ...currentBlogs]
      })
      setSubjects(subjectsResponse.subjects)
      resetBlogForm()
      setSelectedSubjectId(String(response.blog.subject.id))
      setSelectedChapterId(response.blog.chapter ? String(response.blog.chapter.id) : "")
      setStatusMessage(
        editingBlogId
          ? `"${response.blog.title}" was updated successfully.`
          : `"${response.blog.title}" is now live under ${response.blog.subject.name}${
              response.blog.chapter ? ` / ${response.blog.chapter.name}` : ""
            }.`
      )
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not save the topic."
      )
    } finally {
      setIsSavingBlog(false)
    }
  }

  const cancelEditing = () => {
    resetBlogForm()
    setStatusMessage("Edit mode cleared. You can create a new topic now.")
  }

  if (isCheckingSession || (user && isLoadingData)) {
    return (
      <div className="rounded-3xl border border-neutral-200 bg-white p-8 text-sm text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
        Loading your admin dashboard...
      </div>
    )
  }

  if (!user) {
    return (
      <div className="rounded-3xl border border-neutral-200 bg-white p-8 text-sm text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
        Redirecting to login...
      </div>
    )
  }

  const selectedSubject = subjects.find(
    subject => String(subject.id) === selectedSubjectId
  )
  const selectedSubjectChapters = selectedSubject?.chapters || []
  const selectedChapter = selectedSubjectChapters.find(
    chapter => String(chapter.id) === selectedChapterId
  )

  const recentTopicsForSubject = selectedSubject
    ? blogs
        .filter(blog => blog.subject.id === selectedSubject.id)
        .slice(0, 4)
    : []

  const renderChapterChip = (chapter: ApiChapter) => {
    const isActive = String(chapter.id) === selectedChapterId

    return (
      <button
        key={chapter.id}
        type="button"
        onClick={() => {
          setSelectedChapterId(String(chapter.id))
          setNewChapterName("")
        }}
        className={`rounded-2xl border px-4 py-3 text-left transition ${
          isActive
            ? "border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900"
            : "border-neutral-200 text-neutral-700 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-200"
        }`}
      >
        <p className="text-sm font-medium">{chapter.name}</p>
        <p className="mt-1 text-xs opacity-75">
          {chapter._count?.blogs || 0} topic
          {chapter._count?.blogs === 1 ? "" : "s"}
        </p>
      </button>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 rounded-3xl border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-900 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-secondary dark:text-secondary-dark">
            Authenticated admin
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-primary dark:text-primary-dark">
            Build your subject, chapter, and topic library
          </h1>
          <p className="mt-2 text-sm text-secondary dark:text-secondary-dark">
            Signed in as {user.name} ({user.email})
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/blog"
            className="rounded-full border border-neutral-300 px-4 py-2 text-sm text-neutral-700 dark:border-neutral-600 dark:text-neutral-200"
          >
            View library
          </Link>
          <button
            type="button"
            onClick={logout}
            className="rounded-full bg-neutral-900 px-4 py-2 text-sm text-white dark:bg-neutral-100 dark:text-neutral-900"
          >
            Logout
          </button>
        </div>
      </div>

      {(errorMessage || statusMessage) && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            errorMessage
              ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200"
              : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
          }`}
        >
          {errorMessage || statusMessage}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1.5fr_0.9fr]">
        <form
          onSubmit={handleCreateBlog}
          className="space-y-6 rounded-3xl border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-900"
        >
          <div className="flex flex-col gap-3 rounded-3xl border border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-700 dark:bg-neutral-950/40 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-secondary dark:text-secondary-dark">
                {editingBlogId ? "Edit mode" : "Create mode"}
              </p>
              <h2 className="mt-2 text-xl font-semibold text-primary dark:text-primary-dark">
                {editingBlogId ? "Update topic" : "Create a new topic"}
              </h2>
              <p className="mt-2 text-sm text-secondary dark:text-secondary-dark">
                {editingBlogId
                  ? "You are editing an existing topic. Save changes when you're done."
                  : "Write a new topic, place it inside a chapter, and publish it to your library."}
              </p>
            </div>

            {editingBlogId && (
              <button
                type="button"
                onClick={cancelEditing}
                className="rounded-full border border-neutral-300 px-4 py-2 text-sm text-neutral-800 transition hover:border-neutral-500 dark:border-neutral-600 dark:text-neutral-100"
              >
                Cancel edit
              </button>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-primary dark:text-primary-dark">
                Topic title
              </label>
              <input
                value={title}
                onChange={event => setTitle(event.target.value)}
                placeholder="Example: JWT authentication in Express with Prisma"
                className="w-full rounded-2xl border border-neutral-200 bg-transparent px-4 py-3 text-sm outline-none transition focus:border-neutral-400 dark:border-neutral-700"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-primary dark:text-primary-dark">
                Topic preview
              </label>
              <textarea
                value={excerpt}
                onChange={event => setExcerpt(event.target.value)}
                placeholder="This will show in the public topic card."
                rows={3}
                className="w-full rounded-2xl border border-neutral-200 bg-transparent px-4 py-3 text-sm outline-none transition focus:border-neutral-400 dark:border-neutral-700"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-primary dark:text-primary-dark">
                Subject
              </label>
              <select
                value={selectedSubjectId}
                onChange={event => setSelectedSubjectId(event.target.value)}
                className="w-full rounded-2xl border border-neutral-200 bg-transparent px-4 py-3 text-sm outline-none transition focus:border-neutral-400 dark:border-neutral-700"
              >
                <option value="">Select a subject</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-primary dark:text-primary-dark">
                Existing chapter
              </label>
              <select
                value={selectedChapterId}
                onChange={event => {
                  setSelectedChapterId(event.target.value)
                  if (event.target.value) {
                    setNewChapterName("")
                  }
                }}
                className="w-full rounded-2xl border border-neutral-200 bg-transparent px-4 py-3 text-sm outline-none transition focus:border-neutral-400 dark:border-neutral-700"
              >
                <option value="">No chapter yet</option>
                {selectedSubjectChapters.map(chapter => (
                  <option key={chapter.id} value={chapter.id}>
                    {chapter.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-primary dark:text-primary-dark">
                New chapter
              </label>
              <input
                value={newChapterName}
                onChange={event => {
                  const nextValue = event.target.value

                  setNewChapterName(nextValue)

                  if (nextValue.trim()) {
                    setSelectedChapterId("")
                  }
                }}
                placeholder="Example: Authentication fundamentals"
                className="w-full rounded-2xl border border-neutral-200 bg-transparent px-4 py-3 text-sm outline-none transition focus:border-neutral-400 dark:border-neutral-700"
              />
              <p className="mt-2 text-xs text-secondary dark:text-secondary-dark">
                Type here to create a fresh chapter for the selected subject.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-primary dark:text-primary-dark">
                Cover image
              </label>
              <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-dashed border-neutral-300 px-4 py-3 text-sm text-neutral-600 dark:border-neutral-700 dark:text-neutral-300">
                <span>
                  {isUploadingCover ? "Uploading image..." : "Upload cover image"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverUpload}
                />
              </label>
            </div>

            {selectedSubject && (
              <div className="md:col-span-2 rounded-3xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-950/40">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-medium text-primary dark:text-primary-dark">
                      Chapter preview for {selectedSubject.name}
                    </p>
                    <p className="text-xs text-secondary dark:text-secondary-dark">
                      Pick an old chapter, or leave it blank to publish this as an
                      independent topic.
                    </p>
                  </div>
                  {(selectedChapterId || newChapterName.trim()) && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedChapterId("")
                        setNewChapterName("")
                      }}
                      className="rounded-full border border-neutral-300 px-3 py-1 text-xs text-neutral-700 dark:border-neutral-600 dark:text-neutral-200"
                    >
                      Clear chapter
                    </button>
                  )}
                </div>

                {selectedSubjectChapters.length === 0 ? (
                  <p className="mt-4 text-sm text-secondary dark:text-secondary-dark">
                    No chapters yet for this subject. Your first topic can create
                    one.
                  </p>
                ) : (
                  <div className="mt-4 flex flex-wrap gap-3">
                    {selectedSubjectChapters.map(renderChapterChip)}
                  </div>
                )}

                {recentTopicsForSubject.length > 0 && (
                  <div className="mt-5">
                    <p className="text-xs uppercase tracking-[0.18em] text-secondary dark:text-secondary-dark">
                      Recent topics in this subject
                    </p>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      {recentTopicsForSubject.map(blog => (
                        <div
                          key={blog.id}
                          className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900"
                        >
                          <p className="text-xs uppercase tracking-[0.14em] text-secondary dark:text-secondary-dark">
                            {blog.chapter?.name || "Independent topic"} •{" "}
                            {formatDate(blog.publishedAt || blog.createdAt)}
                          </p>
                          <p className="mt-2 text-sm font-medium text-primary dark:text-primary-dark">
                            {blog.title}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {coverImage && (
            <div className="overflow-hidden rounded-3xl border border-neutral-200 dark:border-neutral-700">
              <img
                src={resolveAssetUrl(coverImage)}
                alt="Cover preview"
                className="h-64 w-full object-cover"
              />
            </div>
          )}

          <div>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-primary dark:text-primary-dark">
                  Topic content
                </label>
                <p className="mt-1 text-xs text-secondary dark:text-secondary-dark">
                  Code snippets support language selection, syntax colors, and a
                  copy button on the public topic page.
                </p>
              </div>
              <label className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={event => setIsPublished(event.target.checked)}
                />
                Publish immediately
              </label>
            </div>

            <RichTextEditor
              editorKey={editorKey}
              initialContent={editorInitialContent}
              onChange={setEditorValue}
              onUploadImage={handleInlineImageUpload}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isSavingBlog}
              className="rounded-full bg-neutral-900 px-5 py-2.5 text-sm text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-neutral-100 dark:text-neutral-900"
            >
              {isSavingBlog
                ? editingBlogId
                  ? "Saving changes..."
                  : "Publishing..."
                : editingBlogId
                  ? "Update topic"
                  : "Create topic"}
            </button>

            {editingBlogId && (
              <button
                type="button"
                onClick={cancelEditing}
                className="rounded-full border border-neutral-300 px-5 py-2.5 text-sm text-neutral-800 transition hover:border-neutral-500 dark:border-neutral-600 dark:text-neutral-100"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="space-y-6">
          <form
            onSubmit={handleCreateSubject}
            className="space-y-4 rounded-3xl border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-900"
          >
            <div>
              <h2 className="text-xl font-semibold text-primary dark:text-primary-dark">
                Create a subject
              </h2>
              <p className="mt-2 text-sm text-secondary dark:text-secondary-dark">
                If you forgot a subject, add it here first and then select it in
                the blog form.
              </p>
            </div>

            <input
              value={newSubjectName}
              onChange={event => setNewSubjectName(event.target.value)}
              placeholder="Example: Authentication"
              className="w-full rounded-2xl border border-neutral-200 bg-transparent px-4 py-3 text-sm outline-none transition focus:border-neutral-400 dark:border-neutral-700"
            />
            <textarea
              value={newSubjectDescription}
              onChange={event => setNewSubjectDescription(event.target.value)}
              placeholder="Optional short description for this subject"
              rows={3}
              className="w-full rounded-2xl border border-neutral-200 bg-transparent px-4 py-3 text-sm outline-none transition focus:border-neutral-400 dark:border-neutral-700"
            />

            <button
              type="submit"
              disabled={isCreatingSubject}
              className="rounded-full border border-neutral-300 px-4 py-2 text-sm text-neutral-800 transition hover:border-neutral-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-600 dark:text-neutral-100"
            >
              {isCreatingSubject ? "Creating..." : "Create subject"}
            </button>
          </form>

          <div className="rounded-3xl border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-900">
            <h2 className="text-xl font-semibold text-primary dark:text-primary-dark">
              Existing subjects
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {subjects.length === 0 && (
                <p className="text-sm text-secondary dark:text-secondary-dark">
                  No subjects yet. Create your first one above.
                </p>
              )}
              {subjects.map(subject => (
                <span
                  key={subject.id}
                  className="rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-700 dark:border-neutral-700 dark:text-neutral-200"
                >
                  {subject.name} • {subject._count?.chapters || 0} chapter
                  {subject._count?.chapters === 1 ? "" : "s"}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-900">
            <h2 className="text-xl font-semibold text-primary dark:text-primary-dark">
              Manage topics
            </h2>
            <div className="mt-4 space-y-4">
              {blogs.length === 0 && (
                <p className="text-sm text-secondary dark:text-secondary-dark">
                  Your topic list is empty right now.
                </p>
              )}
              {blogs.map(blog => (
                <div
                  key={blog.id}
                  className="rounded-2xl border border-neutral-200 p-4 transition hover:border-neutral-400 dark:border-neutral-700"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-[0.2em] text-secondary dark:text-secondary-dark">
                        {blog.subject.name}
                        {blog.chapter
                          ? ` • ${blog.chapter.name}`
                          : " • Independent topic"}{" "}
                        • {formatDate(blog.publishedAt || blog.createdAt)}
                      </p>
                      <h3 className="mt-2 text-base font-semibold text-primary dark:text-primary-dark">
                        {blog.title}
                      </h3>
                      <p className="mt-2 text-sm text-secondary dark:text-secondary-dark">
                        {blog.excerpt}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/blog/${blog.slug}`}
                        className="rounded-full border border-neutral-300 px-3 py-1.5 text-xs text-neutral-700 transition hover:border-neutral-500 dark:border-neutral-600 dark:text-neutral-200"
                      >
                        View
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleEditBlog(blog)}
                        className="rounded-full border border-neutral-300 px-3 py-1.5 text-xs text-neutral-700 transition hover:border-neutral-500 dark:border-neutral-600 dark:text-neutral-200"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteBlog(blog)}
                        disabled={deletingBlogId === blog.id}
                        className="rounded-full border border-rose-300 px-3 py-1.5 text-xs text-rose-700 transition hover:border-rose-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-800 dark:text-rose-200"
                      >
                        {deletingBlogId === blog.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
