"use client"

import { useState } from "react"
import { X, Play, RotateCcw, Zap } from "lucide-react"

interface CrisisLauncherProps {
  isOpen: boolean
  onClose: () => void
}

export function CrisisLauncher({ isOpen, onClose }: CrisisLauncherProps) {
  const [selectedScenario, setSelectedScenario] = useState("account-freeze")
  const [isRunning, setIsRunning] = useState(false)
  const [speed, setSpeed] = useState(1)

  const scenarios = [
    { id: "account-freeze", label: "Account Freeze Crisis", duration: "15 mins" },
    { id: "atm-outage", label: "ATM Network Outage", duration: "12 mins" },
    { id: "transfer-failure", label: "Mass Transfer Failures", duration: "10 mins" },
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card border border-border rounded-lg shadow-lg max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Demo Crisis Launcher
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Scenario selector */}
          <div>
            <label className="text-sm font-semibold text-foreground block mb-2">Select Crisis Scenario</label>
            <select
              value={selectedScenario}
              onChange={(e) => setSelectedScenario(e.target.value)}
              className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground text-sm"
            >
              {scenarios.map((scenario) => (
                <option key={scenario.id} value={scenario.id}>
                  {scenario.label} ({scenario.duration})
                </option>
              ))}
            </select>
          </div>

          {/* Speed control */}
          <div>
            <label className="text-sm font-semibold text-foreground block mb-2">Simulation Speed</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0.5"
                max="10"
                step="0.5"
                value={speed}
                onChange={(e) => setSpeed(Number.parseFloat(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm font-mono text-muted-foreground w-8">{speed}x</span>
            </div>
          </div>

          {/* Status */}
          <div
            className={`p-3 rounded-lg border ${
              isRunning ? "bg-green-500/10 border-green-500/30" : "bg-muted/50 border-border"
            }`}
          >
            <p className="text-xs text-muted-foreground">
              {isRunning ? "🟢 Simulation running" : "⚪ Ready to launch"}
            </p>
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`flex-1 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                isRunning
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
            >
              {isRunning ? (
                <>
                  <X className="w-4 h-4" />
                  Stop
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Start Crisis
                </>
              )}
            </button>
            <button
              onClick={() => setIsRunning(false)}
              className="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
