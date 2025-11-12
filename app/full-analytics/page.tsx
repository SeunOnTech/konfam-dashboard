// app/full-analytics/page.tsx
"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { HeroZoneConnected } from "@/components/analytics/hero-zone"
import { PulseZoneConnected } from "@/components/analytics/pulse-zone"
import { ImpactZoneConnected } from "@/components/analytics/impact-zone"
import { MetricsZoneConnected } from "@/components/analytics/metrics-zone"
import { IntelZoneConnected } from "@/components/analytics/intel-zone"
import { DeepDiveZone } from "@/components/analytics/deep-dive-zone"
import { ReplayMode } from "@/components/analytics/replay-mode"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, RotateCcw, Settings } from "lucide-react"
import { mockSentimentData, mockThreats } from "@/lib/demo-data"

export default function FullAnalyticsPage() {
  const [isReplayMode, setIsReplayMode] = useState(false)
  const [replayProgress, setReplayProgress] = useState(0)
  const [replaySpeed, setReplaySpeed] = useState(1)
  const [isPlaying, setIsPlaying] = useState(false)
  
  // Crisis filter - you can populate this from an API endpoint
  const [selectedCrisis, setSelectedCrisis] = useState<string | undefined>(undefined)
  const [timeInterval, setTimeInterval] = useState<'1m' | '5m' | '15m' | '60m'>('5m')

  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setReplayProgress((prev) => {
        if (prev >= 100) {
          setIsPlaying(false)
          return 100
        }
        return prev + replaySpeed
      })
    }, 100)

    return () => clearInterval(interval)
  }, [isPlaying, replaySpeed])

  return (
    <MainLayout title="Full Analytics Dashboard">
      <div className="min-h-screen bg-background">
        {/* Header Section */}
        <div className="sticky top-20 md:top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
          <div className="px-4 md:px-8 py-3 md:py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Full Analytics Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">
                Real-time crisis monitoring and insights
              </p>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              {/* Time Interval Selector */}
              <Select value={timeInterval} onValueChange={(v) => setTimeInterval(v as any)}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1m">1 min</SelectItem>
                  <SelectItem value="5m">5 min</SelectItem>
                  <SelectItem value="15m">15 min</SelectItem>
                  <SelectItem value="60m">60 min</SelectItem>
                </SelectContent>
              </Select>

              {/* Crisis Filter - Optional */}
              {/* <Select value={selectedCrisis} onValueChange={setSelectedCrisis}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Crises" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Crises</SelectItem>
                  Add crisis options from API
                </SelectContent>
              </Select> */}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsReplayMode(!isReplayMode)}
                className="flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                <span className="hidden sm:inline">Replay Crisis</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setReplayProgress(0)
                  setIsPlaying(false)
                }}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="px-4 md:px-8 py-6 md:py-8 space-y-6">
          {/* Row 1: Hero + Pulse */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <HeroZoneConnected 
                crisisId={selectedCrisis} 
                interval={timeInterval}
              />
            </div>
            <div className="lg:col-span-1">
              <PulseZoneConnected crisisId={selectedCrisis} />
            </div>
          </div>

          {/* Row 2: Impact + Metrics + Intel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ImpactZoneConnected crisisId={selectedCrisis} />
            <MetricsZoneConnected crisisId={selectedCrisis} />
            <IntelZoneConnected />
          </div>

          {/* Row 3: Deep Dive (Still using mock data - can be connected similarly) */}
          <DeepDiveZone 
            sentiment={mockSentimentData} 
            threats={mockThreats} 
          />
        </div>

        {/* Replay Mode Overlay */}
        {isReplayMode && (
          <ReplayMode
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            progress={replayProgress}
            setProgress={setReplayProgress}
            speed={replaySpeed}
            setSpeed={setReplaySpeed}
            onClose={() => {
              setIsReplayMode(false)
              setReplayProgress(0)
              setIsPlaying(false)
            }}
          />
        )}
      </div>
    </MainLayout>
  )
}

// // app/full-analytics/page.tsx
// "use client"

// import { useState, useEffect } from "react"
// import { MainLayout } from "@/components/layout/main-layout"
// import { HeroZone } from "@/components/analytics/hero-zone"
// import { PulseZone } from "@/components/analytics/pulse-zone"
// import { ImpactZone } from "@/components/analytics/impact-zone"
// import { MetricsZone } from "@/components/analytics/metrics-zone"
// import { IntelZone } from "@/components/analytics/intel-zone"
// import { DeepDiveZone } from "@/components/analytics/deep-dive-zone"
// import { ReplayMode } from "@/components/analytics/replay-mode"
// import { Button } from "@/components/ui/button"
// import { Play, RotateCcw } from "lucide-react"
// import { mockThreats, mockSentimentData } from "@/lib/demo-data"

// export default function FullAnalyticsPage() {
//   const [isReplayMode, setIsReplayMode] = useState(false)
//   const [replayProgress, setReplayProgress] = useState(0)
//   const [replaySpeed, setReplaySpeed] = useState(1)
//   const [isPlaying, setIsPlaying] = useState(false)

//   useEffect(() => {
//     if (!isPlaying) return

//     const interval = setInterval(() => {
//       setReplayProgress((prev) => {
//         if (prev >= 100) {
//           setIsPlaying(false)
//           return 100
//         }
//         return prev + replaySpeed
//       })
//     }, 100)

//     return () => clearInterval(interval)
//   }, [isPlaying, replaySpeed])

//   return (
//     <MainLayout title="Full Analytics Dashboard">
//       <div className="min-h-screen bg-background">
//         {/* Header Section */}
//         <div className="sticky top-20 md:top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
//           <div className="px-4 md:px-8 py-3 md:py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//             <div className="flex flex-col gap-1">
//               <h1 className="text-2xl md:text-3xl font-bold text-foreground">Full Analytics Dashboard</h1>
//               <p className="text-sm text-muted-foreground">Real-time crisis monitoring and insights</p>
//             </div>
//             <div className="flex items-center gap-2">
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => setIsReplayMode(!isReplayMode)}
//                 className="flex items-center gap-2"
//               >
//                 <Play className="w-4 h-4" />
//                 <span className="hidden sm:inline">Replay Crisis</span>
//               </Button>
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={() => {
//                   setReplayProgress(0)
//                   setIsPlaying(false)
//                 }}
//               >
//                 <RotateCcw className="w-4 h-4" />
//               </Button>
//             </div>
//           </div>
//         </div>

//         {/* Main Dashboard Grid */}
//         <div className="px-4 md:px-8 py-6 md:py-8 space-y-6">
//           {/* Row 1: Hero + Pulse */}
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//             <div className="lg:col-span-2">
//               <HeroZone sentiment={mockSentimentData} />
//             </div>
//             <div className="lg:col-span-1">
//               <PulseZone threats={mockThreats} />
//             </div>
//           </div>

//           {/* Row 2: Impact + Metrics + Intel */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <ImpactZone />
//             <MetricsZone threats={mockThreats} />
//             <IntelZone />
//           </div>

//           {/* Row 3: Deep Dive */}
//           <DeepDiveZone sentiment={mockSentimentData} threats={mockThreats} />
//         </div>

//         {/* Replay Mode Overlay */}
//         {isReplayMode && (
//           <ReplayMode
//             isPlaying={isPlaying}
//             setIsPlaying={setIsPlaying}
//             progress={replayProgress}
//             setProgress={setReplayProgress}
//             speed={replaySpeed}
//             setSpeed={setReplaySpeed}
//             onClose={() => {
//               setIsReplayMode(false)
//               setReplayProgress(0)
//               setIsPlaying(false)
//             }}
//           />
//         )}
//       </div>
//     </MainLayout>
//   )
// }
