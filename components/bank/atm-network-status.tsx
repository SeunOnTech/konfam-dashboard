import { MapPin } from "lucide-react"

export function ATMNetworkStatus() {
  const regions = [
    { name: "Lagos", uptime: 98.5, count: 324 },
    { name: "Abuja", uptime: 97.2, count: 156 },
    { name: "Kano", uptime: 96.8, count: 98 },
    { name: "Port Harcourt", uptime: 99.1, count: 87 },
    { name: "Ibadan", uptime: 97.6, count: 71 },
  ]

  const getStatusColor = (uptime: number) => {
    if (uptime >= 98) return "text-green-600"
    if (uptime >= 95) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="p-6">
      <h2 className="font-semibold text-foreground mb-4">ATM Network Status</h2>

      {/* Overall uptime */}
      <div className="bg-muted/50 rounded-lg p-4 mb-4 border border-border">
        <p className="text-xs text-muted-foreground mb-1">Overall Network Uptime</p>
        <div className="flex items-end justify-between">
          <p className="text-3xl font-bold text-green-600">98.4%</p>
          <p className="text-sm text-green-600 font-semibold">Excellent</p>
        </div>
      </div>

      {/* Regional breakdown */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground mb-3">Regional Status</h3>
        {regions.map((region, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
          >
            <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{region.name}</p>
              <p className="text-xs text-muted-foreground">{region.count} ATMs</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className={`font-bold ${getStatusColor(region.uptime)}`}>{region.uptime}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
