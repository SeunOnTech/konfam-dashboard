"use client"

import { Bell, Clock, AlertCircle } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import { useState, useEffect } from "react"
import { PlatformSelectorHeader } from "./platform-selector-header"

interface HeaderProps {
  title: string
  activeThreats?: number
}

export function Header({ title, activeThreats = 0 }: HeaderProps) {
  const [time, setTime] = useState<string>("")
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }),
      )
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 bg-card border-b border-border h-16 z-40 md:left-64 transition-all duration-300">
      <div className="h-full px-3 md:px-6 flex items-center justify-between gap-2 md:gap-4">
        {/* Left side - Title and Platform Selector */}
        <div className="hidden sm:flex items-center gap-3">
          <h1 className="text-lg md:text-xl font-semibold text-foreground truncate">{title}</h1>
          <div className="hidden md:block h-6 w-px bg-border" />
          <PlatformSelectorHeader />
        </div>

        {/* Mobile platform selector */}
        <div className="sm:hidden">
          <PlatformSelectorHeader />
        </div>

        {/* Right side - Status and controls */}
        <div className="flex items-center gap-2 md:gap-4 ml-auto">
          {/* Real-time clock - hidden on mobile */}
          {/* <div className="hidden sm:flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span className="font-mono">{time || "--:--:--"}</span>
          </div> */}

          {/* Active threats indicator - responsive text */}
          {activeThreats > 0 && (
            <button className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors text-xs md:text-sm font-semibold flex-shrink-0">
              <AlertCircle className="w-3 md:w-4 h-3 md:h-4 flex-shrink-0" />
              <span className="hidden sm:inline">{activeThreats}</span>
            </button>
          )}

          {/* Notifications */}
          <button className="p-2 hover:bg-muted rounded-lg transition-colors relative flex-shrink-0">
            <Bell className="w-5 h-5 text-foreground" />
            {activeThreats > 0 && (
              <div className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full animate-pulse-subtle" />
            )}
          </button>

          {/* Theme toggle */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
