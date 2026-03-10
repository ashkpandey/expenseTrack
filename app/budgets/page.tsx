'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { DashboardHeader } from '@/components/dashboard-header'
import { BudgetAlerts } from '@/components/budget-alerts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { categoryConfig } from '@/lib/categories'
import { Budget, Category } from '@/lib/types'
import { setBudget, getBudgets, deleteBudget, recalculateBudgetSpent } from '@/lib/services/budget-service'
import { toast } from 'sonner'

export default function BudgetsPage() {
  const { user } = useAuth()
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [newBudget, setNewBudget] = useState({ category: 'food', limit: 1000 })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) return

    const loadBudgets = async () => {
      try {
        const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
        const data = await getBudgets(user.uid, currentMonth)
        
        // Recalculate spent amounts for each budget
        const updatedBudgets = await Promise.all(
          data.map(async (budget) => {
            try {
              const spent = await recalculateBudgetSpent(user.uid, budget.id, budget.category, currentMonth)
              return { ...budget, spent }
            } catch (error) {
              console.error('Error recalculating budget:', error)
              return budget
            }
          })
        )
        
        setBudgets(updatedBudgets)
      } catch (error) {
        console.error('Error loading budgets:', error)
      }
    }

    loadBudgets()
  }, [user])

  const handleAddBudget = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
      
      await setBudget(user.uid, {
        userId: user.uid,
        category: newBudget.category as Category,
        limit: newBudget.limit,
        spent: 0,
        month: currentMonth,
        alertThreshold: 80,
      })
      
      // Reload budgets
      const data = await getBudgets(user.uid, currentMonth)
      setBudgets(data)
      setNewBudget({ category: 'food', limit: 1000 })
      toast.success('Budget added!')
    } catch (error) {
      console.error('Error adding budget:', error)
      toast.error('Failed to add budget')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteBudget = async (id: string) => {
    if (!user) return
    
    try {
      await deleteBudget(id)
      setBudgets(budgets.filter(b => b.id !== id))
      toast.success('Budget deleted')
    } catch (error) {
      console.error('Error deleting budget:', error)
      toast.error('Failed to delete budget')
    }
  }

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
          <BudgetAlerts budgets={budgets} />

          <div className="bg-card shadow-sm border border-border/50 rounded-3xl p-5 mb-8">
            <h2 className="text-xl font-semibold tracking-tight mb-4">Set New Budget</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="category" className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Category</Label>
                <Select value={newBudget.category} onValueChange={(value) => setNewBudget({ ...newBudget, category: value })}>
                  <SelectTrigger className="mt-1.5 bg-background/50 border-border/50 h-12 rounded-xl focus:ring-primary/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border/50 shadow-xl">
                    {Object.entries(categoryConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key} className="rounded-lg cursor-pointer">
                        <div className="flex items-center gap-2">
                          <config.icon className="w-4 h-4" style={{ color: config.color }} />
                          <span>{config.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="limit" className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Monthly Limit (₹)</Label>
                <div className="relative mt-1.5">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                  <Input
                    id="limit"
                    type="number"
                    value={newBudget.limit}
                    onChange={(e) => setNewBudget({ ...newBudget, limit: Number(e.target.value) })}
                    placeholder="1000"
                    className="pl-8 text-lg font-medium bg-background/50 border-border/50 h-12 rounded-xl focus-visible:ring-primary/20"
                    min="0"
                    step="100"
                  />
                </div>
              </div>

              <Button onClick={handleAddBudget} className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-0.5 mt-2" disabled={loading}>
                {loading ? 'Adding...' : 'Add Budget'}
              </Button>
            </div>
          </div>

          <h2 className="text-xl font-semibold tracking-tight mb-4">All Budgets</h2>
          {budgets.length > 0 ? (
            <div className="space-y-4">
              {budgets.map(budget => {
                  const categoryInfo = categoryConfig[budget.category];
                  const Icon = categoryInfo?.icon;
                  const percentage = Math.min((budget.spent / budget.limit) * 100, 100);
                  const isOver = budget.spent >= budget.limit;

                  return (
                    <div key={budget.id} className="group relative flex flex-col p-5 rounded-2xl bg-card border border-border/40 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {Icon && categoryInfo && (
                            <div className="p-2.5 rounded-xl" style={{ backgroundColor: categoryInfo.color + '15' }}>
                              <Icon className="w-5 h-5" style={{ color: categoryInfo.color }} />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-foreground capitalize tracking-tight">{budget.category}</p>
                            <p className="text-xs font-medium text-muted-foreground mt-0.5">₹{budget.spent.toFixed(2)} spent</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-base tracking-tight">₹{budget.limit.toFixed(2)}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-destructive hover:bg-destructive/10 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDeleteBudget(budget.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                      
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${isOver ? 'bg-destructive' : 'bg-primary'}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground bg-card border border-border/40 rounded-2xl border-dashed">
              <p>No budgets found. Create one above!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
