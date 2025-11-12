// app/feedback/page.tsx
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { TrendingUp, TrendingDown, Heart, MessageCircle, Users, Clock, BarChart3, Target, Loader2 } from "lucide-react"
import { feedbackAPI, type FeedbackMetric, type TopComment } from "@/lib/feedback-api-client"

export default function FeedbackPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<"daily" | "weekly" | "monthly">("weekly")
  const [metrics, setMetrics] = useState<FeedbackMetric[]>([])
  const [topComments, setTopComments] = useState<TopComment[]>([])
  const [keyTopics, setKeyTopics] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Icon mapping for metrics
  const metricIcons: Record<string, React.ReactNode> = {
    "Positive Mentions": <Heart className="w-5 h-5 text-red-500" />,
    "Engagement Rate": <MessageCircle className="w-5 h-5 text-blue-500" />,
    "Sentiment Score": <Users className="w-5 h-5 text-green-500" />,
    "Influence Index": <Target className="w-5 h-5 text-purple-500" />,
  }

  // Load data when period changes
  useEffect(() => {
    loadFeedbackData()
  }, [selectedPeriod])

  const loadFeedbackData = async () => {
    setIsLoading(true)
    try {
      console.log(`📊 Loading feedback data for ${selectedPeriod} period...`)
      
      // Fetch all data in parallel
      const [metricsData, commentsData, topicsData] = await Promise.all([
        feedbackAPI.getMetrics(selectedPeriod),
        feedbackAPI.getTopComments(selectedPeriod),
        feedbackAPI.getKeyTopics(selectedPeriod),
      ])

      setMetrics(metricsData.metrics)
      setTopComments(commentsData.topComments)
      setKeyTopics(topicsData.keyTopics)
      setLastUpdated(new Date())
      
      console.log("✅ Feedback data loaded successfully")
    } catch (error) {
      console.error("❌ Failed to load feedback data:", error)
      // Keep existing data on error
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate overall health score
  const overallHealthScore = metrics.length > 0
    ? Math.round(metrics.reduce((sum, m) => sum + m.score, 0) / metrics.length)
    : 0

  return (
    <MainLayout title="Reputation & Feedback" activeThreats={0}>
      <div className="space-y-6">
        {/* Header with Period Selector */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Reputation Overview</h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1">
              Track your bank's reputation and what people are saying across social media
            </p>
          </div>

          {/* Period Tabs */}
          <div className="flex gap-2 bg-muted/50 rounded-lg p-1 w-fit">
            {(["daily", "weekly", "monthly"] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                disabled={isLoading}
                className={`px-4 md:px-6 py-2 rounded-md font-semibold transition-all duration-300 text-sm md:text-base capitalize ${
                  selectedPeriod === period
                    ? "bg-primary text-primary-foreground shadow-lg scale-105"
                    : "text-muted-foreground hover:text-foreground disabled:opacity-50"
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="flex items-center justify-center gap-3 py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading feedback data...</p>
          </div>
        )}

        {/* Metrics Grid */}
        {!isLoading && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {metrics.map((metric, idx) => (
                <div
                  key={idx}
                  className="bg-card border border-border rounded-lg p-4 md:p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-lg group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 md:p-3 bg-muted rounded-lg group-hover:bg-primary/10 transition-colors">
                      {metricIcons[metric.label]}
                    </div>
                    <div
                      className={`flex items-center gap-1 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-semibold ${
                        metric.trend === "up" ? "bg-green-500/20 text-green-600" : "bg-red-500/20 text-red-600"
                      }`}
                    >
                      {metric.trend === "up" ? (
                        <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
                      ) : (
                        <TrendingDown className="w-3 h-3 md:w-4 md:h-4" />
                      )}
                      {metric.change > 0 ? "+" : ""}
                      {metric.change}%
                    </div>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground mb-2">{metric.label}</p>
                  <p className="text-2xl md:text-4xl font-bold text-foreground">{metric.score}</p>
                  <p className="text-xs text-muted-foreground mt-1">/100 Score</p>
                </div>
              ))}
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Top Comments Section */}
              <div className="lg:col-span-2 bg-card border border-border rounded-lg p-4 md:p-6">
                <div className="flex items-center gap-2 mb-4 md:mb-6">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  <h3 className="text-lg md:text-xl font-semibold text-foreground">Top Conversations</h3>
                </div>

                {topComments.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">No conversations found for this period</p>
                  </div>
                ) : (
                  <div className="space-y-3 md:space-y-4">
                    {topComments.map((comment, idx) => (
                      <div
                        key={idx}
                        className={`p-3 md:p-4 rounded-lg border transition-all duration-300 hover:border-primary/50 ${
                          comment.sentiment === "positive"
                            ? "bg-green-500/5 border-green-500/20 hover:bg-green-500/10"
                            : comment.sentiment === "negative"
                              ? "bg-red-500/5 border-red-500/20 hover:bg-red-500/10"
                              : "bg-muted/50 border-border"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <p className="text-xs md:text-sm italic text-foreground flex-1">{comment.text}</p>
                          <div
                            className={`px-2 md:px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                              comment.sentiment === "positive"
                                ? "bg-green-500/20 text-green-600"
                                : comment.sentiment === "negative"
                                  ? "bg-red-500/20 text-red-600"
                                  : "bg-gray-500/20 text-gray-600"
                            }`}
                          >
                            {comment.sentiment}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="w-3 h-3 md:w-4 md:h-4" />
                          {comment.count.toLocaleString()} mentions
                          {comment.author && (
                            <>
                              <span className="mx-1">•</span>
                              <span>@{comment.author}</span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Key Topics Section */}
              <div className="bg-card border border-border rounded-lg p-4 md:p-6">
                <div className="flex items-center gap-2 mb-4 md:mb-6">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <h3 className="text-lg md:text-xl font-semibold text-foreground">Key Topics</h3>
                </div>

                {keyTopics.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">No topics identified for this period</p>
                  </div>
                ) : (
                  <div className="space-y-2 md:space-y-3">
                    {keyTopics.map((topic, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 md:p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors group cursor-pointer"
                      >
                        <p className="text-sm md:text-base font-medium text-foreground group-hover:text-primary transition-colors">
                          {topic}
                        </p>
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Overall Health Score */}
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-xs md:text-sm text-muted-foreground mb-3">Overall Reputation Health</p>
                  <div className="relative h-8 md:h-10 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-pink-500 rounded-full transition-all duration-700 flex items-center justify-center"
                      style={{ width: `${overallHealthScore}%` }}
                    >
                      <span className="text-xs md:text-sm font-bold text-white mix-blend-multiply">
                        {overallHealthScore}%
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {overallHealthScore >= 70 ? "Strong and improving" : 
                     overallHealthScore >= 50 ? "Stable" : 
                     "Needs attention"}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Last Updated */}
        <div className="flex items-center justify-center gap-2 text-xs md:text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          Last updated: {lastUpdated.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </MainLayout>
  )
}

// "use client"

// import type React from "react"

// import { useState } from "react"
// import { MainLayout } from "@/components/layout/main-layout"
// import { TrendingUp, TrendingDown, Heart, MessageCircle, Users, Clock, BarChart3, Target } from "lucide-react"

// interface ReputationMetric {
//   label: string
//   score: number
//   trend: "up" | "down"
//   change: number
//   icon: React.ReactNode
// }

// interface FeedbackPeriod {
//   period: "Daily" | "Weekly" | "Monthly"
//   sentiment: ReputationMetric[]
//   topComments: Array<{ text: string; count: number; sentiment: "positive" | "negative" | "neutral" }>
//   keyTopics: string[]
// }

// export default function FeedbackPage() {
//   const [selectedPeriod, setSelectedPeriod] = useState<"Daily" | "Weekly" | "Monthly">("Weekly")

//   const feedbackData: Record<"Daily" | "Weekly" | "Monthly", FeedbackPeriod> = {
//     Daily: {
//       period: "Daily",
//       sentiment: [
//         {
//           label: "Positive Mentions",
//           score: 68,
//           trend: "up",
//           change: 12,
//           icon: <Heart className="w-5 h-5 text-red-500" />,
//         },
//         {
//           label: "Engagement Rate",
//           score: 52,
//           trend: "down",
//           change: -5,
//           icon: <MessageCircle className="w-5 h-5 text-blue-500" />,
//         },
//         {
//           label: "Sentiment Score",
//           score: 64,
//           trend: "up",
//           change: 8,
//           icon: <Users className="w-5 h-5 text-green-500" />,
//         },
//         {
//           label: "Influence Index",
//           score: 71,
//           trend: "up",
//           change: 4,
//           icon: <Target className="w-5 h-5 text-purple-500" />,
//         },
//       ],
//       topComments: [
//         { text: '"Finally got my issue resolved, great customer service!"', count: 342, sentiment: "positive" },
//         { text: '"ATM was down but got it fixed quickly"', count: 278, sentiment: "positive" },
//         { text: '"Still having transaction delays"', count: 156, sentiment: "negative" },
//       ],
//       keyTopics: ["ATM Issues", "Transfer Speed", "Customer Support", "Account Security"],
//     },
//     Weekly: {
//       period: "Weekly",
//       sentiment: [
//         {
//           label: "Positive Mentions",
//           score: 62,
//           trend: "down",
//           change: -8,
//           icon: <Heart className="w-5 h-5 text-red-500" />,
//         },
//         {
//           label: "Engagement Rate",
//           score: 58,
//           trend: "up",
//           change: 6,
//           icon: <MessageCircle className="w-5 h-5 text-blue-500" />,
//         },
//         {
//           label: "Sentiment Score",
//           score: 59,
//           trend: "down",
//           change: -3,
//           icon: <Users className="w-5 h-5 text-green-500" />,
//         },
//         {
//           label: "Influence Index",
//           score: 65,
//           trend: "down",
//           change: -7,
//           icon: <Target className="w-5 h-5 text-purple-500" />,
//         },
//       ],
//       topComments: [
//         { text: '"Banking with them is now seamless"', count: 512, sentiment: "positive" },
//         { text: '"The new app interface is intuitive"', count: 445, sentiment: "positive" },
//         { text: '"Frequent maintenance windows are annoying"', count: 389, sentiment: "negative" },
//       ],
//       keyTopics: ["Mobile App", "Security Features", "Transaction Speed", "Fees"],
//     },
//     Monthly: {
//       period: "Monthly",
//       sentiment: [
//         {
//           label: "Positive Mentions",
//           score: 55,
//           trend: "up",
//           change: 2,
//           icon: <Heart className="w-5 h-5 text-red-500" />,
//         },
//         {
//           label: "Engagement Rate",
//           score: 51,
//           trend: "down",
//           change: -9,
//           icon: <MessageCircle className="w-5 h-5 text-blue-500" />,
//         },
//         {
//           label: "Sentiment Score",
//           score: 54,
//           trend: "up",
//           change: 1,
//           icon: <Users className="w-5 h-5 text-green-500" />,
//         },
//         {
//           label: "Influence Index",
//           score: 58,
//           trend: "up",
//           change: 3,
//           icon: <Target className="w-5 h-5 text-purple-500" />,
//         },
//       ],
//       topComments: [
//         { text: '"Reliable banking partner over the years"', count: 1823, sentiment: "positive" },
//         { text: '"Good competitive rates on savings"', count: 1567, sentiment: "positive" },
//         { text: '"Customer support could be more responsive"', count: 1234, sentiment: "negative" },
//       ],
//       keyTopics: ["Reliability", "Rates & Offers", "Customer Service", "Digital Banking", "Trustworthiness"],
//     },
//   }

//   const current = feedbackData[selectedPeriod]

//   return (
//     <MainLayout title="Reputation & Feedback" activeThreats={0}>
//       <div className="space-y-6">
//         {/* Header with Period Selector */}
//         <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//           <div>
//             <h1 className="text-2xl md:text-3xl font-bold text-foreground">Reputation Overview</h1>
//             <p className="text-sm md:text-base text-muted-foreground mt-1">
//               Track your bank's reputation and what people are saying across social media
//             </p>
//           </div>

//           {/* Period Tabs */}
//           <div className="flex gap-2 bg-muted/50 rounded-lg p-1 w-fit">
//             {(["Daily", "Weekly", "Monthly"] as const).map((period) => (
//               <button
//                 key={period}
//                 onClick={() => setSelectedPeriod(period)}
//                 className={`px-4 md:px-6 py-2 rounded-md font-semibold transition-all duration-300 text-sm md:text-base ${
//                   selectedPeriod === period
//                     ? "bg-primary text-primary-foreground shadow-lg scale-105"
//                     : "text-muted-foreground hover:text-foreground"
//                 }`}
//               >
//                 {period}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Metrics Grid */}
//         <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
//           {current.sentiment.map((metric, idx) => (
//             <div
//               key={idx}
//               className="bg-card border border-border rounded-lg p-4 md:p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-lg group"
//             >
//               <div className="flex items-start justify-between mb-3">
//                 <div className="p-2 md:p-3 bg-muted rounded-lg group-hover:bg-primary/10 transition-colors">
//                   {metric.icon}
//                 </div>
//                 <div
//                   className={`flex items-center gap-1 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-semibold ${
//                     metric.trend === "up" ? "bg-green-500/20 text-green-600" : "bg-red-500/20 text-red-600"
//                   }`}
//                 >
//                   {metric.trend === "up" ? (
//                     <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
//                   ) : (
//                     <TrendingDown className="w-3 h-3 md:w-4 md:h-4" />
//                   )}
//                   {metric.change > 0 ? "+" : ""}
//                   {metric.change}%
//                 </div>
//               </div>
//               <p className="text-xs md:text-sm text-muted-foreground mb-2">{metric.label}</p>
//               <p className="text-2xl md:text-4xl font-bold text-foreground">{metric.score}</p>
//               <p className="text-xs text-muted-foreground mt-1">/100 Score</p>
//             </div>
//           ))}
//         </div>

//         {/* Main Content - No Scroll Container */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
//           {/* Top Comments Section */}
//           <div className="lg:col-span-2 bg-card border border-border rounded-lg p-4 md:p-6">
//             <div className="flex items-center gap-2 mb-4 md:mb-6">
//               <MessageCircle className="w-5 h-5 text-primary" />
//               <h3 className="text-lg md:text-xl font-semibold text-foreground">Top Conversations</h3>
//             </div>

//             <div className="space-y-3 md:space-y-4">
//               {current.topComments.map((comment, idx) => (
//                 <div
//                   key={idx}
//                   className={`p-3 md:p-4 rounded-lg border transition-all duration-300 hover:border-primary/50 ${
//                     comment.sentiment === "positive"
//                       ? "bg-green-500/5 border-green-500/20 hover:bg-green-500/10"
//                       : comment.sentiment === "negative"
//                         ? "bg-red-500/5 border-red-500/20 hover:bg-red-500/10"
//                         : "bg-muted/50 border-border"
//                   }`}
//                 >
//                   <div className="flex items-start justify-between gap-3 mb-2">
//                     <p className="text-xs md:text-sm italic text-foreground flex-1">{comment.text}</p>
//                     <div
//                       className={`px-2 md:px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
//                         comment.sentiment === "positive"
//                           ? "bg-green-500/20 text-green-600"
//                           : comment.sentiment === "negative"
//                             ? "bg-red-500/20 text-red-600"
//                             : "bg-gray-500/20 text-gray-600"
//                       }`}
//                     >
//                       {comment.sentiment}
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-1 text-xs text-muted-foreground">
//                     <Users className="w-3 h-3 md:w-4 md:h-4" />
//                     {comment.count.toLocaleString()} mentions
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Key Topics Section */}
//           <div className="bg-card border border-border rounded-lg p-4 md:p-6">
//             <div className="flex items-center gap-2 mb-4 md:mb-6">
//               <BarChart3 className="w-5 h-5 text-primary" />
//               <h3 className="text-lg md:text-xl font-semibold text-foreground">Key Topics</h3>
//             </div>

//             <div className="space-y-2 md:space-y-3">
//               {current.keyTopics.map((topic, idx) => (
//                 <div
//                   key={idx}
//                   className="flex items-center justify-between p-3 md:p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors group cursor-pointer"
//                 >
//                   <p className="text-sm md:text-base font-medium text-foreground group-hover:text-primary transition-colors">
//                     {topic}
//                   </p>
//                   <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
//                 </div>
//               ))}
//             </div>

//             {/* Overall Health Score */}
//             <div className="mt-6 pt-6 border-t border-border">
//               <p className="text-xs md:text-sm text-muted-foreground mb-3">Overall Reputation Health</p>
//               <div className="relative h-8 md:h-10 bg-muted rounded-full overflow-hidden">
//                 <div
//                   className="h-full bg-gradient-to-r from-primary to-pink-500 rounded-full transition-all duration-700 flex items-center justify-center"
//                   style={{ width: `${current.sentiment.reduce((a, b) => a + b.score, 0) / current.sentiment.length}%` }}
//                 >
//                   <span className="text-xs md:text-sm font-bold text-white mix-blend-multiply">
//                     {Math.round(current.sentiment.reduce((a, b) => a + b.score, 0) / current.sentiment.length)}%
//                   </span>
//                 </div>
//               </div>
//               <p className="text-xs text-muted-foreground mt-2">Stable and improving</p>
//             </div>
//           </div>
//         </div>

//         {/* Last Updated */}
//         <div className="flex items-center justify-center gap-2 text-xs md:text-sm text-muted-foreground">
//           <Clock className="w-4 h-4" />
//           Last updated: {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
//         </div>
//       </div>
//     </MainLayout>
//   )
// }
