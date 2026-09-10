"use client"

import React from "react"
import { usePathname } from "next/navigation"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/context/AuthContext"
import { Loader2 } from "lucide-react"

import { FloatingChat } from "@/components/FloatingChat"

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { loading, token } = useAuth()
  const publicPaths = ["/", "/login", "/register", "/forgot-password"]
  const isPublicPage = publicPaths.includes(pathname)

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (isPublicPage) {
    return <>{children}</>
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-white">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 relative">
          {children}
        </div>
        {/* Global AI Assistant Widget */}
        <FloatingChat />
      </SidebarInset>
    </SidebarProvider>
  )
}
