"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { SystemStatus } from "@/components/bank/system-status"
import { TransactionMonitor } from "@/components/bank/transaction-monitor"
import { ATMNetworkStatus } from "@/components/bank/atm-network-status"
import { AccountVerification } from "@/components/bank/account-verification"
import { VerificationBadge } from "@/components/bank/verification-badge"
import { mockBankData } from "@/lib/demo-data"

export default function BankPage() {
  return (
    <MainLayout title="Bank Verification Portal">
      {/* Verification Badge Header */}
      <div className="mb-8">
        <VerificationBadge bankData={mockBankData} />
      </div>

      {/* Main verification modules grid */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* System Status Panel */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <SystemStatus bankData={mockBankData} />
        </div>

        {/* Transaction Monitor */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <TransactionMonitor bankData={mockBankData} />
        </div>
      </div>

      {/* Bottom row - ATM Network and Account Verification */}
      <div className="grid grid-cols-2 gap-6">
        {/* ATM Network Status */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <ATMNetworkStatus />
        </div>

        {/* Account Verification Tool */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <AccountVerification />
        </div>
      </div>
    </MainLayout>
  )
}
