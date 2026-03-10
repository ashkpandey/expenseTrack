'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { subscribeToExpenses } from '@/lib/services/expense-service';
import { getMonthlyIncome } from '@/lib/services/income-service';
import { LogOut, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import Link from 'next/link';

export const DashboardHeader: React.FC = () => {
  const { user, logout, firebaseUser } = useAuth();
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  useEffect(() => {
    if (!firebaseUser) return;

    // Subscribe to real-time expense updates
    const unsubscribe = subscribeToExpenses(firebaseUser.uid, (expenses) => {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthlyTotal = expenses
        .filter((e) => new Date(e.date) >= monthStart)
        .reduce((sum, e) => sum + e.amount, 0);
      setMonthlyExpenses(monthlyTotal);
    });

    // Fetch income (one-time is fine, doesn't change as often)
    getMonthlyIncome(firebaseUser.uid, currentMonth)
      .then(setMonthlyIncome)
      .catch(console.error);

    return () => unsubscribe();
  }, [firebaseUser]);

  const netSavings = monthlyIncome - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? Math.round((netSavings / monthlyIncome) * 100) : null;
  const isPositive = netSavings >= 0;

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
            {user?.email?.[0].toUpperCase() || 'E'}
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Good {now.getHours() < 12 ? 'morning' : now.getHours() < 18 ? 'afternoon' : 'evening'},
            </p>
            <h1 className="text-xl font-bold tracking-tight">{user?.email?.split('@')[0] || 'User'}</h1>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-5 h-5" />
        </Button>
      </div>

      {/* Hero card — Net Savings */}
      <div className={`relative overflow-hidden p-6 rounded-3xl text-white shadow-lg transition-all ${
        isPositive
          ? 'bg-gradient-to-br from-primary to-primary/80 shadow-primary/25'
          : 'bg-gradient-to-br from-red-600 to-rose-700 shadow-red-600/25'
      }`}>
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -left-4 -bottom-4 w-32 h-32 bg-black/10 rounded-full blur-2xl" />

        <div className="relative z-10">
          <p className="text-white/80 font-medium mb-1 text-sm uppercase tracking-wider">Net Savings This Month</p>
          <div className="flex items-baseline gap-0.5">
            {!isPositive && <span className="text-3xl font-extrabold opacity-90">−</span>}
            <span className="text-2xl opacity-80">₹</span>
            <span className="text-4xl font-extrabold tracking-tight">
              {Math.abs(netSavings).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
            {savingsRate !== null && (
              <span className="ml-2 text-sm font-semibold text-white/70">
                {isPositive ? '+' : '-'}{Math.abs(savingsRate)}%
              </span>
            )}
          </div>
          {!isPositive && (
            <p className="text-white/80 text-xs mt-1 font-medium">
              ₹{(monthlyExpenses - monthlyIncome).toLocaleString('en-IN', { maximumFractionDigits: 0 })} over budget this month
            </p>
          )}

          <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/15 rounded-lg">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-white/70 text-xs">Income</p>
                <p className="font-semibold">₹{monthlyIncome.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/15 rounded-lg">
                <TrendingDown className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-white/70 text-xs">Expenses</p>
                <p className="font-semibold">₹{monthlyExpenses.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
