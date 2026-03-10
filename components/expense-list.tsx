'use client';

import React, { useEffect, useState } from 'react';
import { Expense } from '@/lib/types';
import { subscribeToExpenses, deleteExpense } from '@/lib/services/expense-service';
import { useAuth } from '@/lib/auth-context';
import { categoryConfig } from '@/lib/categories';
import { format } from 'date-fns';
import { Trash2, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { SplitExpenseModal } from '@/components/split-expense-modal';

interface ExpenseListProps {
  onExpensesLoad?: (count: number) => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ onExpensesLoad }) => {
  const { firebaseUser } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  useEffect(() => {
    if (!firebaseUser) return;

    const unsubscribe = subscribeToExpenses(firebaseUser.uid, (data) => {
      setExpenses(data);
      onExpensesLoad?.(data.length);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firebaseUser]);

  const handleDelete = async (expenseId: string) => {
    try {
      await deleteExpense(expenseId);
      toast.success('Expense deleted');
      // No manual state update needed — onSnapshot fires automatically
    } catch {
      toast.error('Failed to delete expense');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading expenses...</div>;
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No expenses yet. Add one to get started!</p>
      </div>
    );
  }

  // Group expenses by date
  const groupedExpenses = expenses.reduce(
    (acc, expense) => {
      const dateKey = format(expense.date, 'yyyy-MM-dd');
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(expense);
      return acc;
    },
    {} as Record<string, Expense[]>,
  );

  return (
    <div className="space-y-6">
      {Object.entries(groupedExpenses).map(([dateKey, dayExpenses]) => (
        <div key={dateKey} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="font-medium text-xs text-muted-foreground uppercase tracking-wider mb-3 px-2">
            {format(new Date(dateKey), 'EEEE, MMM d')}
          </h3>
          <div className="space-y-3">
            {dayExpenses.map((expense) => {
              const categoryInfo = categoryConfig[expense.category];
              const Icon = categoryInfo.icon;

              return (
                <div 
                  key={expense.id} 
                  className="group relative flex items-center justify-between p-4 rounded-2xl bg-card border border-border/40 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className="p-3 rounded-xl transition-transform group-hover:scale-110 duration-300"
                      style={{ backgroundColor: categoryInfo.color + '15' }}
                    >
                      <Icon className="w-5 h-5" style={{ color: categoryInfo.color }} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground tracking-tight">{expense.description}</p>
                      <p className="text-xs font-medium text-muted-foreground mt-0.5">{categoryInfo.name}</p>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <p className="font-bold text-base tracking-tight">₹{expense.amount.toFixed(2)}</p>
                    <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 bottom-2 bg-card pl-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedExpense(expense)}
                        className="h-7 w-7 rounded-full text-primary hover:bg-primary/10"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(expense.id)}
                        className="h-7 w-7 rounded-full text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <SplitExpenseModal expense={selectedExpense} onClose={() => setSelectedExpense(null)} />
    </div>
  );
};
