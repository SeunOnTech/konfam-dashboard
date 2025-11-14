"use client"

import { useState, useEffect } from "react"
import type { DashboardThreat } from "@/lib/api"
import { ChevronRight } from "lucide-react"
import { ThreatDetailModal } from "./threat-detail-modal"

interface Props {
  threat: DashboardThreat
  autoOpen?: boolean
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
      return "bg-muted text-muted-foreground"
  }
}

function getStatusBadge(threat: DashboardThreat) {
  const status = threat.response?.status

  if (!status || status === "PENDING") {
    return {
      label: "Pending",
      className: "bg-muted text-muted-foreground border border-border",
    }
  }

  if (status === "POSTED") {
    return {
      label: "Resolved",
      className: "bg-green-600 text-white",
    }
  }

  if (status === "FAILED") {
    return {
      label: "Failed",
      className: "bg-red-600 text-white",
    }
  }

  return {
    label: "Pending",
    className: "bg-muted text-muted-foreground",
  }
}

export function ThreatDetailPreview({ threat, autoOpen }: Props) {
  const [isOpen, setIsOpen] = useState(false)

  const post = threat.detectedPost
  const statusBadge = getStatusBadge(threat)

  // 🔓 Auto-open modal when coming from deep link (/threats?open={id})
  useEffect(() => {
    if (autoOpen) {
      setIsOpen(true)
    }
  }, [autoOpen])

  return (
    <>
      <div className="flex flex-col h-full">
        {/* HEADER */}
        <div className="p-4 border-b border-border">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                className={`px-3 py-1 rounded-full text-xs font-bold ${getSeverityColor(
                  threat.severity
                )}`}
              >
                {threat.severity}
              </div>

              {/* Status Badge */}
              <div
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusBadge.className}`}
              >
                {statusBadge.label}
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              {threat.detectedAt
                ? new Date(threat.detectedAt).toLocaleTimeString("en-NG")
                : "Unknown"}
            </div>
          </div>

          <p className="text-base font-semibold text-foreground mb-1">
            {post?.content}
          </p>

          {post?.authorHandle && (
            <p className="text-xs text-muted-foreground">@{post.authorHandle}</p>
          )}
        </div>

        {/* BODY */}
        <div className="flex-1 p-4 space-y-4">
          {/* Keywords */}
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-2">Detected Keywords</p>

            <div className="flex flex-wrap gap-2">
              {(post?.matchedKeywords ?? []).length > 0 ? (
                (post?.matchedKeywords ?? [])
                  .slice(0, 6)
                  .map((kw, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-primary/20 text-primary rounded text-xs"
                    >
                      {kw}
                    </span>
                  ))
              ) : (
                <span className="text-xs text-muted-foreground">
                  No keywords detected
                </span>
              )}
            </div>
          </div>

          {/* Engagement */}
          {post && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Engagement</p>
              <div className="flex justify-between text-sm">
                <span>{post.likeCount} Likes</span>
                <span>{post.retweetCount} Retweets</span>
                <span>{post.replyCount} Replies</span>
              </div>
            </div>
          )}

          {/* AI Response Summary (optional) */}
          {threat.response?.summary && (
            <div className="bg-muted/40 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">
                AI Response Summary
              </p>
              <p className="text-sm text-foreground">{threat.response.summary}</p>
            </div>
          )}
        </div>

        {/* BUTTON */}
        <div className="p-4 border-t border-border">
          <button
            onClick={() => setIsOpen(true)}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
          >
            View Full Analysis
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MODAL */}
      <ThreatDetailModal
        threat={threat}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  )
}

// "use client"

// import type { DashboardThreat } from "@/lib/api"
// import { ChevronRight } from "lucide-react"
// import { useState } from "react"
// import { ThreatDetailModal } from "./threat-detail-modal"

// interface Props {
//   threat: DashboardThreat
// }

// function getSeverityColor(severity: string) {
//   switch (severity) {
//     case "CRITICAL": return "bg-destructive text-destructive-foreground"
//     case "HIGH": return "bg-primary text-primary-foreground"
//     case "MEDIUM": return "bg-yellow-500 text-white"
//     case "LOW": return "bg-green-500 text-white"
//     default: return "bg-muted text-muted-foreground"
//   }
// }

// // NEW — Status badge logic
// function getStatusBadge(threat: DashboardThreat) {
//   const status = threat.response?.status

//   if (!status || status === "PENDING") {
//     return {
//       label: "Pending",
//       className: "bg-muted text-muted-foreground border border-border",
//     }
//   }

//   if (status === "POSTED") {
//     return {
//       label: "Resolved",
//       className: "bg-green-600 text-white",
//     }
//   }

//   if (status === "FAILED") {
//     return {
//       label: "Failed",
//       className: "bg-red-600 text-white",
//     }
//   }

//   return {
//     label: "Pending",
//     className: "bg-muted text-muted-foreground",
//   }
// }

// export function ThreatDetailPreview({ threat }: Props) {
//   const [isOpen, setIsOpen] = useState(false)

//   const post = threat.detectedPost
//   const statusBadge = getStatusBadge(threat)

//   return (
//     <>
//       <div className="flex flex-col h-full">

//         {/* HEADER */}
//         <div className="p-4 border-b border-border">
//           <div className="flex items-start justify-between mb-3">
//             <div className="flex items-center gap-2">
//               <div
//                 className={`px-3 py-1 rounded-full text-xs font-bold ${getSeverityColor(
//                   threat.severity
//                 )}`}
//               >
//                 {threat.severity}
//               </div>

//               {/* NEW — STATUS BADGE */}
//               <div
//                 className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusBadge.className}`}
//               >
//                 {statusBadge.label}
//               </div>
//             </div>

//             <div className="text-xs text-muted-foreground">
//               {threat.detectedAt
//                 ? new Date(threat.detectedAt).toLocaleTimeString("en-NG")
//                 : "Unknown"}
//             </div>
//           </div>

//           <p className="text-base font-semibold text-foreground mb-1">
//             {post?.content}
//           </p>

//           {post?.authorHandle && (
//             <p className="text-xs text-muted-foreground">@{post.authorHandle}</p>
//           )}
//         </div>

//         {/* BODY */}
//         <div className="flex-1 p-4 space-y-4">

//           {/* Keywords */}
//           <div className="bg-muted/50 rounded-lg p-3">
//             <p className="text-xs text-muted-foreground mb-2">Detected Keywords</p>

//             <div className="flex flex-wrap gap-2">
//               {(post?.matchedKeywords ?? []).length > 0 ? (
//                 (post!.matchedKeywords ?? [])
//                   .slice(0, 6)
//                   .map((kw, i) => (
//                     <span
//                       key={i}
//                       className="px-2 py-1 bg-primary/20 text-primary rounded text-xs"
//                     >
//                       {kw}
//                     </span>
//                   ))
//               ) : (
//                 <span className="text-xs text-muted-foreground">
//                   No keywords detected
//                 </span>
//               )}
//             </div>
//           </div>

//           {/* Engagement */}
//           {post && (
//             <div>
//               <p className="text-xs text-muted-foreground mb-2">Engagement</p>
//               <div className="flex justify-between text-sm">
//                 <span>{post.likeCount} Likes</span>
//                 <span>{post.retweetCount} Retweets</span>
//                 <span>{post.replyCount} Replies</span>
//               </div>
//             </div>
//           )}

//           {/* NEW – Response snippet (if exists) */}
//           {threat.response?.summary && (
//             <div className="bg-muted/40 p-3 rounded-lg">
//               <p className="text-xs text-muted-foreground mb-1">
//                 AI Response Summary
//               </p>
//               <p className="text-sm text-foreground">{threat.response.summary}</p>
//             </div>
//           )}
//         </div>

//         {/* BUTTON */}
//         <div className="p-4 border-t border-border">
//           <button
//             onClick={() => setIsOpen(true)}
//             className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
//           >
//             View Full Analysis
//             <ChevronRight className="w-4 h-4" />
//           </button>
//         </div>
//       </div>

//       {/* MODAL */}
//       <ThreatDetailModal
//         threat={threat}
//         isOpen={isOpen}
//         onClose={() => setIsOpen(false)}
//       />
//     </>
//   )
// }
