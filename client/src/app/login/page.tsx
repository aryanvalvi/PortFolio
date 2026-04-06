"use client"

import {useEffect, useState, type FormEvent} from "react"
import {useRouter} from "next/navigation"
import Container from "@/components/container"
import {useAuth} from "@/components/providers/AuthProvider"

export default function LoginPage() {
  const router = useRouter()
  const {login, user, isCheckingSession} = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isCheckingSession && user) {
      router.replace("/admin")
    }
  }, [isCheckingSession, router, user])

  if (isCheckingSession) {
    return (
      <Container className="min-h-screen px-4 pb-12 pt-24 md:px-8 md:pt-32">
        <div className="mx-auto max-w-lg rounded-[32px] border border-neutral-200 bg-white p-8 text-sm text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
          Checking admin session...
        </div>
      </Container>
    )
  }

  if (user) {
    return (
      <Container className="min-h-screen px-4 pb-12 pt-24 md:px-8 md:pt-32">
        <div className="mx-auto max-w-lg rounded-[32px] border border-neutral-200 bg-white p-8 text-sm text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
          Redirecting to admin...
        </div>
      </Container>
    )
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      setIsSubmitting(true)
      setErrorMessage("")
      await login(email, password)
      router.push("/admin")
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Login failed. Please try again."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Container className="min-h-screen px-4 pb-12 pt-24 md:px-8 md:pt-32">
      <div className="mx-auto max-w-lg rounded-[32px] border border-neutral-200 bg-white p-8 dark:border-neutral-700 dark:bg-neutral-900">
        <p className="text-xs uppercase tracking-[0.24em] text-secondary dark:text-secondary-dark">
          JWT login
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-primary dark:text-primary-dark">
          Admin sign in
        </h1>
        <p className="mt-3 text-sm text-secondary dark:text-secondary-dark">
          Use the credentials stored in your Prisma database. There is no public
          signup flow here, only login for the admin account.
        </p>

        {errorMessage && (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-primary dark:text-primary-dark">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              placeholder="admin@example.com"
              className="w-full rounded-2xl border border-neutral-200 bg-transparent px-4 py-3 text-sm outline-none transition focus:border-neutral-400 dark:border-neutral-700"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-primary dark:text-primary-dark">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              placeholder="Your password"
              className="w-full rounded-2xl border border-neutral-200 bg-transparent px-4 py-3 text-sm outline-none transition focus:border-neutral-400 dark:border-neutral-700"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-neutral-900 px-5 py-2.5 text-sm text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-neutral-100 dark:text-neutral-900"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </Container>
  )
}
