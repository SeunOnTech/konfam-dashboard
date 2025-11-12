"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export function ResponseTimeline() {
  const data = [
    { name: "Response 1", improvement: 8, language: "English" },
    { name: "Response 2", improvement: 12, language: "Pidgin" },
    { name: "Response 3", improvement: 15, language: "Multilingual" },
  ]

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="name" stroke="var(--muted-foreground)" style={{ fontSize: "12px" }} />
          <YAxis
            stroke="var(--muted-foreground)"
            style={{ fontSize: "12px" }}
            label={{ value: "Sentiment Improvement (%)", angle: -90, position: "insideLeft" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "6px",
            }}
            labelStyle={{ color: "var(--foreground)" }}
          />
          <Bar dataKey="improvement" fill="var(--primary)" name="Sentiment Improvement" isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
