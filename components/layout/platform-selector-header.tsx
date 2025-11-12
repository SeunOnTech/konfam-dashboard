"use client"

import { useState } from "react"
import { Twitter, Lock, TrendingUp } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export function PlatformSelectorHeader() {
  const [open, setOpen] = useState(false)

  const platforms = [
    {
      name: "Twitter/X",
      icon: Twitter,
      status: "active",
      description: "Real-time monitoring active",
    },
    {
      name: "TikTok",
      icon: TrendingUp,
      status: "coming",
      description: "Coming soon",
    },
    {
      name: "Facebook",
      icon: Lock,
      status: "coming",
      description: "Coming soon",
    },
  ]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm font-medium text-foreground group relative">
          <div className="flex items-center gap-2">
            <Twitter className="w-4 h-4 text-primary" />
            <span className="hidden sm:inline">Twitter</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse-subtle" />
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0 border-border">
        <div className="bg-card">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold text-foreground">Social Platforms</p>
            <p className="text-xs text-muted-foreground">Monitor & manage across platforms</p>
          </div>
          <div className="p-3 space-y-2">
            {platforms.map((platform) => {
              const Icon = platform.icon
              return (
                <button
                  key={platform.name}
                  className={`w-full p-3 rounded-lg border transition-all text-left ${
                    platform.status === "active"
                      ? "border-primary/50 bg-primary/5 hover:bg-primary/10"
                      : "border-border bg-muted/30 cursor-not-allowed"
                  }`}
                  disabled={platform.status === "coming"}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-5 h-5 ${platform.status === "active" ? "text-primary" : "text-muted-foreground"}`}
                      />
                      <div>
                        <p className="text-sm font-semibold text-foreground">{platform.name}</p>
                        <p className="text-xs text-muted-foreground">{platform.description}</p>
                      </div>
                    </div>
                    {platform.status === "coming" && <Lock className="w-4 h-4 text-muted-foreground" />}
                    {platform.status === "active" && (
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse-subtle" />
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
