"use client"

import { Button } from "@/components/ui/button"
import { SkipBack, Play, Pause, SkipForward, X } from "lucide-react"

interface ReplayModeProps {
  isPlaying: boolean
  setIsPlaying: (playing: boolean) => void
  progress: number
  setProgress: (progress: number) => void
  speed: number
  setSpeed: (speed: number) => void
  onClose: () => void
}

export function ReplayMode({
  isPlaying,
  setIsPlaying,
  progress,
  setProgress,
  speed,
  setSpeed,
  onClose,
}: ReplayModeProps) {
  const totalMinutes = 45
  const currentMinutes = Math.round((progress / 100) * totalMinutes)

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />

      <div className="relative bg-card border border-border rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-4 space-y-6 animate-in zoom-in-95">
        <div className="flex items-center justify-between">
          <h3 className="text-lg md:text-xl font-bold text-foreground">Crisis Replay Mode</h3>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Playback Controls */}
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setProgress(Math.max(0, progress - 10))}
              className="h-10 w-10 p-0"
            >
              <SkipBack className="w-5 h-5" />
            </Button>

            <Button variant="outline" size="sm" onClick={() => setIsPlaying(!isPlaying)} className="h-10 w-10 p-0">
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setProgress(Math.min(100, progress + 10))}
              className="h-10 w-10 p-0"
            >
              <SkipForward className="w-5 h-5" />
            </Button>
          </div>

          {/* Speed Controls */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-muted-foreground">Speed:</span>
            {[1, 5, 10, 30].map((s) => (
              <Button key={s} variant={speed === s ? "default" : "outline"} size="sm" onClick={() => setSpeed(s)}>
                {s}x
              </Button>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full cursor-pointer"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{currentMinutes}:00</span>
              <span>{totalMinutes}:00</span>
            </div>
          </div>

          {/* Status */}
          <div className="text-center p-3 bg-muted/30 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">
              Phase: <span className="font-semibold text-foreground">AMPLIFICATION</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">Posts: 234 | Sentiment: -0.62 | Threats: 23</p>
          </div>

          {/* Close Button */}
          <Button onClick={onClose} className="w-full">
            Exit Replay Mode
          </Button>
        </div>
      </div>
    </div>
  )
}
