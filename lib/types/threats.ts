// types/threats.ts
/**
 * Type definitions matching backend Prisma schema
 */

// Severity levels (matches backend enum)
export type ThreatSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

// Backend threat from API
export interface BackendThreat {
  id: string;
  postId: string;
  severity: ThreatSeverity;
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