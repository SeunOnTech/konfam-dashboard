"use client"

import { useState, useEffect } from "react"
import { Gauge } from "lucide-react"

interface SentimentGaugeProps {
  score: number
}

export function SentimentGauge({ score }: SentimentGaugeProps) {
  const [displayScore, setDisplayScore] = useState(score)

  useEffect(() => {
    const diff = score - displayScore
    if (Math.abs(diff) < 1) {
      setDisplayScore(score)
      return
    }

    const interval = setInterval(() => {
      setDisplayScore((prev) => {
        const newScore = prev + Math.sign(score - prev) * 0.5
        return Math.abs(score - newScore) < 0.5 ? score : newScore
      })
    }, 30)

    return () => clearInterval(interval)
  }, [score])

  const getSentimentColor = (s: number) => {
    if (s >= 70) return { label: "CALM", text: "text-green-600 dark:text-green-400", gauge: "text-green-500" }
    if (s >= 50) return { label: "MODERATE", text: "text-yellow-600 dark:text-yellow-400", gauge: "text-yellow-500" }
    if (s >= 30) return { label: "ELEVATED", text: "text-orange-600 dark:text-orange-400", gauge: "text-orange-500" }
    return { label: "PANIC", text: "text-destructive dark:text-red-400", gauge: "text-destructive" }
  }

  const sentiment = getSentimentColor(displayScore)
  const angle = (displayScore / 100) * 180 - 90

  return (
    <div className="flex flex-col items-center">
      {/* Gauge circle */}
      <div className="relative w-40 h-20 md:w-48 md:h-24 mb-3 md:mb-4">
        {/* Background arc */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 100">
          <path
            d="M 10 90 A 80 80 0 0 1 190 90"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-border"
          />
          {/* Green section */}
          <path
            d="M 150 90 A 80 80 0 0 1 190 90"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-green-500"
          />
          {/* Yellow section */}
          <path
            d="M 100 30 A 80 80 0 0 1 150 90"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-yellow-500"
          />
          {/* Orange section */}
          <path
            d="M 55 60 A 80 80 0 0 1 100 30"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-orange-500"
          />
          {/* Red section */}
          <path
            d="M 10 90 A 80 80 0 0 1 55 60"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-destructive"
          />

          {/* Needle */}
          <line
            x1="100"
            y1="90"
            x2={100 + 60 * Math.cos((angle * Math.PI) / 180)}
            y2={90 + 60 * Math.sin((angle * Math.PI) / 180)}
            stroke="currentColor"
            strokeWidth="3"
            className="text-foreground"
          />
          <circle cx="100" cy="90" r="5" className="fill-foreground" />
        </svg>
      </div>

      {/* Score display */}
      <div className="text-center mb-3 md:mb-4">
        <Gauge className={`w-5 h-5 md:w-6 md:h-6 mx-auto mb-1 md:mb-2 ${sentiment.gauge}`} />
        <div className="text-2xl md:text-4xl font-bold text-foreground">{Math.round(displayScore)}%</div>
        <div className={`text-xs md:text-sm font-bold ${sentiment.text} mt-1 md:mt-2`}>{sentiment.label}</div>
      </div>

      {/* Status message */}
      <p className="text-xs text-center text-muted-foreground max-w-xs">
        {displayScore >= 70
          ? "Public sentiment is stable"
          : displayScore >= 50
            ? "Moderate concern detected"
            : displayScore >= 30
              ? "Elevated panic levels"
              : "Critical panic level detected"}
      </p>
    </div>
  )
}
