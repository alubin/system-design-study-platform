// localStorage utilities for progress tracking

export interface UserProgress {
  topicsCompleted: string[] // topic IDs
  flashcardProgress: Record<string, FlashcardMastery>
  quizScores: QuizScore[]
  problemsCompleted: Record<string, ProblemCompletion>
  studySessions: StudySession[]
  settings: UserSettings
}

export interface FlashcardMastery {
  cardId: string
  level: number // 0-5, higher is better
  lastReviewed: string // ISO date
  nextReview: string // ISO date
  reviewCount: number
  easeFactor: number // SM-2 algorithm
}

export interface QuizScore {
  timestamp: string
  category: string
  correct: number
  total: number
  questions: string[] // question IDs
}

export interface ProblemCompletion {
  problemId: string
  completedAt: string
  timeSpent: number // minutes
  notes: string
}

export interface StudySession {
  startTime: string
  endTime: string
  activity: 'topics' | 'flashcards' | 'practice' | 'quiz'
  itemsStudied: number
}

export interface UserSettings {
  interviewDate: string | null
  dailyGoal: number // minutes
  theme: 'light' | 'dark' | 'system'
  notifications: boolean
}

const STORAGE_KEY = 'system-design-study-progress'

const defaultProgress: UserProgress = {
  topicsCompleted: [],
  flashcardProgress: {},
  quizScores: [],
  problemsCompleted: {},
  studySessions: [],
  settings: {
    interviewDate: null,
    dailyGoal: 30,
    theme: 'dark',
    notifications: true,
  },
}

export function getProgress(): UserProgress {
  if (typeof window === 'undefined') return defaultProgress

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return defaultProgress

    return { ...defaultProgress, ...JSON.parse(stored) }
  } catch (error) {
    console.error('Failed to load progress:', error)
    return defaultProgress
  }
}

export function saveProgress(progress: Partial<UserProgress>): void {
  if (typeof window === 'undefined') return

  try {
    const current = getProgress()
    const updated = { ...current, ...progress }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch (error) {
    console.error('Failed to save progress:', error)
  }
}

export function markTopicComplete(topicId: string): void {
  const progress = getProgress()
  if (!progress.topicsCompleted.includes(topicId)) {
    progress.topicsCompleted.push(topicId)
    saveProgress(progress)
  }
}

export function updateFlashcardProgress(cardId: string, mastery: Partial<FlashcardMastery>): void {
  const progress = getProgress()
  const current = progress.flashcardProgress[cardId] || {
    cardId,
    level: 0,
    lastReviewed: new Date().toISOString(),
    nextReview: new Date().toISOString(),
    reviewCount: 0,
    easeFactor: 2.5,
  }

  progress.flashcardProgress[cardId] = { ...current, ...mastery }
  saveProgress(progress)
}

export function addQuizScore(score: QuizScore): void {
  const progress = getProgress()
  progress.quizScores.push(score)
  saveProgress(progress)
}

export function markProblemComplete(problemId: string, completion: Omit<ProblemCompletion, 'problemId'>): void {
  const progress = getProgress()
  progress.problemsCompleted[problemId] = { problemId, ...completion }
  saveProgress(progress)
}

export function startStudySession(activity: StudySession['activity']): void {
  const progress = getProgress()
  progress.studySessions.push({
    startTime: new Date().toISOString(),
    endTime: new Date().toISOString(),
    activity,
    itemsStudied: 0,
  })
  saveProgress(progress)
}

export function endStudySession(itemsStudied: number): void {
  const progress = getProgress()
  const currentSession = progress.studySessions[progress.studySessions.length - 1]

  if (currentSession) {
    currentSession.endTime = new Date().toISOString()
    currentSession.itemsStudied = itemsStudied
    saveProgress(progress)
  }
}

export function updateSettings(settings: Partial<UserSettings>): void {
  const progress = getProgress()
  progress.settings = { ...progress.settings, ...settings }
  saveProgress(progress)
}

export function exportProgress(): string {
  return JSON.stringify(getProgress(), null, 2)
}

export function importProgress(jsonData: string): boolean {
  try {
    const data = JSON.parse(jsonData)
    saveProgress(data)
    return true
  } catch (error) {
    console.error('Failed to import progress:', error)
    return false
  }
}

export function clearProgress(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

// Analytics helpers
export function getTopicCompletionRate(): number {
  const progress = getProgress()
  // Assuming 20+ topics from content
  const totalTopics = 20
  return (progress.topicsCompleted.length / totalTopics) * 100
}

export function getFlashcardMasteryRate(): number {
  const progress = getProgress()
  const cards = Object.values(progress.flashcardProgress)

  if (cards.length === 0) return 0

  const masteredCards = cards.filter(c => c.level >= 4).length
  return (masteredCards / cards.length) * 100
}

export function getStudyStreak(): number {
  const progress = getProgress()
  const sessions = progress.studySessions

  if (sessions.length === 0) return 0

  let streak = 0
  let currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)

  for (let i = sessions.length - 1; i >= 0; i--) {
    const sessionDate = new Date(sessions[i].startTime)
    sessionDate.setHours(0, 0, 0, 0)

    const diffDays = Math.floor((currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === streak) {
      streak++
    } else if (diffDays > streak) {
      break
    }
  }

  return streak
}

export function getTotalStudyTime(): number {
  const progress = getProgress()

  return progress.studySessions.reduce((total, session) => {
    const start = new Date(session.startTime).getTime()
    const end = new Date(session.endTime).getTime()
    const duration = (end - start) / (1000 * 60) // minutes
    return total + duration
  }, 0)
}

export function getDaysUntilInterview(): number | null {
  const progress = getProgress()

  if (!progress.settings.interviewDate) return null

  const interviewDate = new Date(progress.settings.interviewDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  interviewDate.setHours(0, 0, 0, 0)

  const diffTime = interviewDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}
