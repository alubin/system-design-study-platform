'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { topics, categories } from '@/content/topics'
import { ArrowLeft, BookOpen, CheckCircle2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getProgress } from '@/lib/storage'

export default function CategoryPage() {
  const params = useParams()
  const categoryId = params.category as string
  const category = categories.find(c => c.id === categoryId)
  const categoryTopics = topics.filter(t => t.category === categoryId)

  const [completedTopics, setCompletedTopics] = useState<string[]>([])

  useEffect(() => {
    const progress = getProgress()
    setCompletedTopics(progress.topicsCompleted)
  }, [])

  if (!category) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold">Category not found</h1>
          <Link href="/">
            <Button className="mt-4">Back to Home</Button>
          </Link>
        </div>
      </main>
    )
  }

  const completionRate = categoryTopics.length > 0
    ? (categoryTopics.filter(t => completedTopics.includes(t.id)).length / categoryTopics.length) * 100
    : 0

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>

          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">{category.name}</h1>
              <p className="text-muted-foreground">
                {categoryTopics.length} topic{categoryTopics.length !== 1 ? 's' : ''} to master
              </p>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {Math.round(completionRate)}% Complete
            </Badge>
          </div>

          <Progress value={completionRate} className="h-2" />
        </div>

        {/* Topics List */}
        <div className="space-y-4">
          {categoryTopics.map((topic) => {
            const isCompleted = completedTopics.includes(topic.id)

            return (
              <Link key={topic.id} href={`/topics/${categoryId}/${topic.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="w-5 h-5 text-primary" />
                          <CardTitle className="text-xl">{topic.title}</CardTitle>
                          {isCompleted && (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          )}
                        </div>
                        <CardDescription className="line-clamp-2">
                          {topic.concepts[0]?.content || 'Learn about this important concept'}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">
                        {topic.concepts.length} concept{topic.concepts.length !== 1 ? 's' : ''}
                      </Badge>
                      <Badge variant="outline">
                        {topic.terminology.length} term{topic.terminology.length !== 1 ? 's' : ''}
                      </Badge>
                      {topic.commonMistakes.length > 0 && (
                        <Badge variant="outline">
                          {topic.commonMistakes.length} pitfall{topic.commonMistakes.length !== 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        {categoryTopics.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No topics available in this category yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
