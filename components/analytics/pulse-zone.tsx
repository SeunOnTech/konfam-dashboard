// components/analytics/pulse-zone-connected.tsx
"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Heart, MessageCircle, Repeat2, Loader2 } from "lucide-react"
import { useThreatAnalytics } from "@/hooks/use-analytics"

interface PulseZoneConnectedProps {
  crisisId?: string
  minThreatLevel?: number
}

export function PulseZoneConnected({ crisisId, minThreatLevel = 0.5 }: PulseZoneConnectedProps) {
  const [stackIndex, setStackIndex] = useState(0)
  const { data, loading, error } = useThreatAnalytics(crisisId, minThreatLevel, 3000)

  const threats = data?.topThreats || []
  const visibleThreats = threats.slice(stackIndex, stackIndex + 5)

  const getSeverityFromLevel = (level: number): string => {
    if (level >= 0.85) return "CRITICAL"
    if (level >= 0.7) return "HIGH"
    if (level >= 0.5) return "MEDIUM"
    return "LOW"
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-destructive text-destructive-foreground"
      case "HIGH":
        return "bg-orange-500 text-white"
      case "MEDIUM":
        return "bg-yellow-500 text-white"
      default:
        return "bg-blue-500 text-white"
    }
  }

  const getSeverityBorder = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "border-l-4 border-destructive"
      case "HIGH":
        return "border-l-4 border-orange-500"
      case "MEDIUM":
        return "border-l-4 border-yellow-500"
      default:
        return "border-l-4 border-blue-500"
    }
  }

  const formatEngagement = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const getTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ago`
  }

  if (error) {
    return (
      <Card className="overflow-hidden">
        <div className="p-6 flex items-center justify-center gap-2 text-destructive">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">Failed to load threats: {error}</span>
        </div>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <div className="p-4 md:p-6 space-y-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <h3 className="font-semibold text-foreground">Live Threats</h3>
            {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          </div>
          <div className="flex items-center gap-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
            </span>
            <span className="text-xs text-muted-foreground">LIVE</span>
          </div>
        </div>

        <div className="relative flex-1 min-h-80 md:min-h-96">
          {visibleThreats.length === 0 && !loading ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <p className="text-sm">No threats detected</p>
            </div>
          ) : (
            <div className="space-y-2">
              {visibleThreats.map((threat, idx) => {
                const severity = getSeverityFromLevel(threat.threatLevel)
                return (
                  <div
                    key={threat.id}
                    className={`
                      relative p-4 rounded-lg border bg-card transition-all duration-300
                      ${getSeverityBorder(severity)}
                      ${idx === 0 ? "scale-100 opacity-100 z-10" : `scale-95 opacity-70 -mt-3 z-${10 - idx}`}
                      hover:shadow-lg cursor-pointer
                    `}
                    style={{
                      transform: `translateY(${idx * 12}px)`,
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <Badge className={getSeverityColor(severity)}>{severity}</Badge>
                      <span className="text-sm font-semibold text-foreground">
                        {Math.round(threat.threatLevel * 100)}/100
                      </span>
                    </div>

                    <p className="text-sm text-foreground mt-2 line-clamp-2">
                      {threat.content}
                    </p>

                    <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{formatEngagement(threat.engagements)}</span>
                          <span>engagements</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{threat.viralCoefficient.toFixed(1)}x</span>
                          <span>viral</span>
                        </div>
                      </div>
                      <span>{getTimeAgo(threat.createdAt)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex gap-1">
            {[...Array(Math.min(5, Math.ceil(threats.length / 5)))].map((_, i) => (
              <button
                key={i}
                className={`h-2 w-2 rounded-full transition-colors ${
                  i === stackIndex ? "bg-primary" : "bg-muted-foreground/30"
                }`}
                onClick={() => setStackIndex(i)}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            {data?.totalThreats || 0} total threats
          </span>
        </div>
      </div>
    </Card>
  )
}

// "use client"

// import { useState } from "react"
// import { Card } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { AlertCircle, Heart, MessageCircle, Repeat2 } from "lucide-react"
// import type { Threat } from "@/lib/types"

// interface PulseZoneProps {
//   threats: Threat[]
// }

// export function PulseZone({ threats }: PulseZoneProps) {
//   const [stackIndex, setStackIndex] = useState(0)
//   const visibleThreats = threats.slice(stackIndex, stackIndex + 5)

//   const getSeverityColor = (severity: string) => {
//     switch (severity) {
//       case "CRITICAL":
//         return "bg-destructive text-destructive-foreground"
//       case "HIGH":
//         return "bg-orange-500 text-white"
//       case "MEDIUM":
//         return "bg-yellow-500 text-white"
//       default:
//         return "bg-blue-500 text-white"
//     }
//   }

//   const getSeverityBorder = (severity: string) => {
//     switch (severity) {
//       case "CRITICAL":
//         return "border-l-4 border-destructive"
//       case "HIGH":
//         return "border-l-4 border-orange-500"
//       case "MEDIUM":
//         return "border-l-4 border-yellow-500"
//       default:
//         return "border-l-4 border-blue-500"
//     }
//   }

//   return (
//     <Card className="overflow-hidden flex flex-col h-full">
//       <div className="p-4 md:p-6 space-y-4 flex-1 flex flex-col">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-2">
//             <AlertCircle className="w-5 h-5 text-destructive" />
//             <h3 className="font-semibold text-foreground">Live Threats</h3>
//           </div>
//           <div className="flex items-center gap-1">
//             <span className="relative flex h-2 w-2">
//               <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
//               <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
//             </span>
//             <span className="text-xs text-muted-foreground">LIVE</span>
//           </div>
//         </div>

//         <div className="relative flex-1 min-h-80 md:min-h-96">
//           <div className="space-y-2">
//             {visibleThreats.map((threat, idx) => (
//               <div
//                 key={threat.id}
//                 className={`
//                   relative p-4 rounded-lg border bg-card transition-all duration-300
//                   ${getSeverityBorder(threat.severity)}
//                   ${idx === 0 ? "scale-100 opacity-100 z-10" : `scale-95 opacity-70 -mt-3 z-${10 - idx}`}
//                   hover:shadow-lg cursor-pointer
//                 `}
//                 style={{
//                   transform: `translateY(${idx * 12}px)`,
//                 }}
//               >
//                 <div className="flex items-start justify-between gap-3">
//                   <Badge className={getSeverityColor(threat.severity)}>{threat.severity}</Badge>
//                   <span className="text-sm font-semibold text-foreground">
//                     {Math.round(threat.threatLevel * 100)}/100
//                   </span>
//                 </div>

//                 <p className="text-sm text-foreground mt-2 line-clamp-2">{threat.post.content}</p>

//                 <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
//                   <div className="flex items-center gap-3">
//                     <div className="flex items-center gap-1">
//                       <Heart className="w-3 h-3" />
//                       {threat.post.engagement.likes}
//                     </div>
//                     <div className="flex items-center gap-1">
//                       <Repeat2 className="w-3 h-3" />
//                       {threat.post.engagement.retweets}
//                     </div>
//                     <div className="flex items-center gap-1">
//                       <MessageCircle className="w-3 h-3" />
//                       {threat.post.engagement.replies}
//                     </div>
//                   </div>
//                   <span>{threat.post.timestamp}</span>
//                 </div>

//                 <p className="text-xs text-muted-foreground mt-2">{threat.post.author}</p>
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className="flex items-center justify-between pt-4 border-t border-border">
//           <div className="flex gap-1">
//             {[...Array(Math.min(5, threats.length))].map((_, i) => (
//               <button
//                 key={i}
//                 className={`h-2 w-2 rounded-full transition-colors ${
//                   i === stackIndex ? "bg-primary" : "bg-muted-foreground/30"
//                 }`}
//                 onClick={() => setStackIndex(i)}
//               />
//             ))}
//           </div>
//           <span className="text-xs text-muted-foreground">{visibleThreats.length} threats</span>
//         </div>
//       </div>
//     </Card>
//   )
// }
