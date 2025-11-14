"use client"

import { useState } from "react"
import type { DashboardThreat } from "@/lib/api"
import { ThreatCard } from "./threat-card"
import { AllThreatsModal } from "./all-threats-modal"
import { ChevronRight, Sparkles } from "lucide-react"

interface ThreatFeedProps {
  threats: DashboardThreat[]
  onSelectThreat: (threat: DashboardThreat) => void
  selectedId?: string
}

export function ThreatFeed({ threats, onSelectThreat, selectedId }: ThreatFeedProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }

  // ✅ Sort by recent first → then severity
  const sortedThreats = [...threats].sort((a, b) => {
    const timeA = new Date(a.detectedAt ?? a.createdAt ?? 0).getTime()
    const timeB = new Date(b.detectedAt ?? b.createdAt ?? 0).getTime()

    // Primary: newest first
    if (timeA !== timeB) return timeB - timeA

    // Secondary: severity fallback
    return severityOrder[a.severity] - severityOrder[b.severity]
  })

  const displayedThreats = sortedThreats.slice(0, 2)
  const hasMore = sortedThreats.length > 2

  return (
    <>
      <div className="divide-y divide-border">
        {displayedThreats.map((threat) => (
          <div
            key={threat.id}
            className="hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => onSelectThreat(threat)}
          >
            <ThreatCard threat={threat} isSelected={threat.id === selectedId} />
          </div>
        ))}

        {hasMore && (
          <div
            className="p-4 flex items-center justify-between hover:bg-muted/50 transition-all cursor-pointer group"
            onClick={() => setIsModalOpen(true)}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Sparkles className="w-5 h-5 text-primary animate-pulse-subtle" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  View all {sortedThreats.length} threats
                </p>
                <p className="text-xs text-muted-foreground">
                  {sortedThreats.length - 2} more crisis alerts waiting
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
          </div>
        )}
      </div>

      <AllThreatsModal
        threats={sortedThreats}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectThreat={(t) => {
          onSelectThreat(t)
          setIsModalOpen(false)
        }}
        selectedId={selectedId}
      />
    </>
  )
}

// "use client"

// import { useState } from "react"
// import type { DashboardThreat } from "@/lib/api"
// import { ThreatCard } from "./threat-card"
// import { AllThreatsModal } from "./all-threats-modal"
// import { ChevronRight, Sparkles } from "lucide-react"

// interface ThreatFeedProps {
//   threats: DashboardThreat[]
//   onSelectThreat: (threat: DashboardThreat) => void
//   selectedId?: string
// }

// export function ThreatFeed({ threats, onSelectThreat, selectedId }: ThreatFeedProps) {
//   const [isModalOpen, setIsModalOpen] = useState(false)

//   const sortedThreats = [...threats].sort((a, b) => {
//     const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
//     return order[a.severity] - order[b.severity]
//   })

//   const displayedThreats = sortedThreats.slice(0, 2)
//   const hasMore = sortedThreats.length > 2

//   //console.log("ThreatFeed - displaying threats:", displayedThreats)

//   return (
//     <>
//       <div className="divide-y divide-border">
//         {displayedThreats.map((threat) => (
//           <div
//             key={threat.id}
//             className="hover:bg-muted/50 transition-colors cursor-pointer"
//             onClick={() => onSelectThreat(threat)}
//           >
//             <ThreatCard threat={threat} isSelected={threat.id === selectedId} />
//           </div>
//         ))}

//         {hasMore && (
//           <div
//             className="p-4 flex items-center justify-between hover:bg-muted/50 transition-all cursor-pointer group"
//             onClick={() => setIsModalOpen(true)}
//           >
//             <div className="flex items-center gap-3 flex-1 min-w-0">
//               <Sparkles className="w-5 h-5 text-primary animate-pulse-subtle" />
//               <div className="min-w-0">
//                 <p className="text-sm font-semibold text-foreground truncate">
//                   View all {sortedThreats.length} threats
//                 </p>
//                 <p className="text-xs text-muted-foreground">
//                   {sortedThreats.length - 2} more crisis alerts waiting
//                 </p>
//               </div>
//             </div>
//             <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
//           </div>
//         )}
//       </div>

//       <AllThreatsModal
//         threats={sortedThreats}
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         onSelectThreat={(t) => {
//           onSelectThreat(t)
//           setIsModalOpen(false)
//         }}
//         selectedId={selectedId}
//       />
//     </>
//   )
// }