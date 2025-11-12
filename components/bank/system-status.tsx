"use client"

import type { BankData } from "@/lib/types"
import { CheckCircle } from "lucide-react"
import { useState, useEffect } from "react"

interface SystemStatusProps {
  bankData: BankData
}

export function SystemStatus({ bankData }: SystemStatusProps) {
  const [displayTime, setDisplayTime] = useState<string>("")

  useEffect(() => {
    const updateTime = () => {
      setDisplayTime(new Date().toLocaleTimeString())
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="p-6">
      <h2 className="font-semibold text-foreground mb-6">System Status</h2>

      {/* Main status indicator */}
      <div className="mb-8 text-center py-6">
        <div className="flex items-center justify-center gap-3 mb-4">
          <CheckCircle className="w-12 h-12 text-green-500" />
          <div className="text-left">
            <p className="text-lg font-bold text-foreground">ALL SYSTEMS</p>
            <p className="text-lg font-bold text-foreground">OPERATIONAL</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Last updated: {displayTime}</p>
      </div>

      {/* Key metrics */}
      <div className="space-y-3">
        <div className="bg-muted/50 rounded-lg p-3 border border-border">
          <p className="text-xs text-muted-foreground mb-1">System Uptime</p>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-bold text-foreground">99.8%</p>
            <p className="text-xs text-green-600">Normal</p>
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-3 border border-border">
          <p className="text-xs text-muted-foreground mb-1">Active Transactions Today</p>
          <p className="text-2xl font-bold text-foreground">{bankData.activeTransactions.toLocaleString()}</p>
        </div>

        <div className="bg-muted/50 rounded-lg p-3 border border-border">
          <p className="text-xs text-muted-foreground mb-1">Active Accounts</p>
          <p className="text-2xl font-bold text-foreground">{(bankData.accountsActive / 1000000).toFixed(2)}M</p>
        </div>

        <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/30 mt-4">
          <p className="text-xs font-semibold text-green-700">NO FROZEN ACCOUNTS DETECTED</p>
          <p className="text-xs text-green-600 mt-1">All customer accounts are functioning normally</p>
        </div>
      </div>
    </div>
  )
}
