"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { AICopilot } from "@/components/response/ai-copilot"
import { ResponsePreview } from "@/components/response/response-preview"
import { DeployedResponses } from "@/components/response/deployed-responses"
import { mockThreats } from "@/lib/demo-data"
import type { Threat } from "@/lib/types"
import { PlatformSelector } from "@/components/response/platform-selector"

export default function ResponsesPage() {
  const [selectedThreat, setSelectedThreat] = useState<Threat | null>(mockThreats[0])
  const [selectedLanguage, setSelectedLanguage] = useState<"english" | "pidgin" | "yoruba" | "hausa">("english")
  const [selectedPlatform, setSelectedPlatform] = useState("twitter")
  const [responses] = useState([
    {
      id: "1",
      threatId: "1",
      english:
        "We can confirm all T Bank systems are operating normally. No accounts have been frozen. Customers can transact freely.",
      pidgin:
        "We don confirm say T Bank systems dey run fine-fine. No account don freeze. Customers fit do their money business properly.",
      yoruba: "A ti fi idi di mimọ pe gbogbo awọn ọrọ T Bank n ṣiṣe ni daradara. Ko si akọọlẹ ti a ti di",
      hausa:
        "Mun tabbata cewa duk tsarin T Bank ana aiki sosai. Babu akauti da aka murge. Abokan cinikin za su iya yin jama'a.",
      tone: "professional",
      deployed: true,
      deployedAt: new Date(Date.now() - 5 * 60000),
      engagement: { likes: 1243, retweets: 567, replies: 234 },
    },
    {
      id: "2",
      threatId: "2",
      english:
        "ATMs across Nigeria are functioning normally. We are committed to maintaining seamless banking services for our customers.",
      pidgin:
        "ATMs for everywhere for Nigeria dey work correct. We don commit ourselves say we go keep banking service tight-tight for our customers.",
      yoruba:
        "Awọn ATM lo gbogbo ilu Naijiria n ṣiṣe daradara. A ti gbẹ ara wa lati ṣetọju awọn iṣẹ banki ti o dara fun awọn olumulo wa.",
      hausa:
        "ATMs a duk faɗin Nijeriya suna aiki kamar kusan. Mun yin alkawari cewa za mu ci gida jami'an banki masu kyau ga abokan cinikin mmu.",
      tone: "professional",
      deployed: true,
      deployedAt: new Date(Date.now() - 15 * 60000),
      engagement: { likes: 2156, retweets: 892, replies: 412 },
    },
  ])

  const highThreats = mockThreats.filter((t) => t.severity === "HIGH" || t.severity === "CRITICAL").length

  return (
    <MainLayout title="Response Center" activeThreats={highThreats}>
      {/* Platform Selector */}
      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <PlatformSelector selectedPlatform={selectedPlatform} onSelectPlatform={setSelectedPlatform} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6">
        {/* Left column - AI Copilot */}
        <div className="col-span-3 md:space-y-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="font-semibold text-foreground mb-4">AI Response Generator</h2>
            <AICopilot
              threat={selectedThreat}
              selectedLanguage={selectedLanguage}
              selectedPlatform={selectedPlatform}
              onLanguageChange={setSelectedLanguage}
              onThreatChange={setSelectedThreat}
              onPlatformChange={setSelectedPlatform}
            />
          </div>

          {/* Deployed Responses Timeline */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="font-semibold text-foreground mb-4">Recently Deployed Responses</h2>
            <DeployedResponses responses={responses} selectedPlatform={selectedPlatform} />
          </div>
        </div>

        {/* Right column - Preview */}
        <div className="col-span-2">
          <div className="bg-card border border-border rounded-lg p-6 sticky top-20">
            <h2 className="font-semibold text-foreground mb-4">Live Preview</h2>
            <ResponsePreview
              response={responses[0]}
              selectedLanguage={selectedLanguage}
              selectedPlatform={selectedPlatform}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
