'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RotateCw } from 'lucide-react'

interface FlashcardProps {
  front: string
  back: string
  onRate?: (rating: 'dont-know' | 'hard' | 'good' | 'easy') => void
  showRating?: boolean
}

export function Flashcard({ front, back, onRate, showRating = false }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  const handleFlip = () => setIsFlipped(!isFlipped)

  const handleRate = (rating: 'dont-know' | 'hard' | 'good' | 'easy') => {
    onRate?.(rating)
    setIsFlipped(false)
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card
        className="min-h-[300px] cursor-pointer hover:shadow-lg transition-shadow"
        onClick={!isFlipped ? handleFlip : undefined}
      >
        <div className="p-8 flex flex-col items-center justify-center min-h-[300px]">
          {!isFlipped ? (
            <>
              <div className="text-sm text-muted-foreground mb-4">Question</div>
              <div className="text-xl text-center font-medium">{front}</div>
              <div className="mt-6 text-sm text-muted-foreground flex items-center gap-2">
                <RotateCw className="w-4 h-4" />
                Click to reveal answer
              </div>
            </>
          ) : (
            <>
              <div className="text-sm text-muted-foreground mb-4">Answer</div>
              <div className="text-lg text-center mb-6">{back}</div>

              {showRating && onRate && (
                <div className="flex flex-col gap-3 w-full mt-4">
                  <div className="text-sm text-center text-muted-foreground mb-2">
                    How well did you know this?
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <Button
                      onClick={() => handleRate('dont-know')}
                      variant="outline"
                      className="bg-red-50 hover:bg-red-100 dark:bg-red-950 dark:hover:bg-red-900 border-red-200 dark:border-red-800"
                    >
                      Don&apos;t Know
                    </Button>
                    <Button
                      onClick={() => handleRate('hard')}
                      variant="outline"
                      className="bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-950 dark:hover:bg-yellow-900 border-yellow-200 dark:border-yellow-800"
                    >
                      Hard
                    </Button>
                    <Button
                      onClick={() => handleRate('good')}
                      variant="outline"
                      className="bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900 border-blue-200 dark:border-blue-800"
                    >
                      Good
                    </Button>
                    <Button
                      onClick={() => handleRate('easy')}
                      variant="outline"
                      className="bg-green-50 hover:bg-green-100 dark:bg-green-950 dark:hover:bg-green-900 border-green-200 dark:border-green-800"
                    >
                      Easy
                    </Button>
                  </div>
                </div>
              )}

              {!showRating && (
                <Button onClick={handleFlip} variant="outline" className="mt-4">
                  <RotateCw className="w-4 h-4 mr-2" />
                  Next Card
                </Button>
              )}
            </>
          )}
        </div>
      </Card>

      {/* Keyboard shortcuts hint */}
      {!isFlipped && (
        <div className="mt-4 text-center text-xs text-muted-foreground">
          Press <kbd className="px-2 py-1 bg-muted rounded">Space</kbd> to flip
        </div>
      )}
      {isFlipped && showRating && (
        <div className="mt-4 text-center text-xs text-muted-foreground">
          Press <kbd className="px-2 py-1 bg-muted rounded">1</kbd>-
          <kbd className="px-2 py-1 bg-muted rounded">4</kbd> to rate
        </div>
      )}
    </div>
  )
}
