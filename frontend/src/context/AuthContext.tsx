"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import api from "@/lib/api"

export interface UserProfile {
  id?: number
  username: string
  email: string
  photo: string | null
  bio: string
  organisation: string
  notif_email: boolean
  notif_stock_alerts: boolean
  notif_order_updates: boolean
  notif_sound: boolean
  notif_mobile: boolean
  display_compact: boolean
  display_animations: boolean
  language: string
  currency: string
}

interface AuthContextType {
  user: any | null
  token: string | null
  profile: UserProfile | null
  profilePhoto: string | null
  login: (credentials: { username: string; password: string }) => Promise<void>
  logout: () => void
  fetchProfile: () => Promise<void>
  updateProfile: (data: Partial<UserProfile> & { photoFile?: File }) => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const fetchProfile = useCallback(async () => {
    try {
      const res = await api.get("profile/")
      setProfile(res.data)
      // Keep username in sync
      if (res.data.username) {
        setUser((prev: any) => ({ ...prev, username: res.data.username }))
        localStorage.setItem("username", res.data.username)
      }
    } catch {
      // silently fail — user may not be authenticated yet
    }
  }, [])

  useEffect(() => {
    const savedToken = localStorage.getItem("token")
    if (savedToken) {
      setToken(savedToken)
      setUser({ username: localStorage.getItem("username") })
      // Fetch real profile from API
      api.get("profile/")
        .then(res => {
          setProfile(res.data)
          if (res.data.username) {
            setUser({ username: res.data.username })
            localStorage.setItem("username", res.data.username)
          }
        })
        .catch(() => {})
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!loading) {
      const publicPaths = ["/", "/login", "/register", "/forgot-password"]
      if (!token && !publicPaths.includes(pathname)) {
        router.replace("/login")
      } else if (token && ["/login", "/register", "/forgot-password"].includes(pathname)) {
        router.replace("/dashboard")
      }
    }
  }, [token, pathname, loading, router])

  const login = async (credentials: { username: string; password: string }) => {
    const response = await api.post("login/", credentials)
    const newToken = response.data.token
    localStorage.setItem("token", newToken)
    localStorage.setItem("username", credentials.username)
    setToken(newToken)
    setUser({ username: credentials.username })
    // Fetch profile right after login
    try {
      const profileRes = await api.get("profile/", {
        headers: { Authorization: `Token ${newToken}` }
      })
      setProfile(profileRes.data)
      if (profileRes.data.username) {
        setUser({ username: profileRes.data.username })
        localStorage.setItem("username", profileRes.data.username)
      }
    } catch {}
    router.push("/dashboard")
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    setProfile(null)
    localStorage.removeItem("token")
    localStorage.removeItem("username")
    router.push("/login")
  }

  const updateProfile = async (data: Partial<UserProfile> & { photoFile?: File }) => {
    const formData = new FormData()
    if (data.photoFile) {
      formData.append("photo", data.photoFile)
    }
    const fields = [
      "username", "email", "bio", "organisation",
      "notif_email", "notif_stock_alerts", "notif_order_updates", "notif_sound", "notif_mobile",
      "display_compact", "display_animations", "language", "currency"
    ] as const
    fields.forEach(key => {
      if (key in data && (data as any)[key] !== undefined) {
        formData.append(key, String((data as any)[key]))
      }
    })
    const res = await api.patch("profile/", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    })
    setProfile(res.data)
    if (res.data.username) {
      setUser((prev: any) => ({ ...prev, username: res.data.username }))
      localStorage.setItem("username", res.data.username)
    }
  }

  const profilePhoto = profile?.photo ?? null

  return (
    <AuthContext.Provider value={{
      user, token, profile, profilePhoto,
      login, logout, fetchProfile, updateProfile, loading
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
