// lib/services/analytics.service.ts
// Service layer for analytics API calls

import type {
  ApiResponse,
  AnalyticsOverview,
  AnalyticsTimeline,
  SentimentAnalysis,
  ViralAnalytics,
  ThreatAnalytics,
  KonfamImpact,
  TrendingTopics,
} from '../api-types'

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL+'/api' || 'http://localhost:4000/api'

class AnalyticsService {
  private async fetchApi<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`)
    
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`)
    }
    
    const result: ApiResponse<T> = await response.json()
    
    if (!result.success) {
      throw new Error('API request failed')
    }
    
    return result.data
  }

  /**
   * GET /api/analytics/overview
   * Get overall analytics snapshot
   */
  async getOverview(crisisId?: string): Promise<AnalyticsOverview> {
    const params = crisisId ? `?crisisId=${crisisId}` : ''
    return this.fetchApi<AnalyticsOverview>(`/analytics/overview${params}`)
  }

  /**
   * GET /api/analytics/timeline
   * Get time-series analytics data
   */
  async getTimeline(
    crisisId?: string,
    interval: '1m' | '5m' | '15m' | '60m' = '5m'
  ): Promise<AnalyticsTimeline> {
    const params = new URLSearchParams()
    if (crisisId) params.append('crisisId', crisisId)
    params.append('interval', interval)
    
    return this.fetchApi<AnalyticsTimeline>(`/analytics/timeline?${params}`)
  }

  /**
   * GET /api/analytics/sentiment
   * Get sentiment distribution
   */
  async getSentiment(crisisId?: string): Promise<SentimentAnalysis> {
    const params = crisisId ? `?crisisId=${crisisId}` : ''
    return this.fetchApi<SentimentAnalysis>(`/analytics/sentiment${params}`)
  }

  /**
   * GET /api/analytics/viral
   * Get viral post analytics
   */
  async getViralAnalytics(crisisId?: string): Promise<ViralAnalytics> {
    const params = crisisId ? `?crisisId=${crisisId}` : ''
    return this.fetchApi<ViralAnalytics>(`/analytics/viral${params}`)
  }

  /**
   * GET /api/analytics/threats
   * Get threat detection analytics
   */
  async getThreats(
    crisisId?: string,
    minThreatLevel: number = 0.5
  ): Promise<ThreatAnalytics> {
    const params = new URLSearchParams()
    if (crisisId) params.append('crisisId', crisisId)
    params.append('minThreatLevel', minThreatLevel.toString())
    
    return this.fetchApi<ThreatAnalytics>(`/analytics/threats?${params}`)
  }

  /**
   * GET /api/analytics/konfam-impact
   * Get Konfam intervention impact metrics
   */
  async getKonfamImpact(crisisId: string): Promise<KonfamImpact> {
    return this.fetchApi<KonfamImpact>(`/analytics/konfam-impact?crisisId=${crisisId}`)
  }

  /**
   * GET /api/analytics/trending-topics
   * Get trending crisis topics and hashtags
   */
  async getTrendingTopics(): Promise<TrendingTopics> {
    return this.fetchApi<TrendingTopics>('/analytics/trending-topics')
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService()