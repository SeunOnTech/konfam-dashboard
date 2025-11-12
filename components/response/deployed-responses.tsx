"use client"

import type { Response } from "@/lib/types"
import { Heart, MessageCircle, Repeat2 } from "lucide-react"

interface DeployedResponsesProps {
  responses: Response[]
}

export function DeployedResponses({ responses }: DeployedResponsesProps) {
  return (
    <div className="space-y-4 max-h-[400px] overflow-y-auto">
      {responses.map((response) => (
        <div key={response.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xs font-semibold text-primary uppercase">{response.tone} Response</p>
              <p className="text-xs text-muted-foreground mt-1">
                {response.deployedAt ? new Date(response.deployedAt).toLocaleTimeString() : "Recently"} ago
              </p>
            </div>
            <div className="px-2 py-1 bg-green-500/20 text-green-700 text-xs font-semibold rounded">LIVE</div>
          </div>

          <p className="text-sm text-foreground mb-3 line-clamp-2">{response.english}</p>

          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer">
              <MessageCircle className="w-3 h-3" />
              <span>{response.engagement?.replies.toLocaleString() || "0"}</span>
            </div>
            <div className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer">
              <Repeat2 className="w-3 h-3" />
              <span>{response.engagement?.retweets.toLocaleString() || "0"}</span>
            </div>
            <div className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer">
              <Heart className="w-3 h-3" />
              <span>{response.engagement?.likes.toLocaleString() || "0"}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
