export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

const API_URL = `${API_BASE_URL}/api`

export type ApiUser = {
  id: string | number
  name: string
  email: string
  role?: string
}

export type ApiModule = {
  id: string | number
  name: string
  slug: string
  description: string | null
  subjectId: string | number
  blogs?: ApiBlog[]
  _count?: {
    blogs: number
  }
}

// Backwards-compatible alias
export type ApiChapter = ApiModule

export type ApiSubject = {
  id: string | number
  name: string
  slug: string
  description: string | null
  modules?: ApiModule[]
  chapters?: ApiModule[]
  _count?: {
    blogs: number
    modules?: number
    chapters?: number
  }
}

export type ApiBlog = {
  id: string | number
  title: string
  slug: string
  excerpt: string
  coverImage: string | null
  contentHtml: string
  contentJson: unknown
  isPublished: boolean
  publishedAt: string | null
  order?: number
  createdAt: string
  updatedAt: string
  subject: ApiSubject
  module?: ApiModule | null
  chapter?: ApiModule | null
  author: ApiUser
}

type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: BodyInit | null
  json?: unknown
  token?: string
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {}
) {
  const headers = new Headers(options.headers)

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`)
  }

  let body = options.body ?? null

  if (options.json !== undefined) {
    headers.set("Content-Type", "application/json")
    body = JSON.stringify(options.json)
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    body,
    cache: "no-store",
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.message || "Request failed.")
  }

  return data as T
}

export async function uploadImage(file: File, token: string) {
  const formData = new FormData()
  formData.append("image", file)

  const data = await apiRequest<{imageUrl: string; provider: string}>(
    "/uploads/image",
    {
      method: "POST",
      body: formData,
      token,
    }
  )

  return {
    ...data,
    imageUrl: resolveAssetUrl(data.imageUrl),
  }
}

export function resolveAssetUrl(url?: string | null) {
  if (!url) {
    return ""
  }

  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:")
  ) {
    return url
  }

  return `${API_BASE_URL}${url.startsWith("/") ? url : `/${url}`}`
}

export function formatDate(dateValue?: string | null) {
  if (!dateValue) {
    return ""
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateValue))
}
