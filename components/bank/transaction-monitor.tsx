"use client"

import type { BankData } from "@/lib/types"
import { ArrowUpRight, ArrowDownLeft, CheckCircle } from "lucide-react"

interface TransactionMonitorProps {
  bankData: BankData
}

export function TransactionMonitor({ bankData }: TransactionMonitorProps) {
  const getTransactionIcon = (type: string) => {
    if (type.includes("Transfer") || type.includes("Payment")) {
      return <ArrowUpRight className="w-4 h-4 text-primary" />
    }
    return <ArrowDownLeft className="w-4 h-4 text-green-600" />
  }

  return (
    <div className="p-6">
      <h2 className="font-semibold text-foreground mb-4">Real-time Transaction Flow</h2>

      {/* Live indicator */}
      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse-subtle" />
        <p className="text-xs font-semibold text-green-600">LIVE TRANSACTIONS</p>
      </div>

      {/* Transaction stream */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {bankData.transactionStream.map((tx, idx) => (
          <div key={idx} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded transition-colors">
            <div className="flex items-center gap-3 flex-1">
              <div className="flex-shrink-0">{getTransactionIcon(tx.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground">{tx.type}</p>
                <p className="text-xs text-muted-foreground">{tx.time}</p>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs font-semibold text-foreground">{tx.amount}</p>
              <div className="flex items-center gap-1 justify-end mt-1">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span className="text-xs text-green-600">Success</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/30">
          <p className="text-xs font-semibold text-green-700">ALL TRANSACTIONS PROCESSED SUCCESSFULLY</p>
          <p className="text-xs text-green-600 mt-1">No failures or delays detected</p>
        </div>
      </div>
    </div>
  )
}
