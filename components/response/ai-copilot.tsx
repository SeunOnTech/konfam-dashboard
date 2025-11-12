"use client"

import { useState } from "react"
import type { Threat } from "@/lib/types"
import { Zap, Copy, Check } from "lucide-react"

interface AICopilotProps {
  threat: Threat | null
  selectedLanguage: "english" | "pidgin" | "yoruba" | "hausa"
  onLanguageChange: (lang: "english" | "pidgin" | "yoruba" | "hausa") => void
  onThreatChange: (threat: Threat) => void
}

const generatedResponses = {
  english:
    "We can confirm all T Bank systems are operating normally. No accounts have been frozen. Our team is monitoring the situation closely. Customers experiencing any issues can contact our support team.",
  pidgin:
    "We don tey-tey confirm say T Bank systems dey run better-better. No account wey don freeze. Our team dey watch the situation with eye. Any customer wey get problem fit call our people them dem.",
  yoruba:
    "A ti fi idi di mimọ pe gbogbo awọn ọrọ T Bank n ṣiṣe ni daradara. Ko si akọõlẹ ti a ti di funfun. Awọn eniyan wa n wo nkan naa. Olumulo eyikeyi ti o ni iṣoro le pe ile-iṣẹ wa.",
  hausa:
    "Mun tabbata cewa duk tsarin T Bank ana aiki sosai. Babu akauti da aka murge. Masu aiki mmu suna kallon batun naa. Abokan cinikin wanda ya sami matsala za ya iya kirane ile-ita mmu.",
}

export function AICopilot({ threat, selectedLanguage, onLanguageChange, onThreatChange }: AICopilotProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [copiedLang, setCopiedLang] = useState<string | null>(null)

  const handleGenerate = async () => {
    setIsGenerating(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsGenerating(false)
  }

  const handleCopy = (text: string, lang: string) => {
    navigator.clipboard.writeText(text)
    setCopiedLang(lang)
    setTimeout(() => setCopiedLang(null), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Threat Context */}
      <div>
        <label className="text-sm font-semibold text-foreground block mb-2">Selected Threat</label>
        <div className="bg-muted/50 rounded-lg p-3 border border-border">
          <p className="text-sm text-foreground line-clamp-2">{threat?.post.content}</p>
          <p className="text-xs text-muted-foreground mt-2">@{threat?.post.author.replace("@", "")}</p>
        </div>
      </div>

      {/* Tone Selector */}
      <div>
        <label className="text-sm font-semibold text-foreground block mb-2">Response Tone</label>
        <div className="grid grid-cols-3 gap-2">
          {(["professional", "empathetic", "urgent"] as const).map((tone) => (
            <button
              key={tone}
              className="px-4 py-2 rounded-lg border border-border text-sm font-medium transition-all hover:bg-muted capitalize"
            >
              {tone}
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <Zap className="w-4 h-4" />
        {isGenerating ? "Generating Responses..." : "Generate Multilingual Responses"}
      </button>

      {/* Language Tabs */}
      <div>
        <label className="text-sm font-semibold text-foreground block mb-3">Multilingual Responses</label>

        {/* Tab buttons */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {(["english", "pidgin", "yoruba", "hausa"] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => onLanguageChange(lang)}
              className={`py-2 rounded-lg font-medium text-sm transition-all capitalize ${
                selectedLanguage === lang
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground hover:bg-muted/80"
              }`}
            >
              {lang === "english" ? "🇬🇧 ENG" : lang === "pidgin" ? "🇳🇬 PIDGIN" : lang === "yoruba" ? "🗣️ YOR" : "🗣️ HAS"}
            </button>
          ))}
        </div>

        {/* Response text area */}
        <div className="bg-muted/50 rounded-lg p-4 border border-border mb-3">
          <p className="text-sm text-foreground leading-relaxed">{generatedResponses[selectedLanguage]}</p>
          <div className="mt-3 text-xs text-muted-foreground">
            {generatedResponses[selectedLanguage].length} characters
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => handleCopy(generatedResponses[selectedLanguage], selectedLanguage)}
            className="flex-1 border border-border text-foreground py-2 rounded-lg font-semibold hover:bg-muted transition-colors flex items-center justify-center gap-2"
          >
            {copiedLang === selectedLanguage ? (
              <>
                <Check className="w-4 h-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Text
              </>
            )}
          </button>
          <button className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg font-semibold hover:bg-primary/90 transition-all">
            Post as @Konfam
          </button>
        </div>
      </div>
    </div>
  )
}
