// components/monitoring/trending-topics.tsx
"use client"

import { TrendingUp, TrendingDown, Minus, Loader2 } from "lucide-react"
import type { TrendingItem } from "@/lib/api"

type Props = {
  trending?: TrendingItem[]
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
}

export function TrendingTopics({ trending = [], isLoading = false, error = null, onRetry }: Props) {
  // Basic heuristics for sentiment/trend direction (optional; your backend can send richer fields later)
  const getSentimentColor = (count: number) => {
    // If you add sentiment later, swap to sentiment flag
    if (count > 500) return "text-green-500"
    if (count > 100) return "text-blue-500"
    return "text-muted-foreground"
  }

  const getTrendIcon = (change = 0) => {
    if (change > 0) return <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
    if (change < 0) return <TrendingDown className="w-3 h-3 md:w-4 md:h-4" />
    return <Minus className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />
  }

  if (isLoading && trending.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">Loading trending topics...</span>
      </div>
    )
  }

  if (error && trending.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-red-500 mb-2">{error}</p>
        {onRetry && (
          <button onClick={onRetry} className="text-xs text-primary hover:underline">
            Try again
          </button>
        )}
      </div>
    )
  }

  if (trending.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-2">📊</div>
        <p className="text-sm text-muted-foreground">No trending topics yet</p>
        <p className="text-xs text-muted-foreground mt-1">Topics will appear as crisis discussions emerge</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {trending.map((topic, idx) => {
        // Optional “change” calculation placeholder; add real % change if backend provides it
        const change = 0
        return (
          <div
            key={`${topic.keyword}-${idx}`}
            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors group"
          >
            <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
              <div className="flex-shrink-0 w-6 md:w-8 h-6 md:h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-xs md:text-sm font-bold text-primary">#{idx + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-xs md:text-sm font-semibold truncate ${getSentimentColor(topic.count)}`}>
                    {topic.keyword}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">{topic.count.toLocaleString()} mentions</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 text-muted-foreground">
              {getTrendIcon(change)}
              <span className="text-xs md:text-sm font-semibold">0%</span>
            </div>
          </div>
        )
      })}

      <div className="flex items-center justify-center gap-2 pt-2 text-xs text-muted-foreground">
        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
        Live
      </div>
    </div>
  )
}

// // components/monitoring/trending-topics.tsx
// "use client"

// import { useState, useEffect } from "react"
// import { TrendingUp, TrendingDown, Minus, Loader2 } from "lucide-react"
// import { analyticsAPI, type TrendingTopic } from "@/lib/analytics-api-client"

// export function TrendingTopics() {
//   const [topics, setTopics] = useState<TrendingTopic[]>([])
//   const [isLoading, setIsLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)
//   const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

//   // Load trending topics on mount and refresh every 30 seconds
//   useEffect(() => {
//     loadTrendingTopics()
    
//     const interval = setInterval(() => {
//       loadTrendingTopics()
//     }, 30000) // Refresh every 30 seconds
    
//     return () => clearInterval(interval)
//   }, [])

//   const loadTrendingTopics = async () => {
//     try {
//       setError(null)
//       console.log('📊 Loading trending topics...')
//       const data = await analyticsAPI.getTrendingTopics()
      
//       // Handle the nested success response structure from your backend
//       if (data.success && data.data) {
//         setTopics(data.data.topics)
//       } else {
//         setTopics(data.topics || [])
//       }
      
//       setLastUpdated(new Date())
//       console.log('✅ Loaded trending topics')
//     } catch (err) {
//       console.error('❌ Failed to load trending topics:', err)
//       setError('Failed to load trending topics')
//       // Keep existing topics on error
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   // Get sentiment color
//   const getSentimentColor = (sentiment: string) => {
//     switch (sentiment) {
//       case 'positive':
//         return 'text-green-500'
//       case 'negative':
//         return 'text-red-500'
//       default:
//         return 'text-muted-foreground'
//     }
//   }

//   // Get trend icon
//   const getTrendIcon = (change: number) => {
//     if (change > 0) {
//       return <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-red-500" />
//     } else if (change < 0) {
//       return <TrendingDown className="w-3 h-3 md:w-4 md:h-4 text-green-500" />
//     }
//     return <Minus className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />
//   }

//   if (isLoading && topics.length === 0) {
//     return (
//       <div className="flex items-center justify-center py-8">
//         <Loader2 className="w-6 h-6 animate-spin text-primary" />
//         <span className="ml-2 text-sm text-muted-foreground">Loading trending topics...</span>
//       </div>
//     )
//   }

//   if (error && topics.length === 0) {
//     return (
//       <div className="text-center py-8">
//         <p className="text-sm text-red-500 mb-2">{error}</p>
//         <button 
//           onClick={loadTrendingTopics}
//           className="text-xs text-primary hover:underline"
//         >
//           Try again
//         </button>
//       </div>
//     )
//   }

//   if (topics.length === 0) {
//     return (
//       <div className="text-center py-8">
//         <div className="text-4xl mb-2">📊</div>
//         <p className="text-sm text-muted-foreground">No trending topics yet</p>
//         <p className="text-xs text-muted-foreground mt-1">
//           Topics will appear as crisis discussions emerge
//         </p>
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-3">
//       {topics.map((topic, idx) => (
//         <div
//           key={idx}
//           className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors group"
//         >
//           <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
//             <div className="flex-shrink-0 w-6 md:w-8 h-6 md:h-8 bg-primary/10 rounded-full flex items-center justify-center">
//               <span className="text-xs md:text-sm font-bold text-primary">#{idx + 1}</span>
//             </div>
//             <div className="flex-1 min-w-0">
//               <div className="flex items-center gap-2">
//                 <p className={`text-xs md:text-sm font-semibold truncate ${getSentimentColor(topic.sentiment)}`}>
//                   {topic.topic}
//                 </p>
//                 {topic.isHashtag && (
//                   <span className="flex-shrink-0 text-xs px-1.5 py-0.5 bg-blue-500/10 text-blue-500 rounded font-medium">
//                     tag
//                   </span>
//                 )}
//               </div>
//               <p className="text-xs text-muted-foreground">
//                 {topic.count.toLocaleString()} mentions
//               </p>
//             </div>
//           </div>
//           <div className="flex items-center gap-2 flex-shrink-0">
//             {getTrendIcon(topic.change)}
//             <span className={`text-xs md:text-sm font-semibold ${
//               topic.change > 0 ? 'text-red-500' : 
//               topic.change < 0 ? 'text-green-500' : 
//               'text-muted-foreground'
//             }`}>
//               {topic.change > 0 ? '+' : ''}{topic.change}%
//             </span>
//           </div>
//         </div>
//       ))}
      
//       {/* Last updated indicator */}
//       <div className="flex items-center justify-center gap-2 pt-2 text-xs text-muted-foreground">
//         <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
//         Updated {lastUpdated.toLocaleTimeString()}
//       </div>
//     </div>
//   )
// }

// import { TrendingUp, TrendingDown } from "lucide-react"

// export function TrendingTopics() {
//   const topics = [
//     { hashtag: "#TBankFrozenAccounts", tweets: 2300, trend: "up" },
//     { hashtag: "#TBankATMDown", tweets: 1890, trend: "up" },
//     { hashtag: "#BankingCrisis", tweets: 1456, trend: "up" },
//     { hashtag: "#TransferFail", tweets: 987, trend: "down" },
//     { hashtag: "#TBankExplain", tweets: 654, trend: "up" },
//   ]

//   return (
//     <div className="space-y-3">
//       {topics.map((topic, idx) => (
//         <div
//           key={idx}
//           className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
//         >
//           <div className="flex-1 min-w-0">
//             <p className="font-semibold text-foreground text-sm truncate">{topic.hashtag}</p>
//             <p className="text-xs text-muted-foreground">{topic.tweets.toLocaleString()} tweets</p>
//           </div>
//           <div
//             className={`text-xs font-bold px-2 py-1 rounded flex items-center gap-1 flex-shrink-0 ml-2 ${
//               topic.trend === "up" ? "bg-destructive/20 text-destructive" : "bg-green-500/20 text-green-600"
//             }`}
//           >
//             {topic.trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
//             <span>{topic.trend === "up" ? "Rising" : "Falling"}</span>
//           </div>
//         </div>
//       ))}
//     </div>
//   )
// }
