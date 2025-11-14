"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { MetricsGrid } from "@/components/monitoring/metrics-grid"
import { ThreatFeed } from "@/components/monitoring/threat-feed"
import { SentimentGauge } from "@/components/monitoring/sentiment-gauge"
import { TrendingTopics } from "@/components/monitoring/trending-topics"
import { useDashboard } from "@/context/dashboard-context"
import { mockBankData } from "@/lib/demo-data"
import type { DashboardThreat } from "@/lib/api"

//
// ───────────────────────────────────────────────────────────────
//   Skeleton Components (Shimmer / SOC Style)
// ───────────────────────────────────────────────────────────────
//
function MetricsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="bg-muted/40 h-20 rounded-lg border border-border"
        />
      ))}
    </div>
  )
}

function ThreatFeedSkeleton() {
  return (
    <div className="divide-y divide-border animate-pulse">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="p-4">
          <div className="h-3 w-24 bg-muted/40 rounded mb-3" />
          <div className="h-4 w-full bg-muted/30 rounded mb-2" />
          <div className="h-4 w-3/4 bg-muted/30 rounded" />
        </div>
      ))}
    </div>
  )
}

function TrendingSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-4 bg-muted/30 rounded" />
      ))}
    </div>
  )
}

function SentimentSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-32 bg-muted/30 rounded-lg mb-4" />
      <div className="h-4 w-24 bg-muted/40 rounded mb-2" />
      <div className="h-4 w-32 bg-muted/40 rounded" />
    </div>
  )
}

//
// ───────────────────────────────────────────────────────────────
//   MAIN DASHBOARD PAGE
// ───────────────────────────────────────────────────────────────
//

export default function DashboardPage() {
  const {
    threats,
    postsAnalyzed,
    activeThreats,
    responsesDeployed,
    sentimentAvg,
    trending,
    timeRange,
    isConnected,
    isLoading,
    setTimeRange,
    deployResponse,
    markThreatAddressed,
  } = useDashboard()

  const router = useRouter()

  const [selectedThreat, setSelectedThreat] = useState<DashboardThreat | null>(null)
  const [isDeployingResponse, setIsDeployingResponse] = useState(false)

  // NEW: Loading animation when changing date range
  const [isRangeLoading, setIsRangeLoading] = useState(false)

  // ───────────────────────────────
  // Convert sentiment → %
  // ───────────────────────────────
  const sentiment = useMemo(
    () => Math.round(((sentimentAvg + 1) / 2) * 100),
    [sentimentAvg]
  )
  const sentimentChange = activeThreats > 0 ? -activeThreats * 2 : 5

  const metrics = useMemo(
    () => [
      {
        label: "Active Threats",
        value: activeThreats,
        change: activeThreats > 0 ? activeThreats : undefined,
        changeType: "increase" as const,
      },
      {
        label: "Positive Sentiment Score",
        value: `${sentiment}%`,
        change: Math.abs(sentimentChange),
        changeType:
          sentimentChange > 0 ? ("increase" as const) : ("decrease" as const),
      },
      {
        label: "Posts Analyzed",
        value: postsAnalyzed.toLocaleString(),
        change: threats.length > 0 ? 12 : undefined,
        changeType: "increase" as const,
      },
      {
        label: "Responses Deployed",
        value: responsesDeployed,
        change: responsesDeployed > 0 ? 1 : undefined,
        changeType: "increase" as const,
      },
    ],
    [activeThreats, sentiment, sentimentChange, postsAnalyzed, threats, responsesDeployed]
  )

  useEffect(() => {
    if (threats.length > 0 && !selectedThreat) {
      setSelectedThreat(threats[0])
    }
  }, [threats, selectedThreat])


  // ───────────────────────────────
  // Deep link to Threats page
  // ───────────────────────────────
  const handleSelectThreat = (threat: DashboardThreat) => {
    setSelectedThreat(threat)
    router.push(`/threats?open=${threat.id}`)
  }

  // ───────────────────────────────
  // Deploy AI Crisis Response
  // ───────────────────────────────
  async function handleDeployResponse(threatId: string) {
    if (isDeployingResponse) return
    setIsDeployingResponse(true)
    try {
      const threat = threats.find((t) => t.id === threatId)
      if (!threat) return

      const responseText = generateKonfamResponse(threat)
      const res = await deployResponse(threatId, responseText)
      await markThreatAddressed(threatId, res.responseId)
    } catch (e) {
      console.error("❌ Response deploy failed:", e)
      alert("Failed to deploy response.")
    } finally {
      setIsDeployingResponse(false)
    }
  }

  function generateKonfamResponse(threat: DashboardThreat): string {
    const templates = [
      "We're aware of concerns about account access. Our systems show 98.5% uptime. If you're experiencing issues, please DM us your account details. #TBankCares",
      "Thank you for reaching out. We've checked our systems – all services are operational. For specific account issues, please contact our support team directly.",
      "We understand your concern. Our monitoring shows normal system performance. Please share details via DM so we can assist you personally. #CustomerFirst",
    ]
    return templates[Math.floor(Math.random() * templates.length)]
  }

  //
  // RENDER
  //
  return (
    <MainLayout title="Crisis Monitoring Dashboard" activeThreats={activeThreats}>
      
      {/* TOP OVERLAY LOADING (z-index safe) */}
      {isRangeLoading && (
        <div className="fixed top-16 left-0 w-full h-1.5 bg-primary/20 z-[200]">
          <div className="h-full w-full bg-primary animate-pulse"></div>
        </div>
      )}

      {/* Connection Status */}
      {!isConnected && !isLoading && (
        <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-500">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium">Reconnecting to backend...</span>
          </div>
        </div>
      )}

      {/* Initial Loading State */}
      {isLoading && threats.length === 0 && (
        <div className="mb-4 p-8 bg-card border border-border rounded-lg text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mb-4" />
          <p className="text-muted-foreground">Loading threats from backend...</p>
          <p className="text-sm text-muted-foreground mt-2">Connecting to server...</p>
        </div>
      )}

      {/* ─────────────────────────────── */}
      {/* METRICS OVERVIEW                */}
      {/* ─────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Key Metrics</h2>

          <div className="flex items-center gap-4">
            
            {/* Time Filter */}
            <div className="flex items-center bg-muted/30 border border-border rounded-lg overflow-hidden text-xs">
              {["Today", "Past Week"].map((label) => (
                <button
                  key={label}
                  onClick={() => {
                    setIsRangeLoading(true)
                    setTimeRange(label as "Today" | "Past Week")
                    setTimeout(() => setIsRangeLoading(false), 650)
                  }}
                  className={`px-3 py-1.5 transition-colors ${
                    timeRange === label
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-muted-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Live Indicator */}
            <div className="flex items-center gap-1.5 text-xs">
              {isConnected ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-green-500 font-medium">LIVE</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-gray-500 rounded-full" />
                  <span className="text-gray-500 font-medium">OFFLINE</span>
                </>
              )}
            </div>
          </div>
        </div>

        {isRangeLoading ? (
          <MetricsSkeleton />
        ) : (
          <MetricsGrid metrics={metrics} />
        )}
      </div>

      {/* ─────────────────────────────── */}
      {/* DASHBOARD GRID                 */}
      {/* ─────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">

        {/* LEFT SIDE */}
        <div className="md:col-span-2 space-y-4 md:space-y-6">

          {/* Threat Feed */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-3 md:p-4 border-b border-border flex justify-between items-center">
              <h3 className="font-semibold text-sm md:text-base text-foreground">
                Backend Threat Detection{" "}
                {threats.length > 0 && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({threats.length} detected)
                  </span>
                )}
              </h3>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? "bg-green-500 animate-pulse-subtle" : "bg-gray-500"
                  }`}
                />
                {isConnected ? "LIVE" : "OFFLINE"}
              </div>
            </div>

            {isRangeLoading ? (
              <ThreatFeedSkeleton />
            ) : threats.length === 0 && !isLoading ? (
              <div className="p-8 text-center">
                <div className="text-4xl mb-2">✅</div>
                <p className="text-muted-foreground">No threats detected</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {postsAnalyzed > 0
                    ? `${postsAnalyzed} posts analyzed — all safe`
                    : "Backend monitoring active..."}
                </p>
              </div>
            ) : (
              <ThreatFeed
                threats={threats}
                selectedId={selectedThreat?.id}
                onSelectThreat={handleSelectThreat}
              />
            )}
          </div>

          {/* Trending */}
          <div className="bg-card border border-border rounded-lg p-3 md:p-4">
            <h3 className="font-semibold text-sm md:text-base text-foreground mb-3 md:mb-4">
              Trending Topics & Hashtags
            </h3>

            {isRangeLoading ? (
              <TrendingSkeleton />
            ) : (
              <TrendingTopics trending={trending} />
            )}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-4 md:space-y-6">

          {/* Sentiment Gauge */}
          <div className="bg-card border border-border rounded-lg p-3 md:p-4">
            <h3 className="font-semibold text-sm md:text-base text-foreground mb-3 md:mb-4">
              Sentiment Gauge
            </h3>

            {isRangeLoading ? (
              <SentimentSkeleton />
            ) : (
              <SentimentGauge score={sentiment} />
            )}

            <div className="mt-4 pt-4 border-t border-border space-y-2">
              <div className="flex items-center justify-between text-xs md:text-sm">
                <span className="text-muted-foreground">Panic Posts</span>
                <span
                  className={`font-semibold ${
                    activeThreats > 0 ? "text-red-500" : "text-green-500"
                  }`}
                >
                  {activeThreats}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs md:text-sm">
                <span className="text-muted-foreground">Trending Direction</span>
                <span
                  className={`font-semibold ${
                    sentimentChange > 0
                      ? "text-green-500"
                      : sentimentChange < 0
                      ? "text-red-500"
                      : "text-gray-500"
                  }`}
                >
                  {sentimentChange > 0
                    ? "↑ Improving"
                    : sentimentChange < 0
                    ? "↓ Declining"
                    : "→ Stable"}
                </span>
              </div>
            </div>
          </div>

          {/* Bank System Status */}
          <div className="bg-card border border-border rounded-lg p-3 md:p-4">
            <h3 className="font-semibold text-sm md:text-base text-foreground mb-3 md:mb-4">
              Bank System Status
            </h3>

            <div className="space-y-2 md:space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm text-muted-foreground truncate">
                    System Status
                  </p>
                  <p className="font-semibold text-xs md:text-sm text-foreground truncate">
                    Operational
                  </p>
                </div>
              </div>

              <div className="pt-2 md:pt-3 border-t border-border">
                <p className="text-xs md:text-sm text-muted-foreground mb-1 md:mb-2">
                  ATM Uptime
                </p>
                <div className="flex items-end gap-2">
                  <div className="text-lg md:text-2xl font-bold text-primary">
                    {mockBankData.atmUptime}%
                  </div>
                  <p className="text-xs text-green-500 mb-0.5 md:mb-1">Normal</p>
                </div>
              </div>

              <div className="pt-2 md:pt-3 border-t border-border">
                <p className="text-xs md:text-sm text-muted-foreground mb-1">
                  Active Accounts
                </p>
                <p className="text-base md:text-lg font-semibold text-foreground">
                  {(mockBankData.accountsActive / 1_000_000).toFixed(1)}M
                </p>
              </div>

              <div className="pt-2 md:pt-3 border-t border-border">
                <p className="text-xs md:text-sm text-muted-foreground mb-1">
                  Transactions/Hour
                </p>
                <p className="text-base md:text-lg font-semibold text-foreground">
                  {mockBankData.activeTransactions.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

// "use client"

// import { useState, useEffect, useMemo } from "react"
// import { useRouter } from "next/navigation"
// import { MainLayout } from "@/components/layout/main-layout"
// import { MetricsGrid } from "@/components/monitoring/metrics-grid"
// import { ThreatFeed } from "@/components/monitoring/threat-feed"
// import { SentimentGauge } from "@/components/monitoring/sentiment-gauge"
// import { TrendingTopics } from "@/components/monitoring/trending-topics"
// import { useDashboard } from "@/context/dashboard-context"
// import { mockBankData } from "@/lib/demo-data"
// import type { DashboardThreat } from "@/lib/api"

// export default function DashboardPage() {
//   const {
//     threats,
//     postsAnalyzed,
//     activeThreats,
//     responsesDeployed,
//     sentimentAvg,
//     trending,
//     timeRange,
//     isConnected,
//     isLoading,
//     setTimeRange,
//     deployResponse,
//     markThreatAddressed,
//   } = useDashboard()

//   const router = useRouter()

//   const [selectedThreat, setSelectedThreat] = useState<DashboardThreat | null>(null)
//   const [isDeployingResponse, setIsDeployingResponse] = useState(false)

//   // Convert sentiment (-1..1) → 0–100%
//   const sentiment = useMemo(
//     () => Math.round(((sentimentAvg + 1) / 2) * 100),
//     [sentimentAvg]
//   )
//   const sentimentChange = activeThreats > 0 ? -activeThreats * 2 : 5

//   const metrics = useMemo(
//     () => [
//       {
//         label: "Active Threats",
//         value: activeThreats,
//         change: activeThreats > 0 ? activeThreats : undefined,
//         changeType: "increase" as const,
//       },
//       {
//         label: "Positive Sentiment Score",
//         value: `${sentiment}%`,
//         change: Math.abs(sentimentChange),
//         changeType:
//           sentimentChange > 0 ? ("increase" as const) : ("decrease" as const),
//       },
//       {
//         label: "Posts Analyzed",
//         value: postsAnalyzed.toLocaleString(),
//         change: threats.length > 0 ? 12 : undefined,
//         changeType: "increase" as const,
//       },
//       {
//         label: "Responses Deployed",
//         value: responsesDeployed,
//         change: responsesDeployed > 0 ? 1 : undefined,
//         changeType: "increase" as const,
//       },
//     ],
//     [activeThreats, sentiment, sentimentChange, postsAnalyzed, threats, responsesDeployed]
//   )

//   useEffect(() => {
//     if (threats.length > 0 && !selectedThreat) {
//       setSelectedThreat(threats[0])
//     }
//   }, [threats, selectedThreat])

//   // 🔗 When a threat is clicked, go straight to the Threats page with deep link
//   const handleSelectThreat = (threat: DashboardThreat) => {
//     setSelectedThreat(threat)
//     router.push(`/threats?open=${threat.id}`)
//   }

//   async function handleDeployResponse(threatId: string) {
//     if (isDeployingResponse) return
//     setIsDeployingResponse(true)
//     try {
//       const threat = threats.find((t) => t.id === threatId)
//       if (!threat) return

//       const responseText = generateKonfamResponse(threat)
//       const res = await deployResponse(threatId, responseText)
//       await markThreatAddressed(threatId, res.responseId)
//     } catch (e) {
//       console.error("❌ Response deploy failed:", e)
//       alert("Failed to deploy response.")
//     } finally {
//       setIsDeployingResponse(false)
//     }
//   }

//   function generateKonfamResponse(threat: DashboardThreat): string {
//     const templates = [
//       "We're aware of concerns about account access. Our systems show 98.5% uptime. If you're experiencing issues, please DM us your account details. #TBankCares",
//       "Thank you for reaching out. We've checked our systems – all services are operational. For specific account issues, please contact our support team directly.",
//       "We understand your concern. Our monitoring shows normal system performance. Please share details via DM so we can assist you personally. #CustomerFirst",
//     ]
//     return templates[Math.floor(Math.random() * templates.length)]
//   }

//   return (
//     <MainLayout title="Crisis Monitoring Dashboard" activeThreats={activeThreats}>
//       {/* 🔌 Connection Status */}
//       {!isConnected && !isLoading && (
//         <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
//           <div className="flex items-center gap-2 text-yellow-500">
//             <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
//             <span className="text-sm font-medium">Reconnecting to backend...</span>
//           </div>
//         </div>
//       )}

//       {/* ⏳ Loading State */}
//       {isLoading && threats.length === 0 && (
//         <div className="mb-4 p-8 bg-card border border-border rounded-lg text-center">
//           <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mb-4" />
//           <p className="text-muted-foreground">Loading threats from backend...</p>
//           <p className="text-sm text-muted-foreground mt-2">Connecting to server...</p>
//         </div>
//       )}

//       {/* 🧮 Metrics Overview */}
//       <div className="mb-8">
//         <div className="flex items-center justify-between mb-4">
//           <h2 className="text-lg font-semibold text-foreground">Key Metrics</h2>
//           <div className="flex items-center gap-4">
//             {/* Time Filter Tabs */}
//             <div className="flex items-center bg-muted/30 border border-border rounded-lg overflow-hidden text-xs">
//               {["Today", "Past Week"].map((label) => (
//                 <button
//                   key={label}
//                   onClick={() => setTimeRange(label as "Today" | "Past Week")}
//                   className={`px-3 py-1.5 transition-colors ${
//                     timeRange === label
//                       ? "bg-primary text-primary-foreground"
//                       : "hover:bg-muted text-muted-foreground"
//                   }`}
//                 >
//                   {label}
//                 </button>
//               ))}
//             </div>

//             {/* Live Indicator */}
//             <div className="flex items-center gap-1.5 text-xs">
//               {isConnected ? (
//                 <>
//                   <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
//                   <span className="text-green-500 font-medium">LIVE</span>
//                 </>
//               ) : (
//                 <>
//                   <div className="w-2 h-2 bg-gray-500 rounded-full" />
//                   <span className="text-gray-500 font-medium">OFFLINE</span>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//         <MetricsGrid metrics={metrics} />
//       </div>

//       {/* 🧠 Main Dashboard Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
//         {/* Left: Threats + Trending */}
//         <div className="md:col-span-2 space-y-4 md:space-y-6">
//           {/* Threat Feed */}
//           <div className="bg-card border border-border rounded-lg overflow-hidden">
//             <div className="p-3 md:p-4 border-b border-border flex justify-between items-center">
//               <h3 className="font-semibold text-sm md:text-base text-foreground">
//                 Backend Threat Detection{" "}
//                 {threats.length > 0 && (
//                   <span className="ml-2 text-xs text-muted-foreground">
//                     ({threats.length} detected)
//                   </span>
//                 )}
//               </h3>
//               <div className="flex items-center gap-2 text-xs text-muted-foreground">
//                 <div
//                   className={`w-2 h-2 rounded-full ${
//                     isConnected ? "bg-green-500 animate-pulse-subtle" : "bg-gray-500"
//                   }`}
//                 />
//                 {isConnected ? "LIVE" : "OFFLINE"}
//               </div>
//             </div>

//             {threats.length === 0 && !isLoading ? (
//               <div className="p-8 text-center">
//                 <div className="text-4xl mb-2">✅</div>
//                 <p className="text-muted-foreground">No threats detected</p>
//                 <p className="text-sm text-muted-foreground mt-1">
//                   {postsAnalyzed > 0
//                     ? `${postsAnalyzed} posts analyzed by backend – all below threat threshold`
//                     : "Backend monitoring active..."}
//                 </p>
//               </div>
//             ) : (
//               <ThreatFeed
//                 threats={threats}
//                 onSelectThreat={handleSelectThreat}
//                 selectedId={selectedThreat?.id}
//               />
//             )}
//           </div>

//           {/* Trending */}
//           <div className="bg-card border border-border rounded-lg p-3 md:p-4">
//             <h3 className="font-semibold text-sm md:text-base text-foreground mb-3 md:mb-4">
//               Trending Topics & Hashtags
//             </h3>
//             <TrendingTopics trending={trending} />
//           </div>
//         </div>

//         {/* Right Column */}
//         <div className="space-y-4 md:space-y-6">
//           {/* Sentiment */}
//           <div className="bg-card border border-border rounded-lg p-3 md:p-4">
//             <h3 className="font-semibold text-sm md:text-base text-foreground mb-3 md:mb-4">
//               Sentiment Gauge
//             </h3>
//             <SentimentGauge score={sentiment} />
//             <div className="mt-4 pt-4 border-t border-border space-y-2">
//               <div className="flex items-center justify-between text-xs md:text-sm">
//                 <span className="text-muted-foreground">Panic Posts</span>
//                 <span
//                   className={`font-semibold ${
//                     activeThreats > 0 ? "text-red-500" : "text-green-500"
//                   }`}
//                 >
//                   {activeThreats}
//                 </span>
//               </div>
//               <div className="flex items-center justify-between text-xs md:text-sm">
//                 <span className="text-muted-foreground">Trending Direction</span>
//                 <span
//                   className={`font-semibold ${
//                     sentimentChange > 0
//                       ? "text-green-500"
//                       : sentimentChange < 0
//                       ? "text-red-500"
//                       : "text-gray-500"
//                   }`}
//                 >
//                   {sentimentChange > 0
//                     ? "↑ Improving"
//                     : sentimentChange < 0
//                     ? "↓ Declining"
//                     : "→ Stable"}
//                 </span>
//               </div>
//             </div>
//           </div>

//           {/* Bank System Status */}
//           <div className="bg-card border border-border rounded-lg p-3 md:p-4">
//             <h3 className="font-semibold text-sm md:text-base text-foreground mb-3 md:mb-4">
//               Bank System Status
//             </h3>
//             <div className="space-y-2 md:space-y-3">
//               <div className="flex items-center gap-2">
//                 <div className="w-3 h-3 bg-green-500 rounded-full" />
//                 <div className="flex-1 min-w-0">
//                   <p className="text-xs md:text-sm text-muted-foreground truncate">
//                     System Status
//                   </p>
//                   <p className="font-semibold text-xs md:text-sm text-foreground truncate">
//                     Operational
//                   </p>
//                 </div>
//               </div>
//               <div className="pt-2 md:pt-3 border-t border-border">
//                 <p className="text-xs md:text-sm text-muted-foreground mb-1 md:mb-2">
//                   ATM Uptime
//                 </p>
//                 <div className="flex items-end gap-2">
//                   <div className="text-lg md:text-2xl font-bold text-primary">
//                     {mockBankData.atmUptime}%
//                   </div>
//                   <p className="text-xs text-green-500 mb-0.5 md:mb-1">Normal</p>
//                 </div>
//               </div>
//               <div className="pt-2 md:pt-3 border-t border-border">
//                 <p className="text-xs md:text-sm text-muted-foreground mb-1">
//                   Active Accounts
//                 </p>
//                 <p className="text-base md:text-lg font-semibold text-foreground">
//                   {(mockBankData.accountsActive / 1_000_000).toFixed(1)}M
//                 </p>
//               </div>
//               <div className="pt-2 md:pt-3 border-t border-border">
//                 <p className="text-xs md:text-sm text-muted-foreground mb-1">
//                   Transactions/Hour
//                 </p>
//                 <p className="text-base md:text-lg font-semibold text-foreground">
//                   {mockBankData.activeTransactions.toLocaleString()}
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Quick Action */}
//           {/* {selectedThreat && selectedThreat.status !== "RESPONDED" && (
//             <div className="bg-card border border-border rounded-lg p-3 md:p-4">
//               <h3 className="font-semibold text-sm md:text-base text-foreground mb-2 md:mb-3">
//                 Quick Action
//               </h3>
//               <p className="text-xs md:text-sm text-muted-foreground mb-2 md:mb-3">
//                 Deploy AI-generated response to selected threat?
//               </p>
//               <button
//                 onClick={() => handleDeployResponse(selectedThreat.id)}
//                 disabled={isDeployingResponse}
//                 className="w-full px-3 md:px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {isDeployingResponse ? "⏳ Deploying..." : "🤖 Generate Response"}
//               </button>
//               <div className="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-border">
//                 <p className="text-xs text-muted-foreground">
//                   Threat Score:{" "}
//                   <span className="font-semibold">
//                     {Math.round((selectedThreat.threatScore ?? 0) * 100)}/100
//                   </span>
//                 </p>
//                 <p className="text-xs text-muted-foreground mt-1">
//                   Panic Factor:{" "}
//                   <span className="font-semibold">
//                     {Math.round((selectedThreat.sentimentImpact ?? 0) * 100)}%
//                   </span>
//                 </p>
//               </div>
//             </div>
//           )} */}
//         </div>
//       </div>
//     </MainLayout>
//   )
// }

// // "use client"

// // import { useState, useEffect, useMemo } from "react"
// // import { MainLayout } from "@/components/layout/main-layout"
// // import { MetricsGrid } from "@/components/monitoring/metrics-grid"
// // import { ThreatFeed } from "@/components/monitoring/threat-feed"
// // import { SentimentGauge } from "@/components/monitoring/sentiment-gauge"
// // import { TrendingTopics } from "@/components/monitoring/trending-topics"
// // import { useDashboard } from "@/context/dashboard-context"
// // import { mockBankData } from "@/lib/demo-data"
// // import type { DashboardThreat } from "@/lib/api"

// // export default function DashboardPage() {
// //   const {
// //     threats,
// //     postsAnalyzed,
// //     activeThreats,
// //     responsesDeployed,
// //     sentimentAvg,
// //     trending,
// //     timeRange,
// //     isConnected,
// //     isLoading,
// //     setTimeRange,
// //     deployResponse,
// //     markThreatAddressed,
// //   } = useDashboard()

// //   const [selectedThreat, setSelectedThreat] = useState<DashboardThreat | null>(null)
// //   const [isDeployingResponse, setIsDeployingResponse] = useState(false)

// //   // Convert sentiment (-1..1) → 0–100%
// //   const sentiment = useMemo(() => Math.round(((sentimentAvg + 1) / 2) * 100), [sentimentAvg])
// //   const sentimentChange = activeThreats > 0 ? -activeThreats * 2 : 5

// //   const metrics = useMemo(
// //     () => [
// //       {
// //         label: "Active Threats",
// //         value: activeThreats,
// //         change: activeThreats > 0 ? activeThreats : undefined,
// //         changeType: "increase" as const,
// //       },
// //       {
// //         label: "Positive Sentiment Score",
// //         value: `${sentiment}%`,
// //         change: Math.abs(sentimentChange),
// //         changeType: sentimentChange > 0 ? ("increase" as const) : ("decrease" as const),
// //       },
// //       {
// //         label: "Posts Analyzed",
// //         value: postsAnalyzed.toLocaleString(),
// //         change: threats.length > 0 ? 12 : undefined,
// //         changeType: "increase" as const,
// //       },
// //       {
// //         label: "Responses Deployed",
// //         value: responsesDeployed,
// //         change: responsesDeployed > 0 ? 1 : undefined,
// //         changeType: "increase" as const,
// //       },
// //     ],
// //     [activeThreats, sentiment, sentimentChange, postsAnalyzed, threats, responsesDeployed]
// //   )

// //   useEffect(() => {
// //     if (threats.length > 0 && !selectedThreat) {
// //       setSelectedThreat(threats[0])
// //     }
// //   }, [threats, selectedThreat])

// //   const handleSelectThreat = (threat: DashboardThreat) => setSelectedThreat(threat)

// //   async function handleDeployResponse(threatId: string) {
// //     if (isDeployingResponse) return
// //     setIsDeployingResponse(true)
// //     try {
// //       const threat = threats.find((t) => t.id === threatId)
// //       if (!threat) return

// //       const responseText = generateKonfamResponse(threat)
// //       const res = await deployResponse(threatId, responseText)
// //       await markThreatAddressed(threatId, res.responseId)
// //     } catch (e) {
// //       console.error("❌ Response deploy failed:", e)
// //       alert("Failed to deploy response.")
// //     } finally {
// //       setIsDeployingResponse(false)
// //     }
// //   }

// //   function generateKonfamResponse(threat: DashboardThreat): string {
// //     const templates = [
// //       "We're aware of concerns about account access. Our systems show 98.5% uptime. If you're experiencing issues, please DM us your account details. #TBankCares",
// //       "Thank you for reaching out. We've checked our systems – all services are operational. For specific account issues, please contact our support team directly.",
// //       "We understand your concern. Our monitoring shows normal system performance. Please share details via DM so we can assist you personally. #CustomerFirst",
// //     ]
// //     return templates[Math.floor(Math.random() * templates.length)]
// //   }

// //   return (
// //     <MainLayout title="Crisis Monitoring Dashboard" activeThreats={activeThreats}>
// //       {/* 🔌 Connection Status */}
// //       {!isConnected && !isLoading && (
// //         <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
// //           <div className="flex items-center gap-2 text-yellow-500">
// //             <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
// //             <span className="text-sm font-medium">Reconnecting to backend...</span>
// //           </div>
// //         </div>
// //       )}

// //       {/* ⏳ Loading State */}
// //       {isLoading && threats.length === 0 && (
// //         <div className="mb-4 p-8 bg-card border border-border rounded-lg text-center">
// //           <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mb-4" />
// //           <p className="text-muted-foreground">Loading threats from backend...</p>
// //           <p className="text-sm text-muted-foreground mt-2">Connecting to server...</p>
// //         </div>
// //       )}

// //       {/* 🧮 Metrics Overview */}
// //       <div className="mb-8">
// //         <div className="flex items-center justify-between mb-4">
// //           <h2 className="text-lg font-semibold text-foreground">Key Metrics</h2>
// //           <div className="flex items-center gap-4">
// //             {/* Time Filter Tabs */}
// //             <div className="flex items-center bg-muted/30 border border-border rounded-lg overflow-hidden text-xs">
// //               {["Today", "Past Week"].map((label) => (
// //                 <button
// //                   key={label}
// //                   onClick={() => setTimeRange(label as "Today" | "Past Week")}
// //                   className={`px-3 py-1.5 transition-colors ${
// //                     timeRange === label
// //                       ? "bg-primary text-primary-foreground"
// //                       : "hover:bg-muted text-muted-foreground"
// //                   }`}
// //                 >
// //                   {label}
// //                 </button>
// //               ))}
// //             </div>

// //             {/* Live Indicator */}
// //             <div className="flex items-center gap-1.5 text-xs">
// //               {isConnected ? (
// //                 <>
// //                   <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
// //                   <span className="text-green-500 font-medium">LIVE</span>
// //                 </>
// //               ) : (
// //                 <>
// //                   <div className="w-2 h-2 bg-gray-500 rounded-full" />
// //                   <span className="text-gray-500 font-medium">OFFLINE</span>
// //                 </>
// //               )}
// //             </div>
// //           </div>
// //         </div>
// //         <MetricsGrid metrics={metrics} />
// //       </div>

// //       {/* 🧠 Main Dashboard Grid */}
// //       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
// //         {/* Left: Threats + Trending */}
// //         <div className="md:col-span-2 space-y-4 md:space-y-6">
// //           {/* Threat Feed */}
// //           <div className="bg-card border border-border rounded-lg overflow-hidden">
// //             <div className="p-3 md:p-4 border-b border-border flex justify-between items-center">
// //               <h3 className="font-semibold text-sm md:text-base text-foreground">
// //                 Backend Threat Detection{" "}
// //                 {threats.length > 0 && (
// //                   <span className="ml-2 text-xs text-muted-foreground">
// //                     ({threats.length} detected)
// //                   </span>
// //                 )}
// //               </h3>
// //               <div className="flex items-center gap-2 text-xs text-muted-foreground">
// //                 <div
// //                   className={`w-2 h-2 rounded-full ${
// //                     isConnected ? "bg-green-500 animate-pulse-subtle" : "bg-gray-500"
// //                   }`}
// //                 />
// //                 {isConnected ? "LIVE" : "OFFLINE"}
// //               </div>
// //             </div>

// //             {threats.length === 0 && !isLoading ? (
// //               <div className="p-8 text-center">
// //                 <div className="text-4xl mb-2">✅</div>
// //                 <p className="text-muted-foreground">No threats detected</p>
// //                 <p className="text-sm text-muted-foreground mt-1">
// //                   {postsAnalyzed > 0
// //                     ? `${postsAnalyzed} posts analyzed by backend – all below threat threshold`
// //                     : "Backend monitoring active..."}
// //                 </p>
// //               </div>
// //             ) : (
// //               <ThreatFeed
// //                 threats={threats}
// //                 onSelectThreat={handleSelectThreat}
// //                 selectedId={selectedThreat?.id}
// //               />
// //             )}
// //           </div>

// //           {/* Trending */}
// //           <div className="bg-card border border-border rounded-lg p-3 md:p-4">
// //             <h3 className="font-semibold text-sm md:text-base text-foreground mb-3 md:mb-4">
// //               Trending Topics & Hashtags
// //             </h3>
// //             <TrendingTopics trending={trending} />
// //           </div>
// //         </div>

// //         {/* Right Column */}
// //         <div className="space-y-4 md:space-y-6">
// //           {/* Sentiment */}
// //           <div className="bg-card border border-border rounded-lg p-3 md:p-4">
// //             <h3 className="font-semibold text-sm md:text-base text-foreground mb-3 md:mb-4">
// //               Sentiment Gauge
// //             </h3>
// //             <SentimentGauge score={sentiment} />
// //             <div className="mt-4 pt-4 border-t border-border space-y-2">
// //               <div className="flex items-center justify-between text-xs md:text-sm">
// //                 <span className="text-muted-foreground">Panic Posts</span>
// //                 <span
// //                   className={`font-semibold ${
// //                     activeThreats > 0 ? "text-red-500" : "text-green-500"
// //                   }`}
// //                 >
// //                   {activeThreats}
// //                 </span>
// //               </div>
// //               <div className="flex items-center justify-between text-xs md:text-sm">
// //                 <span className="text-muted-foreground">Trending Direction</span>
// //                 <span
// //                   className={`font-semibold ${
// //                     sentimentChange > 0
// //                       ? "text-green-500"
// //                       : sentimentChange < 0
// //                       ? "text-red-500"
// //                       : "text-gray-500"
// //                   }`}
// //                 >
// //                   {sentimentChange > 0
// //                     ? "↑ Improving"
// //                     : sentimentChange < 0
// //                     ? "↓ Declining"
// //                     : "→ Stable"}
// //                 </span>
// //               </div>
// //             </div>
// //           </div>

// //           {/* Bank System Status */}
// //           <div className="bg-card border border-border rounded-lg p-3 md:p-4">
// //             <h3 className="font-semibold text-sm md:text-base text-foreground mb-3 md:mb-4">
// //               Bank System Status
// //             </h3>
// //             <div className="space-y-2 md:space-y-3">
// //               <div className="flex items-center gap-2">
// //                 <div className="w-3 h-3 bg-green-500 rounded-full" />
// //                 <div className="flex-1 min-w-0">
// //                   <p className="text-xs md:text-sm text-muted-foreground truncate">
// //                     System Status
// //                   </p>
// //                   <p className="font-semibold text-xs md:text-sm text-foreground truncate">
// //                     Operational
// //                   </p>
// //                 </div>
// //               </div>
// //               <div className="pt-2 md:pt-3 border-t border-border">
// //                 <p className="text-xs md:text-sm text-muted-foreground mb-1 md:mb-2">
// //                   ATM Uptime
// //                 </p>
// //                 <div className="flex items-end gap-2">
// //                   <div className="text-lg md:text-2xl font-bold text-primary">
// //                     {mockBankData.atmUptime}%
// //                   </div>
// //                   <p className="text-xs text-green-500 mb-0.5 md:mb-1">Normal</p>
// //                 </div>
// //               </div>
// //               <div className="pt-2 md:pt-3 border-t border-border">
// //                 <p className="text-xs md:text-sm text-muted-foreground mb-1">
// //                   Active Accounts
// //                 </p>
// //                 <p className="text-base md:text-lg font-semibold text-foreground">
// //                   {(mockBankData.accountsActive / 1_000_000).toFixed(1)}M
// //                 </p>
// //               </div>
// //               <div className="pt-2 md:pt-3 border-t border-border">
// //                 <p className="text-xs md:text-sm text-muted-foreground mb-1">
// //                   Transactions/Hour
// //                 </p>
// //                 <p className="text-base md:text-lg font-semibold text-foreground">
// //                   {mockBankData.activeTransactions.toLocaleString()}
// //                 </p>
// //               </div>
// //             </div>
// //           </div>

// //           {/* Quick Action */}
// //           {/* {selectedThreat && selectedThreat.status !== "RESPONDED" && (
// //             <div className="bg-card border border-border rounded-lg p-3 md:p-4">
// //               <h3 className="font-semibold text-sm md:text-base text-foreground mb-2 md:mb-3">
// //                 Quick Action
// //               </h3>
// //               <p className="text-xs md:text-sm text-muted-foreground mb-2 md:mb-3">
// //                 Deploy AI-generated response to selected threat?
// //               </p>
// //               <button
// //                 onClick={() => handleDeployResponse(selectedThreat.id)}
// //                 disabled={isDeployingResponse}
// //                 className="w-full px-3 md:px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
// //               >
// //                 {isDeployingResponse ? "⏳ Deploying..." : "🤖 Generate Response"}
// //               </button>
// //               <div className="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-border">
// //                 <p className="text-xs text-muted-foreground">
// //                   Threat Score:{" "}
// //                   <span className="font-semibold">
// //                     {Math.round((selectedThreat.threatScore ?? 0) * 100)}/100
// //                   </span>
// //                 </p>
// //                 <p className="text-xs text-muted-foreground mt-1">
// //                   Panic Factor:{" "}
// //                   <span className="font-semibold">
// //                     {Math.round((selectedThreat.sentimentImpact ?? 0) * 100)}%
// //                   </span>
// //                 </p>
// //               </div>
// //             </div>
// //           )} */}
// //         </div>
// //       </div>
// //     </MainLayout>
// //   )
// // }
