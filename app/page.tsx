"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { MetricsGrid } from "@/components/monitoring/metrics-grid"
import { ThreatFeed } from "@/components/monitoring/threat-feed"
import { SentimentGauge } from "@/components/monitoring/sentiment-gauge"
import { TrendingTopics } from "@/components/monitoring/trending-topics"
import { useThreatMonitor } from "@/hooks/use-threat-monitor"
import { mockBankData } from "@/lib/demo-data"
import { twitterAPI } from "@/lib/twitter-api-client"
import type { Threat } from "@/lib/types"

export default function Dashboard() {
  // ✅ Real-time threat monitoring from BACKEND (no client-side detection)
  const {
    threats,
    postsAnalyzed,
    activeThreats,
    isConnected,
    isLoading,
    markThreatAddressed,
    refreshThreats
  } = useThreatMonitor()

  const [selectedThreat, setSelectedThreat] = useState<Threat | null>(null)
  const [sentiment, setSentiment] = useState(72)
  const [responsesDeployed, setResponsesDeployed] = useState(0)
  const [isDeployingResponse, setIsDeployingResponse] = useState(false)

  // Update selected threat when threats change
  useEffect(() => {
    if (threats.length > 0 && !selectedThreat) {
      setSelectedThreat(threats[0])
    }
  }, [threats, selectedThreat])

  // Simulate sentiment changes based on threats
  useEffect(() => {
    if (activeThreats > 0) {
      setSentiment((prev) => Math.max(30, prev - activeThreats * 2))
    } else {
      const interval = setInterval(() => {
        setSentiment((prev) => Math.min(90, prev + 1))
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [activeThreats])

  const sentimentChange = activeThreats > 0 ? -activeThreats * 2 : 5

  const metrics = [
    {
      label: "Active Threats",
      value: activeThreats,
      change: activeThreats > 0 ? activeThreats : undefined,
      changeType: "increase" as const,
    },
    {
      label: "Sentiment Score",
      value: `${Math.round(sentiment)}%`,
      change: Math.abs(sentimentChange),
      changeType: sentimentChange > 0 ? ("increase" as const) : ("decrease" as const),
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
  ]

  const handleSelectThreat = (threat: Threat) => {
    setSelectedThreat(threat)
  }

  // ✅ Deploy response with backend integration
  const handleDeployResponse = async (threatId: string) => {
    if (isDeployingResponse) return;
    
    setIsDeployingResponse(true);
    
    try {
      console.log('🚀 Deploying response for threat:', threatId);
      
      // Find the threat
      const threat = threats.find(t => t.id === threatId);
      if (!threat) {
        console.error('Threat not found');
        return;
      }

      // 1. Generate Konfam response text
      const responseText = generateKonfamResponse(threat);
      
      // 2. Post response tweet
      const responsePost = await twitterAPI.postKonfamResponse({
        text: responseText,
        language: 'ENGLISH'
      });

      console.log('✅ Response posted:', responsePost.id);

      // 3. Mark threat as addressed in backend
      await markThreatAddressed(threatId, responsePost.id);

      // 4. Update UI
      setResponsesDeployed((prev) => prev + 1);
      
      console.log('✅ Threat marked as addressed');
    } catch (error) {
      console.error('❌ Failed to deploy response:', error);
      alert('Failed to deploy response. Please try again.');
    } finally {
      setIsDeployingResponse(false);
    }
  }

  // Generate appropriate Konfam response based on threat
  function generateKonfamResponse(threat: Threat): string {
    const templates = [
      "We're aware of concerns about account access. Our systems show 98.5% uptime. If you're experiencing issues, please DM us your account details. #TBankCares",
      "Thank you for reaching out. We've checked our systems - all services are operational. For specific account issues, please contact our support team directly.",
      "We understand your concern. Our monitoring shows normal system performance. Please share details via DM so we can assist you personally. #CustomerFirst",
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  return (
    <MainLayout
      title="Crisis Monitoring Dashboard"
      activeThreats={activeThreats}
    >
      {/* Connection Status Banner */}
      {!isConnected && !isLoading && (
        <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-500">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium">Reconnecting to backend...</span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && threats.length === 0 && (
        <div className="mb-4 p-8 bg-card border border-border rounded-lg text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mb-4" />
          <p className="text-muted-foreground">Loading threats from backend...</p>
          <p className="text-sm text-muted-foreground mt-2">Connecting to port 4000</p>
        </div>
      )}

      {/* Metrics Overview */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Key Metrics</h2>
          <div className="flex items-center gap-4">
            {/* Refresh button */}
            <button
              onClick={refreshThreats}
              disabled={isLoading}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              🔄 Refresh
            </button>
            
            {/* Connection indicator */}
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
        <MetricsGrid metrics={metrics} />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Left column - Threat feed and trending */}
        <div className="md:col-span-2 space-y-4 md:space-y-6">
          {/* Threat Feed */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-3 md:p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm md:text-base text-foreground">
                  Backend Threat Detection
                  {threats.length > 0 && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({threats.length} detected)
                    </span>
                  )}
                </h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse-subtle' : 'bg-gray-500'}`} />
                  {isConnected ? 'LIVE' : 'OFFLINE'}
                </div>
              </div>
            </div>
            
            {threats.length === 0 && !isLoading ? (
              <div className="p-8 text-center">
                <div className="text-4xl mb-2">✅</div>
                <p className="text-muted-foreground">No threats detected</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {postsAnalyzed > 0 
                    ? `${postsAnalyzed} posts analyzed by backend - all below threat threshold`
                    : 'Backend monitoring active...'}
                </p>
              </div>
            ) : (
              <ThreatFeed 
                threats={threats} 
                onSelectThreat={handleSelectThreat} 
                selectedId={selectedThreat?.id} 
              />
            )}
          </div>

          {/* Trending Topics */}
          <div className="bg-card border border-border rounded-lg p-3 md:p-4">
            <h3 className="font-semibold text-sm md:text-base text-foreground mb-3 md:mb-4">
              Trending Topics & Hashtags
            </h3>
            <TrendingTopics />
          </div>
        </div>

        {/* Right column - Sentiment gauge and bank status */}
        <div className="space-y-4 md:space-y-6">
          {/* Sentiment Gauge */}
          <div className="bg-card border border-border rounded-lg p-3 md:p-4">
            <h3 className="font-semibold text-sm md:text-base text-foreground mb-3 md:mb-4">Sentiment Gauge</h3>
            <SentimentGauge score={sentiment} />
            
            <div className="mt-4 pt-4 border-t border-border space-y-2">
              <div className="flex items-center justify-between text-xs md:text-sm">
                <span className="text-muted-foreground">Panic Posts</span>
                <span className={`font-semibold ${activeThreats > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {activeThreats}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs md:text-sm">
                <span className="text-muted-foreground">Trending Direction</span>
                <span className={`font-semibold ${sentimentChange > 0 ? 'text-green-500' : sentimentChange < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                  {sentimentChange > 0 ? '↑ Improving' : sentimentChange < 0 ? '↓ Declining' : '→ Stable'}
                </span>
              </div>
            </div>
          </div>

          {/* Bank Status Card */}
          <div className="bg-card border border-border rounded-lg p-3 md:p-4">
            <h3 className="font-semibold text-sm md:text-base text-foreground mb-3 md:mb-4">Bank System Status</h3>
            <div className="space-y-2 md:space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm text-muted-foreground truncate">System Status</p>
                  <p className="font-semibold text-xs md:text-sm text-foreground truncate">Operational</p>
                </div>
              </div>
              <div className="pt-2 md:pt-3 border-t border-border">
                <p className="text-xs md:text-sm text-muted-foreground mb-1 md:mb-2">ATM Uptime</p>
                <div className="flex items-end gap-2">
                  <div className="text-lg md:text-2xl font-bold text-primary">{mockBankData.atmUptime}%</div>
                  <p className="text-xs text-green-500 mb-0.5 md:mb-1">Normal</p>
                </div>
              </div>
              <div className="pt-2 md:pt-3 border-t border-border">
                <p className="text-xs md:text-sm text-muted-foreground mb-1">Active Accounts</p>
                <p className="text-base md:text-lg font-semibold text-foreground">
                  {(mockBankData.accountsActive / 1000000).toFixed(1)}M
                </p>
              </div>
              <div className="pt-2 md:pt-3 border-t border-border">
                <p className="text-xs md:text-sm text-muted-foreground mb-1">Transactions/Hour</p>
                <p className="text-base md:text-lg font-semibold text-foreground">
                  {mockBankData.activeTransactions.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          {selectedThreat && !selectedThreat.addressed && (
            <div className="bg-card border border-border rounded-lg p-3 md:p-4">
              <h3 className="font-semibold text-sm md:text-base text-foreground mb-2 md:mb-3">Quick Action</h3>
              <p className="text-xs md:text-sm text-muted-foreground mb-2 md:mb-3">
                Deploy AI-generated response to selected threat?
              </p>
              <button
                onClick={() => handleDeployResponse(selectedThreat.id)}
                disabled={isDeployingResponse}
                className="w-full px-3 md:px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeployingResponse ? '⏳ Deploying...' : '🤖 Generate Response'}
              </button>
              <div className="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Threat Score: <span className="font-semibold">{Math.round(selectedThreat.threatLevel * 100)}/100</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Panic Factor: <span className="font-semibold">{Math.round(selectedThreat.panicFactor * 100)}%</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}

// // app/page.tsx
// "use client"

// import { useState, useEffect } from "react"
// import { MainLayout } from "@/components/layout/main-layout"
// import { MetricsGrid } from "@/components/monitoring/metrics-grid"
// import { ThreatFeed } from "@/components/monitoring/threat-feed"
// import { SentimentGauge } from "@/components/monitoring/sentiment-gauge"
// import { TrendingTopics } from "@/components/monitoring/trending-topics"
// import { mockThreats, mockBankData } from "@/lib/demo-data"
// import type { Threat } from "@/lib/types"

// export default function Dashboard() {
//   const [threats, setThreats] = useState<Threat[]>(mockThreats)
//   const [selectedThreat, setSelectedThreat] = useState<Threat | null>(mockThreats[0])
//   const [sentiment, setSentiment] = useState(72)

//   // Simulate real-time threat updates
//   useEffect(() => {
//     const interval = setInterval(() => {
//       // Occasionally add new threat or update sentiment
//       if (Math.random() > 0.7) {
//         setSentiment((prev) => Math.max(20, Math.min(95, prev + (Math.random() - 0.5) * 5)))
//       }
//     }, 3000)

//     return () => clearInterval(interval)
//   }, [])

//   const metrics = [
//     {
//       label: "Active Threats",
//       value: threats.length,
//       change: 2,
//       changeType: "increase" as const,
//     },
//     {
//       label: "Sentiment Score",
//       value: `${Math.round(sentiment)}%`,
//       change: 5,
//       changeType: "increase" as const,
//     },
//     {
//       label: "Posts Analyzed",
//       value: "1,247",
//       change: 12,
//       changeType: "increase" as const,
//     },
//     {
//       label: "Responses Deployed",
//       value: "3",
//       change: 1,
//       changeType: "increase" as const,
//     },
//   ]

//   return (
//     <MainLayout
//       title="Crisis Monitoring Dashboard"
//       activeThreats={threats.filter((t) => t.severity === "HIGH" || t.severity === "CRITICAL").length}
//     >
//       {/* Metrics Overview */}
//       <div className="mb-8">
//         <h2 className="text-lg font-semibold text-foreground mb-4">Key Metrics</h2>
//         <MetricsGrid metrics={metrics} />
//       </div>

//       {/* Main content grid */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
//         {/* Left column - Threat feed and sentiment */}
//         <div className="md:col-span-2 space-y-4 md:space-y-6">
//           {/* Threat Feed */}
//           <div className="bg-card border border-border rounded-lg overflow-hidden">
//             <div className="p-3 md:p-4 border-b border-border">
//               <div className="flex items-center justify-between">
//                 <h3 className="font-semibold text-sm md:text-base text-foreground">Live Threat Feed</h3>
//                 <div className="flex items-center gap-2 text-xs text-muted-foreground">
//                   <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse-subtle" />
//                   LIVE
//                 </div>
//               </div>
//             </div>
//             <ThreatFeed threats={threats} onSelectThreat={setSelectedThreat} selectedId={selectedThreat?.id} />
//           </div>

//           {/* Trending Topics */}
//           <div className="bg-card border border-border rounded-lg p-3 md:p-4">
//             <h3 className="font-semibold text-sm md:text-base text-foreground mb-3 md:mb-4">
//               Trending Crisis Hashtags
//             </h3>
//             <TrendingTopics />
//           </div>
//         </div>

//         {/* Right column - Sentiment gauge */}
//         <div className="space-y-4 md:space-y-6">
//           <div className="bg-card border border-border rounded-lg p-3 md:p-4">
//             <h3 className="font-semibold text-sm md:text-base text-foreground mb-3 md:mb-4">Sentiment Gauge</h3>
//             <SentimentGauge score={sentiment} />
//           </div>

//           {/* Bank Status Card */}
//           <div className="bg-card border border-border rounded-lg p-3 md:p-4">
//             <h3 className="font-semibold text-sm md:text-base text-foreground mb-3 md:mb-4">Bank System Status</h3>
//             <div className="space-y-2 md:space-y-3">
//               <div className="flex items-center gap-2">
//                 <div className="w-3 h-3 bg-green-500 rounded-full" />
//                 <div className="flex-1 min-w-0">
//                   <p className="text-xs md:text-sm text-muted-foreground truncate">System Status</p>
//                   <p className="font-semibold text-xs md:text-sm text-foreground truncate">Operational</p>
//                 </div>
//               </div>
//               <div className="pt-2 md:pt-3 border-t border-border">
//                 <p className="text-xs md:text-sm text-muted-foreground mb-1 md:mb-2">ATM Uptime</p>
//                 <div className="flex items-end gap-2">
//                   <div className="text-lg md:text-2xl font-bold text-primary">{mockBankData.atmUptime}%</div>
//                   <p className="text-xs text-green-500 mb-0.5 md:mb-1">Normal</p>
//                 </div>
//               </div>
//               <div className="pt-2 md:pt-3 border-t border-border">
//                 <p className="text-xs md:text-sm text-muted-foreground mb-1">Active Accounts</p>
//                 <p className="text-base md:text-lg font-semibold text-foreground">
//                   {(mockBankData.accountsActive / 1000000).toFixed(1)}M
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </MainLayout>
//   )
// }
