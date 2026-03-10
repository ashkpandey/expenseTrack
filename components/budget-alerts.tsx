'use client'

import { AlertCircle, TrendingUp, CheckCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Budget } from '@/lib/types'
import { Progress } from '@/components/ui/progress'

interface BudgetAlertsProps {
  budgets: Budget[]
}

export function BudgetAlerts({ budgets }: BudgetAlertsProps) {
  const alertBudgets = budgets.filter(b => (b.spent / b.limit) > 0.8)
  const exceedBudgets = budgets.filter(b => b.spent > b.limit)
  const healthyBudgets = budgets.filter(b => (b.spent / b.limit) <= 0.8)

  if (budgets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Budget Status</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8 text-muted-foreground">
          <p>No budgets set. Add budgets in settings to track your spending.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {exceedBudgets.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Budget Exceeded</AlertTitle>
          <AlertDescription>
            You've exceeded budget in {exceedBudgets.length} categor{exceedBudgets.length === 1 ? 'y' : 'ies'}
          </AlertDescription>
        </Alert>
      )}

      {alertBudgets.length > 0 && exceedBudgets.length === 0 && (
        <Alert>
          <TrendingUp className="h-4 w-4" />
          <AlertTitle>Budget Warning</AlertTitle>
          <AlertDescription>
            You're approaching limit in {alertBudgets.length} categor{alertBudgets.length === 1 ? 'y' : 'ies'}
          </AlertDescription>
        </Alert>
      )}

      {healthyBudgets.length > 0 && exceedBudgets.length === 0 && alertBudgets.length === 0 && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>All Budgets on Track</AlertTitle>
          <AlertDescription>
            Great job! You're within budget for all categories.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        {budgets.map(budget => {
          const percentage = Math.min((budget.spent / budget.limit) * 100, 100)
          const isExceeded = budget.spent > budget.limit
          const isWarning = percentage > 80

          return (
            <Card key={budget.id} className={isExceeded ? 'border-destructive/50 bg-destructive/5' : isWarning ? 'border-accent/50 bg-accent/5' : ''}>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{budget.category}</span>
                    <span className={`text-sm font-semibold ${isExceeded ? 'text-destructive' : isWarning ? 'text-accent' : 'text-primary'}`}>
                      ₹{budget.spent.toFixed(2)} / ₹{budget.limit.toFixed(2)}
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{percentage.toFixed(0)}% used</span>
                    <span>₹{Math.max(0, budget.limit - budget.spent).toFixed(2)} remaining</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
