// components/analytics/impact-zone-connected.tsx
"use client"

import { Card } from "@/components/ui/card"
import { TrendingDown, TrendingUp, Loader2, AlertCircle } from "lucide-react"
import { useKonfamImpact } from "@/hooks/use-analytics"

interface ImpactZoneConnectedProps {
  crisisId?: string
}

export function ImpactZoneConnected({ crisisId }: ImpactZoneConnectedProps) {
  const { data, loading, error } = useKonfamImpact(crisisId, 5000)

  if (!crisisId) {
    return (
      <Card className="overflow-hidden">
        <div className="p-6 flex items-center justify-center text-muted-foreground">
          <p className="text-sm">Select a crisis to view impact metrics</p>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="overflow-hidden">
        <div className="p-6 flex items-center justify-center gap-2 text-destructive">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">Failed to load impact: {error}</span>
        </div>
      </Card>
    )
  }

  if (loading || !data) {
    return (
      <Card className="overflow-hidden">
        <div className="p-6 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </Card>
    )
  }

  if (!data.hasIntervention) {
    return (
      <Card className="overflow-hidden">
        <div className="p-6 flex items-center justify-center text-muted-foreground">
          <p className="text-sm">{data.message || 'No Konfam intervention yet'}</p>
        </div>
      </Card>
    )
  }

  const formatSentiment = (value: number) => {
    return value >= 0 ? `+${value.toFixed(2)}` : value.toFixed(2)
  }

  const formatTime = (seconds?: number) => {
    if (!seconds) return 'N/A'
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}m ${secs}s`
  }

  return (
    <Card className="overflow-hidden">
      <div className="p-4 md:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-primary" />
            Konfam Impact
            {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Before */}
          <div className="space-y-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase">Before</h4>
            <div className="text-sm">
              <div className="font-semibold text-foreground">
                {formatSentiment(data.sentimentBefore || 0)}
              </div>
              <div className="text-xs text-muted-foreground">Sentiment</div>
            </div>
          </div>

          {/* After */}
          <div className="space-y-3 p-3 rounded-lg bg-green-500/5 border border-green-500/20">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase">After</h4>
            <div className="text-sm">
              <div className="font-semibold text-green-600 dark:text-green-400">
                {formatSentiment(data.sentimentAfter || 0)}
              </div>
              <div className="text-xs text-muted-foreground">Sentiment</div>
            </div>
          </div>
        </div>

        {/* Improvement Banner */}
        <div className="flex items-center justify-center py-3 gap-3 bg-primary/5 rounded-lg border border-primary/20">
          <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
          <span className="font-semibold text-green-600 dark:text-green-400">
            {data.improvementPercentage && data.improvementPercentage > 0 
              ? `+${data.improvementPercentage.toFixed(1)}%` 
              : `${data.improvementPercentage?.toFixed(1) || 0}%`} Improvement
          </span>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="p-2 rounded bg-muted/50">
            <div className="text-xs text-muted-foreground">Responses</div>
            <div className="text-lg font-bold text-foreground">{data.responseCount}</div>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <div className="text-xs text-muted-foreground">Time to Respond</div>
            <div className="text-lg font-bold text-foreground">
              {formatTime(data.timeToIntervention)}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

// "use client"

// import { Card } from "@/components/ui/card"
// import { TrendingDown, TrendingUp } from "lucide-react"

// export function ImpactZone() {
//   const beforeMetrics = [
//     { label: "Sentiment", value: "-0.75", icon: "😱" },
//     { label: "Panic Level", value: "85%", icon: "🔥" },
//     { label: "Viral Spread", value: "4.2x", icon: "📈" },
//     { label: "Misinformation", value: "234", icon: "⚠️" },
//   ]

//   const afterMetrics = [
//     { label: "Sentiment", value: "+0.45", icon: "😊" },
//     { label: "Panic Level", value: "32%", icon: "😌" },
//     { label: "Viral Spread", value: "1.8x", icon: "📉" },
//     { label: "Misinformation", value: "45", icon: "✅" },
//   ]

//   const improvement = 160

//   return (
//     <Card className="overflow-hidden">
//       <div className="p-4 md:p-6 space-y-4">
//         <div className="flex items-center justify-between">
//           <h3 className="font-semibold text-foreground flex items-center gap-2">
//             <TrendingDown className="w-5 h-5 text-primary" />
//             Konfam Impact
//           </h3>
//         </div>

//         <div className="grid grid-cols-2 gap-4">
//           {/* Before */}
//           <div className="space-y-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
//             <h4 className="text-xs font-semibold text-muted-foreground uppercase">Before</h4>
//             {beforeMetrics.map((metric, idx) => (
//               <div key={idx} className="text-sm">
//                 <div className="font-semibold text-foreground">{metric.value}</div>
//                 <div className="text-xs text-muted-foreground">{metric.label}</div>
//               </div>
//             ))}
//           </div>

//           {/* After */}
//           <div className="space-y-3 p-3 rounded-lg bg-green-500/5 border border-green-500/20">
//             <h4 className="text-xs font-semibold text-muted-foreground uppercase">After</h4>
//             {afterMetrics.map((metric, idx) => (
//               <div key={idx} className="text-sm">
//                 <div className="font-semibold text-green-600 dark:text-green-400">{metric.value}</div>
//                 <div className="text-xs text-muted-foreground">{metric.label}</div>
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className="flex items-center justify-center py-3 gap-3 bg-primary/5 rounded-lg border border-primary/20">
//           <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
//           <span className="font-semibold text-green-600 dark:text-green-400">+{improvement}% Improvement</span>
//         </div>
//       </div>
//     </Card>
//   )
// }
