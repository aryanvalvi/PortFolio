"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import {ApiUser, apiRequest} from "@/lib/api"

const STORAGE_KEY = "portfolio-admin-token"

type AuthContextValue = {
  user: ApiUser | null
  token: string | null
  isCheckingSession: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({children}: {children: ReactNode}) {
  const [user, setUser] = useState<ApiUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isCheckingSession, setIsCheckingSession] = useState(true)

  useEffect(() => {
    const savedToken = window.localStorage.getItem(STORAGE_KEY)

    if (!savedToken) {
      setIsCheckingSession(false)
      return
    }

    let shouldIgnore = false

    const restoreSession = async () => {
      try {
        const data = await apiRequest<{user: ApiUser}>("/auth/me", {
          token: savedToken,
        })

        if (shouldIgnore) {
          return
        }

        setUser(data.user)
        setToken(savedToken)
      } catch {
        window.localStorage.removeItem(STORAGE_KEY)
        setUser(null)
        setToken(null)
      } finally {
        if (!shouldIgnore) {
          setIsCheckingSession(false)
        }
      }
    }

    restoreSession()

    return () => {
      shouldIgnore = true
    }
  }, [])

  const login = async (email: string, password: string) => {
    const data = await apiRequest<{token: string; user: ApiUser}>("/auth/login", {
      method: "POST",
      json: {
        email,
        password,
      },
    })

    window.localStorage.setItem(STORAGE_KEY, data.token)
    setToken(data.token)
    setUser(data.user)
  }

  const logout = () => {
    window.localStorage.removeItem(STORAGE_KEY)
    setUser(null)
    setToken(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isCheckingSession,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.")
  }

  return context
}
