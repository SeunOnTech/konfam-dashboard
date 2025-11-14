import type { DashboardThreat } from "@/lib/api"
import { MessageCircle, Heart, Repeat2 } from "lucide-react"

interface ThreatCardProps {
  threat: DashboardThreat
  isSelected?: boolean
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

// NEW → Status badge style
function getStatusBadge(threat: DashboardThreat) {
  const status = threat.response?.status

  if (!status || status === "PENDING") {
    return {
      label: "Pending",
      className:
        "bg-muted text-muted-foreground border border-border",
    }
  }

  if (status === "POSTED") {
    return {
      label: "Resolved",
      className:
        "bg-green-600 text-white",
    }
  }

  if (status === "FAILED") {
    return {
      label: "Failed",
      className:
        "bg-red-600 text-white",
    }
  }

  return {
    label: "Pending",
    className: "bg-muted text-muted-foreground",
  }
}

export function ThreatCard({ threat, isSelected }: ThreatCardProps) {
  const likes =
    threat.detectedPost?.likeCount ??
    threat.currentEngagement ??
    0
  const retweets = threat.detectedPost?.retweetCount ?? 0
  const replies = threat.detectedPost?.replyCount ?? 0
  const panic = Math.min(1, Math.abs(threat.sentimentImpact ?? 0))

  const timestampSource =
    threat.detectedPost?.postedAt || threat.detectedAt

  const timestampLabel = timestampSource
    ? new Date(timestampSource).toLocaleString("en-NG", {
        hour12: false,
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Just now"

  const content = threat.detectedPost?.content
    // threat.verificationSummary ||
    // threat.detectedPost?.content ||
    // "Potential issue detected..."

  const author =
    threat.detectedPost?.authorHandle?.replace("@", "") ||
    threat.brand?.name ||
    "brand"

  const statusBadge = getStatusBadge(threat)

  return (
    <div
      className={`p-4 border-l-4 ${
        isSelected ? "bg-muted border-l-primary" : "border-l-transparent"
      }`}
    >
      {/* Top row: Severity + Status + Time */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className={`px-3 py-1 rounded-full text-xs font-bold ${getSeverityColor(
              threat.severity
            )}`}
          >
            {threat.severity}
          </div>

          {/* NEW — Status badge */}
          <div
            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusBadge.className}`}
          >
            {statusBadge.label}
          </div>
        </div>

        <span className="text-xs text-muted-foreground">
          {timestampLabel}
        </span>
      </div>

      <p className="text-sm text-foreground mb-2 line-clamp-2">
        {content}
      </p>

      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-muted-foreground">
          @{author}
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Heart className="w-3 h-3" />
          {likes.toLocaleString()}
        </div>
        <div className="flex items-center gap-1">
          <Repeat2 className="w-3 h-3" />
          {retweets.toLocaleString()}
        </div>
        <div className="flex items-center gap-1">
          <MessageCircle className="w-3 h-3" />
          {replies.toLocaleString()}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-border flex items-center gap-4">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">Sentiment Impact</p>
          <div className="w-full bg-muted rounded-full h-1.5 mt-1">
            <div
              className="bg-primary h-1.5 rounded-full"
              style={{ width: `${panic * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// // components/monitoring/threat-card.tsx
// import type { DashboardThreat } from "@/lib/api"
// import { MessageCircle, Heart, Repeat2 } from "lucide-react"

// interface ThreatCardProps {
//   threat: DashboardThreat
//   isSelected?: boolean
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
//       return "bg-muted text-muted-foreground"
//   }
// }

// export function ThreatCard({ threat, isSelected }: ThreatCardProps) {
//   const likes =
//     threat.detectedPost?.likeCount ??
//     threat.currentEngagement ??
//     0
//   const retweets = threat.detectedPost?.retweetCount ?? 0
//   const replies = threat.detectedPost?.replyCount ?? 0
//   const panic = Math.min(1, Math.abs(threat.sentimentImpact ?? 0))

//   const timestampSource =
//     threat.detectedPost?.postedAt || threat.detectedAt

//   const timestampLabel = timestampSource
//     ? new Date(timestampSource).toLocaleString("en-NG", {
//         hour12: false,
//         month: "short",
//         day: "numeric",
//         hour: "2-digit",
//         minute: "2-digit",
//       })
//     : "Just now"

//   const content =
//     threat.verificationSummary ||
//     threat.detectedPost?.content ||
//     "Potential issue detected..."

//   const author =
//     threat.detectedPost?.authorHandle?.replace("@", "") ||
//     threat.brand?.name ||
//     "brand"

//     console.log('threat', threat)

//   return (
//     <div
//       className={`p-4 border-l-4 ${
//         isSelected ? "bg-muted border-l-primary" : "border-l-transparent"
//       }`}
//     >
//       <div className="flex items-start gap-3 mb-2">
//         <div
//           className={`px-3 py-1 rounded-full text-xs font-bold ${getSeverityColor(
//             threat.severity
//           )}`}
//         >
//           {threat.severity}
//         </div>
//         <span className="text-xs text-muted-foreground">
//           {timestampLabel}
//         </span>
//       </div>

//       <p className="text-sm text-foreground mb-2 line-clamp-2">
//         {content}
//       </p>

//       <div className="flex items-center justify-between mb-2">
//         <span className="text-xs font-semibold text-muted-foreground">
//           @{author}
//         </span>
//       </div>

//       <div className="flex items-center gap-4 text-xs text-muted-foreground">
//         <div className="flex items-center gap-1">
//           <Heart className="w-3 h-3" />
//           {likes.toLocaleString()}
//         </div>
//         <div className="flex items-center gap-1">
//           <Repeat2 className="w-3 h-3" />
//           {retweets.toLocaleString()}
//         </div>
//         <div className="flex items-center gap-1">
//           <MessageCircle className="w-3 h-3" />
//           {replies.toLocaleString()}
//         </div>
//       </div>

//       <div className="mt-3 pt-3 border-t border-border flex items-center gap-4">
//         <div className="flex-1">
//           <p className="text-xs text-muted-foreground">Sentiment Impact</p>
//           <div className="w-full bg-muted rounded-full h-1.5 mt-1">
//             <div
//               className="bg-primary h-1.5 rounded-full"
//               style={{ width: `${panic * 100}%` }}
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }