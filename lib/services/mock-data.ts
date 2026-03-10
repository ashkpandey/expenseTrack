import { Expense, Budget, GamificationStats } from '@/lib/types'

const mockExpenses: Expense[] = [
  {
    id: '1',
    userId: 'demo-user',
    amount: 45.99,
    category: 'Food',
    description: 'Lunch at cafe',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    splitWith: [],
  },
  {
    id: '2',
    userId: 'demo-user',
    amount: 89.5,
    category: 'Transport',
    description: 'Uber ride to office',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    splitWith: [],
  },
  {
    id: '3',
    userId: 'demo-user',
    amount: 120.0,
    category: 'Entertainment',
    description: 'Movie tickets',
    date: new Date(),
    createdAt: new Date(),
    splitWith: ['user2'],
  },
  {
    id: '4',
    userId: 'demo-user',
    amount: 65.0,
    category: 'Shopping',
    description: 'Groceries',
    date: new Date(),
    createdAt: new Date(),
    splitWith: [],
  },
  {
    id: '5',
    userId: 'demo-user',
    amount: 30.0,
    category: 'Food',
    description: 'Coffee',
    date: new Date(Date.now() - 3 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    splitWith: [],
  },
]

const mockBudgets: Budget[] = [
  {
    id: '1',
    userId: 'demo-user',
    category: 'Food',
    limit: 300,
    spent: 75.99,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  },
  {
    id: '2',
    userId: 'demo-user',
    category: 'Transport',
    limit: 200,
    spent: 89.5,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  },
  {
    id: '3',
    userId: 'demo-user',
    category: 'Entertainment',
    limit: 150,
    spent: 120.0,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  },
  {
    id: '4',
    userId: 'demo-user',
    category: 'Shopping',
    limit: 250,
    spent: 65.0,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  },
]

const mockGamification: GamificationStats = {
  userId: 'demo-user',
  currentStreak: 5,
  longestStreak: 12,
  totalExpenses: 380.49,
  badges: ['Spender', 'Budget Master', 'Consistent Tracker'],
  points: 450,
  level: 3,
}

export const getMockExpenses = (): Expense[] => mockExpenses

export const getMockBudgets = (): Budget[] => mockBudgets

export const getMockGamification = (): GamificationStats => mockGamification

export const addMockExpense = (expense: Omit<Expense, 'id' | 'createdAt'>): Expense => {
  const newExpense: Expense = {
    ...expense,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date(),
  }
  mockExpenses.unshift(newExpense)
  return newExpense
}

export const deleteMockExpense = (id: string): void => {
  const index = mockExpenses.findIndex(e => e.id === id)
  if (index > -1) {
    mockExpenses.splice(index, 1)
  }
}
