'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { AnalyticsDashboard } from '@/components/analytics-dashboard'
import { GamificationWidget } from '@/components/gamification-widget'
import { DashboardHeader } from '@/components/dashboard-header'
import { getExpenses } from '@/lib/services/expense-service'
import { Expense } from '@/lib/types'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const loadExpenses = async () => {
      try {
        setLoading(true)
        const data = await getExpenses(user.uid)
        setExpenses(data)
      } catch (error) {
        console.error('Error loading expenses:', error)
      } finally {
        setLoading(false)
      }
    }

    loadExpenses()
  }, [user])

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">Please log in first</div>
  }

  return (
    <div className="min-h-[100dvh] bg-background relative pb-24 pt-8">
      {/* Background decoration */}
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-primary/5 to-transparent -z-10 pointer-events-none" />

      <div className="max-w-2xl mx-auto px-4">
        <Link href="/">
          <Button variant="ghost" className="mb-6 -ml-4 gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </Link>
        
        <div className="mb-8">
          <DashboardHeader />
        </div>

        <div className="space-y-8">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full rounded-3xl" />
              <Skeleton className="h-80 w-full rounded-3xl" />
            </div>
          ) : (
            <>
              <div className="bg-card shadow-sm border border-border/50 rounded-3xl overflow-hidden p-2">
                <AnalyticsDashboard expenses={expenses} />
              </div>
              <div className="bg-card shadow-sm border border-border/50 rounded-3xl overflow-hidden p-2">
                <GamificationWidget stats={{ currentStreak: 7, longestStreak: 14, level: 5, points: 350, badges: ['Starter', 'Saver'], totalExpenses: expenses.length }} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
