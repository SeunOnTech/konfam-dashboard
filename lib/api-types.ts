// lib/api-types.ts
// Type definitions matching your backend analytics responses

export interface AnalyticsOverview {
  totalPosts: number
  totalEngagements: number
  postsPerMinute: number
  engagementRate: number
  averageSentiment: number
  panicLevel: number
  threatLevel: number
  averageViralCoefficient: number
  viralPostCount: number
  konfamResponseCount: number
  misinformationCount: number
  timestamp: string
}

export interface TimelineDataPoint {
  timestamp: string
  postCount: number
  engagements: number
  sentiment: number
  viralCoefficient: number
  threatLevel: number
}

export interface AnalyticsTimeline {
  interval: number
  timeline: TimelineDataPoint[]
}

export interface SentimentAnalysis {
  toneDistribution: Record<string, number>
  sentimentBeforeKonfam: number
  sentimentAfterKonfam: number
  improvement: number
  hasKonfamResponse: boolean
}

export interface ViralPost {
  id: string
  content: string
  viralCoefficient: number
  totalEngagements: number
  author?: string
}

export interface ViralAnalytics {
  totalViralPosts: number
  distribution: {
    moderate: number
    high: number
    extreme: number
  }
  topPosts: ViralPost[]
}

export interface ThreatPost {
  id: string
  content: string
  threatLevel: number
  viralCoefficient: number
  engagements: number
  createdAt: string
}

export interface ThreatAnalytics {
  totalThreats: number
  bySeverity: {
    low: number
    medium: number
    high: number
    critical: number
  }
  topThreats: ThreatPost[]
}

export interface KonfamImpact {
  hasIntervention: boolean
  responseCount?: number
  timeToIntervention?: number
  sentimentBefore?: number
  sentimentAfter?: number
  improvementPercentage?: number
  firstResponseAt?: string
  message?: string
}

export interface TrendingTopic {
  topic: string
  count: number
  change: number
  sentiment: 'positive' | 'negative' | 'neutral'
  isHashtag: boolean
}

export interface TrendingTopics {
  topics: TrendingTopic[]
  timestamp: string
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean
  data: T
}