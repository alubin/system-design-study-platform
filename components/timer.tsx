'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Pause, Play, RotateCcw } from 'lucide-react'

interface TimerProps {
  initialMinutes: number
  onComplete?: () => void
  autoStart?: boolean
}

export function Timer({ initialMinutes, onComplete, autoStart = false }: TimerProps) {
  const [seconds, setSeconds] = useState(initialMinutes * 60)
  const [isRunning, setIsRunning] = useState(autoStart)
  const [hasCompleted, setHasCompleted] = useState(false)

  useEffect(() => {
    if (!isRunning || seconds <= 0) return

    const interval = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          setIsRunning(false)
          setHasCompleted(true)
          onComplete?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, seconds, onComplete])

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const reset = () => {
    setSeconds(initialMinutes * 60)
    setIsRunning(false)
    setHasCompleted(false)
  }

  const toggle = () => setIsRunning(!isRunning)

  const progress = ((initialMinutes * 60 - seconds) / (initialMinutes * 60)) * 100

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-card rounded-lg border">
      <div className="text-5xl font-mono font-bold tabular-nums">
        {formatTime(seconds)}
      </div>

      <div className="w-full bg-muted rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex gap-2">
        <Button onClick={toggle} size="sm" variant={isRunning ? 'secondary' : 'default'}>
          {isRunning ? (
            <>
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              {hasCompleted ? 'Restart' : 'Start'}
            </>
          )}
        </Button>
        <Button onClick={reset} size="sm" variant="outline">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      {hasCompleted && (
        <div className="text-sm text-green-600 dark:text-green-400 font-medium">
          Time&apos;s up!
        </div>
      )}
    </div>
  )
}
