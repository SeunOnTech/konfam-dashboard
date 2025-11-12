"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  AlertTriangle,
  MessageSquare,
  BarChart3,
  DollarSign,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  Heart,
} from "lucide-react"

const navItems = [
  { label: "Dashboard", href: "/", icon: Home },
  { label: "Threat Analysis", href: "/threats", icon: AlertTriangle },
  { label: "Response Center", href: "/responses", icon: MessageSquare },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Full Analytics", href: "/full-analytics", icon: BarChart3 }, // Added Full Analytics navigation
  { label: "Feedback", href: "/feedback", icon: Heart }, // Added Feedback navigation item
  { label: "Bank Verification", href: "/bank", icon: DollarSign },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) {
        setIsOpen(false)
        setCollapsed(false)
      }
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Close sidebar on mobile when navigating
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false)
    }
  }, [pathname, isMobile])

  return (
    <>
      {/* Mobile menu button - shown on mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed left-4 top-4 z-50 p-2 hover:bg-muted rounded-lg transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-6 h-6 text-foreground" /> : <ChevronRight className="w-6 h-6 text-foreground" />}
      </button>

      {/* Backdrop for mobile */}
      {isOpen && isMobile && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border
        transition-all duration-300 ease-out z-40
        ${isOpen || !isMobile ? "w-64" : "-translate-x-full"}
        ${collapsed && !isMobile ? "md:w-20" : ""}
      `}
      >
        <div className="flex flex-col h-full">
          {/* Header with logo */}
          <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
            {!collapsed || isMobile ? (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-sidebar-primary-foreground" />
                </div>
                <span className="text-lg font-bold text-sidebar-foreground">Konfam</span>
              </div>
            ) : null}
            {!isMobile && (
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="p-1.5 hover:bg-sidebar-accent rounded-lg transition-colors"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {collapsed ? (
                  <ChevronRight className="w-4 h-4 text-sidebar-foreground" />
                ) : (
                  <ChevronLeft className="w-4 h-4 text-sidebar-foreground" />
                )}
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || (item.href === "/" && pathname === "/")

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm
                    ${
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent"
                    }
                    ${collapsed && !isMobile ? "justify-center" : ""}
                  `}
                  title={collapsed && !isMobile ? item.label : undefined}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {(!collapsed || isMobile) && <span className="font-medium">{item.label}</span>}
                </Link>
              )
            })}
          </nav>

          {/* Footer settings */}
          <div className="p-3 border-t border-sidebar-border">
            <button
              className={`flex items-center gap-3 w-full px-3 py-2.5 text-sidebar-foreground hover:bg-sidebar-accent rounded-lg transition-colors text-sm ${
                collapsed && !isMobile ? "justify-center" : ""
              }`}
              title={collapsed && !isMobile ? "Settings" : undefined}
            >
              <Settings className="w-5 h-5 flex-shrink-0" />
              {(!collapsed || isMobile) && <span className="font-medium">Settings</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
