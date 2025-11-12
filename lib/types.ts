// lib/types.ts
// Type definitions for Konfam Dashboard

import { ThreatSeverity } from "./types/threats"

export interface Threat {
  id: string
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
  post: {
    postId: string
    content: string
    author: string
    timestamp: string
    engagement: {
      likes: number
      retweets: number
      replies: number
    }
  }
  detectedAt: Date
  keywords: string[]
  panicFactor: number
  threatLevel: number
  addressed?: boolean
}

export interface BankData {
  systemStatus: "OPERATIONAL" | "DEGRADED" | "DOWN"
  atmUptime: number
  activeTransactions: number
  accountsActive: number
  transactionStream: Array<{
    time: string
    amount: string
    type: string
    status: string
  }>
  lastUpdated: Date
}

export interface Response {
  id: string
  threatId: string
  english: string
  pidgin: string
  yoruba: string
  hausa: string
  tone: "professional" | "empathetic" | "urgent"
  deployed: boolean
  deployedAt?: Date
  engagement?: {
    likes: number
    retweets: number
    replies: number
  }
}

export interface SentimentData {
  timestamp: Date
  score: number
  tweetCount: number
  panicLevel: number
}

export interface Metric {
  label: string
  value: number | string
  change?: number
  changeType?: "increase" | "decrease"
}


// lib/types.ts (ADD THESE TO YOUR EXISTING FILE)
/**
 * Backend API Types (add to existing types.ts)
 */

// Backend threat from API (matches Prisma schema)
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

// WebSocket threat event
export interface ThreatDetectedEvent {
  threatId: string;
  postId: string;
  severity: ThreatSeverity;
  score: number;
  reasons: string[];
  detectedAt: string;
  post: BackendThreat['post'];
}

// WebSocket threat updated event
export interface ThreatUpdatedEvent {
  threatId: string;
  oldSeverity: ThreatSeverity;
  newSeverity: ThreatSeverity;
  newScore: number;
}

// WebSocket threat addressed event
export interface ThreatAddressedEvent {
  threatId: string;
  responseId: string;
  addressedAt: string;
}

// Threat statistics from backend
export interface ThreatStats {
  totalThreatsToday: number;
  activeCritical: number;
  activeHigh: number;
  averageDetectionTime: number;
  topKeywords: Array<{
    keyword: string;
    count: number;
  }>;
  threatsByHour: Array<{
    hour: number;
    count: number;
  }>;
  timestamp: string;
}

// Queue statistics (admin)
export interface QueueStats {
  queue: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
  };
  performance: {
    averageProcessingTime: number;
  };
  threats: {
    total: number;
    active: number;
  };
  scheduler: {
    running: boolean;
  };
  timestamp: string;
}