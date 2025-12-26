// Simplified SM-2 spaced repetition algorithm

export interface ReviewResult {
  quality: 0 | 1 | 2 | 3 | 4 | 5 // 0 = don't know, 5 = perfect
}

export interface CardSchedule {
  level: number
  easeFactor: number
  interval: number // days until next review
  nextReview: Date
}

/**
 * Calculate next review schedule based on SM-2 algorithm
 *
 * @param currentLevel Current mastery level (0-5)
 * @param currentEaseFactor Current ease factor (starts at 2.5)
 * @param quality User's self-assessment (0-5)
 * @returns New schedule for the card
 */
export function calculateNextReview(
  currentLevel: number,
  currentEaseFactor: number,
  quality: ReviewResult['quality']
): CardSchedule {
  // If quality < 3, reset the card (forgot it)
  if (quality < 3) {
    return {
      level: 0,
      easeFactor: Math.max(1.3, currentEaseFactor - 0.2),
      interval: 0,
      nextReview: new Date(), // Review again immediately
    }
  }

  // Calculate new ease factor
  const newEaseFactor = Math.max(
    1.3,
    currentEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  )

  // Calculate interval based on level
  let interval: number
  if (currentLevel === 0) {
    interval = 1 // 1 day
  } else if (currentLevel === 1) {
    interval = 6 // 6 days
  } else {
    interval = Math.round(currentLevel * newEaseFactor)
  }

  const nextReview = new Date()
  nextReview.setDate(nextReview.getDate() + interval)

  return {
    level: currentLevel + 1,
    easeFactor: newEaseFactor,
    interval,
    nextReview,
  }
}

/**
 * Get cards due for review
 *
 * @param cards All flashcard progress records
 * @returns Cards that should be reviewed now
 */
export function getCardsDueForReview(
  cards: Record<string, { nextReview: string }>
): string[] {
  const now = new Date()

  return Object.keys(cards).filter(cardId => {
    const nextReview = new Date(cards[cardId].nextReview)
    return nextReview <= now
  })
}

/**
 * Prioritize cards for study session
 * Returns cards in order: overdue, due today, new cards
 */
export function prioritizeCards(
  allCardIds: string[],
  progress: Record<string, { nextReview: string; level: number }>
): { overdue: string[]; dueToday: string[]; new: string[] } {
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const overdue: string[] = []
  const dueToday: string[] = []
  const newCards: string[] = []

  allCardIds.forEach(cardId => {
    const card = progress[cardId]

    if (!card) {
      newCards.push(cardId)
      return
    }

    const nextReview = new Date(card.nextReview)
    nextReview.setHours(0, 0, 0, 0)

    if (nextReview < now) {
      overdue.push(cardId)
    } else if (nextReview.getTime() === now.getTime()) {
      dueToday.push(cardId)
    }
  })

  return { overdue, dueToday, new: newCards }
}

/**
 * Get recommended number of cards to study per session
 */
export function getRecommendedStudyCount(
  overdueCount: number,
  dueTodayCount: number,
  newCount: number
): number {
  // Priority: overdue > due today > new
  // Aim for 20-30 cards per session
  const target = 25

  if (overdueCount >= target) return Math.min(overdueCount, 30)
  if (overdueCount + dueTodayCount >= target) return overdueCount + Math.min(dueTodayCount, target - overdueCount)

  const remaining = target - overdueCount - dueTodayCount
  return overdueCount + dueTodayCount + Math.min(newCount, remaining)
}

/**
 * Map user's button choice to quality rating
 */
export function mapResponseToQuality(response: 'dont-know' | 'hard' | 'good' | 'easy'): ReviewResult['quality'] {
  const mapping = {
    'dont-know': 0,
    'hard': 3,
    'good': 4,
    'easy': 5,
  } as const

  return mapping[response]
}
