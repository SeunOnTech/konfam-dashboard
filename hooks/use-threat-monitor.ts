// hooks/use-threat-monitor.ts
/**
 * ✅ SIMPLIFIED: Backend does all detection, we just display results
 * All scoring, keyword detection, and analysis removed from client
 */

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { twitterAPI, type BackendThreat } from '@/lib/twitter-api-client';
import type { Threat } from '@/lib/types';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000';

export function useThreatMonitor() {
  // State using your existing Threat type
  const [threats, setThreats] = useState<Threat[]>([]);
  const [postsAnalyzed, setPostsAnalyzed] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const socketRef = useRef<Socket | null>(null);

  // ==========================================================================
  // INITIALIZATION: Load threats & connect WebSocket
  // ==========================================================================

  useEffect(() => {
    console.log('🔌 Initializing threat monitor...');

    // 1. Load initial threats from backend
    loadInitialThreats();

    // 2. Connect to WebSocket for real-time updates
    connectWebSocket();

    // Cleanup on unmount
    return () => {
      console.log('🔌 Disconnecting threat monitor...');
      socketRef.current?.emit('leave:threats');
      socketRef.current?.disconnect();
    };
  }, []);

  // ==========================================================================
  // LOAD INITIAL THREATS FROM BACKEND API
  // ==========================================================================

  async function loadInitialThreats() {
    try {
      console.log('🔍 Loading threats from backend API...');
      
      const { threats: backendThreats, pagination } = await twitterAPI.getThreats({
        limit: 50,
        offset: 0
      });

      console.log(`📊 Loaded ${backendThreats.length} threats from backend`);

      console.log('Backend threats:', backendThreats);

      // Convert backend format to your Threat type
      const convertedThreats = backendThreats.map(convertBackendToThreat);
      
      setThreats(convertedThreats);
      setPostsAnalyzed(pagination.total);
      setIsLoading(false);
    } catch (error) {
      console.error('❌ Failed to load threats:', error);
      setIsLoading(false);
    }
  }

  // ==========================================================================
  // WEBSOCKET CONNECTION & REAL-TIME LISTENERS
  // ==========================================================================

  function connectWebSocket() {
    socketRef.current = io(WS_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    // Connection established
    socketRef.current.on('connect', () => {
      console.log('✅ WebSocket connected:', socketRef.current?.id);
      setIsConnected(true);
      
      // Join threats room to receive events
      socketRef.current?.emit('join:threats');
      console.log('📡 Joined threats room');
    });

    // Connection lost
    socketRef.current.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      setIsConnected(false);
    });

    // Initial threats sent when joining room
    socketRef.current.on('threats:initial', (data: { threats: BackendThreat[] }) => {
      console.log('📊 Received initial threats:', data.threats.length);
      
      const convertedThreats = data.threats.map(convertBackendToThreat);
      setThreats(convertedThreats);
      setPostsAnalyzed(prev => prev + data.threats.length);
    });

    // New threat detected in real-time
    socketRef.current.on('threat_detected', (data: any) => {
      console.log('🚨 NEW THREAT DETECTED:', data);
      
      const newThreat = convertWebSocketToThreat(data);
      
      setThreats(prev => {
        // Avoid duplicates
        if (prev.some(t => t.id === newThreat.id)) {
          return prev;
        }
        // Add to start of array
        return [newThreat, ...prev].slice(0, 50); // Keep last 50
      });

      setPostsAnalyzed(prev => prev + 1);

      // Play alert sound for HIGH/CRITICAL
      if (['HIGH', 'CRITICAL'].includes(data.severity)) {
        playAlertSound();
      }
    });

    // Threat addressed (marked as resolved)
    socketRef.current.on('threat_addressed', (data: { threatId: string }) => {
      console.log('✅ Threat addressed:', data.threatId);
      
      setThreats(prev => 
        prev.map(t => 
          t.id === data.threatId ? { ...t, addressed: true } : t
        )
      );
    });

    // Threat updated (severity changed)
    socketRef.current.on('threat_updated', (data: {
      threatId: string;
      oldSeverity: string;
      newSeverity: string;
      newScore: number;
    }) => {
      console.log('📈 Threat updated:', data);
      
      setThreats(prev => 
        prev.map(t => {
          if (t.id === data.threatId) {
            return {
              ...t,
              severity: data.newSeverity as Threat['severity'],
              threatLevel: data.newScore / 100
            };
          }
          return t;
        })
      );
    });
  }

  // ==========================================================================
  // CONVERSION HELPERS: Backend format → Your Threat type
  // ==========================================================================

  /**
   * Convert backend threat (from API) to your Threat type
   */
  function convertBackendToThreat(backend: BackendThreat): Threat {
    return {
      id: backend.id,
      severity: backend.severity,
      post: {
        postId: backend.post.id,
        content: backend.post.content,
        author: backend.post.author.username,
        timestamp: formatTimestamp(backend.post.createdAt),
        engagement: {
          likes: backend.post.likeCount,
          retweets: backend.post.retweetCount,
          replies: backend.post.replyCount
        }
      },
      detectedAt: new Date(backend.detectedAt),
      keywords: extractKeywords(backend.reasons),
      panicFactor: backend.score / 100,
      threatLevel: backend.score / 100,
      addressed: backend.addressed
    };
  }

  /**
   * Convert WebSocket event to your Threat type
   */
  function convertWebSocketToThreat(data: any): Threat {
    return {
      id: data.threatId,
      severity: data.severity,
      post: {
        postId: data.post.id,
        content: data.post.content,
        author: data.post.author.username,
        timestamp: formatTimestamp(data.post.createdAt),
        engagement: {
          likes: data.post.likeCount,
          retweets: data.post.retweetCount,
          replies: data.post.replyCount
        }
      },
      detectedAt: new Date(data.detectedAt),
      keywords: extractKeywords(data.reasons),
      panicFactor: data.score / 100,
      threatLevel: data.score / 100,
      addressed: false
    };
  }

  // ==========================================================================
  // UTILITY HELPERS
  // ==========================================================================

  /**
   * Format ISO timestamp to relative time
   */
  function formatTimestamp(isoString: string): string {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }

  /**
   * Extract keywords from backend analysis reasons
   */
  function extractKeywords(reasons: string[]): string[] {
    const keywords: string[] = [];
    
    reasons.forEach(reason => {
      // Match patterns like "Contains keywords: frozen, account"
      const match = reason.match(/(?:Contains keywords?|crisis keywords?):?\s*(.+)/i);
      if (match) {
        const keywordsPart = match[1];
        keywords.push(...keywordsPart.split(',').map(k => k.trim()));
      }
    });
    
    return keywords;
  }

  /**
   * Play alert sound for critical threats
   */
  function playAlertSound() {
    try {
      const audio = new Audio('/alert.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {
        console.log('Could not play alert sound (user interaction required)');
      });
    } catch (error) {
      // Silent fail if audio not available
    }
  }

  // ==========================================================================
  // PUBLIC METHODS
  // ==========================================================================

  /**
   * Mark threat as addressed (calls backend API)
   */
  async function markThreatAddressed(threatId: string, responsePostId?: string) {
    try {
      // Generate response ID if not provided
      const responseId = responsePostId || `response_${Date.now()}`;
      
      console.log('📝 Marking threat as addressed:', threatId);
      
      await twitterAPI.markThreatAddressed(threatId, responseId);
      
      // Update local state (WebSocket will also broadcast)
      setThreats(prev => 
        prev.map(t => 
          t.id === threatId ? { ...t, addressed: true } : t
        )
      );
      
      console.log('✅ Threat marked as addressed');
    } catch (error) {
      console.error('❌ Failed to mark threat as addressed:', error);
      throw error;
    }
  }

  /**
   * Manually refresh threats from backend
   */
  async function refreshThreats() {
    console.log('🔄 Refreshing threats...');
    setIsLoading(true);
    await loadInitialThreats();
  }

  // ==========================================================================
  // RETURN HOOK VALUES
  // ==========================================================================

  return {
    threats,
    postsAnalyzed,
    activeThreats: threats.filter(t => 
      ['HIGH', 'CRITICAL'].includes(t.severity) && !t.addressed
    ).length,
    isConnected,
    isLoading,
    markThreatAddressed,
    refreshThreats
  };
}

// // hooks/use-threat-monitor.ts
// import { useState, useEffect, useRef } from 'react';
// import { io, Socket } from 'socket.io-client';
// import { twitterAPI, Tweet } from '@/lib/twitter-api-client';
// import { threatDetector, ThreatAnalysis } from '@/lib/threat-detector';

// interface ThreatAlert {
//   id: string;
//   tweet: Tweet;
//   analysis: ThreatAnalysis;
//   detectedAt: Date;
//   addressed?: boolean;
// }

// const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000';

// export function useThreatMonitor() {
//   const [threats, setThreats] = useState<ThreatAlert[]>([]);
//   const [postsAnalyzed, setPostsAnalyzed] = useState(0);
//   const [isConnected, setIsConnected] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
  
//   const lastTweetId = useRef<string | null>(null);
//   const socketRef = useRef<Socket | null>(null);
//   const processedTweetIds = useRef<Set<string>>(new Set());

//   useEffect(() => {
//     // 1. Initial load: Fetch recent tweets
//     loadRecentTweets();

//     // 2. Real-time monitoring: Listen to WebSocket
//     socketRef.current = io(WS_URL, {
//       transports: ['websocket', 'polling'],
//       reconnection: true,
//       reconnectionDelay: 1000,
//       reconnectionAttempts: 5
//     });

//     // Connection events
//     socketRef.current.on('connect', () => {
//       console.log('✅ WebSocket connected to backend');
//       setIsConnected(true);
//     });

//     socketRef.current.on('disconnect', () => {
//       console.log('❌ WebSocket disconnected');
//       setIsConnected(false);
//     });

//     // Listen for new posts
//     socketRef.current.on('new_post', async (data: any) => {
//       console.log('📬 New post received via WebSocket:', data);
      
//       // Handle both possible data structures
//       const post = data.post || data;
//       await analyzeNewPost(post);
//     });

//     return () => {
//       socketRef.current?.disconnect();
//     };
//   }, []);

//   async function loadRecentTweets() {
//     try {
//       console.log('🔍 Loading recent tweets...');
//       const tweets = await twitterAPI.searchBankTweets({ maxResults: 50 });
//       console.log(`📊 Found ${tweets.length} tweets to analyze`);
      
//       for (const tweet of tweets) {
//         await analyzeNewPost(tweet);
//       }

//       setIsLoading(false);
//     } catch (error) {
//       console.error('❌ Failed to load tweets:', error);
//       setIsLoading(false);
//     }
//   }

//   async function analyzeNewPost(post: Tweet) {
//     // Skip if already processed
//     if (processedTweetIds.current.has(post.id)) {
//       return;
//     }

//     processedTweetIds.current.add(post.id);
//     setPostsAnalyzed(prev => prev + 1);
//     lastTweetId.current = post.id;

//     // Skip if is a Konfam response
//     if (post.metadata?.is_konfam_response) {
//       console.log('⏭️ Skipping Konfam response:', post.id);
//       return;
//     }

//     // Skip if already in threats
//     if (threats.some(t => t.tweet.id === post.id)) {
//       return;
//     }

//     // Analyze for threats
//     try {
//       const analysis = await threatDetector.analyzeTweet(post);

//       // Only alert if it's a real threat
//       if (analysis.isThreat) {
//         console.log(`🚨 THREAT DETECTED: ${analysis.severity} - Score: ${analysis.score}`);
//         console.log(`   Reasons:`, analysis.reasons);

//         const alert: ThreatAlert = {
//           id: crypto.randomUUID(),
//           tweet: post,
//           analysis,
//           detectedAt: new Date(),
//           addressed: false
//         };

//         setThreats(prev => [alert, ...prev].slice(0, 50)); // Keep last 50

//         // Play alert sound for HIGH/CRITICAL
//         if (['HIGH', 'CRITICAL'].includes(analysis.severity)) {
//           playAlertSound();
//         }
//       } else {
//         console.log(`✅ Post analyzed - Not a threat (Score: ${analysis.score})`);
//       }
//     } catch (error) {
//       console.error('Error analyzing post:', error);
//     }
//   }

//   function playAlertSound() {
//     try {
//       const audio = new Audio('/alert.mp3');
//       audio.volume = 0.3;
//       audio.play().catch(() => {
//         console.log('Could not play alert sound (user interaction required)');
//       });
//     } catch (error) {
//       // Silent fail if audio not available
//     }
//   }

//   // Mark threat as addressed
//   function markThreatAddressed(threatId: string) {
//     setThreats(prev => 
//       prev.map(t => 
//         t.id === threatId ? { ...t, addressed: true } : t
//       )
//     );
//   }

//   // Refresh threats manually
//   async function refreshThreats() {
//     setIsLoading(true);
//     processedTweetIds.current.clear();
//     setThreats([]);
//     setPostsAnalyzed(0);
//     await loadRecentTweets();
//   }

//   return {
//     threats,
//     postsAnalyzed,
//     activeThreats: threats.filter(t => 
//       ['HIGH', 'CRITICAL'].includes(t.analysis.severity) && !t.addressed
//     ).length,
//     isConnected,
//     isLoading,
//     markThreatAddressed,
//     refreshThreats
//   };
// }

// // hooks/use-threat-monitor.ts

// import { useState, useEffect, useRef } from 'react';
// import { io } from 'socket.io-client';
// import { twitterAPI, Tweet } from '@/lib/twitter-api-client';
// import { threatDetector, ThreatAnalysis } from '@/lib/threat-detector';

// interface ThreatAlert {
//   id: string;
//   tweet: Tweet;
//   analysis: ThreatAnalysis;
//   detectedAt: Date;
// }

// export function useThreatMonitor() {
//   const [threats, setThreats] = useState<ThreatAlert[]>([]);
//   const [postsAnalyzed, setPostsAnalyzed] = useState(0);
//   const lastTweetId = useRef<string | null>(null);
//   const socketRef = useRef<any>(null);

//   useEffect(() => {
//     // 1. Initial load: Fetch recent tweets
//     loadRecentTweets();

//     // 2. Real-time monitoring: Listen to WebSocket
//     socketRef.current = io('http://localhost:4000');

//     socketRef.current.on('new_post', async (data: { post: any }) => {
//       await analyzeNewPost(data.post);
//     });

//     return () => {
//       socketRef.current?.disconnect();
//     };
//   }, []);

//   async function loadRecentTweets() {
//     try {
//       const tweets = await twitterAPI.searchBankTweets({ maxResults: 50 });
      
//       for (const tweet of tweets) {
//         await analyzeNewPost(tweet);
//       }
//     } catch (error) {
//       console.error('Failed to load tweets:', error);
//     }
//   }

//   async function analyzeNewPost(post: Tweet) {
//     setPostsAnalyzed(prev => prev + 1);
//     lastTweetId.current = post.id;

//     // Skip if already analyzed or is a Konfam response
//     if (post.metadata.is_konfam_response) return;
//     if (threats.some(t => t.tweet.id === post.id)) return;

//     // Analyze for threats
//     const analysis = await threatDetector.analyzeTweet(post);

//     // Only alert if it's a real threat
//     if (analysis.isThreat) {
//       const alert: ThreatAlert = {
//         id: crypto.randomUUID(),
//         tweet: post,
//         analysis,
//         detectedAt: new Date()
//       };

//       setThreats(prev => [alert, ...prev].slice(0, 50)); // Keep last 50

//       // Play alert sound for HIGH/CRITICAL
//       if (['HIGH', 'CRITICAL'].includes(analysis.severity)) {
//         playAlertSound();
//       }
//     }
//   }

//   function playAlertSound() {
//     // Optional: Add alert sound
//     const audio = new Audio('/alert.mp3');
//     audio.play().catch(() => {});
//   }

//   return {
//     threats,
//     postsAnalyzed,
//     activeThreats: threats.filter(t => 
//       ['HIGH', 'CRITICAL'].includes(t.analysis.severity)
//     ).length
//   };
// }