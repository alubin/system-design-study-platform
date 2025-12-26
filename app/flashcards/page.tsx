'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Flashcard } from '@/components/flashcard'
import { flashcards, decks } from '@/content/flashcards'
import { getProgress, updateFlashcardProgress } from '@/lib/storage'
import {
  calculateNextReview,
  prioritizeCards,
  getRecommendedStudyCount,
  mapResponseToQuality,
} from '@/lib/spaced-repetition'
import { ArrowLeft, BarChart3, Shuffle, Target } from 'lucide-react'

type StudyMode = 'select' | 'study'

export default function FlashcardsPage() {
  const [mode, setMode] = useState<StudyMode>('select')
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null)
  const [studyCards, setStudyCards] = useState<string[]>([])
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [progress, setProgress] = useState<any>({})
  const [stats, setStats] = useState({ overdue: 0, dueToday: 0, new: 0 })

  useEffect(() => {
    const userProgress = getProgress()
    setProgress(userProgress.flashcardProgress)

    // Calculate stats for all cards
    const allCardIds = flashcards.map(c => c.id)
    const prioritized = prioritizeCards(allCardIds, userProgress.flashcardProgress)

    setStats({
      overdue: prioritized.overdue.length,
      dueToday: prioritized.dueToday.length,
      new: prioritized.new.length,
    })
  }, [])

  const startStudySession = (deckId: string) => {
    const deckCards = flashcards.filter(c => c.deck === deckId).map(c => c.id)
    const userProgress = getProgress()

    const prioritized = prioritizeCards(deckCards, userProgress.flashcardProgress)

    // Combine prioritized cards
    const cardsToStudy = [
      ...prioritized.overdue,
      ...prioritized.dueToday,
      ...prioritized.new.slice(0, 10), // Limit new cards
    ]

    const recommended = getRecommendedStudyCount(
      prioritized.overdue.length,
      prioritized.dueToday.length,
      prioritized.new.length
    )

    setStudyCards(cardsToStudy.slice(0, recommended))
    setCurrentCardIndex(0)
    setSelectedDeck(deckId)
    setMode('study')
  }

  const handleRate = (rating: 'dont-know' | 'hard' | 'good' | 'easy') => {
    const cardId = studyCards[currentCardIndex]
    const currentProgress = progress[cardId] || {
      level: 0,
      easeFactor: 2.5,
    }

    const quality = mapResponseToQuality(rating)
    const schedule = calculateNextReview(
      currentProgress.level || 0,
      currentProgress.easeFactor || 2.5,
      quality
    )

    updateFlashcardProgress(cardId, {
      level: schedule.level,
      easeFactor: schedule.easeFactor,
      lastReviewed: new Date().toISOString(),
      nextReview: schedule.nextReview.toISOString(),
      reviewCount: (currentProgress.reviewCount || 0) + 1,
    })

    // Move to next card or end session
    if (currentCardIndex < studyCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1)
    } else {
      // Session complete
      setMode('select')
      setSelectedDeck(null)

      // Refresh stats
      const userProgress = getProgress()
      const allCardIds = flashcards.map(c => c.id)
      const prioritized = prioritizeCards(allCardIds, userProgress.flashcardProgress)
      setStats({
        overdue: prioritized.overdue.length,
        dueToday: prioritized.dueToday.length,
        new: prioritized.new.length,
      })
    }
  }

  const currentCard = studyCards[currentCardIndex]
    ? flashcards.find(c => c.id === studyCards[currentCardIndex])
    : null

  // Handle keyboard shortcuts
  useEffect(() => {
    if (mode !== 'study') return

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '1') handleRate('dont-know')
      else if (e.key === '2') handleRate('hard')
      else if (e.key === '3') handleRate('good')
      else if (e.key === '4') handleRate('easy')
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [mode, currentCardIndex, studyCards, handleRate])

  if (mode === 'study' && currentCard) {
    return (
      <main className="min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Study Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                onClick={() => {
                  setMode('select')
                  setSelectedDeck(null)
                }}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Exit Study Session
              </Button>

              <Badge variant="secondary">
                Card {currentCardIndex + 1} of {studyCards.length}
              </Badge>
            </div>

            <Progress value={((currentCardIndex + 1) / studyCards.length) * 100} className="h-2" />
          </div>

          {/* Flashcard */}
          <Flashcard
            front={currentCard.front}
            back={currentCard.back}
            onRate={handleRate}
            showRating={true}
          />

          {/* Progress Info */}
          <Card className="mt-8">
            <CardContent className="p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {studyCards.length - currentCardIndex - 1} cards remaining
                </span>
                <span className="text-muted-foreground">
                  Deck: {decks.find(d => d.id === selectedDeck)?.name}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>

          <h1 className="text-4xl font-bold mb-2">Flashcards</h1>
          <p className="text-muted-foreground">
            Master system design concepts with spaced repetition
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="w-4 h-4 text-red-500" />
                Overdue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.overdue}</div>
              <p className="text-xs text-muted-foreground mt-1">cards need review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-500" />
                Due Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.dueToday}</div>
              <p className="text-xs text-muted-foreground mt-1">scheduled for today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Shuffle className="w-4 h-4 text-green-500" />
                New Cards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.new}</div>
              <p className="text-xs text-muted-foreground mt-1">not yet studied</p>
            </CardContent>
          </Card>
        </div>

        {/* Deck Selection */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Select a Deck</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {decks.map((deck) => {
              const deckCards = flashcards.filter(c => c.deck === deck.id)
              const userProgress = getProgress()
              const deckCardIds = deckCards.map(c => c.id)
              const prioritized = prioritizeCards(deckCardIds, userProgress.flashcardProgress)

              const totalDue = prioritized.overdue.length + prioritized.dueToday.length
              const masteredCards = deckCardIds.filter(id => {
                const card = userProgress.flashcardProgress[id]
                return card && card.level >= 4
              }).length

              const masteryRate = deckCards.length > 0
                ? (masteredCards / deckCards.length) * 100
                : 0

              return (
                <Card key={deck.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>{deck.name}</CardTitle>
                    <CardDescription>{deck.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Mastery</span>
                          <span className="font-medium">{Math.round(masteryRate)}%</span>
                        </div>
                        <Progress value={masteryRate} className="h-2" />
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Cards:</span>
                        <span className="font-medium">{deckCards.length}</span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Due for Review:</span>
                        <Badge variant={totalDue > 0 ? 'default' : 'secondary'}>
                          {totalDue}
                        </Badge>
                      </div>

                      <Button
                        className="w-full"
                        onClick={() => startStudySession(deck.id)}
                        disabled={totalDue === 0 && prioritized.new.length === 0}
                      >
                        {totalDue > 0 ? `Study ${totalDue} Cards` : 'Start Learning'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </main>
  )
}
