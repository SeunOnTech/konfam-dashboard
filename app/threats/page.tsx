"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { X } from "lucide-react"
import { MainLayout } from "@/components/layout/main-layout"
import { ThreatList } from "@/components/detection/threat-list"
import { ThreatDetailPreview } from "@/components/detection/threat-detail-preview"
import { useThreatMonitor } from "@/context/dashboard-context"
import type { DashboardThreat } from "@/lib/api"

export default function ThreatsPage() {
  const {
    threats,
    activeThreats,
    isConnected,
    isLoading,
  } = useThreatMonitor()

  const [selectedThreat, setSelectedThreat] = useState<DashboardThreat | null>(null)
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL")
  const [filterStatus, setFilterStatus] = useState<string>("ALL")

  // Autopilot vs Supervised (still here for later behavior)
  const [mode, setMode] = useState<"AUTOPILOT" | "SUPERVISED">("AUTOPILOT")

  // Deep link + auto-open modal + alert
  const [autoOpenModal, setAutoOpenModal] = useState(false)
  const [showAlert, setShowAlert] = useState(false)

  const searchParams = useSearchParams()
  const openId = searchParams.get("open")

  // Auto-select when threats load / when openId changes
  useEffect(() => {
    if (threats.length === 0) return

    // If URL specifies a threat to open
    if (openId) {
      const match = threats.find((t) => t.id === openId)
      if (match) {
        setSelectedThreat(match)
        setAutoOpenModal(true)
        setShowAlert(true)
        return
      }
    }

    // Default behavior: select first threat
    if (!selectedThreat) {
      setSelectedThreat(threats[0])
    }
  }, [threats, openId]) // intentionally not depending on selectedThreat to avoid loops

  // Keep selected threat synced with incoming updates
  useEffect(() => {
    if (selectedThreat) {
      const updated = threats.find((t) => t.id === selectedThreat.id)
      if (updated) setSelectedThreat(updated)
    }
  }, [threats, selectedThreat])

  // Filter threats based on severity + status
  const filteredThreats = threats.filter((threat) => {
    if (filterSeverity !== "ALL" && threat.severity !== filterSeverity) return false

    if (filterStatus === "ACTIVE" && threat.status === "RESPONDED") return false
    if (filterStatus === "ADDRESSED" && threat.status !== "RESPONDED") return false

    return true
  })

  // High-priority count (CRITICAL/HIGH & not RESPONDED)
  const highPriorityCount = threats.filter(
    (t) =>
      (t.severity === "HIGH" || t.severity === "CRITICAL") &&
      t.status !== "RESPONDED"
  ).length

  const handleSelectThreat = (threat: DashboardThreat) => {
    setSelectedThreat(threat)
    setAutoOpenModal(false) // manual selection shouldn't auto-open modal
    setShowAlert(false)
  }

  // SOC-style alert content builder
  const renderAlert = () => {
    if (!showAlert || !selectedThreat) return null

    const isCritical =
      selectedThreat.severity === "CRITICAL" || selectedThreat.severity === "HIGH"

    const bgClass = isCritical ? "bg-red-600" : "bg-amber-600"

    const platform =
      selectedThreat.detectedPost?.platform || "Social Feed"
    const content =
      selectedThreat.detectedPost?.content ||
      selectedThreat.verificationSummary ||
      "Mass panic detected on social channels."

    return (
      <div className="fixed top-4 hidden inset-x-0 z-50 flex justify-center pointer-events-none">
        <div
          className={`pointer-events-auto ${bgClass} text-white shadow-xl rounded-2xl px-4 py-3 md:px-5 md:py-4 flex items-start gap-3 max-w-2xl w-full mx-4 border border-white/20`}
        >
          <div className="text-2xl md:text-3xl leading-none">🔴</div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] md:text-xs font-semibold tracking-[0.18em] uppercase opacity-80 mb-1">
              Critical Threat Detected
            </p>
            <p className="text-xs md:text-sm font-semibold">
              {platform} — severity {selectedThreat.severity}
            </p>
            <p className="text-[11px] md:text-xs mt-1 opacity-95 line-clamp-2">
              {content}
            </p>
          </div>
          <button
            onClick={() => setShowAlert(false)}
            className="ml-1 mt-0.5 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <MainLayout title="Threat Analysis" activeThreats={highPriorityCount}>
      {/* 🔴 SOC-style Alert Banner */}
      {renderAlert()}

      {/* Connection Status Banner */}
      {!isConnected && !isLoading && (
        <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-500">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium">Reconnecting to backend...</span>
          </div>
        </div>
      )}

      {/* Filters + Mode Bar */}
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
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-1.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="ALL">All</option>
                <option value="ACTIVE">Active Only</option>
                <option value="ADDRESSED">Addressed Only</option>
              </select>
            </div>
          </div>

          {/* RIGHT: Stats + Mode Toggle + Live Indicator */}
          <div className="flex items-center gap-6">
            {/* Threat Count */}
            <div className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-semibold text-foreground">
                {filteredThreats.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-foreground">
                {threats.length}
              </span>{" "}
              threats
            </div>

            {/* Mode Switch */}
            <div className="flex items-center gap-3">
              <span
                className={`text-xs font-medium ${
                  mode === "AUTOPILOT" ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Autopilot
              </span>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={mode === "SUPERVISED"}
                  onChange={() =>
                    setMode(mode === "AUTOPILOT" ? "SUPERVISED" : "AUTOPILOT")
                  }
                />
                <div className="w-11 h-5 bg-border peer-focus:outline-none rounded-full peer peer-checked:bg-primary transition-colors"></div>
                <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-background rounded-full shadow peer-checked:translate-x-6 transition"></div>
              </label>

              <span
                className={`text-xs font-medium ${
                  mode === "SUPERVISED" ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Supervised
              </span>
            </div>

            {/* Live Indicator */}
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

      {/* Content States */}
      {isLoading && threats.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mb-4" />
          <p className="text-muted-foreground">Loading threats from backend...</p>
        </div>
      ) : threats.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <div className="text-4xl mb-4">✅</div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No Threats Detected
          </h3>
          <p className="text-muted-foreground">
            The backend monitoring system is actively scanning posts.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            High-engagement posts with crisis indicators will appear here automatically.
          </p>
        </div>
      ) : filteredThreats.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No Matching Threats
          </h3>
          <p className="text-muted-foreground">
            Try adjusting your filters to see more results.
          </p>
          <button
            onClick={() => {
              setFilterSeverity("ALL")
              setFilterStatus("ALL")
            }}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6 md:h-[calc(100vh-280px)]">
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
              <ThreatDetailPreview threat={selectedThreat} autoOpen={autoOpenModal} />
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

// import { useState, useEffect } from "react"
// import { MainLayout } from "@/components/layout/main-layout"
// import { ThreatList } from "@/components/detection/threat-list"
// import { ThreatDetailPreview } from "@/components/detection/threat-detail-preview"
// import { useThreatMonitor } from "@/context/dashboard-context"
// import type { DashboardThreat } from "@/lib/api"

// export default function ThreatsPage() {
//   const {
//     threats,
//     activeThreats,
//     isConnected,
//     isLoading,
//   } = useThreatMonitor()

//   const [selectedThreat, setSelectedThreat] = useState<DashboardThreat | null>(null)
//   const [filterSeverity, setFilterSeverity] = useState<string>("ALL")
//   const [filterStatus, setFilterStatus] = useState<string>("ALL")

//   // NEW → Autopilot vs Supervised
//   const [mode, setMode] = useState<"AUTOPILOT" | "SUPERVISED">("AUTOPILOT")

//   // Auto-select first threat when threats load
//   useEffect(() => {
//     if (threats.length > 0 && !selectedThreat) {
//       setSelectedThreat(threats[0])
//     }
//   }, [threats, selectedThreat])

//   // Keep selected threat synced with incoming updates
//   useEffect(() => {
//     if (selectedThreat) {
//       const updated = threats.find((t) => t.id === selectedThreat.id)
//       if (updated) setSelectedThreat(updated)
//     }
//   }, [threats, selectedThreat])

//   // Filter threats based on severity + status
//   const filteredThreats = threats.filter((threat) => {
//     if (filterSeverity !== "ALL" && threat.severity !== filterSeverity) return false

//     if (filterStatus === "ACTIVE" && threat.status === "RESPONDED") return false
//     if (filterStatus === "ADDRESSED" && threat.status !== "RESPONDED") return false

//     return true
//   })

//   // High-priority count (CRITICAL/HIGH & not RESPONDED)
//   const highPriorityCount = threats.filter(
//     (t) =>
//       (t.severity === "HIGH" || t.severity === "CRITICAL") &&
//       t.status !== "RESPONDED"
//   ).length

//   const handleSelectThreat = (threat: DashboardThreat) => {
//     setSelectedThreat(threat)
//   }

//   return (
//     <MainLayout title="Threat Analysis" activeThreats={highPriorityCount}>
//       {/* Connection Status Banner */}
//       {!isConnected && !isLoading && (
//         <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
//           <div className="flex items-center gap-2 text-yellow-500">
//             <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
//             <span className="text-sm font-medium">Reconnecting to backend...</span>
//           </div>
//         </div>
//       )}

//       {/* Filters + Mode Bar */}
//       <div className="mb-4 bg-card border border-border rounded-lg p-4">
//         <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
//           <div className="flex flex-col md:flex-row gap-4 flex-1">
            
//             {/* Severity Filter */}
//             <div className="flex items-center gap-2">
//               <label className="text-sm font-medium text-foreground">Severity:</label>
//               <select
//                 value={filterSeverity}
//                 onChange={(e) => setFilterSeverity(e.target.value)}
//                 className="px-3 py-1.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
//               >
//                 <option value="ALL">All</option>
//                 <option value="CRITICAL">Critical</option>
//                 <option value="HIGH">High</option>
//                 <option value="MEDIUM">Medium</option>
//                 <option value="LOW">Low</option>
//               </select>
//             </div>

//             {/* Status Filter */}
//             <div className="flex items-center gap-2">
//               <label className="text-sm font-medium text-foreground">Status:</label>
//               <select
//                 value={filterStatus}
//                 onChange={(e) => setFilterStatus(e.target.value)}
//                 className="px-3 py-1.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
//               >
//                 <option value="ALL">All</option>
//                 <option value="ACTIVE">Active Only</option>
//                 <option value="ADDRESSED">Addressed Only</option>
//               </select>
//             </div>
//           </div>

//           {/* RIGHT: Stats + Mode Toggle + Live Indicator */}
//           <div className="flex items-center gap-6">
//             {/* Threat Count */}
//             <div className="text-sm text-muted-foreground">
//               Showing{" "}
//               <span className="font-semibold text-foreground">
//                 {filteredThreats.length}
//               </span>{" "}
//               of{" "}
//               <span className="font-semibold text-foreground">
//                 {threats.length}
//               </span>{" "}
//               threats
//             </div>

//             {/* NEW: Mode Switch */}
//             <div className="flex items-center gap-3">
//               <span
//                 className={`text-xs font-medium ${
//                   mode === "AUTOPILOT"
//                     ? "text-primary"
//                     : "text-muted-foreground"
//                 }`}
//               >
//                 Autopilot
//               </span>

//               <label className="relative inline-flex items-center cursor-pointer">
//                 <input
//                   type="checkbox"
//                   className="sr-only peer"
//                   checked={mode === "SUPERVISED"}
//                   onChange={() =>
//                     setMode(mode === "AUTOPILOT" ? "SUPERVISED" : "AUTOPILOT")
//                   }
//                 />
//                 <div className="w-11 h-5 bg-border peer-focus:outline-none rounded-full peer peer-checked:bg-primary transition-colors"></div>
//                 <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-background rounded-full shadow peer-checked:translate-x-6 transition"></div>
//               </label>

//               <span
//                 className={`text-xs font-medium ${
//                   mode === "SUPERVISED"
//                     ? "text-primary"
//                     : "text-muted-foreground"
//                 }`}
//               >
//                 Supervised
//               </span>
//             </div>

//             {/* Live Indicator */}
//             <div className="flex items-center gap-2">
//               {isConnected ? (
//                 <>
//                   <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
//                   <span className="text-xs text-green-500 font-medium">LIVE</span>
//                 </>
//               ) : (
//                 <>
//                   <div className="w-2 h-2 bg-gray-500 rounded-full" />
//                   <span className="text-xs text-gray-500 font-medium">OFFLINE</span>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Content States */}
//       {isLoading && threats.length === 0 ? (
//         <div className="bg-card border border-border rounded-lg p-8 text-center">
//           <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mb-4" />
//           <p className="text-muted-foreground">Loading threats from backend...</p>
//         </div>
//       ) : threats.length === 0 ? (
//         <div className="bg-card border border-border rounded-lg p-8 text-center">
//           <div className="text-4xl mb-4">✅</div>
//           <h3 className="text-lg font-semibold text-foreground mb-2">
//             No Threats Detected
//           </h3>
//           <p className="text-muted-foreground">
//             The backend monitoring system is actively scanning posts.
//           </p>
//           <p className="text-sm text-muted-foreground mt-2">
//             High-engagement posts with crisis indicators will appear here automatically.
//           </p>
//         </div>
//       ) : filteredThreats.length === 0 ? (
//         <div className="bg-card border border-border rounded-lg p-8 text-center">
//           <div className="text-4xl mb-4">🔍</div>
//           <h3 className="text-lg font-semibold text-foreground mb-2">
//             No Matching Threats
//           </h3>
//           <p className="text-muted-foreground">
//             Try adjusting your filters to see more results.
//           </p>
//           <button
//             onClick={() => {
//               setFilterSeverity("ALL")
//               setFilterStatus("ALL")
//             }}
//             className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
//           >
//             Clear Filters
//           </button>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6 md:h-[calc(100vh-280px)]">
          
//           {/* Left panel - Threat list */}
//           <div className="md:col-span-2 bg-card border border-border rounded-lg overflow-hidden flex flex-col h-[600px]">
//             <div className="p-3 md:p-4 border-b border-border">
//               <h2 className="font-semibold text-sm md:text-base text-foreground">
//                 All Threats ({filteredThreats.length})
//               </h2>
//               <p className="text-xs text-muted-foreground mt-1">
//                 {highPriorityCount} High Priority Active
//               </p>
//             </div>
//             <ThreatList
//               threats={filteredThreats}
//               selectedId={selectedThreat?.id}
//               onSelectThreat={handleSelectThreat}
//             />
//           </div>

//           {/* Right panel - Threat detail preview */}
//           <div className="md:col-span-3 bg-card border border-border rounded-lg overflow-hidden flex flex-col">
//             {selectedThreat ? (
//               <ThreatDetailPreview threat={selectedThreat}  />
//             ) : (
//               <div className="flex-1 flex items-center justify-center p-4">
//                 <p className="text-muted-foreground text-center text-sm">
//                   Select a threat to view details
//                 </p>
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </MainLayout>
//   )
// }