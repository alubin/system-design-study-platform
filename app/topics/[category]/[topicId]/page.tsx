'use client'

import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { topics } from '@/content/topics'
import { ArrowLeft, CheckCircle2, AlertTriangle, Link as LinkIcon, Lightbulb } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getProgress, markTopicComplete } from '@/lib/storage'
import Link from 'next/link'

export default function TopicPage() {
  const params = useParams()
  const router = useRouter()
  const topicId = params.topicId as string
  const categoryId = params.category as string

  const topic = topics.find(t => t.id === topicId && t.category === categoryId)
  const [isCompleted, setIsCompleted] = useState(false)

  useEffect(() => {
    const progress = getProgress()
    setIsCompleted(progress.topicsCompleted.includes(topicId))
  }, [topicId])

  if (!topic) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Topic not found</h1>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </main>
    )
  }

  const handleMarkComplete = () => {
    markTopicComplete(topicId)
    setIsCompleted(true)
  }

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/topics/${categoryId}`}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Category
            </Button>
          </Link>

          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{topic.title}</h1>
              <p className="text-muted-foreground">
                Master this essential system design concept
              </p>
            </div>
            {isCompleted ? (
              <Badge className="bg-green-500 text-white">
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Completed
              </Badge>
            ) : (
              <Button onClick={handleMarkComplete} variant="outline">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Mark as Complete
              </Button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Concepts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                Core Concepts
              </CardTitle>
              <CardDescription>
                Understand the fundamental ideas and implementations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {topic.concepts.map((concept, index) => (
                  <AccordionItem key={index} value={`concept-${index}`}>
                    <AccordionTrigger className="text-left">
                      {concept.title}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-2">
                        {/* Overview */}
                        <div>
                          <h4 className="font-semibold mb-2">Overview</h4>
                          <p className="text-muted-foreground">{concept.content}</p>
                        </div>

                        {/* Tabbed Explanations */}
                        <Tabs defaultValue="eli5" className="w-full">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="eli5">ELI5</TabsTrigger>
                            <TabsTrigger value="technical">Technical</TabsTrigger>
                          </TabsList>
                          <TabsContent value="eli5" className="mt-4">
                            <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-4 border border-blue-200 dark:border-blue-800">
                              <p className="text-sm">{concept.eli5}</p>
                            </div>
                          </TabsContent>
                          <TabsContent value="technical" className="mt-4">
                            <div className="rounded-lg bg-slate-50 dark:bg-slate-900 p-4 border">
                              <p className="text-sm font-mono">{concept.technical}</p>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* Terminology */}
          {topic.terminology.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Key Terminology</CardTitle>
                <CardDescription>
                  Important terms and definitions to know
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topic.terminology.map((term, index) => (
                    <div key={index}>
                      <dt className="font-semibold text-sm mb-1">{term.term}</dt>
                      <dd className="text-sm text-muted-foreground">{term.definition}</dd>
                      {index < topic.terminology.length - 1 && (
                        <Separator className="mt-4" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Common Mistakes */}
          {topic.commonMistakes.length > 0 && (
            <Card className="border-orange-200 dark:border-orange-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                  <AlertTriangle className="w-5 h-5" />
                  Common Mistakes & Pitfalls
                </CardTitle>
                <CardDescription>
                  Avoid these common errors and misconceptions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {topic.commonMistakes.map((mistake, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="text-orange-500 mt-1">•</span>
                      <span className="text-sm">{mistake}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Related Topics */}
          {topic.relatedTopics.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="w-5 h-5" />
                  Related Topics
                </CardTitle>
                <CardDescription>
                  Continue your learning journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {topic.relatedTopics.map((relatedId) => {
                    const relatedTopic = topics.find(t => t.id === relatedId)
                    if (!relatedTopic) return null

                    return (
                      <Link
                        key={relatedId}
                        href={`/topics/${relatedTopic.category}/${relatedId}`}
                      >
                        <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                          {relatedTopic.title}
                        </Badge>
                      </Link>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-between">
          <Link href={`/topics/${categoryId}`}>
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to {categoryId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </Button>
          </Link>

          {!isCompleted && (
            <Button onClick={handleMarkComplete}>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Mark as Complete
            </Button>
          )}
        </div>
      </div>
    </main>
  )
}
