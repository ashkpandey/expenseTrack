'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addIncome } from '@/lib/services/income-service';
import { useAuth } from '@/lib/auth-context';
import { IncomeSource } from '@/lib/types';
import { toast } from 'sonner';
import { Loader2, Briefcase, TrendingUp, Building2, Gift, Home, DollarSign } from 'lucide-react';

const incomeSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  description: z.string().min(1, 'Description is required'),
  source: z.enum(['salary', 'freelance', 'business', 'investment', 'rental', 'gift', 'other'] as const),
  date: z.string(),
  isRecurring: z.boolean().optional(),
  recurringFrequency: z.enum(['weekly', 'monthly', 'yearly']).optional(),
});

type IncomeForm = z.infer<typeof incomeSchema>;

interface AddIncomeFormProps {
  onSuccess?: () => void;
}

const sourceConfig: Record<IncomeSource, { label: string; icon: React.ElementType; color: string }> = {
  salary: { label: 'Salary', icon: Briefcase, color: 'oklch(0.55 0.25 260)' },
  freelance: { label: 'Freelance', icon: DollarSign, color: 'oklch(0.65 0.2 150)' },
  business: { label: 'Business', icon: Building2, color: 'oklch(0.65 0.2 50)' },
  investment: { label: 'Investment', icon: TrendingUp, color: 'oklch(0.72 0.2 10)' },
  rental: { label: 'Rental', icon: Home, color: 'oklch(0.6 0.15 200)' },
  gift: { label: 'Gift / Bonus', icon: Gift, color: 'oklch(0.7 0.2 340)' },
  other: { label: 'Other', icon: DollarSign, color: 'oklch(0.5 0.02 260)' },
};

export const AddIncomeForm: React.FC<AddIncomeFormProps> = ({ onSuccess }) => {
  const { firebaseUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm<IncomeForm>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      source: 'salary',
      isRecurring: false,
    },
  });

  const onSubmit = async (data: IncomeForm) => {
    if (!firebaseUser) {
      toast.error('You must be logged in');
      return;
    }

    setIsLoading(true);
    try {
      await addIncome(firebaseUser.uid, {
        amount: data.amount,
        description: data.description,
        source: data.source as IncomeSource,
        date: new Date(data.date),
        userId: firebaseUser.uid,
        isRecurring: data.isRecurring,
        recurringFrequency: data.isRecurring ? data.recurringFrequency : undefined,
      });

      toast.success('Income recorded! 💰');
      reset({
        date: new Date().toISOString().split('T')[0],
        source: 'salary',
        isRecurring: false,
      });
      setIsRecurring(false);
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to record income');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="flex gap-4">
        <div className="flex-1">
          <Label className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Amount</Label>
          <div className="relative mt-1.5">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('amount', { valueAsNumber: true })}
              className="pl-8 text-lg font-medium"
            />
          </div>
          {errors.amount && <p className="text-destructive text-sm mt-1">{errors.amount.message}</p>}
        </div>
        <div className="flex-1">
          <Label className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Date</Label>
          <Input
            type="date"
            {...register('date')}
            className="mt-1.5"
          />
        </div>
      </div>

      <div>
        <Label className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Description</Label>
        <Input
          placeholder="e.g. March salary, Client payment..."
          {...register('description')}
          className="mt-1.5"
        />
        {errors.description && <p className="text-destructive text-sm mt-1">{errors.description.message}</p>}
      </div>

      <div>
        <Label className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Source</Label>
        <Select defaultValue="salary" onValueChange={(v) => setValue('source', v as IncomeSource)}>
          <SelectTrigger className="mt-1.5">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(sourceConfig).map(([key, cfg]) => (
              <SelectItem key={key} value={key}>
                <div className="flex items-center gap-2">
                  <cfg.icon className="w-4 h-4" style={{ color: cfg.color }} />
                  <span>{cfg.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Recurring Toggle */}
      <div className="flex items-center gap-3 p-4 rounded-2xl border border-border/50 bg-muted/30">
        <button
          type="button"
          onClick={() => {
            setIsRecurring(!isRecurring);
            setValue('isRecurring', !isRecurring);
          }}
          className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus-visible:outline-none ${isRecurring ? 'bg-primary' : 'bg-muted'}`}
        >
          <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${isRecurring ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
        <div>
          <p className="text-sm font-semibold">Recurring Income</p>
          <p className="text-xs text-muted-foreground">e.g. monthly salary, weekly freelance</p>
        </div>
      </div>

      {isRecurring && (
        <div>
          <Label className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Frequency</Label>
          <Select defaultValue="monthly" onValueChange={(v) => setValue('recurringFrequency', v as any)}>
            <SelectTrigger className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Saving...</> : 'Record Income'}
      </Button>
    </form>
  );
};

export { sourceConfig };
