// components/detection/threat-detail-modal.tsx
"use client"

import type { DashboardThreat } from "@/lib/api"
import { AlertCircle, CheckCircle, Flag, Sparkles } from "lucide-react"
import { useState } from "react"
import { ResponseGenerationFlow } from "./response-generation-flow"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ThreatDetailModalProps {
  threat: DashboardThreat
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

  const timeLabel = threat.detectedAt
    ? new Date(threat.detectedAt).toLocaleString("en-NG", {
        hour12: false,
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Unknown time"

  const content = threat.detectedPost?.content || "No content available"
  const author =
    threat.detectedPost?.authorHandle?.replace("@", "") ||
    threat.brand?.name ||
    "unknown"

  const keywords = threat.detectedPost?.matchedKeywords || []

  const likes = threat.detectedPost?.likeCount ?? threat.currentEngagement ?? 0
  const retweets = threat.detectedPost?.retweetCount ?? 0
  const replies = threat.detectedPost?.replyCount ?? 0

  const panicScore = Math.round(Math.abs(threat.sentimentImpact || 0) * 100)
  const threatLevelScore = Math.round((threat.threatScore || 0) * 100)

  const verificationLabel =
    threat.verificationStatus || "UNVERIFIED"
  const verificationSummary =
    threat.verificationSummary ||
    "Claim not yet fully verified against internal data."

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto z-[100]">
        {selectedAction === "respond" ? (
          // NOTE: ResponseGenerationFlow likely still expects old Threat.
          // Cast to any for now; we can refactor that component next.
          <ResponseGenerationFlow
            threat={threat as any}
            onClose={() => setSelectedAction(null)}
          />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-primary" />
                Threat Analysis
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`px-4 py-2 rounded-full text-sm font-bold ${getSeverityColor(
                      threat.severity
                    )}`}
                  >
                    {threat.severity} SEVERITY
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {timeLabel}
                  </div>
                </div>
                <p className="text-lg font-semibold text-foreground mb-2">
                  {content}
                </p>
                <p className="text-sm text-muted-foreground">
                  Posted by @{author}
                </p>
              </div>

              {/* Analysis Sections */}
              <div className="space-y-4">
                {/* Detection analysis */}
                <div>
                  <h3 className="font-semibold text-foreground mb-3">
                    Detection Analysis
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-xs text-muted-foreground mb-1">
                        Sentiment Impact
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="text-3xl font-bold text-primary">
                          {panicScore/100}
                        </div>
                        <p className="text-xs text-muted-foreground">/100</p>
                      </div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-xs text-muted-foreground mb-1">
                        Threat Score
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="text-3xl font-bold text-primary">
                          {threatLevelScore/100}
                        </div>
                        <p className="text-xs text-muted-foreground">/100</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Keywords */}
                <div>
                  <h3 className="font-semibold text-foreground mb-3">
                    Detected Keywords
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {keywords.length > 0 ? (
                      keywords.map((keyword, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium"
                        >
                          {keyword}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        No explicit keywords detected
                      </span>
                    )}
                  </div>
                </div>

                {/* Engagement */}
                <div>
                  <h3 className="font-semibold text-foreground mb-3">
                    Engagement Metrics
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-xs text-muted-foreground">Likes</p>
                      <p className="text-2xl font-bold text-foreground">
                        {likes.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-xs text-muted-foreground">
                        Retweets
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {retweets.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-xs text-muted-foreground">Replies</p>
                      <p className="text-2xl font-bold text-foreground">
                        {replies.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Verification */}
                <div>
                  <h3 className="font-semibold text-foreground mb-3">
                    Verification Status
                  </h3>
                  <div className="bg-muted/50 rounded-lg p-4 border border-border">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-foreground text-sm">
                          {verificationLabel}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {verificationSummary}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {/* <div className="space-y-2 border-t border-border pt-4">
                <button
                  onClick={() => handleAction("respond")}
                  className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                    actionStates.responded
                      ? "bg-green-500/20 text-green-600 border border-green-500"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  {actionStates.responded
                    ? "Response Generated ✓"
                    : "Generate Response"}
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
                  {actionStates.addressed
                    ? "Marked as Addressed ✓"
                    : "Mark as Addressed"}
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
                  {actionStates.flagged
                    ? "Flagged for Review ✓"
                    : "Flag for Review"}
                </button>
              </div> */}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
