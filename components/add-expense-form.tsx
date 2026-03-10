'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { categoryConfig, categorizeExpense } from '@/lib/categories';
import { addExpense } from '@/lib/services/expense-service';
import { useAuth } from '@/lib/auth-context';
import { Category } from '@/lib/types';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const expenseSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  description: z.string().min(1, 'Description is required'),
  category: z.enum(['food', 'transport', 'entertainment', 'utilities', 'shopping', 'health', 'education', 'other'] as const),
  date: z.string(),
});

type ExpenseForm = z.infer<typeof expenseSchema>;

interface AddExpenseFormProps {
  onSuccess?: () => void;
  autoCategory?: boolean;
}

export const AddExpenseForm: React.FC<AddExpenseFormProps> = ({ onSuccess, autoCategory = true }) => {
  const { firebaseUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, watch, formState: { errors }, setValue } = useForm<ExpenseForm>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      category: 'other',
    },
  });

  const description = watch('description');

  React.useEffect(() => {
    if (autoCategory && description && description.length > 2) {
      const suggestedCategory = categorizeExpense(description);
      setValue('category', suggestedCategory);
    }
  }, [description, autoCategory, setValue]);

  const onSubmit = async (data: ExpenseForm) => {
    if (!firebaseUser) {
      toast.error('You must be logged in');
      return;
    }

    setIsLoading(true);
    try {
      await addExpense(firebaseUser.uid, {
        userId: firebaseUser.uid,
        amount: data.amount,
        description: data.description,
        category: data.category as Category,
        date: new Date(data.date),
      });

      toast.success('Expense added!');
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to add expense');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="flex gap-4">
        <div className="flex-1">
          <Label htmlFor="amount" className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Amount</Label>
          <div className="relative mt-1.5">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('amount', { valueAsNumber: true })}
              className="pl-8 text-lg font-medium bg-background/50 border-border/50 h-12 rounded-xl focus-visible:ring-primary/20"
            />
          </div>
          {errors.amount && <p className="text-destructive text-sm mt-1">{errors.amount.message}</p>}
        </div>

        <div className="flex-1">
          <Label htmlFor="date" className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Date</Label>
          <Input
            id="date"
            type="date"
            {...register('date')}
            className="mt-1.5 text-base bg-background/50 border-border/50 h-12 rounded-xl focus-visible:ring-primary/20"
          />
          {errors.date && <p className="text-destructive text-sm mt-1">{errors.date.message}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="description" className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Description</Label>
        <Input
          id="description"
          type="text"
          placeholder="What did you spend on? e.g. Coffee"
          {...register('description')}
          className="mt-1.5 bg-background/50 border-border/50 h-12 rounded-xl focus-visible:ring-primary/20 placeholder:text-muted-foreground/50"
        />
        {errors.description && <p className="text-destructive text-sm mt-1">{errors.description.message}</p>}
      </div>

      <div>
        <Label htmlFor="category" className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Category</Label>
        <Select defaultValue="other" onValueChange={(value) => setValue('category', value as Category)}>
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

      <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-0.5" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Adding...
          </>
        ) : (
          'Add Expense'
        )}
      </Button>
    </form>
  );
};
