'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { quizQuestions } from '@/content/quiz'
import { addQuizScore, getProgress } from '@/lib/storage'
import { ArrowLeft, CheckCircle2, XCircle, BarChart3, TrendingUp } from 'lucide-react'

type QuizMode = 'select' | 'quiz' | 'results'

export default function QuizPage() {
  const [mode, setMode] = useState<QuizMode>('select')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [questions, setQuestions] = useState<typeof quizQuestions>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [showExplanation, setShowExplanation] = useState(false)
  const [quizHistory, setQuizHistory] = useState<any[]>([])

  useEffect(() => {
    const progress = getProgress()
    setQuizHistory(progress.quizScores)
  }, [])

  const categories = [
    { id: 'all', name: 'All Topics', count: quizQuestions.length },
    { id: 'data-pipeline', name: 'Data Pipeline & Sync', count: quizQuestions.filter(q => q.category === 'data-pipeline').length },
    { id: 'distributed', name: 'Distributed Systems', count: quizQuestions.filter(q => q.category === 'distributed').length },
    { id: 'multi-tenant', name: 'Multi-Tenant SaaS', count: quizQuestions.filter(q => q.category === 'multi-tenant').length },
    { id: 'access-control', name: 'Access Control', count: quizQuestions.filter(q => q.category === 'access-control').length },
    { id: 'reliability', name: 'Reliability & Observability', count: quizQuestions.filter(q => q.category === 'reliability').length },
    { id: 'storage', name: 'Storage & Databases', count: quizQuestions.filter(q => q.category === 'storage').length },
  ]

  const startQuiz = (category: string) => {
    const filtered = category === 'all'
      ? quizQuestions
      : quizQuestions.filter(q => q.category === category)

    // Shuffle questions
    const shuffled = [...filtered].sort(() => Math.random() - 0.5).slice(0, 10)

    setQuestions(shuffled)
    setSelectedCategory(category)
    setCurrentIndex(0)
    setAnswers({})
    setShowExplanation(false)
    setMode('quiz')
  }

  const handleAnswer = () => {
    const currentQ = questions[currentIndex]
    setAnswers({ ...answers, [currentIndex]: selectedAnswer })
    setShowExplanation(true)
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setSelectedAnswer('')
      setShowExplanation(false)
    } else {
      // Quiz complete
      const correct = questions.filter((q, i) => {
        const answer = answers[i]
        if (q.type === 'multiple-choice') {
          return answer === q.options![Number(q.correctAnswer)].toString()
        } else {
          return answer === q.correctAnswer.toString()
        }
      }).length

      addQuizScore({
        timestamp: new Date().toISOString(),
        category: selectedCategory || 'all',
        correct,
        total: questions.length,
        questions: questions.map(q => q.id),
      })

      setMode('results')
    }
  }

  const isCorrect = () => {
    const currentQ = questions[currentIndex]
    if (!selectedAnswer) return false

    if (currentQ.type === 'multiple-choice') {
      return selectedAnswer === currentQ.options![Number(currentQ.correctAnswer)]
    } else {
      return selectedAnswer === currentQ.correctAnswer.toString()
    }
  }

  if (mode === 'results') {
    const correct = questions.filter((q, i) => {
      const answer = answers[i]
      if (q.type === 'multiple-choice') {
        return answer === q.options![Number(q.correctAnswer)]
      } else {
        return answer === q.correctAnswer.toString()
      }
    }).length

    const percentage = (correct / questions.length) * 100

    return (
      <main className="min-h-screen p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl mb-4">Quiz Complete!</CardTitle>
              <CardDescription>
                Here&apos;s how you did
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Score */}
              <div className="text-center">
                <div className="text-6xl font-bold mb-2">
                  {Math.round(percentage)}%
                </div>
                <p className="text-muted-foreground">
                  {correct} out of {questions.length} correct
                </p>
              </div>

              <Progress value={percentage} className="h-4" />

              {/* Performance Feedback */}
              <div className={`p-4 rounded-lg border ${
                percentage >= 80
                  ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
                  : percentage >= 60
                  ? 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800'
                  : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
              }`}>
                <h3 className="font-semibold mb-2">
                  {percentage >= 80
                    ? '🎉 Excellent work!'
                    : percentage >= 60
                    ? '👍 Good effort!'
                    : '📚 Keep studying!'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {percentage >= 80
                    ? 'You have a strong understanding of these concepts. Keep it up!'
                    : percentage >= 60
                    ? 'You\'re on the right track. Review the topics you missed and try again.'
                    : 'Consider reviewing the topics covered in this quiz and trying again.'}
                </p>
              </div>

              {/* Question Review */}
              <div className="space-y-3">
                <h3 className="font-semibold">Question Review</h3>
                {questions.map((q, i) => {
                  const userAnswer = answers[i]
                  let isCorrectAnswer = false

                  if (q.type === 'multiple-choice') {
                    isCorrectAnswer = userAnswer === q.options![Number(q.correctAnswer)]
                  } else {
                    isCorrectAnswer = userAnswer === q.correctAnswer.toString()
                  }

                  return (
                    <div
                      key={q.id}
                      className={`p-3 rounded-lg border ${
                        isCorrectAnswer
                          ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
                          : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {isCorrectAnswer ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium mb-1">
                            Q{i + 1}: {q.question}
                          </p>
                          {!isCorrectAnswer && (
                            <p className="text-xs text-muted-foreground">
                              {q.explanation}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button onClick={() => startQuiz(selectedCategory || 'all')} className="flex-1">
                  Try Again
                </Button>
                <Button
                  onClick={() => setMode('select')}
                  variant="outline"
                  className="flex-1"
                >
                  New Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  if (mode === 'quiz') {
    const currentQ = questions[currentIndex]
    const progress = ((currentIndex + 1) / questions.length) * 100

    return (
      <main className="min-h-screen p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" onClick={() => setMode('select')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Exit Quiz
              </Button>
              <Badge variant="secondary">
                Question {currentIndex + 1} of {questions.length}
              </Badge>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Badge>{currentQ.category}</Badge>
                <Badge variant="outline">{currentQ.difficulty}</Badge>
              </div>
              <CardTitle className="text-xl">{currentQ.question}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Answer Options */}
              {currentQ.type === 'multiple-choice' && (
                <RadioGroup
                  value={selectedAnswer}
                  onValueChange={setSelectedAnswer}
                  disabled={showExplanation}
                >
                  <div className="space-y-3">
                    {currentQ.options?.map((option, i) => (
                      <div
                        key={i}
                        className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors ${
                          showExplanation
                            ? option === currentQ.options![Number(currentQ.correctAnswer)]
                              ? 'bg-green-50 dark:bg-green-950 border-green-500'
                              : selectedAnswer === option && !isCorrect()
                              ? 'bg-red-50 dark:bg-red-950 border-red-500'
                              : ''
                            : selectedAnswer === option
                            ? 'border-primary bg-primary/5'
                            : 'hover:border-muted-foreground/50'
                        }`}
                      >
                        <RadioGroupItem value={option} id={`option-${i}`} />
                        <Label htmlFor={`option-${i}`} className="flex-1 cursor-pointer">
                          {option}
                        </Label>
                        {showExplanation && option === currentQ.options![Number(currentQ.correctAnswer)] && (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        )}
                        {showExplanation && selectedAnswer === option && !isCorrect() && (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              )}

              {currentQ.type === 'true-false' && (
                <RadioGroup
                  value={selectedAnswer}
                  onValueChange={setSelectedAnswer}
                  disabled={showExplanation}
                >
                  <div className="space-y-3">
                    {['true', 'false'].map((option) => (
                      <div
                        key={option}
                        className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors ${
                          showExplanation
                            ? option === currentQ.correctAnswer.toString()
                              ? 'bg-green-50 dark:bg-green-950 border-green-500'
                              : selectedAnswer === option && !isCorrect()
                              ? 'bg-red-50 dark:bg-red-950 border-red-500'
                              : ''
                            : selectedAnswer === option
                            ? 'border-primary bg-primary/5'
                            : 'hover:border-muted-foreground/50'
                        }`}
                      >
                        <RadioGroupItem value={option} id={option} />
                        <Label htmlFor={option} className="flex-1 cursor-pointer capitalize">
                          {option}
                        </Label>
                        {showExplanation && option === currentQ.correctAnswer.toString() && (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        )}
                        {showExplanation && selectedAnswer === option && !isCorrect() && (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              )}

              {/* Explanation */}
              {showExplanation && (
                <div className={`p-4 rounded-lg border ${
                  isCorrect()
                    ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
                }`}>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    {isCorrect() ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        Correct!
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-red-600" />
                        Incorrect
                      </>
                    )}
                  </h4>
                  <p className="text-sm">{currentQ.explanation}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                {!showExplanation ? (
                  <Button
                    onClick={handleAnswer}
                    disabled={!selectedAnswer}
                    className="w-full"
                  >
                    Check Answer
                  </Button>
                ) : (
                  <Button onClick={handleNext} className="w-full">
                    {currentIndex < questions.length - 1 ? 'Next Question' : 'See Results'}
                  </Button>
                )}
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

          <h1 className="text-4xl font-bold mb-2">Quiz</h1>
          <p className="text-muted-foreground">
            Test your knowledge with curated questions
          </p>
        </div>

        {/* Quiz History */}
        {quizHistory.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Recent Scores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {quizHistory.slice(-3).reverse().map((score, i) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold mb-1">
                      {Math.round((score.correct / score.total) * 100)}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {score.correct}/{score.total} correct
                    </div>
                    <Badge variant="secondary" className="mt-2">
                      {score.category}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Category Selection */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Select Quiz Category</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((category) => (
              <Card
                key={category.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => startQuiz(category.id)}
              >
                <CardHeader>
                  <CardTitle>{category.name}</CardTitle>
                  <CardDescription>
                    {category.count} question{category.count !== 1 ? 's' : ''} available
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    Start Quiz
                    {category.id === 'all' && ' (10 random questions)'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
