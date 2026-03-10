'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard-header';
import { AddIncomeForm, sourceConfig } from '@/components/add-income-form';
import { deleteIncome, getIncome } from '@/lib/services/income-service';
import { useAuth } from '@/lib/auth-context';
import { Income } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trash2, Plus, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function IncomePage() {
  const router = useRouter();
  const { firebaseUser } = useAuth();
  const [income, setIncome] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const fetchIncome = useCallback(async () => {
    if (!firebaseUser) return;
    setLoading(true);
    try {
      const data = await getIncome(firebaseUser.uid);
      setIncome(data);
    } catch {
      toast.error('Failed to load income');
    } finally {
      setLoading(false);
    }
  }, [firebaseUser]);

  useEffect(() => {
    fetchIncome();
  }, [fetchIncome]);

  const handleDelete = async (id: string) => {
    try {
      await deleteIncome(id);
      toast.success('Income entry removed');
      fetchIncome();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const totalThisMonth = income
    .filter((i) => {
      const d = new Date(i.date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, i) => sum + i.amount, 0);

  const grouped: Record<string, Income[]> = {};
  income.forEach((i) => {
    const key = format(new Date(i.date), 'MMMM yyyy');
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(i);
  });

  return (
    <main className="min-h-screen bg-background pb-32">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center gap-3 pt-6 pb-2">
          <button
            onClick={() => router.back()}
            className="p-2.5 rounded-xl hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-extrabold tracking-tight">Income</h1>
        </div>

        <DashboardHeader />

        {/* Summary */}
        <div className="mt-6 p-6 rounded-3xl bg-gradient-to-br from-emerald-500/15 to-teal-500/10 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-emerald-500/20 rounded-lg">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">This Month</p>
          </div>
          <p className="text-4xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">
            ₹{totalThisMonth.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-muted-foreground mt-1.5">
            {income.filter((i) => {
              const d = new Date(i.date);
              const now = new Date();
              return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            }).length} income entries
          </p>
        </div>

        {/* Add Income */}
        <div className="mt-6">
          {showAdd ? (
            <div className="p-5 rounded-3xl border border-primary/20 bg-primary/5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold">Add Income</h2>
                <button onClick={() => setShowAdd(false)} className="p-2 rounded-xl hover:bg-muted text-muted-foreground">
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
              <AddIncomeForm onSuccess={() => { setShowAdd(false); fetchIncome(); }} />
            </div>
          ) : (
            <Button variant="outline" className="w-full border-dashed border-2" onClick={() => setShowAdd(true)}>
              <Plus className="w-4 h-4 mr-2" /> Record Income
            </Button>
          )}
        </div>

        {/* Income History */}
        <div className="mt-8 space-y-6">
          {Object.entries(grouped).map(([month, entries]) => (
            <div key={month}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">{month}</p>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  +₹{entries.reduce((s, e) => s + e.amount, 0).toLocaleString('en-IN')}
                </p>
              </div>
              <div className="space-y-2">
                {entries.map((item) => {
                  const cfg = sourceConfig[item.source];
                  const Icon = cfg.icon;
                  return (
                    <div
                      key={item.id}
                      className="group flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/40 hover:border-emerald-500/20 hover:shadow-sm transition-all"
                    >
                      <div
                        className="w-10 h-10 flex items-center justify-center rounded-xl shrink-0"
                        style={{ backgroundColor: cfg.color + '20' }}
                      >
                        <Icon className="w-5 h-5" style={{ color: cfg.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold tracking-tight truncate">{item.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {cfg.label} · {format(new Date(item.date), 'dd MMM')}
                          {item.isRecurring && (
                            <span className="ml-2 px-1.5 py-0.5 bg-primary/10 text-primary rounded-md text-xs font-semibold">
                              Recurring
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-emerald-600 dark:text-emerald-400">+₹{item.amount.toLocaleString('en-IN')}</p>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {!loading && income.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <div className="text-5xl mb-4">💰</div>
              <p className="font-semibold">No income recorded yet</p>
              <p className="text-sm mt-1">Tap "Record Income" to get started</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
