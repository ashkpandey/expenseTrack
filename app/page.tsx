'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { AuthCard } from '@/components/auth-card';
import { DashboardHeader } from '@/components/dashboard-header';
import { AddExpenseForm } from '@/components/add-expense-form';
import { ExpenseList } from '@/components/expense-list';
import { UPIImport } from '@/components/upi-import';
import { Button } from '@/components/ui/button';
import { PlusCircle, BarChart3, TrendingUp, Wallet, RefreshCw, Smartphone } from 'lucide-react';

function HomeContent() {
  const { user, loading } = useAuth();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'add' | 'upi'>('add');

  // Handle redirect from Share Target (?tab=upi)
  useEffect(() => {
    if (searchParams.get('tab') === 'upi') {
      setActiveTab('upi');
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin" />
          </div>
          <p className="text-primary font-medium tracking-wide">Warming up...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex relative overflow-hidden items-center justify-center bg-background p-4">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[100px]" />
          <div className="absolute top-[20%] -right-[10%] w-[30%] h-[40%] rounded-full bg-accent/10 blur-[100px]" />
          <div className="absolute -bottom-[10%] left-[20%] w-[40%] h-[40%] rounded-full bg-secondary/20 blur-[120px]" />
        </div>

        <div className="w-full max-w-md z-10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4 text-primary">
              <TrendingUp className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-3">ExpenseTrack</h1>
            <p className="text-muted-foreground text-lg">Master your money. Effortlessly.</p>
          </div>
          <div className="shadow-2xl shadow-primary/5 rounded-3xl overflow-hidden border border-border/50 bg-background/50 backdrop-blur-xl">
            <AuthCard onSuccess={() => {}} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background relative pb-24">
      {/* Background decoration */}
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-primary/5 to-transparent -z-10 pointer-events-none" />
      
      <div className="max-w-2xl mx-auto p-4 space-y-8 pt-8">
        <div className="flex items-start justify-between">
          <DashboardHeader />
        </div>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight">Quick Actions</h2>
            <Link href="/analytics">
              <Button variant="ghost" size="sm" className="gap-2 text-primary hover:text-primary hover:bg-primary/10 transition-colors">
                <BarChart3 className="w-4 h-4" />
                <span>Analytics</span>
              </Button>
            </Link>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-1 p-1 bg-muted rounded-2xl">
            <button
              onClick={() => setActiveTab('add')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'add' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              Add Expense
            </button>
            <button
              onClick={() => setActiveTab('upi')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'upi' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              UPI Import
            </button>
          </div>

          <div className="bg-card shadow-sm border border-border/50 rounded-3xl p-5 mb-8">
            {activeTab === 'add' ? (
              <AddExpenseForm
                onSuccess={() => {}}
                autoCategory={true}
              />
            ) : (
              <UPIImport onSuccess={() => {}} />
            )}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight">Recent Activity</h2>
          </div>
          <ExpenseList />
        </section>
      </div>

      {/* Floating Bottom Nav for Mobile Feel */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm">
        <div className="flex items-center justify-around bg-background/80 backdrop-blur-xl border border-border/50 shadow-2xl p-2 rounded-full">
          <Button variant="ghost" className="rounded-full w-12 h-12 flex flex-col gap-0.5 text-primary bg-primary/10">
            <PlusCircle className="w-5 h-5" />
          </Button>
          <Link href="/income">
            <Button variant="ghost" className="rounded-full w-12 h-12 flex flex-col gap-0.5 text-muted-foreground hover:text-foreground">
              <Wallet className="w-5 h-5" />
            </Button>
          </Link>
          <Link href="/budgets">
            <Button variant="ghost" className="rounded-full w-12 h-12 flex flex-col gap-0.5 text-muted-foreground hover:text-foreground">
              <TrendingUp className="w-5 h-5" />
            </Button>
          </Link>
          <Link href="/subscriptions">
            <Button variant="ghost" className="rounded-full w-12 h-12 flex flex-col gap-0.5 text-muted-foreground hover:text-foreground">
              <RefreshCw className="w-5 h-5" />
            </Button>
          </Link>
          <Link href="/analytics">
            <Button variant="ghost" className="rounded-full w-12 h-12 flex flex-col gap-0.5 text-muted-foreground hover:text-foreground">
              <BarChart3 className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}
