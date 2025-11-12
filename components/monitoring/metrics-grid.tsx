import { TrendingUp, TrendingDown } from "lucide-react"
import type { Metric } from "@/lib/types"

interface MetricsGridProps {
  metrics: Metric[]
}

export function MetricsGrid({ metrics }: MetricsGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {metrics.map((metric, idx) => (
        <div key={idx} className="bg-card border border-border rounded-lg p-3 md:p-4 hover:shadow-md transition-shadow">
          <p className="text-xs md:text-sm text-muted-foreground mb-1 md:mb-2">{metric.label}</p>
          <div className="flex items-end justify-between">
            <div className="text-lg md:text-3xl font-bold text-foreground">{metric.value}</div>
            {metric.change !== undefined && (
              <div
                className={`flex items-center gap-1 text-xs font-semibold ${
                  metric.changeType === "increase"
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {metric.changeType === "increase" ? (
                  <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
                ) : (
                  <TrendingDown className="w-3 h-3 md:w-4 md:h-4" />
                )}
                {Math.abs(metric.change)}%
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
