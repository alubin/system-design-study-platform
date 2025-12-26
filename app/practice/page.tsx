'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { problems } from '@/content/problems'
import { getProgress } from '@/lib/storage'
import { ArrowLeft, CheckCircle2, Clock, TrendingUp } from 'lucide-react'

export default function PracticePage() {
  const [completedProblems, setCompletedProblems] = useState<Record<string, any>>({})

  useEffect(() => {
    const progress = getProgress()
    setCompletedProblems(progress.problemsCompleted)
  }, [])

  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    advanced: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
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

          <h1 className="text-4xl font-bold mb-2">Practice Problems</h1>
          <p className="text-muted-foreground">
            Apply your knowledge with real-world system design scenarios
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Problems</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{problems.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {Object.keys(completedProblems).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {problems.length - Object.keys(completedProblems).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Problems List */}
        <div className="space-y-4">
          {problems.map((problem) => {
            const isCompleted = completedProblems[problem.id]

            return (
              <Card key={problem.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-xl">{problem.title}</CardTitle>
                        {isCompleted && (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                      <CardDescription className="line-clamp-2">
                        {problem.description}
                      </CardDescription>
                    </div>
                    <Badge className={difficultyColors[problem.difficulty]}>
                      {problem.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {problem.estimatedTime} min
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <TrendingUp className="w-4 h-4" />
                      {problem.category}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline">
                      {problem.functionalRequirements.length} requirements
                    </Badge>
                    <Badge variant="outline">
                      {problem.hints.length} hints available
                    </Badge>
                    <Badge variant="outline">
                      Full solution included
                    </Badge>
                  </div>

                  {isCompleted && (
                    <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4">
                      <div className="text-sm text-green-800 dark:text-green-200">
                        ✓ Completed{' '}
                        {isCompleted.timeSpent && `in ${isCompleted.timeSpent} min`}
                      </div>
                    </div>
                  )}

                  <Link href={`/practice/${problem.id}`}>
                    <Button className="w-full">
                      {isCompleted ? 'Review Solution' : 'Start Problem'}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </main>
  )
}
