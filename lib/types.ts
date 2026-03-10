export type Category = 'food' | 'transport' | 'entertainment' | 'utilities' | 'shopping' | 'health' | 'education' | 'other';

export type IncomeSource = 'salary' | 'freelance' | 'business' | 'investment' | 'rental' | 'gift' | 'other';

export type PaymentApp = 'gpay' | 'paytm' | 'phonepe' | 'amazonpay' | 'slice' | 'cred' | 'cash' | 'card' | 'other';

export interface Expense {
  id: string;
  userId: string;
  amount: number;
  category: Category;
  description: string;
  date: Date;
  createdAt: Date;
  splitWith?: string[];
  paymentMethod?: PaymentApp;
  receipt?: string;
  isFromUPI?: boolean;
  upiRef?: string;
}

export interface Income {
  id: string;
  userId: string;
  amount: number;
  source: IncomeSource;
  description: string;
  date: Date;
  createdAt: Date;
  isRecurring?: boolean;
  recurringFrequency?: 'weekly' | 'monthly' | 'yearly';
}

export interface Subscription {
  id: string;
  userId: string;
  name: string;
  amount: number;
  billingCycle: 'weekly' | 'monthly' | 'yearly';
  nextBillingDate: Date;
  category: Category;
  isActive: boolean;
  emoji?: string;
  paymentApp?: PaymentApp;
  createdAt: Date;
  lastAutoAdded?: Date;
}

export interface Budget {
  id: string;
  userId: string;
  category: Category;
  limit: number;
  spent: number;
  month: string; // YYYY-MM format
  alertThreshold: number; // percentage (e.g., 80)
}

export interface GameProfile {
  userId: string;
  totalExpenses: number;
  streakDays: number;
  lastExpenseDate: Date;
  badges: Badge[];
  points: number;
  level: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
}

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
  biometricEnabled?: boolean;
  preferredCurrency?: string;
}

export interface GamificationStats {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  totalExpenses: number;
  badges: string[];
  points: number;
  level: number;
}
