'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  getProgress,
  updateSettings,
  exportProgress,
  importProgress,
  clearProgress,
} from '@/lib/storage'
import { ArrowLeft, Download, Upload, Trash2, Moon, Sun, Laptop } from 'lucide-react'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [interviewDate, setInterviewDate] = useState('')
  const [dailyGoal, setDailyGoal] = useState(30)
  const [notifications, setNotifications] = useState(true)

  useEffect(() => {
    setMounted(true)
    const progress = getProgress()
    setInterviewDate(progress.settings.interviewDate || '')
    setDailyGoal(progress.settings.dailyGoal || 30)
    setNotifications(progress.settings.notifications ?? true)
  }, [])

  const handleSave = () => {
    updateSettings({
      interviewDate: interviewDate || null,
      dailyGoal,
      notifications,
    })
    alert('Settings saved!')
  }

  const handleExport = () => {
    const data = exportProgress()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `study-progress-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = e.target?.result as string
          if (importProgress(data)) {
            alert('Progress imported successfully!')
            window.location.reload()
          } else {
            alert('Failed to import progress. Invalid file format.')
          }
        } catch (error) {
          alert('Failed to import progress. Invalid file format.')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all progress? This action cannot be undone.')) {
      clearProgress()
      alert('Progress cleared!')
      window.location.reload()
    }
  }

  if (!mounted) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-10 bg-muted rounded w-1/3 mb-4"></div>
          </div>
        </div>
      </main>
    )
  }

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

          <h1 className="text-4xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Customize your study experience
          </p>
        </div>

        <div className="space-y-6">
          {/* Study Goals */}
          <Card>
            <CardHeader>
              <CardTitle>Study Goals</CardTitle>
              <CardDescription>
                Set your interview date and daily study targets
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="interview-date">Interview Date (Optional)</Label>
                <Input
                  id="interview-date"
                  type="date"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="max-w-md"
                />
                <p className="text-sm text-muted-foreground">
                  Set your target interview date to see a countdown on the dashboard
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="daily-goal">Daily Study Goal (minutes)</Label>
                <Input
                  id="daily-goal"
                  type="number"
                  min="5"
                  max="480"
                  value={dailyGoal}
                  onChange={(e) => setDailyGoal(Number(e.target.value))}
                  className="max-w-md"
                />
                <p className="text-sm text-muted-foreground">
                  Recommended: 30-60 minutes per day
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how the app looks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Theme</Label>
                  <p className="text-sm text-muted-foreground">
                    Select your preferred color scheme
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant={theme === 'light' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('light')}
                  className="flex items-center gap-2"
                >
                  <Sun className="w-4 h-4" />
                  Light
                </Button>
                <Button
                  variant={theme === 'dark' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('dark')}
                  className="flex items-center gap-2"
                >
                  <Moon className="w-4 h-4" />
                  Dark
                </Button>
                <Button
                  variant={theme === 'system' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('system')}
                  className="flex items-center gap-2"
                >
                  <Laptop className="w-4 h-4" />
                  System
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Manage study reminders and alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">Enable Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get reminders to maintain your study streak
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Backup, restore, or clear your progress
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={handleExport}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export Progress
                </Button>
                <Button
                  variant="outline"
                  onClick={handleImport}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Import Progress
                </Button>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-destructive mb-2">Danger Zone</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Permanently delete all your study progress and settings
                </p>
                <Button
                  variant="destructive"
                  onClick={handleClear}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All Data
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            <Link href="/">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
