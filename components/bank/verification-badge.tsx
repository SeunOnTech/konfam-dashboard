import type { BankData } from "@/lib/types"
import { CheckCircle, Info } from "lucide-react"

interface VerificationBadgeProps {
  bankData: BankData
}

export function VerificationBadge({ bankData }: VerificationBadgeProps) {
  return (
    <div className="bg-gradient-to-r from-green-500/10 to-green-500/5 border border-green-500/30 rounded-lg p-6 flex items-center gap-4">
      <CheckCircle className="w-12 h-12 text-green-600 flex-shrink-0" />
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="font-bold text-lg text-foreground">VERIFIED BY T BANK</h2>
          <div className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full">LIVE DATA</div>
        </div>
        <p className="text-sm text-muted-foreground">
          All claims have been verified against real-time bank data. Last updated: {new Date().toLocaleTimeString()}
        </p>
      </div>
      <Info className="w-5 h-5 text-muted-foreground flex-shrink-0" />
    </div>
  )
}
