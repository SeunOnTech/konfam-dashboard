import { ArrowUp } from "lucide-react"

export function FinancialImpact() {
  const impacts = [
    {
      label: "Customer Churn Prevented",
      value: "₦2.4B",
      description: "Retained customers value",
    },
    {
      label: "Brand Damage Avoided",
      value: "₦890M",
      description: "Reputation protection",
    },
    {
      label: "Call Center Load",
      value: "-68%",
      description: "Reduced support burden",
    },
    {
      label: "Time Saved",
      value: "12hrs",
      description: "Comms team efficiency",
    },
  ]

  return (
    <div className="space-y-3">
      {impacts.map((impact, idx) => (
        <div key={idx} className="bg-muted/50 rounded-lg p-3 border border-border">
          <div className="flex items-start justify-between mb-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase">{impact.label}</p>
            <ArrowUp className="w-3 h-3 text-green-600 flex-shrink-0" />
          </div>
          <p className="text-lg font-bold text-primary mb-1">{impact.value}</p>
          <p className="text-xs text-muted-foreground">{impact.description}</p>
        </div>
      ))}
    </div>
  )
}
