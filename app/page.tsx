'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ProgressRing } from '@/components/progress-ring'
import {
  getProgress,
  getTopicCompletionRate,
  getFlashcardMasteryRate,
  getStudyStreak,
  getDaysUntilInterview,
  getTotalStudyTime,
} from '@/lib/storage'
import { categories } from '@/content/topics'
import { Book, Calendar, Clock, Flame, GraduationCap, Target, TrendingUp } from 'lucide-react'

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [progress, setProgress] = useState({
    topicCompletion: 0,
    flashcardMastery: 0,
    studyStreak: 0,
    daysUntil: null as number | null,
    totalStudyTime: 0,
  })

  useEffect(() => {
    setMounted(true)
    const userProgress = getProgress()

    setProgress({
      topicCompletion: getTopicCompletionRate(),
      flashcardMastery: getFlashcardMasteryRate(),
      studyStreak: getStudyStreak(),
      daysUntil: getDaysUntilInterview(),
      totalStudyTime: getTotalStudyTime(),
    })
  }, [])

  if (!mounted) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-10 bg-muted rounded w-1/3 mb-4"></div>
            <div className="h-6 bg-muted rounded w-1/2"></div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">System Design Interview Prep</h1>
          <p className="text-muted-foreground">
            Master system design concepts for your upcoming interview
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Days Until Interview */}
          {progress.daysUntil !== null && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Interview Countdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {progress.daysUntil > 0 ? progress.daysUntil : 'Today!'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {progress.daysUntil > 0 ? 'days remaining' : 'Good luck!'}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Study Streak */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                Study Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{progress.studyStreak}</div>
              <p className="text-xs text-muted-foreground mt-1">days in a row</p>
            </CardContent>
          </Card>

          {/* Total Study Time */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                Total Study Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {Math.round(progress.totalStudyTime)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">minutes logged</p>
            </CardContent>
          </Card>

          {/* Topics Completed */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-green-500" />
                Topics Mastered
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {Math.round(progress.topicCompletion)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">completion rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Your Progress</CardTitle>
              <CardDescription>Track your mastery across all categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {categories.map(category => (
                  <div key={category.id}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">{category.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(Math.random() * 100)}%
                      </span>
                    </div>
                    <Progress value={Math.random() * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Overall Mastery</CardTitle>
              <CardDescription>Combined progress across all areas</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <ProgressRing
                progress={(progress.topicCompletion + progress.flashcardMastery) / 2}
                size={160}
                strokeWidth={12}
                className="mb-4"
              />
              <div className="text-center mt-4">
                <div className="text-sm text-muted-foreground mb-2">Breakdown</div>
                <div className="flex gap-4 text-xs">
                  <div>
                    <div className="font-medium">Topics</div>
                    <div className="text-muted-foreground">
                      {Math.round(progress.topicCompletion)}%
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Flashcards</div>
                    <div className="text-muted-foreground">
                      {Math.round(progress.flashcardMastery)}%
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Continue Learning</CardTitle>
            <CardDescription>Pick up where you left off</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/topics/data-pipeline">
                <Button variant="outline" className="w-full h-auto py-6 flex-col gap-2">
                  <Book className="w-6 h-6" />
                  <span className="font-medium">Study Topics</span>
                  <span className="text-xs text-muted-foreground">
                    Deep-dive into concepts
                  </span>
                </Button>
              </Link>

              <Link href="/flashcards">
                <Button variant="outline" className="w-full h-auto py-6 flex-col gap-2">
                  <Target className="w-6 h-6" />
                  <span className="font-medium">Review Flashcards</span>
                  <span className="text-xs text-muted-foreground">
                    Spaced repetition
                  </span>
                </Button>
              </Link>

              <Link href="/practice">
                <Button variant="outline" className="w-full h-auto py-6 flex-col gap-2">
                  <TrendingUp className="w-6 h-6" />
                  <span className="font-medium">Practice Problems</span>
                  <span className="text-xs text-muted-foreground">
                    System design scenarios
                  </span>
                </Button>
              </Link>

              <Link href="/quiz">
                <Button variant="outline" className="w-full h-auto py-6 flex-col gap-2">
                  <GraduationCap className="w-6 h-6" />
                  <span className="font-medium">Take Quiz</span>
                  <span className="text-xs text-muted-foreground">
                    Test your knowledge
                  </span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Topics by Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(category => (
            <Link key={category.id} href={`/topics/${category.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                  <CardDescription>
                    {Math.round(Math.random() * 8) + 2} topics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Progress value={Math.random() * 100} className="h-2 flex-1 mr-4" />
                    <Badge variant="secondary">
                      {Math.round(Math.random() * 100)}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
