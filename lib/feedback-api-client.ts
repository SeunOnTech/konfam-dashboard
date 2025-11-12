// lib/feedback-api-client.ts
/**
 * Feedback API Client
 * Handles all feedback and reputation analytics API calls
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export interface FeedbackMetric {
  label: string;
  score: number;
  trend: 'up' | 'down';
  change: number;
}

export interface TopComment {
  text: string;
  count: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  author: string;
  postId: string;
}

export interface SentimentDataPoint {
  timestamp: string;
  sentimentScore: number;
  postCount: number;
  label: string;
}

export interface FeedbackMetricsResponse {
  period: string;
  metrics: FeedbackMetric[];
  timestamp: string;
}

export interface TopCommentsResponse {
  period: string;
  topComments: TopComment[];
  timestamp: string;
}

export interface KeyTopicsResponse {
  period: string;
  keyTopics: string[];
  topicsWithMetrics: Array<{
    topic: string;
    mentions: number;
    engagement: number;
  }>;
  timestamp: string;
}

export interface SentimentTrendResponse {
  period: string;
  sentimentTrend: SentimentDataPoint[];
  timestamp: string;
}

class FeedbackAPIClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  /**
   * Get feedback metrics for specified period
   */
  async getMetrics(period: 'daily' | 'weekly' | 'monthly' = 'weekly'): Promise<FeedbackMetricsResponse> {
    const response = await fetch(`${this.baseUrl}/feedback/metrics?period=${period}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch metrics: ${response.statusText}`);
    }
    
    return response.json();
  }

  /**
   * Get top comments for specified period
   */
  async getTopComments(period: 'daily' | 'weekly' | 'monthly' = 'weekly'): Promise<TopCommentsResponse> {
    const response = await fetch(`${this.baseUrl}/feedback/top-comments?period=${period}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch top comments: ${response.statusText}`);
    }
    
    return response.json();
  }

  /**
   * Get key topics for specified period
   */
  async getKeyTopics(period: 'daily' | 'weekly' | 'monthly' = 'weekly'): Promise<KeyTopicsResponse> {
    const response = await fetch(`${this.baseUrl}/feedback/topics?period=${period}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch key topics: ${response.statusText}`);
    }
    
    return response.json();
  }

  /**
   * Get sentiment trend for specified period
   */
  async getSentimentTrend(period: 'daily' | 'weekly' | 'monthly' = 'weekly'): Promise<SentimentTrendResponse> {
    const response = await fetch(`${this.baseUrl}/feedback/sentiment-trend?period=${period}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch sentiment trend: ${response.statusText}`);
    }
    
    return response.json();
  }
}

// Export singleton instance
export const feedbackAPI = new FeedbackAPIClient();