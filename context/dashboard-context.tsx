"use client"

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react"
import {
  DashboardThreat,
  MetricsOverview,
  TrendingItem,
  TimeRangeUI,
  getDashboardThreats,
  getDashboardMetrics,
  getDashboardSentiment,
  getTrendingTopics,
  markThreatAddressed as apiMarkThreatAddressed,
  deployResponse as apiDeployResponse,
  wsUrl,
} from "@/lib/api"

type DashboardState = {
  // core data
  threats: DashboardThreat[]
  postsAnalyzed: number
  activeThreats: number
  responsesDeployed: number
  sentimentAvg: number // -1..1 from backend
  trending: TrendingItem[]

  // ui/conn
  timeRange: TimeRangeUI
  isConnected: boolean
  isLoading: boolean
  error?: string

  // actions
  setTimeRange: (r: TimeRangeUI) => void
  refreshAll: () => Promise<void>
  markThreatAddressed: (threatId: string, responsePostId?: string) => Promise<void>
  deployResponse: (threatId: string, text: string) => Promise<{ responseId?: string }>
}

const DashboardContext = createContext<DashboardState | null>(null)

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [threats, setThreats] = useState<DashboardThreat[]>([])
  const [postsAnalyzed, setPostsAnalyzed] = useState<number>(0)
  const [activeThreats, setActiveThreats] = useState<number>(0)
  const [responsesDeployed, setResponsesDeployed] = useState<number>(0)
  const [sentimentAvg, setSentimentAvg] = useState<number>(0) // -1..1
  const [trending, setTrending] = useState<TrendingItem[]>([])
  const [timeRange, setTimeRange] = useState<TimeRangeUI>("Today")
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)

  const wsRef = useRef<WebSocket | null>(null)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const refreshingRef = useRef(false)

  // -----------------------------------------------------
  // 🔄 Data fetcher
  // -----------------------------------------------------
  async function refreshAll() {
    if (refreshingRef.current) return // skip if already refreshing
    refreshingRef.current = true
    setError(undefined)

    try {
      const [th, met, sen, tr] = await Promise.all([
        getDashboardThreats(timeRange),
        getDashboardMetrics(timeRange),
        getDashboardSentiment(timeRange),
        getTrendingTopics(timeRange, 12),
      ])

      setThreats(th.threats || [])
      setActiveThreats(th.activeThreats ?? met.activeThreats ?? 0)
      setPostsAnalyzed(th.postsAnalyzed ?? met.postsAnalyzed ?? 0)
      setResponsesDeployed(met.responsesDeployed ?? 0)
      setSentimentAvg(sen.averageSentiment ?? met.avgSentiment ?? 0)
      setTrending(tr || [])
    } catch (e: any) {
      setError(e?.message || "Failed to load dashboard data")
    } finally {
      refreshingRef.current = false
      setIsLoading(false)
    }
  }

  // -----------------------------------------------------
  // 🚀 Initial + on time range change
  // -----------------------------------------------------
  useEffect(() => {
    refreshAll()
  }, [timeRange])

  // -----------------------------------------------------
  // 🧠 Independent polling (every 60s)
  // -----------------------------------------------------
  useEffect(() => {
    const POLL_INTERVAL = 10_000 // 10 seconds
    if (pollingRef.current) clearInterval(pollingRef.current)

    pollingRef.current = setInterval(() => {
      console.log("⏱ Polling dashboard data for freshness...")
      refreshAll()
    }, POLL_INTERVAL)

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [timeRange])

  // -----------------------------------------------------
  // ⚡ WebSocket live updates
  // -----------------------------------------------------
  useEffect(() => {
    const url = wsUrl()
    const socket = new WebSocket(url)
    wsRef.current = socket

    socket.onopen = () => setIsConnected(true)
    socket.onclose = () => setIsConnected(false)
    socket.onerror = () => setIsConnected(false)

    socket.onmessage = (evt) => {
      try {
        const message = JSON.parse(evt.data as string)
        const ev = message?.event as string
        const data = message?.data

        switch (ev) {
          case "newThreat": {
            if (data && data.id) {
              setThreats((prev) => [data as DashboardThreat, ...prev])
              setActiveThreats((prev) => prev + 1)
              setPostsAnalyzed((prev) => prev + 1)
            }
            break
          }
          case "updateMetrics": {
            const m = data as Partial<MetricsOverview>
            if (typeof m.postsAnalyzed === "number") setPostsAnalyzed(m.postsAnalyzed)
            if (typeof m.activeThreats === "number") setActiveThreats(m.activeThreats)
            if (typeof m.responsesDeployed === "number")
              setResponsesDeployed(m.responsesDeployed)
            if (typeof (m as any).avgSentiment === "number")
              setSentimentAvg((m as any).avgSentiment)
            break
          }
          case "responsePosted": {
            const { threatId } = data || {}
            if (threatId) {
              setThreats((prev) =>
                prev.map((t) =>
                  t.id === threatId
                    ? {
                        ...t,
                        status: "RESPONDED",
                        response: {
                          ...(t.response || {}),
                          status: "POSTED",
                          postedAt: new Date().toISOString(),
                          platform: (t.response?.platform || "TWITTER") as any,
                          id: t.response?.id || "temp",
                        },
                      }
                    : t
                )
              )
              setResponsesDeployed((p) => p + 1)
            }
            break
          }
          case "post_analyzed": {
            setPostsAnalyzed((p) => p + 1)
            break
          }
          default:
            break
        }
      } catch (err) {
        console.error("⚠️ WebSocket message parse error:", err)
      }
    }

    return () => {
      try {
        socket.close()
      } catch {}
    }
  }, [])

  // -----------------------------------------------------
  // 🧩 Actions
  // -----------------------------------------------------
  async function markThreatAddressed(threatId: string, responsePostId?: string) {
    await apiMarkThreatAddressed(threatId, responsePostId)
    setThreats((prev) =>
      prev.map((t) =>
        t.id === threatId
          ? {
              ...t,
              status: "RESPONDED",
              response: {
                ...(t.response || {}),
                status: "POSTED",
                postedAt: new Date().toISOString(),
                platform: (t.response?.platform || "TWITTER") as any,
                id: t.response?.id || "temp",
              },
            }
          : t
      )
    )
    setResponsesDeployed((p) => p + 1)
    setActiveThreats((p) => Math.max(0, p - 1))
  }

  async function deployResponse(threatId: string, text: string) {
    const res: any = await apiDeployResponse(threatId, text, "TWITTER")
    setThreats((prev) =>
      prev.map((t) =>
        t.id === threatId
          ? {
              ...t,
              status: "RESPONDED",
              response: {
                id: res?.id || "temp",
                status: "POSTED",
                postedAt: new Date().toISOString(),
                platform: "TWITTER",
              } as any,
            }
          : t
      )
    )
    setResponsesDeployed((p) => p + 1)
    setActiveThreats((p) => Math.max(0, p - 1))
    return { responseId: res?.id }
  }

  // -----------------------------------------------------
  // 🧱 Context value
  // -----------------------------------------------------
  const value = useMemo<DashboardState>(
    () => ({
      threats,
      postsAnalyzed,
      activeThreats,
      responsesDeployed,
      sentimentAvg,
      trending,
      timeRange,
      isConnected,
      isLoading,
      error,
      setTimeRange,
      refreshAll,
      markThreatAddressed,
      deployResponse,
    }),
    [
      threats,
      postsAnalyzed,
      activeThreats,
      responsesDeployed,
      sentimentAvg,
      trending,
      timeRange,
      isConnected,
      isLoading,
      error,
    ]
  )

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>
}

// -----------------------------------------------------
// 🔗 Hooks
// -----------------------------------------------------
export function useDashboard() {
  const ctx = useContext(DashboardContext)
  if (!ctx) throw new Error("useDashboard must be used inside DashboardProvider")
  return ctx
}

/* Compatibility shim for useThreatMonitor */
export function useThreatMonitor() {
  const {
    threats,
    postsAnalyzed,
    activeThreats,
    isConnected,
    isLoading,
    markThreatAddressed,
    refreshAll,
  } = useDashboard()

  return {
    threats,
    postsAnalyzed,
    activeThreats,
    isConnected,
    isLoading,
    markThreatAddressed,
    refreshThreats: refreshAll,
  }
}