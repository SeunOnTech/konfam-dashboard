"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { SentimentChart } from "@/components/analytics/sentiment-chart"
import { ImpactComparison } from "@/components/analytics/impact-comparison"
import { ResponseTimeline } from "@/components/analytics/response-timeline"
import { FinancialImpact } from "@/components/analytics/financial-impact"
import { mockSentimentData } from "@/lib/demo-data"

export default function AnalyticsPage() {
  return (
    <MainLayout title="Analytics & Impact">
      {/* Top section - Sentiment chart */}
      <div className="mb-8">
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="font-semibold text-foreground mb-4">Sentiment Timeline</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Crisis timeline showing public sentiment from peak panic through recovery
          </p>
          <SentimentChart data={mockSentimentData} />
        </div>
      </div>

      {/* Middle section - Before/After comparison */}
      <div className="mb-8">
        <h2 className="font-semibold text-foreground mb-4">Crisis Impact Analysis</h2>
        <ImpactComparison />
      </div>

      {/* Bottom section - Response timeline and financial impact */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="font-semibold text-foreground mb-4">Response Effectiveness</h2>
            <ResponseTimeline />
          </div>
        </div>

        <div>
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="font-semibold text-foreground mb-4">Financial Impact</h2>
            <FinancialImpact />
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
