"use client"

import { useState } from "react"
import type { Threat } from "@/lib/types"
import { ThreatCard } from "./threat-card"
import { AllThreatsModal } from "./all-threats-modal"
import { ChevronRight, Sparkles } from "lucide-react"

interface ThreatFeedProps {
  threats: Threat[]
  onSelectThreat: (threat: Threat) => void
  selectedId?: string
}

export function ThreatFeed({ threats, onSelectThreat, selectedId }: ThreatFeedProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const sortedThreats = [...threats].sort((a, b) => {
    const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
    return severityOrder[a.severity] - severityOrder[b.severity]
  })

  // Show only first 2 threats - ensure no scrolling
  const displayedThreats = sortedThreats.slice(0, 2)
  const hasMore = sortedThreats.length > 2

  return (
    <>
      {/* Desktop and tablet view - no scrolling, fixed height */}
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

        {/* Creative CTA for viewing all threats */}
        {hasMore && (
          <div
            className="p-4 flex items-center justify-between hover:bg-muted/50 transition-all cursor-pointer group"
            onClick={() => setIsModalOpen(true)}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="relative flex-shrink-0">
                <Sparkles className="w-5 h-5 text-primary animate-pulse-subtle" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  View all {sortedThreats.length} threats
                </p>
                <p className="text-xs text-muted-foreground">{sortedThreats.length - 2} more crisis alerts waiting</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
          </div>
        )}
      </div>

      {/* Modal for all threats */}
      <AllThreatsModal
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
