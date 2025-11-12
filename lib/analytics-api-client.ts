/**
 * Analytics API Client
 * Handles all analytics and trending topics API calls
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export interface TrendingTopic {
  topic: string;
  count: number;
  change: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  isHashtag: boolean;
}

export interface TrendingTopicsResponse {
  topics: TrendingTopic[];
  timestamp: string;
}

class AnalyticsAPIClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  /**
   * Get trending topics/hashtags from crisis discussions
   */
  async getTrendingTopics(): Promise<TrendingTopicsResponse> {
    const response = await fetch(`${this.baseUrl}/analytics/trending-topics`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch trending topics: ${response.statusText}`);
    }
    
    return response.json();
  }
}

// Export singleton instance
export const analyticsAPI = new AnalyticsAPIClient();