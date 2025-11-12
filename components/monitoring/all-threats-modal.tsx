"use client"

import { useState, useMemo } from "react"
import { X, Search, ArrowUpDown, AlertCircle } from "lucide-react"
import type { Threat } from "@/lib/types"
import { ThreatCard } from "./threat-card"

interface AllThreatsModalProps {
  threats: Threat[]
  isOpen: boolean
  onClose: () => void
  onSelectThreat: (threat: Threat) => void
  selectedId?: string
}

type SortOption = "severity" | "panic" | "engagement" | "recent"

export function AllThreatsModal({ threats, isOpen, onClose, onSelectThreat, selectedId }: AllThreatsModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("severity")
  const [showSortMenu, setShowSortMenu] = useState(false)

  const filteredAndSortedThreats = useMemo(() => {
    let result = [...threats]

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (threat) =>
          threat.post.content.toLowerCase().includes(query) ||
          threat.keywords.some((k) => k.toLowerCase().includes(query)) ||
          threat.post.author.toLowerCase().includes(query),
      )
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "severity":
          const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
          return severityOrder[a.severity] - severityOrder[b.severity]
        case "panic":
          return b.panicFactor - a.panicFactor
        case "engagement":
          const aEngagement = a.post.engagement.likes + a.post.engagement.retweets + a.post.engagement.replies
          const bEngagement = b.post.engagement.likes + b.post.engagement.retweets + b.post.engagement.replies
          return bEngagement - aEngagement
        case "recent":
          return b.detectedAt.getTime() - a.detectedAt.getTime()
        default:
          return 0
      }
    })

    return result
  }, [threats, searchQuery, sortBy])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-200" onClick={onClose} />

      {/* Modal - Desktop/Tablet */}
      <div className="hidden md:flex fixed inset-0 z-[100] items-center justify-center p-4">
        <div
          className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-border flex-shrink-0">
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-foreground">
                All Threats ({filteredAndSortedThreats.length})
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground">
                Monitoring {threats.length} active crisis alerts
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search and Sort Bar */}
          <div className="flex flex-col sm:flex-row gap-2 p-4 md:p-6 border-b border-border flex-shrink-0 bg-muted/30">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search threats, keywords, authors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div className="relative">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors whitespace-nowrap"
              >
                <ArrowUpDown className="w-4 h-4" />
                Sort
              </button>

              {showSortMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-10 animate-in fade-in slide-in-from-top-2 duration-200">
                  {[
                    { value: "severity" as const, label: "By Severity" },
                    { value: "panic" as const, label: "By Panic Factor" },
                    { value: "engagement" as const, label: "By Engagement" },
                    { value: "recent" as const, label: "Most Recent" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value)
                        setShowSortMenu(false)
                      }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors first:rounded-t-lg last:rounded-b-lg ${
                        sortBy === option.value
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Threats List */}
          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {filteredAndSortedThreats.length > 0 ? (
              filteredAndSortedThreats.map((threat) => (
                <div
                  key={threat.id}
                  className={`hover:bg-muted/50 transition-colors cursor-pointer ${
                    threat.id === selectedId ? "bg-muted/50 border-l-4 border-l-primary" : ""
                  }`}
                  onClick={() => onSelectThreat(threat)}
                >
                  <ThreatCard threat={threat} isSelected={threat.id === selectedId} />
                </div>
              ))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-12 px-4">
                <AlertCircle className="w-12 h-12 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground text-center">No threats match your search</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Sheet - Mobile */}
      <div className="md:hidden fixed inset-0 z-[100] flex flex-col pointer-events-none">
        <div className="flex-1" onClick={onClose} />

        <div
          className="bg-card rounded-t-2xl border-t border-border border-x border-x-border flex flex-col max-h-[90vh] animate-in slide-in-from-bottom duration-300 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Handle bar */}
          <div className="flex justify-center pt-2 pb-1">
            <div className="w-12 h-1 bg-muted rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div>
              <h2 className="text-lg font-semibold text-foreground">All Threats ({filteredAndSortedThreats.length})</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search and Sort Bar */}
          <div className="flex flex-col gap-2 p-3 border-b border-border bg-muted/30">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search threats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div className="relative">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors w-full justify-center"
              >
                <ArrowUpDown className="w-4 h-4" />
                Sort
              </button>

              {showSortMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-10 animate-in fade-in slide-in-from-top-2 duration-200">
                  {[
                    { value: "severity" as const, label: "By Severity" },
                    { value: "panic" as const, label: "By Panic Factor" },
                    { value: "engagement" as const, label: "By Engagement" },
                    { value: "recent" as const, label: "Most Recent" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value)
                        setShowSortMenu(false)
                      }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors first:rounded-t-lg last:rounded-b-lg ${
                        sortBy === option.value
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Threats List */}
          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {filteredAndSortedThreats.length > 0 ? (
              filteredAndSortedThreats.map((threat) => (
                <div
                  key={threat.id}
                  className={`hover:bg-muted/50 transition-colors cursor-pointer ${
                    threat.id === selectedId ? "bg-muted/50 border-l-4 border-l-primary" : ""
                  }`}
                  onClick={() => onSelectThreat(threat)}
                >
                  <ThreatCard threat={threat} isSelected={threat.id === selectedId} />
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 px-4">
                <AlertCircle className="w-12 h-12 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground text-center">No threats match your search</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
