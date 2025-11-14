// // components/analytics/intel-zone-connected.tsx
// "use client"

// import { Card } from "@/components/ui/card"
// import { BarChart3, Loader2, AlertCircle, TrendingUp, TrendingDown, Hash } from "lucide-react"
// import { useTrendingTopics } from "@/hooks/use-analytics"

// export function IntelZoneConnected() {
//   const { data, loading, error } = useTrendingTopics(30000)

//   const getSentimentColor = (sentiment: string) => {
//     switch (sentiment) {
//       case "negative":
//         return "text-destructive dark:text-red-400"
//       case "positive":
//         return "text-green-600 dark:text-green-400"
//       default:
//         return "text-muted-foreground"
//     }
//   }

//   const getSentimentIcon = (sentiment: string) => {
//     switch (sentiment) {
//       case "negative":
//         return "😰"
//       case "positive":
//         return "😊"
//       default:
//         return "😐"
//     }
//   }

//   if (error) {
//     return (
//       <Card className="overflow-hidden">
//         <div className="p-6 flex items-center justify-center gap-2 text-destructive">
//           <AlertCircle className="w-5 h-5" />
//           <span className="text-sm">Failed to load topics: {error}</span>
//         </div>
//       </Card>
//     )
//   }

//   return (
//     <Card className="overflow-hidden">
//       <div className="p-4 md:p-6 space-y-4">
//         <div className="flex items-center gap-2">
//           <BarChart3 className="w-5 h-5 text-primary" />
//           <h3 className="font-semibold text-foreground">Trending Topics</h3>
//           {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
//         </div>

//         <div className="space-y-2 max-h-80 overflow-y-auto">
//           {!data || data.topics.length === 0 ? (
//             <div className="h-40 flex items-center justify-center text-muted-foreground">
//               <p className="text-sm">No trending topics yet</p>
//             </div>
//           ) : (
//             data.topics.map((topic, idx) => (
//               <div
//                 key={idx}
//                 className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
//               >
//                 <div className="flex items-center gap-2 flex-1 min-w-0">
//                   <span className="text-xs font-semibold text-muted-foreground w-6 flex-shrink-0">
//                     {idx + 1}.
//                   </span>
                  
//                   <div className="flex items-center gap-2 flex-1 min-w-0">
//                     {topic.isHashtag && (
//                       <Hash className="w-3 h-3 text-primary flex-shrink-0" />
//                     )}
//                     <span 
//                       className={`font-medium truncate ${getSentimentColor(topic.sentiment)}`}
//                       title={topic.topic}
//                     >
//                       {topic.topic}
//                     </span>
//                   </div>

//                   <span className="text-xs flex-shrink-0">
//                     {getSentimentIcon(topic.sentiment)}
//                   </span>
//                 </div>

//                 <div className="flex items-center gap-2 flex-shrink-0 ml-2">
//                   <span className="text-sm font-semibold text-foreground">
//                     {topic.count}
//                   </span>
                  
//                   {topic.change !== 0 && (
//                     <div className="flex items-center gap-1">
//                       {topic.change > 0 ? (
//                         <>
//                           <TrendingUp className="w-3 h-3 text-green-600 dark:text-green-400" />
//                           <span className="text-xs text-green-600 dark:text-green-400">
//                             +{topic.change}%
//                           </span>
//                         </>
//                       ) : (
//                         <>
//                           <TrendingDown className="w-3 h-3 text-muted-foreground" />
//                           <span className="text-xs text-muted-foreground">
//                             {topic.change}%
//                           </span>
//                         </>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             ))
//           )}
//         </div>

//         {data && (
//           <div className="pt-2 border-t border-border text-xs text-muted-foreground">
//             Last updated: {new Date(data.timestamp).toLocaleTimeString()}
//           </div>
//         )}
//       </div>
//     </Card>
//   )
// }

"use client"

import { Card } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"

export function IntelZone() {
  const topics = [
    { word: "frozen", count: 234, trend: "up", sentiment: "negative" },
    { word: "ATM", count: 156, trend: "up", sentiment: "negative" },
    { word: "scam", count: 89, trend: "down", sentiment: "negative" },
    { word: "down", count: 67, trend: "up", sentiment: "neutral" },
    { word: "account", count: 145, trend: "up", sentiment: "negative" },
    { word: "blocked", count: 98, trend: "up", sentiment: "negative" },
  ]

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "negative":
        return "text-destructive dark:text-red-400"
      case "positive":
        return "text-green-600 dark:text-green-400"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="p-4 md:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Trending Topics</h3>
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto">
          {topics.map((topic, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2 flex-1">
                <span className="text-xs font-semibold text-muted-foreground w-6">{idx + 1}.</span>
                <span className={`font-medium ${getSentimentColor(topic.sentiment)}`}>{topic.word}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">{topic.count}</span>
                <span
                  className={`text-xs ${topic.trend === "up" ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}
                >
                  {topic.trend === "up" ? "↑" : "↓"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
