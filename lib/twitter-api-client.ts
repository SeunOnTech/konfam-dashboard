// lib/twitter-api-client.ts
/**
 * ✅ UPDATED: Now fetches threats from backend instead of client-side detection
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

// ============================================================================
// BACKEND THREAT TYPES (matches Prisma schema exactly)
// ============================================================================

export interface BackendThreat {
  id: string;
  postId: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  score: number;
  reasons: string[];
  detectedAt: string;
  addressed: boolean;
  addressedAt: string | null;
  responseId: string | null;
  post: {
    id: string;
    content: string;
    createdAt: string;
    likeCount: number;
    retweetCount: number;
    replyCount: number;
    author: {
      id: string;
      username: string;
      displayName: string;
      avatarUrl: string | null;
      verified: boolean;
    };
  };
}

export interface ThreatStats {
  totalThreatsToday: number;
  activeCritical: number;
  activeHigh: number;
  averageDetectionTime: number;
  topKeywords: Array<{ keyword: string; count: number }>;
  threatsByHour: Array<{ hour: number; count: number }>;
  timestamp: string;
}

export interface ThreatFilters {
  severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  addressed?: boolean;
  limit?: number;
  offset?: number;
}

// ============================================================================
// LEGACY TWEET INTERFACE (kept for posting responses)
// ============================================================================

export interface Tweet {
  id: string;
  text: string;
  author: {
    id: string;
    username: string;
    name: string;
    verified: boolean;
    profile_image_url: string;
  };
  public_metrics: {
    like_count: number;
    retweet_count: number;
    reply_count: number;
    impression_count: number;
  };
  metadata: {
    is_konfam_response: boolean;
    emotional_tone: string;
    panic_factor: number;
    threat_level: number;
    is_misinformation: boolean;
  };
  created_at: string;
}

// ============================================================================
// API CLIENT CLASS
// ============================================================================

export class TwitterAPIClient {
  
  // ==========================================================================
  // ✅ NEW: THREAT MANAGEMENT METHODS (Backend Integration)
  // ==========================================================================

  /**
   * Get threats from backend with optional filters
   */
  async getThreats(filters: ThreatFilters = {}): Promise<{
    threats: BackendThreat[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  }> {
    try {
      const params = new URLSearchParams();
      
      if (filters.severity) params.append('severity', filters.severity);
      if (filters.addressed !== undefined) params.append('addressed', String(filters.addressed));
      if (filters.limit) params.append('limit', String(filters.limit));
      if (filters.offset) params.append('offset', String(filters.offset));

      const response = await fetch(
        `${BACKEND_URL}/api/threats?${params}`,
        { 
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.message || 'Failed to fetch threats');
      }

      return response.json();
    } catch (error) {
      console.error('❌ getThreats error:', error);
      throw error;
    }
  }

  /**
   * Get single threat by ID with full details
   */
  async getThreatById(id: string): Promise<BackendThreat> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/threats/${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.status === 404) {
        throw new Error('Threat not found');
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.message || 'Failed to fetch threat');
      }

      const data = await response.json();
      return data.threat;
    } catch (error) {
      console.error('❌ getThreatById error:', error);
      throw error;
    }
  }

  /**
   * Mark threat as addressed after Konfam responds
   */
  async markThreatAddressed(threatId: string, responseId: string): Promise<BackendThreat> {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/threats/${threatId}/address`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ responseId })
        }
      );

      if (response.status === 404) {
        throw new Error('Threat not found');
      }

      if (response.status === 400) {
        const error = await response.json();
        throw new Error(error.message || 'Bad request');
      }

      if (!response.ok) {
        throw new Error('Failed to mark threat as addressed');
      }

      const data = await response.json();
      return data.threat;
    } catch (error) {
      console.error('❌ markThreatAddressed error:', error);
      throw error;
    }
  }

  /**
   * Get threat statistics and analytics
   */
  async getThreatStats(): Promise<ThreatStats> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/threats/stats`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch threat stats');
      }

      return response.json();
    } catch (error) {
      console.error('❌ getThreatStats error:', error);
      throw error;
    }
  }

  // ==========================================================================
  // ✅ NEW: ADMIN CONTROL METHODS
  // ==========================================================================

  /**
   * Trigger immediate threat scan (don't wait for scheduler)
   */
  async triggerImmediateScan(): Promise<{ message: string; jobId: string }> {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/admin/scan-now`,
        { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to trigger scan');
      }

      return response.json();
    } catch (error) {
      console.error('❌ triggerImmediateScan error:', error);
      throw error;
    }
  }

  /**
   * Get queue statistics (monitoring)
   */
  async getQueueStats(): Promise<any> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/queue-stats`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch queue stats');
      }

      return response.json();
    } catch (error) {
      console.error('❌ getQueueStats error:', error);
      throw error;
    }
  }

  /**
   * Pause automatic threat detection
   */
  async pauseDetection(): Promise<{ message: string; status: string }> {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/admin/pause-detection`,
        { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to pause detection');
      }

      return response.json();
    } catch (error) {
      console.error('❌ pauseDetection error:', error);
      throw error;
    }
  }

  /**
   * Resume automatic threat detection
   */
  async resumeDetection(): Promise<{ message: string; status: string }> {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/admin/resume-detection`,
        { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to resume detection');
      }

      return response.json();
    } catch (error) {
      console.error('❌ resumeDetection error:', error);
      throw error;
    }
  }

  /**
   * Reset all threats (for demo reset)
   */
  async resetThreats(): Promise<{ message: string; deletedCount: number }> {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/admin/reset-threats`,
        { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to reset threats');
      }

      return response.json();
    } catch (error) {
      console.error('❌ resetThreats error:', error);
      throw error;
    }
  }

  // ==========================================================================
  // EXISTING METHOD (kept for posting Konfam responses)
  // ==========================================================================

  /**
   * Post a Konfam response tweet
   */
  async postKonfamResponse(options: {
    text: string;
    replyTo?: string;
    quoteTweet?: string;
    language?: string;
  }): Promise<Tweet> {
    try {
        console.log('Posting Konfam response with options:', options);
      const response = await fetch(`${BACKEND_URL}/api/twitter/tweets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: options.text,
          reply_to: options.replyTo,
          quote_tweet: options.quoteTweet,
          language: options.language || 'ENGLISH',
          is_konfam_response: true
        })
      });

      if (!response.ok) {
        throw new Error('Failed to post tweet');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('❌ postKonfamResponse error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const twitterAPI = new TwitterAPIClient();

// // lib/twitter-api-client.ts

// const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

// export interface Tweet {
//   id: string;
//   text: string;
//   author: {
//     id: string;
//     username: string;
//     name: string;
//     verified: boolean;
//     profile_image_url: string;
//   };
//   public_metrics: {
//     like_count: number;
//     retweet_count: number;
//     reply_count: number;
//     impression_count: number;
//   };
//   metadata: {
//     is_konfam_response: any;
//     emotional_tone: string;
//     panic_factor: number;
//     threat_level: number;
//     is_misinformation: boolean;
//   };
//   created_at: string;
// }

// export class TwitterAPIClient {
  
//   /**
//    * Search for tweets about T Bank
//    */
//   async searchBankTweets(options: {
//     keywords?: string;
//     maxResults?: number;
//     sinceId?: string;
//   } = {}): Promise<Tweet[]> {
//     const params = new URLSearchParams({
//       query: options.keywords || 'T Bank OR TBank OR @tbank_ng',
//       max_results: String(options.maxResults || 100),
//       ...(options.sinceId && { since_id: options.sinceId })
//     });

//     const response = await fetch(
//       `${BACKEND_URL}/api/twitter/search/recent?${params}`
//     );

//     if (!response.ok) {
//       throw new Error('Failed to search tweets');
//     }

//     const data = await response.json();
//     return data.data || [];
//   }

//   /**
//    * Get detailed metrics for a specific tweet
//    */
//   async getTweetMetrics(tweetId: string) {
//     const response = await fetch(
//       `${BACKEND_URL}/api/twitter/tweets/${tweetId}/metrics`
//     );

//     if (!response.ok) {
//       throw new Error('Failed to fetch tweet metrics');
//     }

//     const data = await response.json();
//     return data.data;
//   }

//   /**
//    * Post a Konfam response tweet
//    */
//   async postKonfamResponse(options: {
//     text: string;
//     replyTo?: string;
//     language?: string;
//   }) {
//     const response = await fetch(`${BACKEND_URL}/api/twitter/tweets`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         text: options.text,
//         reply_to: options.replyTo,
//         language: options.language || 'ENGLISH',
//         is_konfam_response: true
//       })
//     });

//     if (!response.ok) {
//       throw new Error('Failed to post tweet');
//     }

//     const data = await response.json();
//     return data.data;
//   }
// }

// export const twitterAPI = new TwitterAPIClient();