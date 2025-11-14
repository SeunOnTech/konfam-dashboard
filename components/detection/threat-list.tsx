// components/detection/threat-list.tsx
"use client"

import { useState } from "react"
import type { DashboardThreat } from "@/lib/api"
import { ThreatCard } from "@/components/monitoring/threat-card"
import { AllThreatsModalPage } from "./all-threats-modal-page"
import { ChevronRight, AlertCircle } from "lucide-react"

interface ThreatListProps {
  threats: DashboardThreat[]
  selectedId?: string
  onSelectThreat: (threat: DashboardThreat) => void
}

export function ThreatList({ threats, selectedId, onSelectThreat }: ThreatListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const sortedThreats = [...threats].sort((a, b) => {
    const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 } as const
    return order[a.severity] - order[b.severity]
  })


  return (
    <>
      <div className="flex-1 overflow-hidden flex flex-col divide-y divide-border h-full">
        <div className="flex-1 overflow-hidden flex flex-col divide-y divide-border">
          {sortedThreats.slice(0, 2).map((threat) => (
            <div
              key={threat.id}
              className={`hover:bg-muted/50 transition-colors cursor-pointer flex-1 overflow-hidden ${
                threat.id === selectedId ? "bg-muted border-l-4 border-l-primary" : ""
              }`}
              onClick={() => onSelectThreat(threat)}
            >
              <ThreatCard threat={threat} isSelected={threat.id === selectedId} />
            </div>
          ))}
        </div>

        {sortedThreats.length > 2 && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="p-3 md:p-4 flex items-center justify-between hover:bg-muted/50 transition-all group bg-gradient-to-r from-primary/5 to-transparent border-none cursor-pointer flex-shrink-0"
          >
            <div className="flex items-center gap-2 md:gap-3 flex-1 text-left min-w-0">
              <AlertCircle className="w-4 md:w-5 h-4 md:h-5 text-primary animate-pulse-subtle" />
              <div className="min-w-0">
                <p className="text-xs md:text-sm font-semibold text-foreground truncate">
                  {sortedThreats.length - 2} more threats
                </p>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  View complete crisis assessment
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 md:w-5 h-4 md:h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
          </button>
        )}
      </div>

      <AllThreatsModalPage
        threats={sortedThreats}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectThreat={(threat) => {
          onSelectThreat(threat)
          setIsModalOpen(false)
        }}
        selectedId={selectedId}
      />
    </>
  )
}



// // components/detection/threat-list.tsx
// "use client"

// import { useState } from "react"
// import type { Threat } from "@/lib/types"
// import { ThreatCard } from "@/components/monitoring/threat-card"
// import { AllThreatsModalPage } from "./all-threats-modal-page"
// import { ChevronRight, AlertCircle } from "lucide-react"

// interface ThreatListProps {
//   threats: Threat[]
//   selectedId?: string
//   onSelectThreat: (threat: Threat) => void
// }

// export function ThreatList({ threats, selectedId, onSelectThreat }: ThreatListProps) {
//   const [isModalOpen, setIsModalOpen] = useState(false)

//   const sortedThreats = [...threats].sort((a, b) => {
//     const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
//     return severityOrder[a.severity] - severityOrder[b.severity]
//   })

//   return (
//     <>
//       <div className="flex-1 overflow-hidden flex flex-col divide-y divide-border h-full">
//         <div className="flex-1 overflow-hidden flex flex-col divide-y divide-border">
//           {sortedThreats.slice(0, 2).map((threat) => (
//             <div
//               key={threat.id}
//               className={`hover:bg-muted/50 transition-colors cursor-pointer flex-1 overflow-hidden ${
//                 threat.id === selectedId ? "bg-muted border-l-4 border-l-primary" : ""
//               }`}
//               onClick={() => onSelectThreat(threat)}
//             >
//               <ThreatCard threat={threat} isSelected={threat.id === selectedId} />
//             </div>
//           ))}
//         </div>

//         {/* Creative CTA for viewing all threats */}
//         {sortedThreats.length > 2 && (
//           <button
//             onClick={() => setIsModalOpen(true)}
//             className="p-3 md:p-4 flex items-center justify-between hover:bg-muted/50 transition-all group bg-gradient-to-r from-primary/5 to-transparent border-none cursor-pointer flex-shrink-0"
//           >
//             <div className="flex items-center gap-2 md:gap-3 flex-1 text-left min-w-0">
//               <div className="relative flex-shrink-0">
//                 <AlertCircle className="w-4 md:w-5 h-4 md:h-5 text-primary animate-pulse-subtle" />
//               </div>
//               <div className="min-w-0">
//                 <p className="text-xs md:text-sm font-semibold text-foreground truncate">
//                   {sortedThreats.length - 2} more threats
//                 </p>
//                 <p className="text-xs text-muted-foreground hidden sm:block">View complete crisis assessment</p>
//               </div>
//             </div>
//             <ChevronRight className="w-4 md:w-5 h-4 md:h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
//           </button>
//         )}
//       </div>

//       {/* Modal */}
//       <AllThreatsModalPage
//         threats={sortedThreats}
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         onSelectThreat={(threat) => {
//           onSelectThreat(threat)
//           setIsModalOpen(false)
//         }}
//         selectedId={selectedId}
//       />
//     </>
//   )
// }
