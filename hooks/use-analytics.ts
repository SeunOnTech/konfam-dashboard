// lib/hooks/use-analytics.ts
// Custom hooks for analytics data with auto-refresh

import { useState, useEffect, useCallback } from 'react'
import { analyticsService } from '../lib/services/analytics.service'
import type {
  AnalyticsOverview,
  AnalyticsTimeline,
  SentimentAnalysis,
  ViralAnalytics,
  ThreatAnalytics,
  KonfamImpact,
  TrendingTopics,
} from '../lib/api-types'

interface UseAnalyticsState<T> {
  data: T | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

/**
 * Hook for analytics overview with auto-refresh
 */
export function useAnalyticsOverview(
  crisisId?: string,
  refreshInterval: number = 5000
): UseAnalyticsState<AnalyticsOverview> {
  const [data, setData] = useState<AnalyticsOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setError(null)
      const result = await analyticsService.getOverview(crisisId)
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch overview')
      console.error('Analytics overview error:', err)
    } finally {
      setLoading(false)
    }
  }, [crisisId])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, refreshInterval)
    return () => clearInterval(interval)
  }, [fetchData, refreshInterval])

  return { data, loading, error, refresh: fetchData }
}

/**
 * Hook for timeline data with auto-refresh
 */
export function useAnalyticsTimeline(
  crisisId?: string,
  interval: '1m' | '5m' | '15m' | '60m' = '5m',
  refreshInterval: number = 10000
): UseAnalyticsState<AnalyticsTimeline> {
  const [data, setData] = useState<AnalyticsTimeline | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setError(null)
      const result = await analyticsService.getTimeline(crisisId, interval)
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch timeline')
      console.error('Analytics timeline error:', err)
    } finally {
      setLoading(false)
    }
  }, [crisisId, interval])

  useEffect(() => {
    fetchData()
    const timer = setInterval(fetchData, refreshInterval)
    return () => clearInterval(timer)
  }, [fetchData, refreshInterval])

  return { data, loading, error, refresh: fetchData }
}

/**
 * Hook for sentiment analysis
 */
export function useSentimentAnalysis(
  crisisId?: string,
  refreshInterval: number = 5000
): UseAnalyticsState<SentimentAnalysis> {
  const [data, setData] = useState<SentimentAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setError(null)
      const result = await analyticsService.getSentiment(crisisId)
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sentiment')
      console.error('Sentiment analysis error:', err)
    } finally {
      setLoading(false)
    }
  }, [crisisId])

  useEffect(() => {
    fetchData()
    const timer = setInterval(fetchData, refreshInterval)
    return () => clearInterval(timer)
  }, [fetchData, refreshInterval])

  return { data, loading, error, refresh: fetchData }
}

/**
 * Hook for viral analytics
 */
export function useViralAnalytics(
  crisisId?: string,
  refreshInterval: number = 10000
): UseAnalyticsState<ViralAnalytics> {
  const [data, setData] = useState<ViralAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setError(null)
      const result = await analyticsService.getViralAnalytics(crisisId)
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch viral analytics')
      console.error('Viral analytics error:', err)
    } finally {
      setLoading(false)
    }
  }, [crisisId])

  useEffect(() => {
    fetchData()
    const timer = setInterval(fetchData, refreshInterval)
    return () => clearInterval(timer)
  }, [fetchData, refreshInterval])

  return { data, loading, error, refresh: fetchData }
}

/**
 * Hook for threat analytics
 */
export function useThreatAnalytics(
  crisisId?: string,
  minThreatLevel: number = 0.5,
  refreshInterval: number = 3000
): UseAnalyticsState<ThreatAnalytics> {
  const [data, setData] = useState<ThreatAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setError(null)
      const result = await analyticsService.getThreats(crisisId, minThreatLevel)
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch threats')
      console.error('Threat analytics error:', err)
    } finally {
      setLoading(false)
    }
  }, [crisisId, minThreatLevel])

  useEffect(() => {
    fetchData()
    const timer = setInterval(fetchData, refreshInterval)
    return () => clearInterval(timer)
  }, [fetchData, refreshInterval])

  return { data, loading, error, refresh: fetchData }
}

/**
 * Hook for Konfam impact metrics
 */
export function useKonfamImpact(
  crisisId: string | undefined,
  refreshInterval: number = 5000
): UseAnalyticsState<KonfamImpact> {
  const [data, setData] = useState<KonfamImpact | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!crisisId) {
      setData(null)
      setLoading(false)
      return
    }

    try {
      setError(null)
      const result = await analyticsService.getKonfamImpact(crisisId)
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch Konfam impact')
      console.error('Konfam impact error:', err)
    } finally {
      setLoading(false)
    }
  }, [crisisId])

  useEffect(() => {
    fetchData()
    if (crisisId) {
      const timer = setInterval(fetchData, refreshInterval)
      return () => clearInterval(timer)
    }
  }, [fetchData, refreshInterval, crisisId])

  return { data, loading, error, refresh: fetchData }
}

/**
 * Hook for trending topics
 */
export function useTrendingTopics(
  refreshInterval: number = 30000
): UseAnalyticsState<TrendingTopics> {
  const [data, setData] = useState<TrendingTopics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setError(null)
      const result = await analyticsService.getTrendingTopics()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch trending topics')
      console.error('Trending topics error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const timer = setInterval(fetchData, refreshInterval)
    return () => clearInterval(timer)
  }, [fetchData, refreshInterval])

  return { data, loading, error, refresh: fetchData }
}