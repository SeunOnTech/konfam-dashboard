import type { Threat } from "@/lib/types"
import { MessageCircle, Heart, Repeat2 } from "lucide-react"

interface ThreatCardProps {
  threat: Threat
  isSelected?: boolean
}

function getSeverityColor(severity: string) {
  switch (severity) {
    case "CRITICAL":
      return "bg-destructive text-destructive-foreground"
    case "HIGH":
      return "bg-primary text-primary-foreground"
    case "MEDIUM":
      return "bg-yellow-500 text-white"
    case "LOW":
      return "bg-green-500 text-white"
    default:
      return "bg-muted text-muted-foreground"
  }
}

export function ThreatCard({ threat, isSelected }: ThreatCardProps) {
  return (
    <div className={`p-4 border-l-4 ${isSelected ? "bg-muted border-l-primary" : "border-l-transparent"}`}>
      <div className="flex items-start gap-3 mb-2">
        <div className={`px-3 py-1 rounded-full text-xs font-bold ${getSeverityColor(threat.severity)}`}>
          {threat.severity}
        </div>
        <span className="text-xs text-muted-foreground">{threat.post.timestamp}</span>
      </div>

      <p className="text-sm text-foreground mb-2 line-clamp-2">{threat.post.content}</p>

      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-muted-foreground">@{threat.post.author.replace("@", "")}</span>
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Heart className="w-3 h-3" />
          {threat.post.engagement.likes.toLocaleString()}
        </div>
        <div className="flex items-center gap-1">
          <Repeat2 className="w-3 h-3" />
          {threat.post.engagement.retweets.toLocaleString()}
        </div>
        <div className="flex items-center gap-1">
          <MessageCircle className="w-3 h-3" />
          {threat.post.engagement.replies.toLocaleString()}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-border flex items-center gap-4">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">Panic Factor</p>
          <div className="w-full bg-muted rounded-full h-1.5 mt-1">
            <div className="bg-primary h-1.5 rounded-full" style={{ width: `${threat.panicFactor * 100}%` }} />
          </div>
        </div>
      </div>
    </div>
  )
}
