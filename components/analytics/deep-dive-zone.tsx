// components/analytics/deep-dive-zone-connected.tsx
"use client"

import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts"
import { Zap, Citrus as Virus, BarChart3, Network, Lightbulb, Loader2 } from "lucide-react"
import { useSentimentAnalysis, useViralAnalytics, useAnalyticsOverview } from "@/hooks/use-analytics"

interface DeepDiveZoneConnectedProps {
  crisisId?: string
}

export function DeepDiveZone({ crisisId }: DeepDiveZoneConnectedProps) {
  const { data: sentimentData, loading: sentimentLoading } = useSentimentAnalysis(crisisId, 10000)
  const { data: viralData, loading: viralLoading } = useViralAnalytics(crisisId, 15000)
  const { data: overviewData } = useAnalyticsOverview(crisisId, 5000)

  // Transform sentiment tone distribution to chart format
  const sentimentDistribution = sentimentData?.toneDistribution 
    ? Object.entries(sentimentData.toneDistribution).map(([name, value]) => {
        const colors: Record<string, string> = {
          'PANIC': 'hsl(var(--destructive))',
          'ANGER': 'hsl(var(--chart-1))',
          'CONCERN': 'hsl(var(--chart-2))',
          'NEUTRAL': 'hsl(var(--muted-foreground))',
          'REASSURING': 'hsl(var(--chart-3))',
          'FACTUAL': 'hsl(var(--chart-4))',
        }
        return {
          name: name.charAt(0) + name.slice(1).toLowerCase(),
          value: typeof value === 'number' ? value : 0,
          fill: colors[name] || 'hsl(var(--primary))'
        }
      })
    : []

  // Transform viral distribution
  const viralDistribution = viralData?.distribution
    ? [
        { range: "Moderate (2-3x)", count: viralData.distribution.moderate },
        { range: "High (3-5x)", count: viralData.distribution.high },
        { range: "Extreme (5x+)", count: viralData.distribution.extreme },
      ]
    : []

  // Engagement funnel data
  const engagementData = overviewData
    ? [
        { stage: "Posts", value: overviewData.totalPosts },
        { stage: "Engagements", value: overviewData.totalEngagements },
        { stage: "Viral", value: overviewData.viralPostCount },
        { stage: "Responses", value: overviewData.konfamResponseCount },
      ]
    : []

  return (
    <Card className="overflow-hidden">
      <Tabs defaultValue="sentiment" className="w-full">
        <div className="border-b border-border px-4 md:px-6 pt-4 md:pt-6">
          <TabsList className="w-full justify-start bg-transparent border-0 gap-2 flex-wrap">
            <TabsTrigger value="sentiment" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Sentiment</span>
            </TabsTrigger>
            <TabsTrigger value="viral" className="flex items-center gap-2">
              <Virus className="w-4 h-4" />
              <span className="hidden sm:inline">Viral</span>
            </TabsTrigger>
            <TabsTrigger value="engagement" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Engagement</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              <span className="hidden sm:inline">Insights</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="p-4 md:p-6">
          {/* Sentiment Tab */}
          <TabsContent value="sentiment" className="space-y-4">
            {sentimentLoading ? (
              <div className="h-64 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : sentimentDistribution.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <p className="text-sm">No sentiment data available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sentimentDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="value"
                      >
                        {sentimentDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="space-y-3">
                  {sentimentDistribution.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.fill }} 
                        />
                        <span className="text-sm text-foreground">{item.name}</span>
                      </div>
                      <span className="font-semibold text-foreground">{item.value}</span>
                    </div>
                  ))}

                  {sentimentData?.hasKonfamResponse && (
                    <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <h4 className="text-xs font-semibold text-foreground mb-2">
                        Konfam Impact
                      </h4>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Before:</span>
                          <span className="font-semibold text-foreground">
                            {sentimentData.sentimentBeforeKonfam.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">After:</span>
                          <span className="font-semibold text-green-600 dark:text-green-400">
                            {sentimentData.sentimentAfterKonfam.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-border">
                          <span className="text-muted-foreground">Improvement:</span>
                          <span className="font-semibold text-green-600 dark:text-green-400">
                            {sentimentData.improvement >= 0 ? '+' : ''}{sentimentData.improvement.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Viral Tab */}
          <TabsContent value="viral" className="space-y-4">
            {viralLoading ? (
              <div className="h-64 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : viralDistribution.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <p className="text-sm">No viral data available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={viralDistribution}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="range" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">
                    Top Viral Posts ({viralData?.topPosts.length || 0})
                  </h4>
                  {viralData?.topPosts.slice(0, 3).map((post, i) => (
                    <div key={post.id} className="p-3 rounded-lg bg-muted/50 border border-border">
                      <p className="text-sm text-foreground line-clamp-2">
                        {post.content}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-muted-foreground">
                          {post.author || 'Anonymous'}
                        </p>
                        <div className="text-xs font-semibold text-primary">
                          {post.viralCoefficient.toFixed(1)}x viral
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Engagement Tab */}
          <TabsContent value="engagement" className="space-y-4">
            {engagementData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <p className="text-sm">No engagement data available</p>
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="stage" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-4">
            <div className="space-y-4">
              {overviewData && (
                <>
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <h4 className="font-semibold text-foreground mb-2">Crisis Summary</h4>
                    <p className="text-sm text-foreground leading-relaxed">
                      The current crisis shows{' '}
                      <span className={overviewData.panicLevel > 0.7 ? 'font-bold text-destructive' : 'font-bold'}>
                        {overviewData.panicLevel > 0.7 ? 'HIGH' : overviewData.panicLevel > 0.4 ? 'MODERATE' : 'LOW'}
                      </span>
                      {' '}panic levels driven by {overviewData.misinformationCount} misinformation posts.
                      {overviewData.konfamResponseCount > 0 && (
                        <> Konfam has deployed {overviewData.konfamResponseCount} response{overviewData.konfamResponseCount > 1 ? 's' : ''} 
                        with an average sentiment of {overviewData.averageSentiment >= 0 ? '+' : ''}{overviewData.averageSentiment.toFixed(2)}.</>
                      )}
                    </p>
                  </div>

                  {overviewData.threatLevel > 0.5 && (
                    <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                      <h4 className="font-semibold text-foreground mb-2">Key Risk Factors</h4>
                      <ul className="text-sm text-foreground space-y-1">
                        <li>• Average threat level: {(overviewData.threatLevel * 100).toFixed(0)}%</li>
                        <li>• Viral coefficient: {overviewData.averageViralCoefficient.toFixed(1)}x</li>
                        <li>• Posts per minute: {overviewData.postsPerMinute.toFixed(1)}</li>
                        <li>• Engagement rate: {overviewData.engagementRate.toFixed(1)} per post</li>
                      </ul>
                    </div>
                  )}

                  <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                    <h4 className="font-semibold text-foreground mb-2">Recommendations</h4>
                    <ol className="text-sm text-foreground space-y-1">
                      {overviewData.konfamResponseCount === 0 && (
                        <li>1. Deploy Konfam response immediately to counter misinformation</li>
                      )}
                      {overviewData.viralPostCount > 5 && (
                        <li>{overviewData.konfamResponseCount === 0 ? 2 : 1}. Target high-viral posts for priority response</li>
                      )}
                      {overviewData.panicLevel > 0.7 && (
                        <li>{overviewData.viralPostCount > 5 ? 3 : 2}. Increase monitoring frequency due to high panic levels</li>
                      )}
                      <li>• Continue monitoring trending topics and sentiment shifts</li>
                      <li>• Prepare official statements for media inquiries</li>
                    </ol>
                  </div>
                </>
              )}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  )
}

// "use client"
// import { Card } from "@/components/ui/card"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
// import { Zap, Citrus as Virus, BarChart3, Network, Lightbulb } from "lucide-react"
// import type { SentimentData, Threat } from "@/lib/types"

// interface DeepDiveZoneProps {
//   sentiment: SentimentData[]
//   threats: Threat[]
// }

// export function DeepDiveZone({ sentiment, threats }: DeepDiveZoneProps) {
//   const sentimentDistribution = [
//     { name: "Panic", value: 34, fill: "hsl(var(--destructive))" },
//     { name: "Angry", value: 28, fill: "hsl(var(--chart-1))" },
//     { name: "Concerned", value: 22, fill: "hsl(var(--chart-2))" },
//     { name: "Neutral", value: 10, fill: "hsl(var(--muted-foreground))" },
//     { name: "Reassured", value: 4, fill: "hsl(var(--chart-3))" },
//     { name: "Factual", value: 2, fill: "hsl(var(--chart-4))" },
//   ]

//   const viralDistribution = [
//     { range: "1-2x", count: 89 },
//     { range: "2-3x", count: 45 },
//     { range: "3-5x", count: 23 },
//     { range: "5x+", count: 12 },
//   ]

//   const engagementData = [
//     { stage: "Posts", value: 1247 },
//     { stage: "Views", value: 8945 },
//     { stage: "Likes", value: 3421 },
//     { stage: "RTs", value: 1567 },
//     { stage: "Replies", value: 789 },
//   ]

//   return (
//     <Card className="overflow-hidden">
//       <Tabs defaultValue="sentiment" className="w-full">
//         <div className="border-b border-border px-4 md:px-6 pt-4 md:pt-6">
//           <TabsList className="w-full justify-start bg-transparent border-0 gap-2 flex-wrap">
//             <TabsTrigger value="sentiment" className="flex items-center gap-2">
//               <Zap className="w-4 h-4" />
//               <span className="hidden sm:inline">Sentiment</span>
//             </TabsTrigger>
//             <TabsTrigger value="viral" className="flex items-center gap-2">
//               <Virus className="w-4 h-4" />
//               <span className="hidden sm:inline">Viral</span>
//             </TabsTrigger>
//             <TabsTrigger value="engagement" className="flex items-center gap-2">
//               <BarChart3 className="w-4 h-4" />
//               <span className="hidden sm:inline">Engagement</span>
//             </TabsTrigger>
//             <TabsTrigger value="network" className="flex items-center gap-2">
//               <Network className="w-4 h-4" />
//               <span className="hidden sm:inline">Network</span>
//             </TabsTrigger>
//             <TabsTrigger value="insights" className="flex items-center gap-2">
//               <Lightbulb className="w-4 h-4" />
//               <span className="hidden sm:inline">Insights</span>
//             </TabsTrigger>
//           </TabsList>
//         </div>

//         <div className="p-4 md:p-6">
//           <TabsContent value="sentiment" className="space-y-4">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div className="h-64">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <PieChart>
//                     <Pie
//                       data={sentimentDistribution}
//                       cx="50%"
//                       cy="50%"
//                       innerRadius={60}
//                       outerRadius={100}
//                       dataKey="value"
//                     >
//                       {sentimentDistribution.map((entry, index) => (
//                         <Cell key={`cell-${index}`} fill={entry.fill} />
//                       ))}
//                     </Pie>
//                     <Tooltip />
//                   </PieChart>
//                 </ResponsiveContainer>
//               </div>
//               <div className="space-y-3">
//                 {sentimentDistribution.map((item, idx) => (
//                   <div key={idx} className="flex items-center justify-between">
//                     <div className="flex items-center gap-2">
//                       <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
//                       <span className="text-sm text-foreground">{item.name}</span>
//                     </div>
//                     <span className="font-semibold text-foreground">{item.value}%</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </TabsContent>

//           <TabsContent value="viral" className="space-y-4">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div className="h-64">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <BarChart data={viralDistribution}>
//                     <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
//                     <XAxis dataKey="range" className="text-xs" />
//                     <YAxis className="text-xs" />
//                     <Tooltip />
//                     <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
//                   </BarChart>
//                 </ResponsiveContainer>
//               </div>
//               <div className="space-y-3">
//                 <h4 className="font-semibold text-foreground">Top Viral Posts</h4>
//                 {[1, 2, 3].map((i) => (
//                   <div key={i} className="p-3 rounded-lg bg-muted/50 border border-border">
//                     <p className="text-sm text-foreground line-clamp-2">Post preview {i}</p>
//                     <p className="text-xs text-muted-foreground mt-1">{4.8 - i * 0.3}x viral</p>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </TabsContent>

//           <TabsContent value="engagement" className="space-y-4">
//             <div className="h-64">
//               <ResponsiveContainer width="100%" height="100%">
//                 <BarChart data={engagementData}>
//                   <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
//                   <XAxis dataKey="stage" className="text-xs" />
//                   <YAxis className="text-xs" />
//                   <Tooltip />
//                   <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>
//           </TabsContent>

//           <TabsContent value="network" className="space-y-4">
//             <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg border border-border">
//               <div className="text-center space-y-2">
//                 <Network className="w-12 h-12 mx-auto text-muted-foreground opacity-50" />
//                 <p className="text-sm text-muted-foreground">Network visualization coming soon</p>
//               </div>
//             </div>
//           </TabsContent>

//           <TabsContent value="insights" className="space-y-4">
//             <div className="space-y-4">
//               <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
//                 <h4 className="font-semibold text-foreground mb-2">Crisis Summary</h4>
//                 <p className="text-sm text-foreground leading-relaxed">
//                   The current crisis shows HIGH panic levels driven by {threats.length} misinformation posts about
//                   account freezes. Konfam's intervention resulted in a 160% sentiment improvement within 3 minutes. The
//                   system detected and addressed 81% of threats.
//                 </p>
//               </div>

//               <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
//                 <h4 className="font-semibold text-foreground mb-2">Key Risk Factors</h4>
//                 <ul className="text-sm text-foreground space-y-1">
//                   <li>• Bot amplification detected (3.2x multiplier)</li>
//                   <li>• Peak posting hours: 12pm-2pm, 6pm-8pm</li>
//                   <li>• High-influence users spreading panic</li>
//                   <li>• Viral coefficient exceeding 4.0x threshold</li>
//                 </ul>
//               </div>

//               <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
//                 <h4 className="font-semibold text-foreground mb-2">Recommendations</h4>
//                 <ol className="text-sm text-foreground space-y-1">
//                   <li>1. Deploy additional Konfam responses targeting high-influence users</li>
//                   <li>2. Monitor #FrozenAccount hashtag for escalation</li>
//                   <li>3. Prepare statements for mainstream media</li>
//                   <li>4. Increase monitoring during 12-2pm window</li>
//                 </ol>
//               </div>
//             </div>
//           </TabsContent>
//         </div>
//       </Tabs>
//     </Card>
//   )
// }
