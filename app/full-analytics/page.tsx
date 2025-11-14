"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { HeroZone } from "@/components/analytics/hero-zone"
import { PulseZone } from "@/components/analytics/pulse-zone"
import { ImpactZone } from "@/components/analytics/impact-zone"
import { MetricsZone } from "@/components/analytics/metrics-zone"
import { IntelZone } from "@/components/analytics/intel-zone"
import { DeepDiveZone } from "@/components/analytics/deep-dive-zone"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { mockThreats, mockSentimentData } from "@/lib/demo-data"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

// ⭐ Import the working premium report generator
import { generatePremiumPDF } from "@/lib/premium-pdf"

export default function FullAnalyticsPage() {
  const [downloading, setDownloading] = useState<"today" | "week" | null>(null)

  const handleDownload = async (range: "today" | "week") => {
    setDownloading(range)

    // 🔥 Generate the premium PDF report
    await generatePremiumPDF(range)

    setDownloading(null)
  }

  return (
    <MainLayout title="Full Analytics Dashboard">
      <div className="min-h-screen bg-background">
        {/* Header */}
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

            {/* Download Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  disabled={!!downloading}
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {downloading ? "Generating..." : "Download Report"}
                  </span>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => handleDownload("today")}>
                  Today’s Report
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => handleDownload("week")}>
                  This Week’s Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Main Dashboard */}
        <div className="px-4 md:px-8 py-6 md:py-8 space-y-6">
          {/* Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <HeroZone sentiment={mockSentimentData} />
            </div>
            <div className="lg:col-span-1">
              <PulseZone threats={mockThreats} />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ImpactZone />
            <MetricsZone threats={mockThreats} />
            <IntelZone />
          </div>

          {/* Row 3 */}
          <DeepDiveZone sentiment={mockSentimentData} threats={mockThreats} />
        </div>
      </div>
    </MainLayout>
  )
}


// "use client"

// import { useState } from "react"
// import { MainLayout } from "@/components/layout/main-layout"
// import { HeroZone } from "@/components/analytics/hero-zone"
// import { PulseZone } from "@/components/analytics/pulse-zone"
// import { ImpactZone } from "@/components/analytics/impact-zone"
// import { MetricsZone } from "@/components/analytics/metrics-zone"
// import { IntelZone } from "@/components/analytics/intel-zone"
// import { DeepDiveZone } from "@/components/analytics/deep-dive-zone"
// import { Button } from "@/components/ui/button"
// import { Download } from "lucide-react"
// import { mockThreats, mockSentimentData } from "@/lib/demo-data"
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuTrigger,
//   DropdownMenuItem,
// } from "@/components/ui/dropdown-menu"

// export default function FullAnalyticsPage() {
//   const handleDownload = async (range: "today" | "week") => {
//     console.log("Downloading report:", range)

//     // 🔥 You can later connect this to your backend endpoint:
//     // GET /api/analytics/report?range=today | week
//     alert(`Downloading ${range === "today" ? "Today's" : "This Week's"} Report...`)
//   }

//   return (
//     <MainLayout title="Full Analytics Dashboard">
//       <div className="min-h-screen bg-background">
//         {/* Header */}
//         <div className="sticky top-20 md:top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
//           <div className="px-4 md:px-8 py-3 md:py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//             <div className="flex flex-col gap-1">
//               <h1 className="text-2xl md:text-3xl font-bold text-foreground">
//                 Full Analytics Dashboard
//               </h1>
//               <p className="text-sm text-muted-foreground">
//                 Real-time crisis monitoring and insights
//               </p>
//             </div>

//             {/* Download Button */}
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button variant="outline" size="sm" className="flex items-center gap-2">
//                   <Download className="w-4 h-4" />
//                   <span className="hidden sm:inline">Download Report</span>
//                 </Button>
//               </DropdownMenuTrigger>

//               <DropdownMenuContent align="end" className="w-40">
//                 <DropdownMenuItem onClick={() => handleDownload("today")}>
//                   Today’s Report
//                 </DropdownMenuItem>
//                 <DropdownMenuItem onClick={() => handleDownload("week")}>
//                   This Week’s Report
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           </div>
//         </div>

//         {/* Main Dashboard */}
//         <div className="px-4 md:px-8 py-6 md:py-8 space-y-6">
//           {/* Row 1 */}
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//             <div className="lg:col-span-2">
//               <HeroZone sentiment={mockSentimentData} />
//             </div>
//             <div className="lg:col-span-1">
//               <PulseZone threats={mockThreats} />
//             </div>
//           </div>

//           {/* Row 2 */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <ImpactZone />
//             <MetricsZone threats={mockThreats} />
//             <IntelZone />
//           </div>

//           {/* Row 3 */}
//           <DeepDiveZone sentiment={mockSentimentData} threats={mockThreats} />
//         </div>
//       </div>
//     </MainLayout>
//   )
// }
