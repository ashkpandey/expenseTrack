'use client'

import { useMemo } from 'react'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Expense } from '@/lib/types'

interface AnalyticsDashboardProps {
  expenses: Expense[]
}

export function AnalyticsDashboard({ expenses }: AnalyticsDashboardProps) {
  const categoryData = useMemo(() => {
    const grouped = expenses.reduce((acc, expense) => {
      const existing = acc.find(item => item.name === expense.category)
      if (existing) {
        existing.value += expense.amount
        existing.count += 1
      } else {
        acc.push({ name: expense.category, value: expense.amount, count: 1 })
      }
      return acc
    }, [] as Array<{ name: string; value: number; count: number }>)
    return grouped.sort((a, b) => b.value - a.value)
  }, [expenses])

  const monthlyData = useMemo(() => {
    const grouped: Record<string, number> = {}
    expenses.forEach(expense => {
      const monthKey = new Date(expense.date).toLocaleString('default', { month: 'short' })
      grouped[monthKey] = (grouped[monthKey] || 0) + expense.amount
    })
    return Object.entries(grouped).map(([month, value]) => ({ name: month, value }))
  }, [expenses])

  const totalSpent = useMemo(() => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0)
  }, [expenses])

  const averageExpense = useMemo(() => {
    return expenses.length > 0 ? totalSpent / expenses.length : 0
  }, [expenses, totalSpent])

  const COLORS = ['#7c3aed', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#f97316']

  return (
    <div className="space-y-6 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 border border-border/50">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Total Spent</p>
          <p className="text-4xl font-bold tracking-tight text-primary">₹{totalSpent.toFixed(2)}</p>
          <p className="text-sm text-muted-foreground mt-2">Across all tracking</p>
        </div>

        <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-2xl p-6 border border-border/50">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Average Expense</p>
          <p className="text-4xl font-bold tracking-tight text-accent">₹{averageExpense.toFixed(2)}</p>
          <p className="text-sm text-muted-foreground mt-2">From {expenses.length} tracked items</p>
        </div>
      </div>

      <div className="bg-background/50 rounded-2xl p-6 border border-border/50">
        <h3 className="text-lg font-bold tracking-tight mb-6">Spending by Category</h3>
        <div className="-ml-6">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" labelLine={false} label={({ name }) => `${name}`} outerRadius={100} innerRadius={60} fill="#8884d8" dataKey="value" paddingAngle={5}>
                {categoryData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={8} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `₹${value.toFixed(2)}`} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-background/50 rounded-2xl p-6 border border-border/50">
        <h3 className="text-lg font-bold tracking-tight mb-6">Monthly Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#888" opacity={0.2} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dx={-10} />
            <Tooltip formatter={(value: number) => `₹${value.toFixed(2)}`} cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
            <Bar dataKey="value" fill="currentColor" className="fill-primary" radius={[6, 6, 0, 0]} maxBarSize={50} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-background/50 rounded-2xl p-6 border border-border/50">
        <h3 className="text-lg font-bold tracking-tight mb-6">Category Breakdown</h3>
        <div className="space-y-4">
          {categoryData.map((item, index) => (
            <div key={item.name} className="flex items-center justify-between group p-3 hover:bg-muted/50 rounded-xl transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center opacity-80 shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }}>
                  <span className="text-white font-bold text-xs uppercase">{item.name.substring(0, 2)}</span>
                </div>
                <div>
                  <span className="text-base font-semibold capitalize">{item.name}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.count} expenses</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-base tracking-tight">₹{item.value.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
