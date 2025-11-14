// lib/api.ts
// Minimal, type-safe API client for Konfam Dashboard

export type TimeRangeUI = "Today" | "Past Week"
export type TimeRangeParam = "today" | "week"

export interface DashboardThreat {
  id: string
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
  threatType: "MISINFORMATION" | "CRISIS" | "NEGATIVE_SENTIMENT" | "VIRAL_RISK"
  status: "NEW" | "ANALYZING" | "PENDING" | "RESPONDED" | "RESOLVED" | "IGNORED"
  detectedAt: string
  brandId: string
  monitorId?: string | null
  threatScore: number
  sentimentImpact: number
  viralityImpact: number
  credibilityImpact: number
  predictedReach: number
  currentEngagement: number
  peakEngagement: number
  verificationStatus?: string | null
  verificationConfidence?: number | null
  verificationSummary?: string | null
  verificationEvidenceIds: string[]
  // includes from controller:
  detectedPost?: {
    id: string
    content: string
    authorHandle: string
    likeCount: number
    retweetCount: number
    replyCount: number
    viewCount: number
    sentimentPolarity: number
    matchedKeywords: string[]
    postedAt: string
  } | null
  brand?: { id: string; name: string } | null
  response?: {
    id: string
    status: "PENDING" | "POSTED" | "FAILED"
    postedAt?: string | null
    platform: "X_CLONE" | "TWITTER" | "FACEBOOK" | "INSTAGRAM"
  } | null
}

export interface MetricsOverview {
  postsAnalyzed: number
  activeThreats: number
  responsesDeployed: number
  avgSentiment: number // -1..1 from backend; UI can convert to %
}

export interface TrendingItem {
  keyword: string
  count: number
}

const BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/+$/, "") ||
  "http://localhost:4001"

async function http<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || json?.success === false) {
    const msg =
      json?.error ||
      json?.message ||
      `HTTP ${res.status} on ${path}`
    throw new Error(msg)
  }
  return (json?.data ?? json) as T
}

export function toTimeParam(ui: TimeRangeUI): TimeRangeParam {
  return ui === "Past Week" ? "week" : "today"
}

/* -------------------- Threats -------------------- */
export async function getDashboardThreats(range: TimeRangeUI) {
  const p = toTimeParam(range)
  return http<{ threats: DashboardThreat[]; activeThreats: number; postsAnalyzed: number }>(
    `/api/dashboard/threats?timeRange=${p}`
  )
}

export async function markThreatAddressed(id: string, responsePostId?: string) {
  return http(`/api/dashboard/threats/${id}/address`, {
    method: "PATCH",
    body: JSON.stringify({ responsePostId }),
  })
}

/* -------------------- Metrics & Sentiment -------------------- */
export async function getDashboardMetrics(range: TimeRangeUI) {
  const p = toTimeParam(range)
  return http<MetricsOverview>(`/api/dashboard/metrics?timeRange=${p}`)
}

export async function getDashboardSentiment(range: TimeRangeUI) {
  const p = toTimeParam(range)
  return http<{ averageSentiment: number }>(`/api/dashboard/sentiment?timeRange=${p}`)
}

/* -------------------- Trending -------------------- */
export async function getTrendingTopics(range: TimeRangeUI, limit = 10) {
  const p = toTimeParam(range)
  return http<TrendingItem[]>(
    `/api/dashboard/trending?timeRange=${p}&limit=${limit}`
  )
}

/* -------------------- Responses -------------------- */
export async function deployResponse(
  threatId: string,
  text: string,
  platform: "TWITTER" | "X_CLONE" = "TWITTER"
) {
  return http(`/api/dashboard/responses/deploy`, {
    method: "POST",
    body: JSON.stringify({ threatId, text, platform }),
  })
}

/* -------------------- Health (optional) -------------------- */
export async function health() {
  return http<{ status: string }>(`/`)
}

/* -------------------- WS URL helper -------------------- */
export function wsUrl(): string {
  // If BASE_URL is http(s)://host:port, convert to ws(s)
  try {
    const u = new URL(BASE_URL)
    u.protocol = u.protocol === "https:" ? "wss:" : "ws:"
    // Root WS in your app.ts already works at server top-level
    return `${u.toString().replace(/\/+$/, "")}`
  } catch {
    // fallback to same-origin WS
    if (typeof window !== "undefined") {
      const proto = window.location.protocol === "https:" ? "wss" : "ws"
      return `${proto}://${window.location.host}`
    }
    return "ws://localhost:4001"
  }
}
