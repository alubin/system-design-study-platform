'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Timer } from '@/components/timer'
import { problems } from '@/content/problems'
import { markProblemComplete } from '@/lib/storage'
import { ArrowLeft, CheckCircle2, Lightbulb, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

export default function ProblemPage() {
  const params = useParams()
  const router = useRouter()
  const problemId = params.problemId as string

  const problem = problems.find(p => p.id === problemId)
  const [notes, setNotes] = useState('')
  const [showSolution, setShowSolution] = useState(false)
  const [revealedHints, setRevealedHints] = useState<number[]>([])
  const [startTime] = useState(Date.now())

  // Auto-save notes to localStorage
  useEffect(() => {
    const key = `problem-notes-${problemId}`
    const saved = localStorage.getItem(key)
    if (saved) setNotes(saved)
  }, [problemId])

  useEffect(() => {
    const key = `problem-notes-${problemId}`
    const timer = setTimeout(() => {
      localStorage.setItem(key, notes)
    }, 500)
    return () => clearTimeout(timer)
  }, [notes, problemId])

  if (!problem) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Problem not found</h1>
          <Link href="/practice">
            <Button>Back to Problems</Button>
          </Link>
        </div>
      </main>
    )
  }

  const handleComplete = () => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000 / 60)
    markProblemComplete(problemId, {
      completedAt: new Date().toISOString(),
      timeSpent,
      notes,
    })
    router.push('/practice')
  }

  const toggleHint = (index: number) => {
    setRevealedHints(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/practice">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Problems
            </Button>
          </Link>

          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{problem.title}</h1>
              <div className="flex items-center gap-3">
                <Badge>{problem.difficulty}</Badge>
                <Badge variant="outline">{problem.category}</Badge>
                <Badge variant="outline">{problem.estimatedTime} min</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Main Layout - Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Problem Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Problem Description */}
            <Card>
              <CardHeader>
                <CardTitle>Problem Statement</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{problem.description}</p>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="functional">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="functional">Functional</TabsTrigger>
                    <TabsTrigger value="non-functional">Non-Functional</TabsTrigger>
                    <TabsTrigger value="constraints">Constraints</TabsTrigger>
                  </TabsList>

                  <TabsContent value="functional" className="mt-4">
                    <ul className="space-y-2">
                      {problem.functionalRequirements.map((req, i) => (
                        <li key={i} className="flex gap-2 text-sm">
                          <span className="text-primary mt-1">•</span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </TabsContent>

                  <TabsContent value="non-functional" className="mt-4">
                    <ul className="space-y-2">
                      {problem.nonFunctionalRequirements.map((req, i) => (
                        <li key={i} className="flex gap-2 text-sm">
                          <span className="text-primary mt-1">•</span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </TabsContent>

                  <TabsContent value="constraints" className="mt-4">
                    <ul className="space-y-2">
                      {problem.constraints.map((constraint, i) => (
                        <li key={i} className="flex gap-2 text-sm">
                          <span className="text-orange-500 mt-1">!</span>
                          <span>{constraint}</span>
                        </li>
                      ))}
                    </ul>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Hints */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  Hints
                </CardTitle>
                <CardDescription>
                  Reveal hints one at a time if you get stuck
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {problem.hints.map((hint, index) => (
                    <div key={index}>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                        onClick={() => toggleHint(index)}
                      >
                        <span>Hint {index + 1}: {hint.title}</span>
                        {revealedHints.includes(index) ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>

                      {revealedHints.includes(index) && (
                        <div className="mt-2 p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                          <p className="text-sm">{hint.content}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Solution */}
            <Card className="border-2 border-dashed">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Sample Solution</CardTitle>
                  <Button
                    variant={showSolution ? 'secondary' : 'default'}
                    onClick={() => setShowSolution(!showSolution)}
                  >
                    {showSolution ? (
                      <>
                        <EyeOff className="w-4 h-4 mr-2" />
                        Hide Solution
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        Reveal Solution
                      </>
                    )}
                  </Button>
                </div>
                {!showSolution && (
                  <CardDescription>
                    Try solving the problem first before looking at the solution
                  </CardDescription>
                )}
              </CardHeader>

              {showSolution && (
                <CardContent className="space-y-6">
                  {/* Overview */}
                  <div>
                    <h3 className="font-semibold mb-2">Overview</h3>
                    <p className="text-sm text-muted-foreground">
                      {problem.sampleSolution.overview}
                    </p>
                  </div>

                  <Separator />

                  {/* Components */}
                  <div>
                    <h3 className="font-semibold mb-3">System Components</h3>
                    <Accordion type="single" collapsible>
                      {problem.sampleSolution.components.map((component, i) => (
                        <AccordionItem key={i} value={`component-${i}`}>
                          <AccordionTrigger className="text-sm">
                            {component.name}
                            {component.technology && (
                              <Badge variant="secondary" className="ml-2">
                                {component.technology}
                              </Badge>
                            )}
                          </AccordionTrigger>
                          <AccordionContent>
                            <p className="text-sm text-muted-foreground">
                              {component.description}
                            </p>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>

                  <Separator />

                  {/* Data Flow */}
                  <div>
                    <h3 className="font-semibold mb-3">Data Flow</h3>
                    <ol className="space-y-2">
                      {problem.sampleSolution.dataFlow.map((step, i) => (
                        <li key={i} className="text-sm text-muted-foreground">
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>

                  <Separator />

                  {/* Key Decisions */}
                  <div>
                    <h3 className="font-semibold mb-3">Key Design Decisions</h3>
                    <div className="space-y-4">
                      {problem.sampleSolution.keyDecisions.map((decision, i) => (
                        <div key={i} className="border-l-2 border-primary pl-4">
                          <h4 className="text-sm font-medium mb-1">
                            {decision.decision}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {decision.rationale}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Scaling Considerations */}
                  <div>
                    <h3 className="font-semibold mb-3">Scaling Considerations</h3>
                    <ul className="space-y-2">
                      {problem.sampleSolution.scalingConsiderations.map((consideration, i) => (
                        <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                          <span className="text-primary mt-1">→</span>
                          <span>{consideration}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {problem.sampleSolution.alternativeApproaches && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="font-semibold mb-3">Alternative Approaches</h3>
                        <ul className="space-y-2">
                          {problem.sampleSolution.alternativeApproaches.map((approach, i) => (
                            <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                              <span className="text-blue-500 mt-1">◆</span>
                              <span>{approach}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                </CardContent>
              )}
            </Card>
          </div>

          {/* Right Column - Timer and Scratchpad */}
          <div className="space-y-6">
            {/* Timer */}
            <Timer initialMinutes={problem.estimatedTime} />

            {/* Scratchpad */}
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Scratchpad</CardTitle>
                <CardDescription>
                  Your notes are auto-saved
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Jot down your thoughts, diagrams in text, component lists, API designs..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[400px] font-mono text-sm"
                />

                <div className="mt-4 flex gap-2">
                  <Button
                    onClick={handleComplete}
                    className="flex-1"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Mark Complete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
