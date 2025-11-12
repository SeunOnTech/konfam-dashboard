"use client"

import { useState } from "react"
import { Search, CheckCircle } from "lucide-react"

export function AccountVerification() {
  const [accountType, setAccountType] = useState("savings")
  const [region, setRegion] = useState("lagos")
  const [verified, setVerified] = useState(false)

  const handleVerify = () => {
    setVerified(true)
    setTimeout(() => setVerified(false), 5000)
  }

  const verificationResults: Record<string, Record<string, number>> = {
    savings: { lagos: 456123, abuja: 234567, kano: 123456 },
    current: { lagos: 234561, abuja: 123456, kano: 87654 },
    investment: { lagos: 45678, abuja: 23456, kano: 12345 },
  }

  return (
    <div className="p-6">
      <h2 className="font-semibold text-foreground mb-4">Account Verification Tool</h2>

      <div className="space-y-4">
        {/* Account type selector */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground block mb-2">Account Type</label>
          <select
            value={accountType}
            onChange={(e) => setAccountType(e.target.value)}
            className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground text-sm"
          >
            <option value="savings">Savings Account</option>
            <option value="current">Current Account</option>
            <option value="investment">Investment Account</option>
          </select>
        </div>

        {/* Region selector */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground block mb-2">Region</label>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground text-sm"
          >
            <option value="lagos">Lagos</option>
            <option value="abuja">Abuja</option>
            <option value="kano">Kano</option>
          </select>
        </div>

        {/* Verify button */}
        <button
          onClick={handleVerify}
          className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          <Search className="w-4 h-4" />
          Verify Accounts
        </button>

        {/* Results */}
        {verified && (
          <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/30 animate-slide-in-top">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-700 text-sm mb-1">Verification Complete</p>
                <p className="text-green-700 text-sm font-bold">
                  {(
                    verificationResults[accountType][region as keyof (typeof verificationResults)["savings"]] || 0
                  ).toLocaleString()}{" "}
                  {accountType} accounts
                </p>
                <p className="text-xs text-green-600 mt-1">
                  All active and operational in {region.charAt(0).toUpperCase() + region.slice(1)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
