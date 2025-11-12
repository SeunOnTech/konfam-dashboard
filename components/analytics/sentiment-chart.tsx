"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import type { SentimentData } from "@/lib/types"

interface SentimentChartProps {
  data: SentimentData[]
}

export function SentimentChart({ data }: SentimentChartProps) {
  const formattedData = data.map((d) => ({
    time: d.timestamp.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    sentiment: Math.round(d.score),
    panic: Math.round(d.panicLevel),
  }))

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="time" stroke="var(--muted-foreground)" style={{ fontSize: "12px" }} />
          <YAxis stroke="var(--muted-foreground)" style={{ fontSize: "12px" }} domain={[0, 100]} />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "6px",
            }}
            labelStyle={{ color: "var(--foreground)" }}
          />
          <ReferenceLine
            y={50}
            stroke="var(--border)"
            strokeDasharray="5 5"
            label={{ value: "50% Threshold", position: "right", fill: "var(--muted-foreground)", fontSize: 12 }}
          />

          {/* Sentiment line */}
          <Line
            type="monotone"
            dataKey="sentiment"
            stroke="var(--primary)"
            strokeWidth={3}
            dot={false}
            isAnimationActive={false}
            name="Sentiment Score"
          />

          {/* Panic level line */}
          <Line
            type="monotone"
            dataKey="panic"
            stroke="var(--destructive)"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            isAnimationActive={false}
            name="Panic Level"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
