"use client"

import type { Response } from "@/lib/types"
import { Heart, MessageCircle, Repeat2, Share } from "lucide-react"

interface ResponsePreviewProps {
  response: Response
  selectedLanguage: "english" | "pidgin" | "yoruba" | "hausa"
}

export function ResponsePreview({ response, selectedLanguage }: ResponsePreviewProps) {
  const getLanguageLabel = (lang: string) => {
    switch (lang) {
      case "english":
        return "English"
      case "pidgin":
        return "Pidgin English"
      case "yoruba":
        return "Yoruba"
      case "hausa":
        return "Hausa"
      default:
        return lang
    }
  }

  const responseText = response[selectedLanguage as keyof Response]

  return (
    <div className="space-y-4">
      {/* Twitter-like preview */}
      <div className="bg-muted/50 rounded-lg p-4 border border-border">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1">
              <p className="font-bold text-foreground">Konfam Nigeria</p>
              <div className="text-primary">✓</div>
            </div>
            <p className="text-xs text-muted-foreground">@konfam.ng</p>
          </div>
        </div>

        {/* Post content */}
        <p className="text-sm text-foreground mb-4 leading-relaxed">
          {typeof responseText === "string" ? responseText : response.english}
        </p>

        {/* Language badge */}
        <div className="mb-4">
          <span className="inline-block px-3 py-1 bg-primary/20 text-primary rounded-full text-xs font-semibold">
            {getLanguageLabel(selectedLanguage)}
          </span>
        </div>

        {/* Engagement buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-border text-xs text-muted-foreground">
          <button className="flex items-center gap-2 hover:text-primary transition-colors">
            <MessageCircle className="w-4 h-4" />
            <span>{response.engagement?.replies || 0}</span>
          </button>
          <button className="flex items-center gap-2 hover:text-primary transition-colors">
            <Repeat2 className="w-4 h-4" />
            <span>{response.engagement?.retweets || 0}</span>
          </button>
          <button className="flex items-center gap-2 hover:text-primary transition-colors">
            <Heart className="w-4 h-4" />
            <span>{response.engagement?.likes || 0}</span>
          </button>
          <button className="flex items-center gap-2 hover:text-primary transition-colors">
            <Share className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Deployment status */}
      {response.deployed && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
          <p className="text-xs font-semibold text-green-700">DEPLOYED</p>
          <p className="text-xs text-green-600 mt-1">
            Posted {response.deployedAt ? new Date(response.deployedAt).toLocaleTimeString() : "Recently"}
          </p>
        </div>
      )}

      {/* Character count warning */}
      <div className="text-xs text-muted-foreground text-center">
        {typeof responseText === "string" ? responseText.length : 0} / 280 characters
      </div>
    </div>
  )
}
