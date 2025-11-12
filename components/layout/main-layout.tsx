import type { ReactNode } from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"

interface MainLayoutProps {
  children: ReactNode
  title: string
  activeThreats?: number
}

export function MainLayout({ children, title, activeThreats = 0 }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header title={title} activeThreats={activeThreats} />

      {/* Main content area - responsive positioning for mobile */}
      <main className="fixed top-16 left-0 right-0 bottom-0 overflow-y-auto md:left-64 transition-all duration-300 z-0">
        <div className="p-3 md:p-6">{children}</div>
      </main>
    </div>
  )
}
