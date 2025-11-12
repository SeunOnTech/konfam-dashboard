"use client"

import type { Threat } from "@/lib/types"
import { ChevronRight } from "lucide-react"
import { useState } from "react"
import { ThreatDetailModal } from "./threat-detail-modal"

interface ThreatDetailPreviewProps {
  threat: Threat
}

function getSeverityColor(severity: string) {
  switch (severity) {
    case "CRITICAL":
      return "bg-destructive text-destructive-foreground"
    case "HIGH":
      return "bg-primary text-primary-foreground"
    case "MEDIUM":
      return "bg-yellow-500 text-white"
    case "LOW":
      return "bg-green-500 text-white"
    default:
      return "bg-muted"
  }
}

export function ThreatDetailPreview({ threat }: ThreatDetailPreviewProps) {
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Header with severity badge */}
        <div className="p-4 md:p-6 border-b border-border">
          <div className="flex items-start justify-between mb-3">
            <div className={`px-3 py-1 rounded-full text-xs md:text-sm font-bold ${getSeverityColor(threat.severity)}`}>
              {threat.severity}
            </div>
            <div className="text-xs text-muted-foreground">{threat.detectedAt.toLocaleTimeString()}</div>
          </div>
          <p className="text-base md:text-lg font-semibold text-foreground mb-2 line-clamp-2">{threat.post.content}</p>
          <p className="text-xs md:text-sm text-muted-foreground">@{threat.post.author.replace("@", "")}</p>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col p-4 md:p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Panic Factor</p>
              <p className="text-2xl font-bold text-primary">{(threat.panicFactor * 100).toFixed(0)}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Threat Level</p>
              <p className="text-2xl font-bold text-primary">{(threat.threatLevel * 100).toFixed(0)}</p>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-2">Detected Keywords</p>
            <div className="flex flex-wrap gap-2">
              {threat.keywords.slice(0, 3).map((keyword, idx) => (
                <span key={idx} className="px-2 py-1 bg-primary/20 text-primary rounded text-xs font-medium">
                  {keyword}
                </span>
              ))}
              {threat.keywords.length > 3 && (
                <span className="px-2 py-1 text-muted-foreground text-xs">+{threat.keywords.length - 3} more</span>
              )}
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-2">Engagement</p>
            <div className="flex justify-between text-sm">
              <span className="text-foreground">{threat.post.engagement.likes} Likes</span>
              <span className="text-foreground">{threat.post.engagement.retweets} Retweets</span>
              <span className="text-foreground">{threat.post.engagement.replies} Replies</span>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6 border-t border-border">
          <button
            onClick={() => setIsDetailModalOpen(true)}
            className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-3 rounded-lg font-semibold hover:shadow-lg transition-all group flex items-center justify-center gap-2 hover:translate-y-[-2px] active:translate-y-[0]"
          >
            <span>View Full Analysis</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Full detail modal */}
      <ThreatDetailModal threat={threat} isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} />
    </>
  )
}
