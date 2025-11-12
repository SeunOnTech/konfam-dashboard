// app/threats/page.tsx
"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { ThreatList } from "@/components/detection/threat-list"
import { ThreatDetailPreview } from "@/components/detection/threat-detail-preview"
import { useThreatMonitor } from "@/hooks/use-threat-monitor"
import type { Threat } from "@/lib/types"

export default function ThreatsPage() {
  // ✅ Get real threats from backend
  const {
    threats,
    activeThreats,
    isConnected,
    isLoading,
    markThreatAddressed,
    refreshThreats
  } = useThreatMonitor()

  const [selectedThreat, setSelectedThreat] = useState<Threat | null>(null)
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL")
  const [filterAddressed, setFilterAddressed] = useState<string>("ALL")

  // Auto-select first threat when threats load
  useEffect(() => {
    if (threats.length > 0 && !selectedThreat) {
      setSelectedThreat(threats[0])
    }
  }, [threats, selectedThreat])

  // Update selected threat if it changes in the threats array
  useEffect(() => {
    if (selectedThreat) {
      const updated = threats.find(t => t.id === selectedThreat.id)
      if (updated) {
        setSelectedThreat(updated)
      }
    }
  }, [threats, selectedThreat])

  // Filter threats based on user selection
  const filteredThreats = threats.filter(threat => {
    // Filter by severity
    if (filterSeverity !== "ALL" && threat.severity !== filterSeverity) {
      return false
    }
    
    // Filter by addressed status
    if (filterAddressed === "ACTIVE" && threat.addressed) {
      return false
    }
    if (filterAddressed === "ADDRESSED" && !threat.addressed) {
      return false
    }
    
    return true
  })

  // Calculate high-priority threats (CRITICAL + HIGH that are not addressed)
  const highPriorityCount = threats.filter(
    t => (t.severity === "HIGH" || t.severity === "CRITICAL") && !t.addressed
  ).length

  // Handle threat selection
  const handleSelectThreat = (threat: Threat) => {
    setSelectedThreat(threat)
  }

  // Handle marking threat as addressed
  const handleMarkAddressed = async (threatId: string, responseId: string) => {
    await markThreatAddressed(threatId, responseId)
    // The selected threat will auto-update via the useEffect above
  }

  return (
    <MainLayout title="Threat Analysis" activeThreats={highPriorityCount}>
      {/* Connection Status Banner */}
      {!isConnected && !isLoading && (
        <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-500">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium">Reconnecting to backend...</span>
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="mb-4 bg-card border border-border rounded-lg p-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            {/* Severity Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-foreground">Severity:</label>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="px-3 py-1.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="ALL">All</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-foreground">Status:</label>
              <select
                value={filterAddressed}
                onChange={(e) => setFilterAddressed(e.target.value)}
                className="px-3 py-1.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="ALL">All</option>
                <option value="ACTIVE">Active Only</option>
                <option value="ADDRESSED">Addressed Only</option>
              </select>
            </div>
          </div>

          {/* Stats & Refresh */}
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filteredThreats.length}</span> of{" "}
              <span className="font-semibold text-foreground">{threats.length}</span> threats
            </div>
            
            <button
              onClick={refreshThreats}
              disabled={isLoading}
              className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isLoading ? "⏳ Loading..." : "🔄 Refresh"}
            </button>

            {/* Connection Indicator */}
            <div className="flex items-center gap-2">
              {isConnected ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-green-500 font-medium">LIVE</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-gray-500 rounded-full" />
                  <span className="text-xs text-gray-500 font-medium">OFFLINE</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && threats.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mb-4" />
          <p className="text-muted-foreground">Loading threats from backend...</p>
        </div>
      ) : threats.length === 0 ? (
        /* Empty State */
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <div className="text-4xl mb-4">✅</div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No Threats Detected</h3>
          <p className="text-muted-foreground">
            The backend monitoring system is actively scanning posts.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            High-engagement posts with crisis indicators will appear here automatically.
          </p>
        </div>
      ) : filteredThreats.length === 0 ? (
        /* Filtered Empty State */
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No Matching Threats</h3>
          <p className="text-muted-foreground">
            Try adjusting your filters to see more results.
          </p>
          <button
            onClick={() => {
              setFilterSeverity("ALL")
              setFilterAddressed("ALL")
            }}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        /* Main Content Grid */
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6 md:h-[calc(100vh-280px)] mb-100">
          {/* Left panel - Threat list */}
          <div className="md:col-span-2 bg-card border border-border rounded-lg overflow-hidden flex flex-col h-[600px]">
            <div className="p-3 md:p-4 border-b border-border">
              <h2 className="font-semibold text-sm md:text-base text-foreground">
                All Threats ({filteredThreats.length})
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                {highPriorityCount} High Priority Active
              </p>
            </div>
            <ThreatList
              threats={filteredThreats}
              selectedId={selectedThreat?.id}
              onSelectThreat={handleSelectThreat}
            />
          </div>

          {/* Right panel - Threat detail preview */}
          <div className="md:col-span-3 bg-card border border-border rounded-lg overflow-hidden flex flex-col">
            {selectedThreat ? (
              <ThreatDetailPreview
                threat={selectedThreat}
                onMarkAddressed={handleMarkAddressed}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center p-4">
                <p className="text-muted-foreground text-center text-sm">
                  Select a threat to view details
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </MainLayout>
  )
}

// // app/threats/page.tsx
// "use client"

// import { useState } from "react"
// import { MainLayout } from "@/components/layout/main-layout"
// import { ThreatList } from "@/components/detection/threat-list"
// import { ThreatDetailPreview } from "@/components/detection/threat-detail-preview"
// import { mockThreats } from "@/lib/demo-data"
// import type { Threat } from "@/lib/types"

// export default function ThreatsPage() {
//   const [selectedThreat, setSelectedThreat] = useState<Threat | null>(mockThreats[0])
//   const [threats] = useState<Threat[]>(mockThreats)

//   const highThreats = threats.filter((t) => t.severity === "HIGH" || t.severity === "CRITICAL").length

//   return (
//     <MainLayout title="Threat Analysis" activeThreats={highThreats}>
//       <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6 md:h-[calc(100vh-180px)]">
//         {/* Left panel - Threat list */}
//         <div className="md:col-span-2 bg-card border border-border rounded-lg overflow-hidden flex flex-col">
//           <div className="p-3 md:p-4 border-b border-border">
//             <h2 className="font-semibold text-sm md:text-base text-foreground">All Threats ({threats.length})</h2>
//             <p className="text-xs text-muted-foreground mt-1">
//               {threats.filter((t) => t.severity === "HIGH" || t.severity === "CRITICAL").length} High Priority
//             </p>
//           </div>
//           <ThreatList threats={threats} selectedId={selectedThreat?.id} onSelectThreat={setSelectedThreat} />
//         </div>

//         {/* Right panel - Threat detail preview */}
//         <div className="md:col-span-3 bg-card border border-border rounded-lg overflow-hidden flex flex-col">
//           {selectedThreat ? (
//             <ThreatDetailPreview threat={selectedThreat} />
//           ) : (
//             <div className="flex-1 flex items-center justify-center p-4">
//               <p className="text-muted-foreground text-center text-sm">Select a threat to view details</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </MainLayout>
//   )
// }
