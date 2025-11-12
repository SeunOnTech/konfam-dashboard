"use client"

import { useEffect, useState } from "react"
import { CrisisLauncher } from "@/components/demo/crisis-launcher"

export function DemoControls() {
  const [showLauncher, setShowLauncher] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K to open demo launcher
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setShowLauncher(!showLauncher)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [showLauncher])

  return <CrisisLauncher isOpen={showLauncher} onClose={() => setShowLauncher(false)} />
}
