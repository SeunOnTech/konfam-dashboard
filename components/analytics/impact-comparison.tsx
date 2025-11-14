export function ImpactComparison() {
  const beforeMetrics = [
    { label: "Panic Tweets", value: "42%", icon: "📊" },
    { label: "Avg Engagement per Post", value: "172", icon: "💬" },
    { label: "Misinformation Spread Rate", value: "68%", icon: "⚠️" },
  ]

  const afterMetrics = [
    { label: "Calm Tweets", value: "78%", icon: "📈" },
    { label: "Avg Engagement per Post", value: "34", icon: "💬" },
    { label: "Truth Amplification Rate", value: "91%", icon: "✓" },
  ]

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Before */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-semibold text-foreground mb-4 pb-4 border-b border-border">Before Konfam Response</h3>
        <div className="space-y-4">
          {beforeMetrics.map((metric, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-lg">{metric.icon}</span>
                <span className="text-sm text-foreground">{metric.label}</span>
              </div>
              <span className="font-bold text-destructive">{metric.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* After */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-semibold text-foreground mb-4 pb-4 border-b border-border">After Konfam Response</h3>
        <div className="space-y-4">
          {afterMetrics.map((metric, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-lg">{metric.icon}</span>
                <span className="text-sm text-foreground">{metric.label}</span>
              </div>
              <span className="font-bold text-green-600">{metric.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
