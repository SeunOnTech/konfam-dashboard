// components/analytics/hero-zone-connected.tsx
"use client"

import { useState } from "react"
import { Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart } from "recharts"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, ZoomIn, ZoomOut, Loader2, AlertCircle } from "lucide-react"
import { useAnalyticsTimeline } from "@/hooks/use-analytics"

interface HeroZoneConnectedProps {
  crisisId?: string
  interval?: '1m' | '5m' | '15m' | '60m'
}

export function HeroZoneConnected({ crisisId, interval = '5m' }: HeroZoneConnectedProps) {
  const [zoomLevel, setZoomLevel] = useState(1)
  const { data, loading, error } = useAnalyticsTimeline(crisisId, interval, 10000)

  // Transform API data to chart format
  const chartData = data?.timeline.map((d) => ({
    time: new Date(d.timestamp).toLocaleTimeString("en-US", { 
      hour: "2-digit", 
      minute: "2-digit" 
    }),
    sentiment: d.sentiment,
    posts: d.postCount,
    threat: d.threatLevel,
    engagements: d.engagements,
  })) || []

  if (error) {
    return (
      <Card className="overflow-hidden">
        <div className="p-6 flex items-center justify-center gap-2 text-destructive">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">Failed to load timeline: {error}</span>
        </div>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <div className="p-4 md:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Crisis Timeline</h3>
            {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
              className="h-8 w-8 p-0"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-xs text-muted-foreground w-12 text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.25))}
              className="h-8 w-8 p-0"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="h-80 md:h-96 w-full">
          {chartData.length === 0 && !loading ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <p className="text-sm">No timeline data available</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <defs>
                  <linearGradient id="threatGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="time" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Bar dataKey="posts" fill="hsl(var(--muted-foreground))" opacity={0.3} />
                <Line
                  type="monotone"
                  dataKey="sentiment"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={false}
                  isAnimationActive={true}
                />
                <Line
                  type="monotone"
                  dataKey="threat"
                  stroke="hsl(var(--destructive))"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  isAnimationActive={true}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span>Sentiment</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-destructive" />
              <span>Threat Level</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-muted-foreground opacity-50" />
              <span>Posts</span>
            </div>
          </div>
          <span className="ml-auto">
            {loading ? 'Updating...' : `Live • Interval: ${data?.interval}min`}
          </span>
        </div>
      </div>
    </Card>
  )
}

// "use client"

// import { useState } from "react"
// import { Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart } from "recharts"
// import { Card } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { TrendingUp, ZoomIn, ZoomOut } from "lucide-react"
// import type { SentimentData } from "@/lib/types"

// interface HeroZoneProps {
//   sentiment: SentimentData[]
// }

// export function HeroZone({ sentiment }: HeroZoneProps) {
//   const [zoomLevel, setZoomLevel] = useState(1)

//   const chartData = sentiment.map((d) => ({
//     time: d.timestamp.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
//     sentiment: d.score / 100,
//     posts: d.tweetCount,
//     threat: d.panicLevel / 100,
//   }))

//   return (
//     <Card className="overflow-hidden">
//       <div className="p-4 md:p-6 space-y-4">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-2">
//             <TrendingUp className="w-5 h-5 text-primary" />
//             <h3 className="font-semibold text-foreground">Crisis Timeline</h3>
//           </div>
//           <div className="flex items-center gap-2">
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
//               className="h-8 w-8 p-0"
//             >
//               <ZoomOut className="w-4 h-4" />
//             </Button>
//             <span className="text-xs text-muted-foreground w-12 text-center">{Math.round(zoomLevel * 100)}%</span>
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.25))}
//               className="h-8 w-8 p-0"
//             >
//               <ZoomIn className="w-4 h-4" />
//             </Button>
//           </div>
//         </div>

//         <div className="h-80 md:h-96 w-full">
//           <ResponsiveContainer width="100%" height="100%">
//             <ComposedChart data={chartData}>
//               <defs>
//                 <linearGradient id="threatGradient" x1="0" y1="0" x2="0" y2="1">
//                   <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
//                   <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
//                 </linearGradient>
//                 <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
//                   <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={1} />
//                   <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
//                 </linearGradient>
//               </defs>
//               <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
//               <XAxis dataKey="time" className="text-xs" />
//               <YAxis className="text-xs" />
//               <Tooltip
//                 contentStyle={{
//                   backgroundColor: "hsl(var(--card))",
//                   border: "1px solid hsl(var(--border))",
//                   borderRadius: "0.5rem",
//                 }}
//                 labelStyle={{ color: "hsl(var(--foreground))" }}
//               />
//               <Bar dataKey="posts" fill="hsl(var(--muted-foreground))" opacity={0.3} />
//               <Line
//                 type="monotone"
//                 dataKey="sentiment"
//                 stroke="hsl(var(--primary))"
//                 strokeWidth={3}
//                 dot={false}
//                 isAnimationActive={true}
//               />
//             </ComposedChart>
//           </ResponsiveContainer>
//         </div>

//         <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-muted-foreground">
//           <div className="flex items-center gap-2">
//             <div className="w-2 h-2 rounded-full bg-primary" />
//             <span>Sentiment Trend</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <div className="w-2 h-2 rounded-full bg-muted-foreground opacity-50" />
//             <span>Post Volume</span>
//           </div>
//           <span className="ml-auto">Live • Last update: 2s ago</span>
//         </div>
//       </div>
//     </Card>
//   )
// }
