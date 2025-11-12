// lib/groq-client.ts
import Groq from "groq-sdk"

interface GroqResponse {
  suggestions: string[]
  response: string
}

class GroqClientManager {
  private apiKeys: string[]
  private currentKeyIndex: number = 0

  constructor() {
    // Parse comma-separated API keys from environment
    const keysString = process.env.NEXT_PUBLIC_GROQ_API_KEYS || ""
    this.apiKeys = keysString.split(",").map((key) => key.trim()).filter(Boolean)

    if (this.apiKeys.length === 0) {
      console.warn("⚠️ No Groq API keys found in NEXT_PUBLIC_GROQ_API_KEYS")
    }
  }

  /**
   * Get current Groq client with key rotation on failure
   */
  private getClient(): Groq {
    if (this.apiKeys.length === 0) {
      throw new Error("No Groq API keys available")
    }

    const apiKey = this.apiKeys[this.currentKeyIndex]
    return new Groq({
      apiKey,
      dangerouslyAllowBrowser: true, // Required for client-side usage
    })
  }

  /**
   * Rotate to next API key
   */
  private rotateKey() {
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length
    console.log(`🔄 Rotated to Groq API key ${this.currentKeyIndex + 1}/${this.apiKeys.length}`)
  }

  /**
   * Make API call with automatic key rotation on failure
   */
  private async makeRequestWithRetry<T>(
    requestFn: (client: Groq) => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: Error | null = null

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const client = this.getClient()
        const result = await requestFn(client)
        return result
      } catch (error) {
        lastError = error as Error
        console.error(`❌ Groq API call failed (attempt ${attempt + 1}/${maxRetries}):`, error)

        // Rotate to next key if we have more attempts
        if (attempt < maxRetries - 1) {
          this.rotateKey()
          // Wait a bit before retrying
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      }
    }

    throw lastError || new Error("All Groq API calls failed")
  }

  /**
   * Generate context suggestions based on threat
   */
  async generateContextSuggestions(threatContent: string, threatAuthor: string): Promise<string[]> {
    const systemPrompt = `You are helping to generate realistic bank statements about their actual situation.

Given a panic tweet about a bank issue, generate 5 different realistic statements that the BANK would make about what's actually happening internally.

These should sound like official bank communications - honest, transparent, and specific:
- If there IS an issue: Acknowledge it, explain scope, give timeline
- If it's exaggerated: Clarify actual scope (e.g., "affecting 3% of users in Lagos area")
- If it's false: State clearly what the real status is

Return ONLY a JSON array of 5 strings, no markdown, no explanation.

Example formats:
- "We're experiencing a technical issue affecting mobile app login for some customers in Lagos. Our team is working to resolve it within the next 2 hours. No accounts are frozen."
- "We identified and resolved a brief ATM network slowdown (15 minutes) affecting 5 machines in Ikeja. All systems now operational. No funds missing."
- "This claim is false. Our systems show 99.2% uptime today. The user's individual account was flagged for standard security verification, not frozen."
- "We're aware of slow transaction processing affecting approximately 200 customers since 2 PM. Issue isolated to one server. Expected resolution: 4 PM today."
- "No widespread account freezes. One customer account was temporarily restricted due to suspicious activity (standard fraud prevention). Issue resolved after verification."`

    const userPrompt = `Panic Tweet: "${threatContent}"
Posted by: @${threatAuthor}

Generate 5 different realistic statements the BANK might make about what's actually happening (could be: acknowledging real issue with scope/timeline, clarifying exaggeration, or debunking false claim).

Make them specific, honest, and transparent like real bank communications.`

    try {
      return await this.makeRequestWithRetry(async (client) => {
        const completion = await client.chat.completions.create({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          model: "llama-3.3-70b-versatile",
          temperature: 0.8,
          max_tokens: 500,
        })

        const content = completion.choices[0]?.message?.content || "[]"
        
        // Clean markdown if present
        const cleanContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
        
        const suggestions = JSON.parse(cleanContent)
        
        if (!Array.isArray(suggestions) || suggestions.length === 0) {
          throw new Error("Invalid suggestions format")
        }

        return suggestions.slice(0, 5)
      })
    } catch (error) {
      console.error("Failed to generate context suggestions:", error)
      
      // Fallback suggestions
      return [
        "We're experiencing a brief technical issue affecting 3% of mobile app users in Lagos. Resolution expected within 1 hour. No accounts are frozen.",
        "This claim is false. Our systems show 99% uptime today. The individual account was flagged for routine security verification, not frozen.",
        "We identified a 10-minute ATM network slowdown affecting 8 machines in Lekki. All systems now operational. No customer funds affected.",
        "We're aware of slow transaction processing affecting approximately 150 customers since 1 PM. Issue isolated. Expected resolution: 3 PM today.",
        "No widespread outage. One customer experienced login issues due to incorrect credentials. All other systems operating normally.",
      ]
    }
  }

  /**
   * Generate AI response based on threat and bank context
   */
  async generateResponse(
    threatContent: string,
    threatAuthor: string,
    bankContext: string,
    tone: "professional" | "empathetic" | "urgent"
  ): Promise<string> {
    const toneDescriptions = {
      professional: "professional, clear, and authoritative without sounding corporate",
      empathetic: "understanding but firm about facts, balancing empathy with truth",
      urgent: "direct and serious, emphasizing the danger of spreading false information",
    }

    const systemPrompt = `You are Konfam, an independent AI-powered fact-checking system that verifies banking claims in real-time.

Your role: Combat misinformation by comparing viral panic tweets against verified bank data.

CRITICAL INSTRUCTIONS:
1. You are NOT the bank. You are an independent verifier.
2. Use the bank's statement to fact-check the panic tweet
3. Call out misinformation clearly if the tweet is false/exaggerated
4. If the bank confirms an issue, acknowledge it BUT clarify the actual scope (not as bad as panic suggests)
5. Always redirect people to verified channels for accurate info

Response structure:
- Start with "⚠️ FACT-CHECK:" or "🔍 VERIFIED:" or "❌ FALSE CLAIM:"
- State what's ACTUALLY happening (based on bank's verified statement)
- Contrast with what the panic tweet claimed (if false/exaggerated)
- Be ${toneDescriptions[tone]}
- Keep under 280 characters (Twitter limit)
- No hashtags, no promotional language

Examples:
- Panic: "EVERYONE'S ACCOUNTS ARE FROZEN!" → Bank: "3% of users affected" → You: "⚠️ FACT-CHECK: Bank confirms technical issue affecting 3% of users in Lagos area only, not system-wide freezes. Resolution in progress. This viral claim is exaggerated."

- Panic: "BANK IS COLLAPSING!" → Bank: "15min ATM slowdown, now resolved" → You: "❌ FALSE CLAIM: Bank data shows 15-minute ATM network hiccup (now resolved). No collapse, no missing funds. This is fear-mongering."

- Panic: "CAN'T ACCESS MY MONEY!" → Bank: "One account security verification" → You: "🔍 VERIFIED: Individual case, not system-wide. Bank confirms this was standard fraud prevention for ONE account. All systems operational."

Return ONLY the response text, no quotes, no markdown.`

    const userPrompt = `Panic Tweet: "${threatContent}"
Posted by: @${threatAuthor}

Actual Bank Statement: "${bankContext}"

Generate a ${tone} Konfam fact-check response that:
1. Compares the panic tweet against the bank's verified statement
2. Calls out misinformation if present
3. Clarifies what's ACTUALLY happening (scope, timeline, facts)
4. Protects the bank's reputation by correcting false narratives

Generate response now (under 280 chars):`

    try {
      return await this.makeRequestWithRetry(async (client) => {
        const completion = await client.chat.completions.create({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          model: "llama-3.3-70b-versatile",
          temperature: 0.7,
          max_tokens: 200,
        })

        const response = completion.choices[0]?.message?.content?.trim() || ""
        
        // Remove quotes if present
        const cleanResponse = response.replace(/^["']|["']$/g, "")
        
        // Ensure it's under 280 characters
        if (cleanResponse.length > 280) {
          return cleanResponse.substring(0, 277) + "..."
        }

        return cleanResponse
      })
    } catch (error) {
      console.error("Failed to generate response:", error)
      
      // Fallback response
      const isFalseOrExaggerated = bankContext.toLowerCase().includes("false") || 
                                   bankContext.toLowerCase().includes("no widespread") ||
                                   bankContext.toLowerCase().includes("only") ||
                                   bankContext.toLowerCase().includes("isolated")
      
      if (isFalseOrExaggerated) {
        return `❌ FALSE CLAIM: ${bankContext.substring(0, 180)} This viral post is spreading misinformation.`
      } else {
        return `⚠️ FACT-CHECK: Bank confirms ${bankContext.substring(0, 180)} Not as widespread as claimed. Check official channels.`
      }
    }
  }
}

// Export singleton instance
export const groqClient = new GroqClientManager()

// // lib/groq-client.ts
// import Groq from "groq-sdk"

// interface GroqResponse {
//   suggestions: string[]
//   response: string
// }

// class GroqClientManager {
//   private apiKeys: string[]
//   private currentKeyIndex: number = 0

//   constructor() {
//     // Parse comma-separated API keys from environment
//     const keysString = process.env.NEXT_PUBLIC_GROQ_API_KEYS || ""
//     this.apiKeys = keysString.split(",").map((key) => key.trim()).filter(Boolean)

//     if (this.apiKeys.length === 0) {
//       console.warn("⚠️ No Groq API keys found in NEXT_PUBLIC_GROQ_API_KEYS")
//     }
//   }

//   /**
//    * Get current Groq client with key rotation on failure
//    */
//   private getClient(): Groq {
//     if (this.apiKeys.length === 0) {
//       throw new Error("No Groq API keys available")
//     }

//     const apiKey = this.apiKeys[this.currentKeyIndex]
//     return new Groq({
//       apiKey,
//       dangerouslyAllowBrowser: true, // Required for client-side usage
//     })
//   }

//   /**
//    * Rotate to next API key
//    */
//   private rotateKey() {
//     this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length
//     console.log(`🔄 Rotated to Groq API key ${this.currentKeyIndex + 1}/${this.apiKeys.length}`)
//   }

//   /**
//    * Make API call with automatic key rotation on failure
//    */
//   private async makeRequestWithRetry<T>(
//     requestFn: (client: Groq) => Promise<T>,
//     maxRetries: number = 3
//   ): Promise<T> {
//     let lastError: Error | null = null

//     for (let attempt = 0; attempt < maxRetries; attempt++) {
//       try {
//         const client = this.getClient()
//         const result = await requestFn(client)
//         return result
//       } catch (error) {
//         lastError = error as Error
//         console.error(`❌ Groq API call failed (attempt ${attempt + 1}/${maxRetries}):`, error)

//         // Rotate to next key if we have more attempts
//         if (attempt < maxRetries - 1) {
//           this.rotateKey()
//           // Wait a bit before retrying
//           await new Promise((resolve) => setTimeout(resolve, 1000))
//         }
//       }
//     }

//     throw lastError || new Error("All Groq API calls failed")
//   }

//   /**
//    * Generate context suggestions based on threat
//    */
//   async generateContextSuggestions(threatContent: string, threatAuthor: string): Promise<string[]> {
//     const systemPrompt = `You are Konfam, an independent AI monitoring system that fact-checks banking misinformation.

// Given a crisis post about a bank, generate 5 realistic verification findings that Konfam would discover when fact-checking the claim.

// Each finding should be a factual statement about what's REALLY happening (verified with bank data), written from Konfam's perspective as an independent monitor.

// Return ONLY a JSON array of 5 strings, no markdown, no explanation.

// Example formats:
// - "Verified: Bank systems show 98.5% uptime - this claim is unsubstantiated"
// - "Cross-checked with real-time data: No evidence of account freezes in the system"
// - "Our monitoring indicates normal operations - this appears to be misinformation"
// - "Fact-check: Technical issues affecting 2% of users, not widespread freezes"
// - "Data verification: ATM network 97% operational, isolated incidents only"`

//     const userPrompt = `Crisis Post: "${threatContent}"
// Posted by: @${threatAuthor}

// What would Konfam (independent monitoring system) discover when fact-checking this claim with real bank data?

// Generate 5 verification findings.`

//     try {
//       return await this.makeRequestWithRetry(async (client) => {
//         const completion = await client.chat.completions.create({
//           messages: [
//             { role: "system", content: systemPrompt },
//             { role: "user", content: userPrompt },
//           ],
//           model: "llama-3.3-70b-versatile",
//           temperature: 0.8,
//           max_tokens: 500,
//         })

//         const content = completion.choices[0]?.message?.content || "[]"
        
//         // Clean markdown if present
//         const cleanContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
        
//         const suggestions = JSON.parse(cleanContent)
        
//         if (!Array.isArray(suggestions) || suggestions.length === 0) {
//           throw new Error("Invalid suggestions format")
//         }

//         return suggestions.slice(0, 5)
//       })
//     } catch (error) {
//       console.error("Failed to generate context suggestions:", error)
      
//       // Fallback suggestions
//       return [
//         "Verified: Bank systems show 98.5% uptime - this claim appears unsubstantiated",
//         "Cross-checked with real-time data: No system-wide issues detected, isolated incidents only",
//         "Our monitoring indicates normal operations - this may be misinformation or individual case",
//         "Fact-check: Technical issues affecting <2% of users, not widespread freezes",
//         "Data verification: All core banking services operational, no evidence supporting this claim",
//       ]
//     }
//   }

//   /**
//    * Generate AI response based on threat and bank context
//    */
//   async generateResponse(
//     threatContent: string,
//     threatAuthor: string,
//     bankContext: string,
//     tone: "professional" | "empathetic" | "urgent"
//   ): Promise<string> {
//     const toneDescriptions = {
//       professional: "professional, factual, and informative",
//       empathetic: "empathetic but neutral and fact-based",
//       urgent: "urgent, direct, and warning-focused",
//     }

//     const systemPrompt = `You are Konfam, an independent AI-powered fact-checking and crisis monitoring system for banks. You are NOT the bank itself.

// Your role:
// - Monitor social media for banking misinformation
// - Verify claims with real bank data
// - Respond to correct false information
// - Sound like an independent watchdog, not bank PR

// Response style:
// - Be ${toneDescriptions[tone]}
// - Start with verification language (e.g., "We've verified...", "Our monitoring shows...", "Fact-check:")
// - Reference data objectively (e.g., "Bank systems show...", "Current status indicates...")
// - Sound neutral and trustworthy, not promotional
// - Keep under 280 characters (Twitter limit)
// - No hashtags unless specifically relevant

// Return ONLY the response text, no quotes, no markdown, no explanation.`

//     const userPrompt = `Crisis Post: "${threatContent}"
// Posted by: @${threatAuthor}

// Verified Situation: ${bankContext}

// Generate a ${tone} fact-checking response from Konfam (independent monitoring system, NOT the bank) that:
// 1. Verifies the claim with data
// 2. Corrects misinformation if present
// 3. Provides factual status update
// 4. Sounds neutral and trustworthy, not promotional

// Example style: "⚠️ FACT-CHECK: Our monitoring shows TBank systems are 98% operational. This claim appears unverified. Users can check real-time status at..."

// Generate response now:`

//     try {
//       return await this.makeRequestWithRetry(async (client) => {
//         const completion = await client.chat.completions.create({
//           messages: [
//             { role: "system", content: systemPrompt },
//             { role: "user", content: userPrompt },
//           ],
//           model: "llama-3.3-70b-versatile",
//           temperature: 0.7,
//           max_tokens: 200,
//         })

//         const response = completion.choices[0]?.message?.content?.trim() || ""
        
//         // Remove quotes if present
//         const cleanResponse = response.replace(/^["']|["']$/g, "")
        
//         // Ensure it's under 280 characters
//         if (cleanResponse.length > 280) {
//           return cleanResponse.substring(0, 277) + "..."
//         }

//         return cleanResponse
//       })
//     } catch (error) {
//       console.error("Failed to generate response:", error)
      
//       // Fallback response
//       return `⚠️ FACT-CHECK: Our monitoring indicates ${bankContext.substring(0, 80)}. We verify claims with real-time bank data. Check official sources for accurate info.`
//     }
//   }
// }

// // Export singleton instance
// export const groqClient = new GroqClientManager()