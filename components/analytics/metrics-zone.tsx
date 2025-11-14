// // components/analytics/metrics-zone-connected.tsx
// "use client"

// import { Card } from "@/components/ui/card"
// import { TrendingUp, Activity, Loader2, AlertCircle } from "lucide-react"
// import { useAnalyticsOverview } from "@/hooks/use-analytics"

// interface MetricsZoneConnectedProps {
//   crisisId?: string
// }

// export function MetricsZoneConnected({ crisisId }: MetricsZoneConnectedProps) {
//   const { data, loading, error } = useAnalyticsOverview(crisisId, 5000)

//   if (error) {
//     return (
//       <Card className="overflow-hidden">
//         <div className="p-6 flex items-center justify-center gap-2 text-destructive">
//           <AlertCircle className="w-5 h-5" />
//           <span className="text-sm">Failed to load metrics: {error}</span>
//         </div>
//       </Card>
//     )
//   }

//   const formatNumber = (num: number) => {
//     if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
//     if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
//     return num.toString()
//   }

//   const metrics = [
//     {
//       label: "Posts Analyzed",
//       value: data ? formatNumber(data.totalPosts) : "---",
//       change: data?.postsPerMinute ? `+${data.postsPerMinute.toFixed(1)}` : "+0",
//       timeframe: "per min",
//     },
//     {
//       label: "Threats Detected",
//       value: data?.misinformationCount?.toString() || "---",
//       change: data?.threatLevel ? `${(data.threatLevel * 100).toFixed(0)}%` : "0%",
//       timeframe: "avg level",
//     },
//     {
//       label: "Responses",
//       value: data?.konfamResponseCount?.toString() || "---",
//       change: data?.viralPostCount ? `${data.viralPostCount}` : "0",
//       timeframe: "viral posts",
//     },
//     {
//       label: "Sentiment",
//       value: data?.averageSentiment !== undefined 
//         ? (data.averageSentiment >= 0 ? `+${data.averageSentiment.toFixed(2)}` : data.averageSentiment.toFixed(2))
//         : "---",
//       change: data?.engagementRate ? `${data.engagementRate.toFixed(1)}` : "0",
//       timeframe: "eng/post",
//     },
//   ]

//   return (
//     <Card className="overflow-hidden">
//       <div className="p-4 md:p-6 space-y-4">
//         <div className="flex items-center gap-2">
//           <Activity className="w-5 h-5 text-primary" />
//           <h3 className="font-semibold text-foreground">Live Metrics</h3>
//           {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
//         </div>

//         <div className="grid grid-cols-2 gap-3">
//           {metrics.map((metric, idx) => (
//             <div key={idx} className="p-3 rounded-lg bg-muted/50 border border-border">
//               <div className="text-xs text-muted-foreground uppercase font-semibold mb-2">
//                 {metric.label}
//               </div>
//               <div className="text-xl md:text-2xl font-bold text-foreground">
//                 {metric.value}
//               </div>
//               <div className="flex items-center justify-between mt-2">
//                 <div className="text-xs text-muted-foreground flex items-center gap-1">
//                   <TrendingUp className="w-3 h-3 text-green-600 dark:text-green-400" />
//                   <span className="text-green-600 dark:text-green-400">{metric.change}</span>
//                   <span>({metric.timeframe})</span>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//         {data && (
//           <div className="pt-2 border-t border-border">
//             <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
//               <div>
//                 <span className="font-semibold">Panic Level:</span>{" "}
//                 <span className={data.panicLevel > 0.7 ? "text-destructive" : ""}>
//                   {(data.panicLevel * 100).toFixed(0)}%
//                 </span>
//               </div>
//               <div>
//                 <span className="font-semibold">Avg Viral:</span> {data.averageViralCoefficient.toFixed(1)}x
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </Card>
//   )
// }

"use client"

import { Card } from "@/components/ui/card"
import { TrendingUp, Activity } from "lucide-react"
import type { Threat } from "@/lib/types"

interface MetricsZoneProps {
  threats: Threat[]
}

export function MetricsZone({ threats }: MetricsZoneProps) {
  const metrics = [
    { label: "Posts Analyzed", value: "1,247", change: "+15", timeframe: "1 min" },
    { label: "Threats Detected", value: threats.length.toString(), change: "+3", timeframe: "1 min" },
    { label: "Responses", value: "3", change: "+2", timeframe: "5 min" },
    { label: "Sentiment", value: "+0.45", change: "+160%", timeframe: "live" },
  ]

  return (
    <Card className="overflow-hidden">
      <div className="p-4 md:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Live Metrics</h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {metrics.map((metric, idx) => (
            <div key={idx} className="p-3 rounded-lg bg-muted/50 border border-border">
              <div className="text-xs text-muted-foreground uppercase font-semibold mb-2">{metric.label}</div>
              <div className="text-xl md:text-2xl font-bold text-foreground">{metric.value}</div>
              <div className="flex items-center justify-between mt-2">
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-green-600 dark:text-green-400" />
                  <span className="text-green-600 dark:text-green-400">{metric.change}</span>
                  <span>({metric.timeframe})</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
