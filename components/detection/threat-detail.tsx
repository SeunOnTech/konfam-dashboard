// components/detection/threat-detail-preview.tsx
"use client"

import type { DashboardThreat } from "@/lib/api"
import { ChevronRight } from "lucide-react"
import { useState } from "react"
import { ThreatDetailModal } from "./threat-detail-modal"

interface ThreatDetailPreviewProps {
  threat: DashboardThreat
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

  const timeLabel = threat.detectedAt
    ? new Date(threat.detectedAt).toLocaleTimeString("en-NG", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "Unknown time"

  const content = threat.detectedPost?.content || "No content available"
  const author =
    threat.detectedPost?.authorHandle?.replace("@", "") ||
    threat.brand?.name ||
    "unknown"

  const keywords = threat.detectedPost?.matchedKeywords || []

  const panicScore = Math.round(Math.abs(threat.sentimentImpact || 0) * 100)
  const threatLevelScore = Math.round((threat.threatScore || 0) * 100)

  const likes = threat.detectedPost?.likeCount ?? threat.currentEngagement ?? 0
  const retweets = threat.detectedPost?.retweetCount ?? 0
  const replies = threat.detectedPost?.replyCount ?? 0

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Header with severity badge */}
        <div className="p-4 md:p-6 border-b border-border">
          <div className="flex items-start justify-between mb-3">
            <div
              className={`px-3 py-1 rounded-full text-xs md:text-sm font-bold ${getSeverityColor(
                threat.severity
              )}`}
            >
              {threat.severity}
            </div>
            <div className="text-xs text-muted-foreground">
              {timeLabel}
            </div>
          </div>
          <p className="text-base md:text-lg font-semibold text-foreground mb-2 line-clamp-2">
            {content}
          </p>
          <p className="text-xs md:text-sm text-muted-foreground">@{author}</p>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden flex flex-col p-4 md:p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Sentiment Impact</p>
              <p className="text-2xl font-bold text-primary">{panicScore}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Threat Score</p>
              <p className="text-2xl font-bold text-primary">{threatLevelScore}</p>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-2">Detected Keywords</p>
            <div className="flex flex-wrap gap-2">
              {keywords.slice(0, 3).map((keyword, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-primary/20 text-primary rounded text-xs font-medium"
                >
                  {keyword}
                </span>
              ))}
              {keywords.length > 3 && (
                <span className="px-2 py-1 text-muted-foreground text-xs">
                  +{keywords.length - 3} more
                </span>
              )}
              {keywords.length === 0 && (
                <span className="text-xs text-muted-foreground">
                  No explicit keywords detected
                </span>
              )}
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-2">Engagement</p>
            <div className="flex justify-between text-sm">
              <span className="text-foreground">{likes} Likes</span>
              <span className="text-foreground">{retweets} Retweets</span>
              <span className="text-foreground">{replies} Replies</span>
            </div>
          </div>
        </div>

        {/* CTA */}
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

      <ThreatDetailModal
        threat={threat}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />
    </>
  )
}

// // components/detection/threat-detail.tsx
// "use client"

// import type { Threat } from "@/lib/types"
// import { AlertCircle, CheckCircle, Flag } from "lucide-react"
// import { useState } from "react"

// interface ThreatDetailProps {
//   threat: Threat
// }

// function getSeverityColor(severity: string) {
//   switch (severity) {
//     case "CRITICAL":
//       return "bg-destructive text-destructive-foreground"
//     case "HIGH":
//       return "bg-primary text-primary-foreground"
//     case "MEDIUM":
//       return "bg-yellow-500 text-white"
//     case "LOW":
//       return "bg-green-500 text-white"
//     default:
//       return "bg-muted"
//   }
// }

// export function ThreatDetail({ threat }: ThreatDetailProps) {
//   const [showActions, setShowActions] = useState(false)

//   return (
//     <div className="flex flex-col h-full overflow-y-auto">
//       {/* Header with severity */}
//       <div className="p-6 border-b border-border">
//         <div className="flex items-start justify-between mb-4">
//           <div className={`px-4 py-2 rounded-full text-sm font-bold ${getSeverityColor(threat.severity)}`}>
//             {threat.severity} SEVERITY
//           </div>
//           <div className="text-xs text-muted-foreground">{threat.detectedAt.toLocaleTimeString()}</div>
//         </div>
//         <p className="text-lg font-semibold text-foreground mb-2">{threat.post.content}</p>
//         <p className="text-sm text-muted-foreground">Posted by @{threat.post.author.replace("@", "")}</p>
//       </div>

//       {/* Analysis sections */}
//       <div className="flex-1 overflow-y-auto p-6 space-y-6">
//         {/* Detection Details */}
//         <div>
//           <h3 className="font-semibold text-foreground mb-3">Detection Analysis</h3>
//           <div className="grid grid-cols-2 gap-4">
//             <div className="bg-muted/50 rounded-lg p-3">
//               <p className="text-xs text-muted-foreground mb-1">Panic Factor Score</p>
//               <div className="flex items-center gap-2">
//                 <div className="text-2xl font-bold text-primary">{(threat.panicFactor * 100).toFixed(0)}</div>
//                 <p className="text-xs text-muted-foreground">/100</p>
//               </div>
//             </div>
//             <div className="bg-muted/50 rounded-lg p-3">
//               <p className="text-xs text-muted-foreground mb-1">Threat Level</p>
//               <div className="flex items-center gap-2">
//                 <div className="text-2xl font-bold text-primary">{(threat.threatLevel * 100).toFixed(0)}</div>
//                 <p className="text-xs text-muted-foreground">/100</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Keywords & Detection */}
//         <div>
//           <h3 className="font-semibold text-foreground mb-3">Detected Keywords</h3>
//           <div className="flex flex-wrap gap-2">
//             {threat.keywords.map((keyword, idx) => (
//               <span key={idx} className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium">
//                 {keyword}
//               </span>
//             ))}
//           </div>
//         </div>

//         {/* Engagement Metrics */}
//         <div>
//           <h3 className="font-semibold text-foreground mb-3">Engagement Metrics</h3>
//           <div className="grid grid-cols-3 gap-3">
//             <div className="bg-muted/50 rounded-lg p-3">
//               <p className="text-xs text-muted-foreground">Likes</p>
//               <p className="text-xl font-bold text-foreground">{threat.post.engagement.likes.toLocaleString()}</p>
//             </div>
//             <div className="bg-muted/50 rounded-lg p-3">
//               <p className="text-xs text-muted-foreground">Retweets</p>
//               <p className="text-xl font-bold text-foreground">{threat.post.engagement.retweets.toLocaleString()}</p>
//             </div>
//             <div className="bg-muted/50 rounded-lg p-3">
//               <p className="text-xs text-muted-foreground">Replies</p>
//               <p className="text-xl font-bold text-foreground">{threat.post.engagement.replies.toLocaleString()}</p>
//             </div>
//           </div>
//         </div>

//         {/* Verification Status */}
//         <div>
//           <h3 className="font-semibold text-foreground mb-3">Verification Status</h3>
//           <div className="bg-muted/50 rounded-lg p-4 border border-border">
//             <div className="flex items-start gap-3">
//               <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
//               <div>
//                 <p className="font-semibold text-foreground text-sm">UNVERIFIED CLAIM</p>
//                 <p className="text-xs text-muted-foreground mt-1">
//                   Bank systems show normal operational status. Account freeze claims not supported by verified data.
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Action buttons */}
//       <div className="p-6 border-t border-border space-y-2">
//         <button className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
//           <AlertCircle className="w-4 h-4" />
//           Generate Response
//         </button>
//         <button className="w-full border border-border text-foreground py-2 rounded-lg font-semibold hover:bg-muted transition-colors flex items-center justify-center gap-2">
//           <CheckCircle className="w-4 h-4" />
//           Mark as Addressed
//         </button>
//         <button className="w-full border border-border text-foreground py-2 rounded-lg font-semibold hover:bg-muted transition-colors flex items-center justify-center gap-2">
//           <Flag className="w-4 h-4" />
//           Flag for Review
//         </button>
//       </div>
//     </div>
//   )
// }
