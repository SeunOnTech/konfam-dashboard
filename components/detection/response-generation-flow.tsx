// src/components/detection/response-generation-flow.tsx
"use client"

import type { Threat } from "@/lib/types"
import { ArrowLeft, Send, MessageCircle, Repeat2, Loader2, Sparkles } from "lucide-react"
import { useState, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { groqClient } from "@/lib/groq-client"
import { twitterAPI } from "@/lib/twitter-api-client"

interface ResponseGenerationFlowProps {
  threat: Threat
  onClose: () => void
  onSuccess?: () => void
}

export function ResponseGenerationFlow({ threat, onClose, onSuccess }: ResponseGenerationFlowProps) {
  const [step, setStep] = useState<"bank-context" | "generate" | "deploy" | "success">("bank-context")
  const [bankContext, setBankContext] = useState("")
  const [responseTone, setResponseTone] = useState<"professional" | "empathetic" | "urgent">("professional")
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [deployType, setDeployType] = useState<"reply" | "quote" | null>(null)
  const [generatedResponse, setGeneratedResponse] = useState("")
  const [contextSuggestions, setContextSuggestions] = useState<string[]>([])

    async function markThreatAddressed(threatId: string, responsePostId: string) {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/threats/${threatId}/address`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: threatId, responseId: responsePostId })
            })

            if (!response.ok) {
                throw new Error(`Failed to mark threat as addressed: ${response.statusText}`)
            }

            console.log("✅ Marked threat as addressed")
        } catch (error) {
            console.error("❌ Failed to mark threat as addressed:", error)
            // Don't throw - we don't want to block the flow if this fails
        }
    }

  // Load AI-generated context suggestions on mount
  useEffect(() => {
    loadContextSuggestions()
  }, [])

  const loadContextSuggestions = async () => {
    setIsLoadingSuggestions(true)
    try {
      console.log("🤖 Generating AI context suggestions...")
      const suggestions = await groqClient.generateContextSuggestions(
        threat.post.content,
        threat.post.author
      )
      setContextSuggestions(suggestions)
      console.log("✅ Loaded", suggestions.length, "context suggestions")
    } catch (error) {
      console.error("❌ Failed to load context suggestions:", error)
      // Fallback suggestions are handled in groqClient
    } finally {
      setIsLoadingSuggestions(false)
    }
  }

  const handleContextContinue = () => {
    if (bankContext.trim().length === 0) return
    setStep("generate")
    handleGenerate()
  }

  const handleGenerate = async () => {
    setIsGenerating(true)

    try {
      console.log("🤖 Generating AI response with tone:", responseTone)
      const response = await groqClient.generateResponse(
        threat.post.content,
        threat.post.author,
        bankContext,
        responseTone
      )
      setGeneratedResponse(response)
      console.log("✅ Generated response:", response.substring(0, 50) + "...")
    } catch (error) {
      console.error("❌ Failed to generate response:", error)
      alert("Failed to generate response. Please try again.")
      setStep("bank-context")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDeploy = async (type: "reply" | "quote") => {
    setDeployType(type)
    
    try {
      console.log(`🚀 Deploying ${type} response...`)
      console.log('post', threat.post.postId)
      
      // Post to Twitter clone
      const responsePost = await twitterAPI.postKonfamResponse({
        text: generatedResponse,
        replyTo: type === "reply" ? threat.post.postId : undefined,
        quoteTweet: type === "quote" ? threat.post.postId : undefined,
        language: "ENGLISH",
      })

      console.log("✅ Response posted:", responsePost.id)
      
      // Mark threat as addressed (if you have backend integration)
      // await markThreatAddressed(threat.id, responsePost.id)
      await markThreatAddressed(threat.id, responsePost.id)
      
      setStep("success")
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("❌ Failed to deploy response:", error)
      alert("Failed to deploy response. Please try again.")
      setDeployType(null)
    }
  }

  const handleRegenerate = () => {
    setStep("bank-context")
    setGeneratedResponse("")
  }

  return (
    <div className="space-y-4 max-h-[80vh] overflow-y-auto">
      {step === "bank-context" && (
        <>
          <div className="flex items-center gap-2 pb-4 border-b border-border">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground text-lg">AI-Powered Response Generation</h2>
          </div>

          {/* Threat Overview */}
          <div className="bg-muted/50 rounded-lg p-4 border border-border">
            <p className="text-xs text-muted-foreground mb-2 font-semibold">THREAT BEING ADDRESSED</p>
            <p className="text-sm text-foreground">{threat.post.content}</p>
            <p className="text-xs text-muted-foreground mt-2">@{threat.post.author.replace("@", "")}</p>
          </div>

          {/* Context Input */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold text-foreground block mb-2">
                Bank's Official Statement
              </label>
              <Textarea
                value={bankContext}
                onChange={(e) => setBankContext(e.target.value)}
                placeholder="What is the bank saying about this situation? Be specific: acknowledge real issues with scope/timeline, or clarify if claim is false/exaggerated..."
                className="min-h-24 resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                💡 <strong>Tip:</strong> If there's a real issue, be honest and specific (e.g., "affecting 200 users in Lagos, resolving by 4pm"). 
                If it's false, state what's actually true. Konfam will use this to fight misinformation.
              </p>
            </div>

            {/* AI-Generated Suggestions */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-xs font-semibold text-muted-foreground">AI-SUGGESTED BANK STATEMENTS</p>
                {isLoadingSuggestions && (
                  <Loader2 className="w-3 h-3 animate-spin text-primary" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                Click any suggestion to use it, or write your own based on the bank's actual situation
              </p>
              
              {isLoadingSuggestions ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-full h-12 rounded-lg border border-border bg-muted/30 animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {contextSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => setBankContext(suggestion)}
                      className={`w-full p-3 text-left rounded-lg border transition-all text-sm ${
                        bankContext === suggestion
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:bg-muted/50 text-foreground hover:border-primary/50"
                      }`}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Response Tone Selection */}
            <div>
              <label className="text-sm font-semibold text-foreground block mb-2">Response Tone</label>
              <div className="grid grid-cols-3 gap-2">
                {(["professional", "empathetic", "urgent"] as const).map((tone) => (
                  <button
                    key={tone}
                    onClick={() => setResponseTone(tone)}
                    className={`px-3 py-2 rounded-lg border font-medium text-sm transition-all capitalize ${
                      responseTone === tone
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-muted-foreground"
                    }`}
                  >
                    {tone}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <button
            onClick={handleContextContinue}
            disabled={bankContext.trim().length === 0 || isGenerating}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Generate AI Response
          </button>
        </>
      )}

      {step === "generate" && (
        <>
          <div className="flex items-center gap-2 pb-4 border-b border-border">
            {!isGenerating && (
              <button onClick={handleRegenerate} className="p-1 hover:bg-muted rounded">
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h2 className="font-semibold text-foreground">
              {isGenerating ? "AI Generating Response..." : "Review Generated Response"}
            </h2>
          </div>

          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <Sparkles className="w-6 h-6 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground text-center">
                  Analyzing threat with AI...
                </p>
                <p className="text-xs text-muted-foreground text-center mt-1">
                  Using Groq LLaMA 3.3 70B to generate optimal response
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Bank Context Used */}
              <div>
                <p className="text-xs text-muted-foreground mb-2 font-semibold">BANK'S ACTUAL SITUATION</p>
                <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/30 text-sm text-foreground">
                  {bankContext}
                </div>
              </div>

              {/* Original Panic Tweet for Context */}
              <div>
                <p className="text-xs text-muted-foreground mb-2 font-semibold">VIRAL PANIC TWEET</p>
                <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/30 text-sm text-foreground">
                  {threat.post.content}
                </div>
              </div>

              {/* Generated Response */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-muted-foreground font-semibold">KONFAM'S FACT-CHECK RESPONSE</p>
                  <span className="text-xs text-muted-foreground">
                    {generatedResponse.length}/280 chars
                  </span>
                </div>
                <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/30 text-sm text-foreground leading-relaxed font-medium">
                  {generatedResponse}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  ℹ️ This response corrects misinformation by comparing the viral claim against verified bank data
                </p>
                <button
                  onClick={handleRegenerate}
                  className="mt-2 text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  Regenerate with different tone or context
                </button>
              </div>

              {/* Deployment Options */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-foreground">Deploy As</p>
                <button
                  onClick={() => handleDeploy("reply")}
                  disabled={deployType !== null && deployType !== "reply"}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    deployType === "reply" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                  } disabled:opacity-50`}
                >
                  <div className="flex items-start gap-3">
                    <MessageCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-foreground text-sm">Direct Reply</p>
                      <p className="text-xs text-muted-foreground">Post as a direct reply to the threat</p>
                    </div>
                    {deployType === "reply" && <Loader2 className="w-4 h-4 animate-spin ml-auto" />}
                  </div>
                </button>

                <button
                  onClick={() => handleDeploy("quote")}
                  disabled={deployType !== null && deployType !== "quote"}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    deployType === "quote" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                  } disabled:opacity-50`}
                >
                  <div className="flex items-start gap-3">
                    <Repeat2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-foreground text-sm">Quote Tweet</p>
                      <p className="text-xs text-muted-foreground">Quote tweet with additional context</p>
                    </div>
                    {deployType === "quote" && <Loader2 className="w-4 h-4 animate-spin ml-auto" />}
                  </div>
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {step === "success" && (
        <div className="space-y-4 py-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-green-600 animate-bounce" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Response Deployed Successfully!</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Your AI-generated response has been posted as a {deployType} and is now live.
            </p>
          </div>

          <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/30">
            <div>
              <p className="text-xs text-muted-foreground mb-2 font-semibold">YOUR RESPONSE</p>
              <p className="text-sm text-foreground">{generatedResponse}</p>
            </div>
            <p className="text-xs text-muted-foreground mt-3">Posted: {new Date().toLocaleTimeString()}</p>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all"
          >
            Done
          </button>
        </div>
      )}
    </div>
  )
}

// // src/components/detection/response-generation-flow.tsx
// "use client"

// import type { Threat } from "@/lib/types"
// import { ArrowLeft, Send, MessageCircle, Repeat2, Loader2, Sparkles } from "lucide-react"
// import { useState, useEffect } from "react"
// import { Textarea } from "@/components/ui/textarea"
// import { groqClient } from "@/lib/groq-client"
// import { twitterAPI } from "@/lib/twitter-api-client"

// interface ResponseGenerationFlowProps {
//   threat: Threat
//   onClose: () => void
//   onSuccess?: () => void
// }

// export function ResponseGenerationFlow({ threat, onClose, onSuccess }: ResponseGenerationFlowProps) {
//   const [step, setStep] = useState<"bank-context" | "generate" | "deploy" | "success">("bank-context")
//   const [bankContext, setBankContext] = useState("")
//   const [responseTone, setResponseTone] = useState<"professional" | "empathetic" | "urgent">("professional")
//   const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
//   const [isGenerating, setIsGenerating] = useState(false)
//   const [deployType, setDeployType] = useState<"reply" | "quote" | null>(null)
//   const [generatedResponse, setGeneratedResponse] = useState("")
//   const [contextSuggestions, setContextSuggestions] = useState<string[]>([])

//   // Load AI-generated context suggestions on mount
//   useEffect(() => {
//     loadContextSuggestions()
//   }, [])

//   const loadContextSuggestions = async () => {
//     setIsLoadingSuggestions(true)
//     try {
//       console.log("🤖 Generating AI context suggestions...")
//       const suggestions = await groqClient.generateContextSuggestions(
//         threat.post.content,
//         threat.post.author
//       )
//       setContextSuggestions(suggestions)
//       console.log("✅ Loaded", suggestions.length, "context suggestions")
//     } catch (error) {
//       console.error("❌ Failed to load context suggestions:", error)
//       // Fallback suggestions are handled in groqClient
//     } finally {
//       setIsLoadingSuggestions(false)
//     }
//   }

//   const handleContextContinue = () => {
//     if (bankContext.trim().length === 0) return
//     setStep("generate")
//     handleGenerate()
//   }

//   const handleGenerate = async () => {
//     setIsGenerating(true)

//     try {
//       console.log("🤖 Generating AI response with tone:", responseTone)
//       const response = await groqClient.generateResponse(
//         threat.post.content,
//         threat.post.author,
//         bankContext,
//         responseTone
//       )
//       setGeneratedResponse(response)
//       console.log("✅ Generated response:", response.substring(0, 50) + "...")
//     } catch (error) {
//       console.error("❌ Failed to generate response:", error)
//       alert("Failed to generate response. Please try again.")
//       setStep("bank-context")
//     } finally {
//       setIsGenerating(false)
//     }
//   }

//   const handleDeploy = async (type: "reply" | "quote") => {
//     setDeployType(type)
    
//     try {
//       console.log(`🚀 Deploying ${type} response...`)
      
//       // Post to Twitter clone
//       const responsePost = await twitterAPI.postKonfamResponse({
//         text: generatedResponse,
//         language: "ENGLISH",
//       })

//       console.log("✅ Response posted:", responsePost.id)
      
//       // Mark threat as addressed (if you have backend integration)
//       // await markThreatAddressed(threat.id, responsePost.id)
      
//       setStep("success")
      
//       // Call success callback if provided
//       if (onSuccess) {
//         onSuccess()
//       }
//     } catch (error) {
//       console.error("❌ Failed to deploy response:", error)
//       alert("Failed to deploy response. Please try again.")
//       setDeployType(null)
//     }
//   }

//   const handleRegenerate = () => {
//     setStep("bank-context")
//     setGeneratedResponse("")
//   }

//   return (
//     <div className="space-y-4 max-h-[80vh] overflow-y-auto">
//       {step === "bank-context" && (
//         <>
//           <div className="flex items-center gap-2 pb-4 border-b border-border">
//             <Sparkles className="w-5 h-5 text-primary" />
//             <h2 className="font-semibold text-foreground text-lg">AI-Powered Response Generation</h2>
//           </div>

//           {/* Threat Overview */}
//           <div className="bg-muted/50 rounded-lg p-4 border border-border">
//             <p className="text-xs text-muted-foreground mb-2 font-semibold">THREAT BEING ADDRESSED</p>
//             <p className="text-sm text-foreground">{threat.post.content}</p>
//             <p className="text-xs text-muted-foreground mt-2">@{threat.post.author.replace("@", "")}</p>
//           </div>

//           {/* Context Input */}
//           <div className="space-y-3">
//             <div>
//               <label className="text-sm font-semibold text-foreground block mb-2">
//                 Verification Finding
//               </label>
//               <Textarea
//                 value={bankContext}
//                 onChange={(e) => setBankContext(e.target.value)}
//                 placeholder="What did Konfam discover when verifying this claim? (e.g., 'Verified: Systems show 98% uptime...')"
//                 className="min-h-24 resize-none"
//               />
//               <p className="text-xs text-muted-foreground mt-1">
//                 AI will use this verified finding to generate a fact-checking response
//               </p>
//             </div>

//             {/* AI-Generated Suggestions */}
//             <div>
//               <div className="flex items-center gap-2 mb-2">
//                 <p className="text-xs font-semibold text-muted-foreground">AI-OPTIMIZED CONTEXTS</p>
//                 {isLoadingSuggestions && (
//                   <Loader2 className="w-3 h-3 animate-spin text-primary" />
//                 )}
//               </div>
              
//               {isLoadingSuggestions ? (
//                 <div className="space-y-2">
//                   {[1, 2, 3].map((i) => (
//                     <div
//                       key={i}
//                       className="w-full h-12 rounded-lg border border-border bg-muted/30 animate-pulse"
//                     />
//                   ))}
//                 </div>
//               ) : (
//                 <div className="space-y-2">
//                   {contextSuggestions.map((suggestion, idx) => (
//                     <button
//                       key={idx}
//                       onClick={() => setBankContext(suggestion)}
//                       className={`w-full p-3 text-left rounded-lg border transition-all text-sm ${
//                         bankContext === suggestion
//                           ? "border-primary bg-primary/10 text-primary"
//                           : "border-border hover:bg-muted/50 text-foreground hover:border-primary/50"
//                       }`}
//                     >
//                       {suggestion}
//                     </button>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* Response Tone Selection */}
//             <div>
//               <label className="text-sm font-semibold text-foreground block mb-2">Response Tone</label>
//               <div className="grid grid-cols-3 gap-2">
//                 {(["professional", "empathetic", "urgent"] as const).map((tone) => (
//                   <button
//                     key={tone}
//                     onClick={() => setResponseTone(tone)}
//                     className={`px-3 py-2 rounded-lg border font-medium text-sm transition-all capitalize ${
//                       responseTone === tone
//                         ? "border-primary bg-primary/10 text-primary"
//                         : "border-border hover:border-muted-foreground"
//                     }`}
//                   >
//                     {tone}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Continue Button */}
//           <button
//             onClick={handleContextContinue}
//             disabled={bankContext.trim().length === 0 || isGenerating}
//             className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2"
//           >
//             <Sparkles className="w-4 h-4" />
//             Generate AI Response
//           </button>
//         </>
//       )}

//       {step === "generate" && (
//         <>
//           <div className="flex items-center gap-2 pb-4 border-b border-border">
//             {!isGenerating && (
//               <button onClick={handleRegenerate} className="p-1 hover:bg-muted rounded">
//                 <ArrowLeft className="w-4 h-4" />
//               </button>
//             )}
//             <h2 className="font-semibold text-foreground">
//               {isGenerating ? "AI Generating Response..." : "Review Generated Response"}
//             </h2>
//           </div>

//           {isGenerating ? (
//             <div className="flex flex-col items-center justify-center py-12 gap-4">
//               <div className="relative">
//                 <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
//                 <Sparkles className="w-6 h-6 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
//               </div>
//               <div>
//                 <p className="text-sm font-semibold text-foreground text-center">
//                   Analyzing threat with AI...
//                 </p>
//                 <p className="text-xs text-muted-foreground text-center mt-1">
//                   Using Groq LLaMA 3.3 70B to generate optimal response
//                 </p>
//               </div>
//             </div>
//           ) : (
//             <div className="space-y-4">
//               {/* Bank Context Used */}
//               <div>
//                 <p className="text-xs text-muted-foreground mb-2 font-semibold">BANK SITUATION</p>
//                 <div className="bg-muted/30 rounded-lg p-3 border border-border text-sm text-foreground">
//                   {bankContext}
//                 </div>
//               </div>

//               {/* Generated Response */}
//               <div>
//                 <div className="flex items-center justify-between mb-2">
//                   <p className="text-xs text-muted-foreground font-semibold">AI-GENERATED RESPONSE</p>
//                   <span className="text-xs text-muted-foreground">
//                     {generatedResponse.length}/280 chars
//                   </span>
//                 </div>
//                 <div className="bg-primary/5 rounded-lg p-4 border border-primary/20 text-sm text-foreground leading-relaxed">
//                   {generatedResponse}
//                 </div>
//                 <button
//                   onClick={handleRegenerate}
//                   className="mt-2 text-xs text-primary hover:underline flex items-center gap-1"
//                 >
//                   <Sparkles className="w-3 h-3" />
//                   Regenerate with different tone or context
//                 </button>
//               </div>

//               {/* Deployment Options */}
//               <div className="space-y-3">
//                 <p className="text-sm font-semibold text-foreground">Deploy As</p>
//                 <button
//                   onClick={() => handleDeploy("reply")}
//                   disabled={deployType !== null && deployType !== "reply"}
//                   className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
//                     deployType === "reply" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
//                   } disabled:opacity-50`}
//                 >
//                   <div className="flex items-start gap-3">
//                     <MessageCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
//                     <div>
//                       <p className="font-semibold text-foreground text-sm">Direct Reply</p>
//                       <p className="text-xs text-muted-foreground">Post as a direct reply to the threat</p>
//                     </div>
//                     {deployType === "reply" && <Loader2 className="w-4 h-4 animate-spin ml-auto" />}
//                   </div>
//                 </button>

//                 <button
//                   onClick={() => handleDeploy("quote")}
//                   disabled={deployType !== null && deployType !== "quote"}
//                   className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
//                     deployType === "quote" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
//                   } disabled:opacity-50`}
//                 >
//                   <div className="flex items-start gap-3">
//                     <Repeat2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
//                     <div>
//                       <p className="font-semibold text-foreground text-sm">Quote Tweet</p>
//                       <p className="text-xs text-muted-foreground">Quote tweet with additional context</p>
//                     </div>
//                     {deployType === "quote" && <Loader2 className="w-4 h-4 animate-spin ml-auto" />}
//                   </div>
//                 </button>
//               </div>
//             </div>
//           )}
//         </>
//       )}

//       {step === "success" && (
//         <div className="space-y-4 py-8">
//           <div className="text-center">
//             <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
//               <Send className="w-8 h-8 text-green-600 animate-bounce" />
//             </div>
//             <h3 className="text-lg font-semibold text-foreground mb-2">Response Deployed Successfully!</h3>
//             <p className="text-sm text-muted-foreground mb-4">
//               Your AI-generated response has been posted as a {deployType} and is now live.
//             </p>
//           </div>

//           <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/30">
//             <div>
//               <p className="text-xs text-muted-foreground mb-2 font-semibold">YOUR RESPONSE</p>
//               <p className="text-sm text-foreground">{generatedResponse}</p>
//             </div>
//             <p className="text-xs text-muted-foreground mt-3">Posted: {new Date().toLocaleTimeString()}</p>
//           </div>

//           <button
//             onClick={onClose}
//             className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all"
//           >
//             Done
//           </button>
//         </div>
//       )}
//     </div>
//   )
// }

// // src/components/detection/response-generation-flow.tsx
// "use client"

// import type { Threat } from "@/lib/types"
// import { ArrowLeft, Send, MessageCircle, Repeat2, Loader2 } from "lucide-react"
// import { useState } from "react"
// import { Textarea } from "@/components/ui/textarea"

// interface ResponseGenerationFlowProps {
//   threat: Threat
//   onClose: () => void
// }

// export function ResponseGenerationFlow({ threat, onClose }: ResponseGenerationFlowProps) {
//   const [step, setStep] = useState<"bank-context" | "generate" | "deploy" | "success">("bank-context")
//   const [bankContext, setBankContext] = useState("")
//   const [responseTone, setResponseTone] = useState<"professional" | "empathetic" | "urgent">("professional")
//   const [isGenerating, setIsGenerating] = useState(false)
//   const [deployType, setDeployType] = useState<"reply" | "quote" | null>(null)
//   const [generatedResponse, setGeneratedResponse] = useState("")

//   const contextExamples = [
//     "This is not verified - the post is false",
//     "We are experiencing technical issues but funds are safe, issue will soon be rectified",
//     "Account freezes are not part of our system - user may have other account restrictions",
//     "Our systems are operating normally with no reported disruptions",
//     "We are investigating the claims and will provide updates shortly",
//   ]

//   const handleContextContinue = () => {
//     if (bankContext.trim().length === 0) return
//     setStep("generate")
//   }

//   const handleGenerate = async () => {
//     setIsGenerating(true)

//     // Simulate API call that uses bankContext and threat info
//     await new Promise((resolve) => setTimeout(resolve, 2500))

//     const responses: Record<string, string> = {
//       professional: `We appreciate your concern. ${bankContext} Our support team is available 24/7 to assist any customers with specific questions. We remain committed to maintaining the highest security and service standards.`,
//       empathetic: `We understand your concern and take this seriously. ${bankContext} We're here to help our customers and encourage anyone with specific issues to reach out directly to our support team.`,
//       urgent: `IMMEDIATE UPDATE: ${bankContext} We are actively monitoring this situation and have dedicated resources to resolve any issues. Our customer support team is standing by - contact us directly for assistance.`,
//     }

//     setGeneratedResponse(responses[responseTone])
//     setIsGenerating(false)
//   }

//   const handleDeploy = async (type: "reply" | "quote") => {
//     setDeployType(type)
//     // Simulate deployment
//     await new Promise((resolve) => setTimeout(resolve, 1500))
//     setStep("success")
//   }

//   return (
//     <div className="space-y-4 max-h-[80vh] overflow-y-auto">
//       {step === "bank-context" && (
//         <>
//           <div className="flex items-center gap-2 pb-4 border-b border-border">
//             <h2 className="font-semibold text-foreground text-lg">Add Bank Situation Context</h2>
//           </div>

//           {/* Threat Overview */}
//           <div className="bg-muted/50 rounded-lg p-4 border border-border">
//             <p className="text-xs text-muted-foreground mb-2 font-semibold">THREAT BEING ADDRESSED</p>
//             <p className="text-sm text-foreground">{threat.post.content}</p>
//             <p className="text-xs text-muted-foreground mt-2">@{threat.post.author.replace("@", "")}</p>
//           </div>

//           {/* Context Input */}
//           <div className="space-y-3">
//             <div>
//               <label className="text-sm font-semibold text-foreground block mb-2">Bank Situation Context</label>
//               <Textarea
//                 value={bankContext}
//                 onChange={(e) => setBankContext(e.target.value)}
//                 placeholder="Describe the situation at the bank. E.g., 'We are experiencing technical issues but funds are safe...'"
//                 className="min-h-24 resize-none"
//               />
//               <p className="text-xs text-muted-foreground mt-1">
//                 This context will be used to generate an accurate, informed response
//               </p>
//             </div>

//             {/* Quick Examples */}
//             <div>
//               <p className="text-xs font-semibold text-muted-foreground mb-2">SUGGESTED CONTEXTS</p>
//               <div className="space-y-2">
//                 {contextExamples.map((example, idx) => (
//                   <button
//                     key={idx}
//                     onClick={() => setBankContext(example)}
//                     className="w-full p-3 text-left rounded-lg border border-border hover:bg-muted/50 transition-colors text-sm text-foreground hover:border-primary/50"
//                   >
//                     {example}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* Response Tone Selection */}
//             <div>
//               <label className="text-sm font-semibold text-foreground block mb-2">Response Tone</label>
//               <div className="grid grid-cols-3 gap-2">
//                 {(["professional", "empathetic", "urgent"] as const).map((tone) => (
//                   <button
//                     key={tone}
//                     onClick={() => setResponseTone(tone)}
//                     className={`px-3 py-2 rounded-lg border font-medium text-sm transition-all capitalize ${
//                       responseTone === tone
//                         ? "border-primary bg-primary/10 text-primary"
//                         : "border-border hover:border-muted-foreground"
//                     }`}
//                   >
//                     {tone}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Continue Button */}
//           <button
//             onClick={handleContextContinue}
//             disabled={bankContext.trim().length === 0 || isGenerating}
//             className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
//           >
//             Continue to Generate Response
//           </button>
//         </>
//       )}

//       {step === "generate" && (
//         <>
//           <div className="flex items-center gap-2 pb-4 border-b border-border">
//             {!isGenerating && (
//               <button onClick={() => setStep("bank-context")} className="p-1 hover:bg-muted rounded">
//                 <ArrowLeft className="w-4 h-4" />
//               </button>
//             )}
//             <h2 className="font-semibold text-foreground">
//               {isGenerating ? "Generating Response..." : "Review Generated Response"}
//             </h2>
//           </div>

//           {isGenerating ? (
//             <div className="flex flex-col items-center justify-center py-12 gap-4">
//               <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
//               <div>
//                 <p className="text-sm font-semibold text-foreground text-center">Analyzing threat with context...</p>
//                 <p className="text-xs text-muted-foreground text-center mt-1">
//                   Using bank situation to generate optimal response
//                 </p>
//               </div>
//             </div>
//           ) : (
//             <div className="space-y-4">
//               {/* Bank Context Used */}
//               <div>
//                 <p className="text-xs text-muted-foreground mb-2 font-semibold">BANK SITUATION</p>
//                 <div className="bg-muted/30 rounded-lg p-3 border border-border text-sm text-foreground">
//                   {bankContext}
//                 </div>
//               </div>

//               {/* Generated Response */}
//               <div>
//                 <p className="text-xs text-muted-foreground mb-2 font-semibold">GENERATED RESPONSE</p>
//                 <div className="bg-primary/5 rounded-lg p-4 border border-primary/20 text-sm text-foreground leading-relaxed">
//                   {generatedResponse}
//                 </div>
//               </div>

//               {/* Deployment Options */}
//               <div className="space-y-3">
//                 <p className="text-sm font-semibold text-foreground">Deploy As</p>
//                 <button
//                   onClick={() => handleDeploy("reply")}
//                   disabled={deployType !== null && deployType !== "reply"}
//                   className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
//                     deployType === "reply" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
//                   }`}
//                 >
//                   <div className="flex items-start gap-3">
//                     <MessageCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
//                     <div>
//                       <p className="font-semibold text-foreground text-sm">Direct Reply</p>
//                       <p className="text-xs text-muted-foreground">Post as a direct reply to the threat</p>
//                     </div>
//                     {deployType === "reply" && <Loader2 className="w-4 h-4 animate-spin ml-auto" />}
//                   </div>
//                 </button>

//                 <button
//                   onClick={() => handleDeploy("quote")}
//                   disabled={deployType !== null && deployType !== "quote"}
//                   className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
//                     deployType === "quote" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
//                   }`}
//                 >
//                   <div className="flex items-start gap-3">
//                     <Repeat2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
//                     <div>
//                       <p className="font-semibold text-foreground text-sm">Quote Tweet</p>
//                       <p className="text-xs text-muted-foreground">Quote tweet with additional context</p>
//                     </div>
//                     {deployType === "quote" && <Loader2 className="w-4 h-4 animate-spin ml-auto" />}
//                   </div>
//                 </button>
//               </div>
//             </div>
//           )}
//         </>
//       )}

//       {step === "success" && (
//         <div className="space-y-4 py-8">
//           <div className="text-center">
//             <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
//               <Send className="w-8 h-8 text-green-600" />
//             </div>
//             <h3 className="text-lg font-semibold text-foreground mb-2">Response Deployed Successfully!</h3>
//             <p className="text-sm text-muted-foreground mb-4">
//               Your response has been posted as a {deployType} on Twitter/X and is now live.
//             </p>
//           </div>

//           <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/30">
//             <div>
//               <p className="text-xs text-muted-foreground mb-2 font-semibold">YOUR RESPONSE</p>
//               <p className="text-sm text-foreground">{generatedResponse}</p>
//             </div>
//             <p className="text-xs text-muted-foreground mt-3">Posted: {new Date().toLocaleTimeString()}</p>
//           </div>

//           <button
//             onClick={onClose}
//             className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all"
//           >
//             Done
//           </button>
//         </div>
//       )}
//     </div>
//   )
// }
