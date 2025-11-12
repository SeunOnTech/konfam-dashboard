// src/components/detection/threat-detail-modal.tsx
"use client"

import type { Threat } from "@/lib/types"
import { AlertCircle, CheckCircle, Flag, Sparkles } from "lucide-react"
import { useState } from "react"
import { ResponseGenerationFlow } from "./response-generation-flow"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ThreatDetailModalProps {
  threat: Threat
  isOpen: boolean
  onClose: () => void
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

export function ThreatDetailModal({ threat, isOpen, onClose }: ThreatDetailModalProps) {
  const [selectedAction, setSelectedAction] = useState<"respond" | "address" | "flag" | null>(null)
  const [actionStates, setActionStates] = useState({
    responded: false,
    addressed: false,
    flagged: false,
  })

  const handleAction = (action: "respond" | "address" | "flag") => {
    if (action === "respond") {
      setSelectedAction("respond")
    } else if (action === "address") {
      setActionStates((prev) => ({ ...prev, addressed: !prev.addressed }))
      setTimeout(() => setSelectedAction(null), 500)
    } else if (action === "flag") {
      setActionStates((prev) => ({ ...prev, flagged: !prev.flagged }))
      setTimeout(() => setSelectedAction(null), 500)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto z-[100]">
        {selectedAction === "respond" ? (
          <ResponseGenerationFlow threat={threat} onClose={() => setSelectedAction(null)} />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-primary" />
                Threat Analysis
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Threat Header */}
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className={`px-4 py-2 rounded-full text-sm font-bold ${getSeverityColor(threat.severity)}`}>
                    {threat.severity} SEVERITY
                  </div>
                  <div className="text-xs text-muted-foreground">{threat.detectedAt.toLocaleTimeString()}</div>
                </div>
                <p className="text-lg font-semibold text-foreground mb-2">{threat.post.content}</p>
                <p className="text-sm text-muted-foreground">Posted by @{threat.post.author.replace("@", "")}</p>
              </div>

              {/* Analysis Sections */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Detection Analysis</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-xs text-muted-foreground mb-1">Panic Factor Score</p>
                      <div className="flex items-center gap-2">
                        <div className="text-3xl font-bold text-primary">{(threat.panicFactor * 100).toFixed(0)}</div>
                        <p className="text-xs text-muted-foreground">/100</p>
                      </div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-xs text-muted-foreground mb-1">Threat Level</p>
                      <div className="flex items-center gap-2">
                        <div className="text-3xl font-bold text-primary">{(threat.threatLevel * 100).toFixed(0)}</div>
                        <p className="text-xs text-muted-foreground">/100</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-3">Detected Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {threat.keywords.map((keyword, idx) => (
                      <span key={idx} className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-3">Engagement Metrics</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-xs text-muted-foreground">Likes</p>
                      <p className="text-2xl font-bold text-foreground">
                        {threat.post.engagement.likes.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-xs text-muted-foreground">Retweets</p>
                      <p className="text-2xl font-bold text-foreground">
                        {threat.post.engagement.retweets.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-xs text-muted-foreground">Replies</p>
                      <p className="text-2xl font-bold text-foreground">
                        {threat.post.engagement.replies.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-3">Verification Status</h3>
                  <div className="bg-muted/50 rounded-lg p-4 border border-border">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-foreground text-sm">UNVERIFIED CLAIM</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Bank systems show normal operational status. Account freeze claims not supported by verified
                          data.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 border-t border-border pt-4">
                <button
                  onClick={() => handleAction("respond")}
                  className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                    actionStates.responded
                      ? "bg-green-500/20 text-green-600 border border-green-500"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  {actionStates.responded ? "Response Generated ✓" : "Generate Response"}
                </button>

                <button
                  onClick={() => handleAction("address")}
                  className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 border ${
                    actionStates.addressed
                      ? "bg-green-500/20 text-green-600 border-green-500"
                      : "border-border text-foreground hover:bg-muted"
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  {actionStates.addressed ? "Marked as Addressed ✓" : "Mark as Addressed"}
                </button>

                <button
                  onClick={() => handleAction("flag")}
                  className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 border ${
                    actionStates.flagged
                      ? "bg-orange-500/20 text-orange-600 border-orange-500"
                      : "border-border text-foreground hover:bg-muted"
                  }`}
                >
                  <Flag className="w-4 h-4" />
                  {actionStates.flagged ? "Flagged for Review ✓" : "Flag for Review"}
                </button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
