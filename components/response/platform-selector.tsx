"use client"

import type React from "react"

import { Twitter, Lock } from "lucide-react"

interface Platform {
  id: string
  name: string
  icon: React.ReactNode
  status: "active" | "coming-soon"
  color: string
}

const platforms: Platform[] = [
  {
    id: "twitter",
    name: "Twitter / X",
    icon: <Twitter className="w-6 h-6" />,
    status: "active",
    color: "from-sky-400 to-sky-600",
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: <Lock className="w-6 h-6" />,
    status: "coming-soon",
    color: "from-gray-700 to-gray-900",
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: <Lock className="w-6 h-6" />,
    status: "coming-soon",
    color: "from-blue-500 to-blue-700",
  },
]

interface PlatformSelectorProps {
  selectedPlatform: string
  onSelectPlatform: (id: string) => void
}

export function PlatformSelector({ selectedPlatform, onSelectPlatform }: PlatformSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-foreground block">Response Platform</label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {platforms.map((platform) => (
          <button
            key={platform.id}
            onClick={() => platform.status === "active" && onSelectPlatform(platform.id)}
            disabled={platform.status === "coming-soon"}
            className={`
              relative p-4 rounded-lg border-2 transition-all
              ${
                selectedPlatform === platform.id && platform.status === "active"
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-muted-foreground"
              }
              ${platform.status === "coming-soon" ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}
          >
            <div
              className={`
                inline-flex p-2 rounded-lg mb-2
                ${platform.status === "active" ? `bg-gradient-to-br ${platform.color} text-white` : "bg-muted text-muted-foreground"}
              `}
            >
              {platform.icon}
            </div>
            <p className="text-sm font-semibold text-foreground">{platform.name}</p>
            {platform.status === "coming-soon" && <p className="text-xs text-muted-foreground mt-1">Coming Soon</p>}
          </button>
        ))}
      </div>
    </div>
  )
}
