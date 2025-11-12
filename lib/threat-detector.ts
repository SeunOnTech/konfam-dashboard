// lib/threat-detector.ts
import { Tweet, twitterAPI } from './twitter-api-client';

export interface ThreatAnalysis {
  isThreat: boolean;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  score: number; // 0-100
  reasons: string[];
  recommendedAction: string;
}

export class ThreatDetector {
  
  // Engagement thresholds
  private readonly THRESHOLDS = {
    CRITICAL: { engagement: 500, velocity: 20, panic: 0.7 },
    HIGH: { engagement: 200, velocity: 10, panic: 0.5 },
    MEDIUM: { engagement: 100, velocity: 5, panic: 0.4 },
    LOW: { engagement: 50, velocity: 2, panic: 0.3 }
  };

  // Bank-related keywords that indicate misinformation
  private readonly CRISIS_KEYWORDS = [
    'freeze', 'frozen', 'block', 'blocked',
    'hack', 'hacked', 'breach', 'breached',
    'scam', 'fraud', 'steal', 'stolen',
    'down', 'crash', 'fail', 'failure',
    'close', 'closing', 'shutdown', 'bankrupt'
  ];

  /**
   * Analyze a tweet for threat level
   */
  async analyzeTweet(tweet: Tweet): Promise<ThreatAnalysis> {
    const reasons: string[] = [];
    let score = 0;

    // 1. Check engagement level
    const totalEngagement = 
      tweet.public_metrics.like_count +
      tweet.public_metrics.retweet_count +
      tweet.public_metrics.reply_count;

    if (totalEngagement >= this.THRESHOLDS.CRITICAL.engagement) {
      score += 40;
      reasons.push(`Very high engagement (${totalEngagement})`); // FIX: Changed from template literal with backticks
    } else if (totalEngagement >= this.THRESHOLDS.HIGH.engagement) {
      score += 30;
      reasons.push(`High engagement (${totalEngagement})`);
    } else if (totalEngagement >= this.THRESHOLDS.MEDIUM.engagement) {
      score += 20;
      reasons.push(`Moderate engagement (${totalEngagement})`);
    } else if (totalEngagement >= this.THRESHOLDS.LOW.engagement) {
      score += 10;
      reasons.push(`Growing engagement (${totalEngagement})`);
    }

    // 2. Check velocity (fetch metrics)
    try {
      const metrics = await twitterAPI.getTweetMetrics(tweet.id);
      if (metrics.calculated_metrics.velocity_per_minute >= 20) {
        score += 30;
        reasons.push(`Spreading rapidly (${metrics.calculated_metrics.velocity_per_minute}/min)`);
      } else if (metrics.calculated_metrics.velocity_per_minute >= 10) {
        score += 20;
        reasons.push(`Fast spread (${metrics.calculated_metrics.velocity_per_minute}/min)`);
      }
    } catch (error) {
      // Velocity data unavailable, skip
      console.log('Could not fetch velocity metrics:', error);
    }

    // 3. Check content for crisis keywords
    const text = tweet.text.toLowerCase();
    const matchedKeywords = this.CRISIS_KEYWORDS.filter(kw => text.includes(kw));
    
    if (matchedKeywords.length > 0) {
      score += matchedKeywords.length * 5;
      reasons.push(`Contains crisis keywords: ${matchedKeywords.join(', ')}`);
    }

    // 4. Check panic factor from metadata
    if (tweet.metadata.panic_factor >= 0.7) {
      score += 20;
      reasons.push('Extremely high panic factor');
    } else if (tweet.metadata.panic_factor >= 0.5) {
      score += 15;
      reasons.push('High panic factor');
    }

    // 5. Check emotional tone
    if (['PANIC', 'ANGER'].includes(tweet.metadata.emotional_tone)) {
      score += 10;
      reasons.push(`Emotional tone: ${tweet.metadata.emotional_tone}`);
    }

    // Determine severity
    let severity: ThreatAnalysis['severity'] = 'LOW';
    let recommendedAction = 'Monitor for now';

    if (score >= 80) {
      severity = 'CRITICAL';
      recommendedAction = '🚨 Deploy response immediately';
    } else if (score >= 60) {
      severity = 'HIGH';
      recommendedAction = '⚠️ Generate response and prepare deployment';
    } else if (score >= 40) {
      severity = 'MEDIUM';
      recommendedAction = '⚡ Monitor closely and prepare response';
    } else if (score >= 20) {
      severity = 'LOW';
      recommendedAction = '👀 Early warning - keep watching';
    }

    return {
      isThreat: score >= 20, // Only flag if score >= 20
      severity,
      score,
      reasons,
      recommendedAction
    };
  }
}

export const threatDetector = new ThreatDetector();

// // lib/threat-detector.ts

// import { Tweet, twitterAPI } from './twitter-api-client';

// export interface ThreatAnalysis {
//   isThreat: boolean;
//   severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
//   score: number; // 0-100
//   reasons: string[];
//   recommendedAction: string;
// }

// export class ThreatDetector {
  
//   // Engagement thresholds
//   private readonly THRESHOLDS = {
//     CRITICAL: { engagement: 500, velocity: 20, panic: 0.7 },
//     HIGH: { engagement: 200, velocity: 10, panic: 0.5 },
//     MEDIUM: { engagement: 100, velocity: 5, panic: 0.4 },
//     LOW: { engagement: 50, velocity: 2, panic: 0.3 }
//   };

//   // Bank-related keywords that indicate misinformation
//   private readonly CRISIS_KEYWORDS = [
//     'freeze', 'frozen', 'block', 'blocked',
//     'hack', 'hacked', 'breach', 'breached',
//     'scam', 'fraud', 'steal', 'stolen',
//     'down', 'crash', 'fail', 'failure',
//     'close', 'closing', 'shutdown', 'bankrupt'
//   ];

//   /**
//    * Analyze a tweet for threat level
//    */
//   async analyzeTweet(tweet: Tweet): Promise<ThreatAnalysis> {
//     const reasons: string[] = [];
//     let score = 0;

//     // 1. Check engagement level
//     const totalEngagement = 
//       tweet.public_metrics.like_count +
//       tweet.public_metrics.retweet_count +
//       tweet.public_metrics.reply_count;

//     if (totalEngagement >= this.THRESHOLDS.CRITICAL.engagement) {
//       score += 40;
//       reasons.push(`Very high engagement (${totalEngagement})`);
//     } else if (totalEngagement >= this.THRESHOLDS.HIGH.engagement) {
//       score += 30;
//       reasons.push(`High engagement (${totalEngagement})`);
//     } else if (totalEngagement >= this.THRESHOLDS.MEDIUM.engagement) {
//       score += 20;
//       reasons.push(`Moderate engagement (${totalEngagement})`);
//     } else if (totalEngagement >= this.THRESHOLDS.LOW.engagement) {
//       score += 10;
//       reasons.push(`Growing engagement (${totalEngagement})`);
//     }

//     // 2. Check velocity (fetch metrics)
//     try {
//       const metrics = await twitterAPI.getTweetMetrics(tweet.id);
//       if (metrics.calculated_metrics.velocity_per_minute >= 20) {
//         score += 30;
//         reasons.push(`Spreading rapidly (${metrics.calculated_metrics.velocity_per_minute}/min)`);
//       } else if (metrics.calculated_metrics.velocity_per_minute >= 10) {
//         score += 20;
//         reasons.push(`Fast spread (${metrics.calculated_metrics.velocity_per_minute}/min)`);
//       }
//     } catch (error) {
//       // Velocity data unavailable, skip
//     }

//     // 3. Check content for crisis keywords
//     const text = tweet.text.toLowerCase();
//     const matchedKeywords = this.CRISIS_KEYWORDS.filter(kw => text.includes(kw));
    
//     if (matchedKeywords.length > 0) {
//       score += matchedKeywords.length * 5;
//       reasons.push(`Contains crisis keywords: ${matchedKeywords.join(', ')}`);
//     }

//     // 4. Check panic factor from metadata
//     if (tweet.metadata.panic_factor >= 0.7) {
//       score += 20;
//       reasons.push('Extremely high panic factor');
//     } else if (tweet.metadata.panic_factor >= 0.5) {
//       score += 15;
//       reasons.push('High panic factor');
//     }

//     // 5. Check emotional tone
//     if (['PANIC', 'ANGER'].includes(tweet.metadata.emotional_tone)) {
//       score += 10;
//       reasons.push(`Emotional tone: ${tweet.metadata.emotional_tone}`);
//     }

//     // Determine severity
//     let severity: ThreatAnalysis['severity'] = 'LOW';
//     let recommendedAction = 'Monitor for now';

//     if (score >= 80) {
//       severity = 'CRITICAL';
//       recommendedAction = '🚨 Deploy response immediately';
//     } else if (score >= 60) {
//       severity = 'HIGH';
//       recommendedAction = '⚠️ Generate response and prepare deployment';
//     } else if (score >= 40) {
//       severity = 'MEDIUM';
//       recommendedAction = '⚡ Monitor closely and prepare response';
//     } else if (score >= 20) {
//       severity = 'LOW';
//       recommendedAction = '👀 Early warning - keep watching';
//     }

//     return {
//       isThreat: score >= 20, // Only flag if score >= 20
//       severity,
//       score,
//       reasons,
//       recommendedAction
//     };
//   }
// }

// export const threatDetector = new ThreatDetector();