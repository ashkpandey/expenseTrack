'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addSubscription, updateSubscription, deleteSubscription } from '@/lib/services/subscription-service';
import { useAuth } from '@/lib/auth-context';
import { Subscription, Category } from '@/lib/types';
import { categoryConfig } from '@/lib/categories';
import { toast } from 'sonner';
import { Plus, Trash2, Pencil, Check, X, RefreshCw } from 'lucide-react';

const POPULAR_SUBS = [
  { name: 'Netflix', emoji: '🎬', category: 'entertainment' as Category, amount: 649 },
  { name: 'Spotify', emoji: '🎵', category: 'entertainment' as Category, amount: 119 },
  { name: 'Amazon Prime', emoji: '📦', category: 'shopping' as Category, amount: 299 },
  { name: 'YouTube Premium', emoji: '▶️', category: 'entertainment' as Category, amount: 129 },
  { name: 'Disney+ Hotstar', emoji: '⭐', category: 'entertainment' as Category, amount: 299 },
  { name: 'Apple Music', emoji: '🍎', category: 'entertainment' as Category, amount: 99 },
  { name: 'Gym', emoji: '💪', category: 'health' as Category, amount: 1000 },
  { name: 'Notion', emoji: '📝', category: 'education' as Category, amount: 160 },
];

interface SubscriptionManagerProps {
  subscriptions: Subscription[];
  onUpdate: () => void;
}

export const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ subscriptions, onUpdate }) => {
  const { firebaseUser } = useAuth();
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [newSub, setNewSub] = useState({
    name: '',
    emoji: '📱',
    amount: 0,
    billingCycle: 'monthly' as Subscription['billingCycle'],
    category: 'entertainment' as Category,
    nextBillingDate: new Date().toISOString().split('T')[0],
    isActive: true,
  });

  const handleQuickAdd = (preset: typeof POPULAR_SUBS[0]) => {
    setNewSub({ ...newSub, name: preset.name, emoji: preset.emoji, amount: preset.amount, category: preset.category });
    setShowAdd(true);
  };

  const handleAdd = async () => {
    if (!firebaseUser || !newSub.name || !newSub.amount) return;
    setLoading(true);
    try {
      await addSubscription(firebaseUser.uid, {
        ...newSub,
        userId: firebaseUser.uid,
        nextBillingDate: new Date(newSub.nextBillingDate),
      });
      toast.success(`${newSub.emoji} ${newSub.name} subscription added!`);
      setShowAdd(false);
      setNewSub({ name: '', emoji: '📱', amount: 0, billingCycle: 'monthly', category: 'entertainment', nextBillingDate: new Date().toISOString().split('T')[0], isActive: true });
      onUpdate();
    } catch {
      toast.error('Failed to add subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (sub: Subscription) => {
    try {
      await updateSubscription(sub.id, { isActive: !sub.isActive });
      toast.success(`${sub.name} ${!sub.isActive ? 'activated' : 'paused'}`);
      onUpdate();
    } catch {
      toast.error('Failed to update subscription');
    }
  };

  const handleDelete = async (sub: Subscription) => {
    try {
      await deleteSubscription(sub.id);
      toast.success(`${sub.name} removed`);
      onUpdate();
    } catch {
      toast.error('Failed to delete subscription');
    }
  };

  const monthlyTotal = subscriptions
    .filter((s) => s.isActive)
    .reduce((sum, s) => {
      if (s.billingCycle === 'monthly') return sum + s.amount;
      if (s.billingCycle === 'yearly') return sum + s.amount / 12;
      if (s.billingCycle === 'weekly') return sum + s.amount * 4.33;
      return sum;
    }, 0);

  const daysUntil = (date: Date) => {
    const diff = new Date(date).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10">
          <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1">Monthly Cost</p>
          <p className="text-3xl font-bold text-primary tracking-tight">₹{monthlyTotal.toFixed(0)}</p>
          <p className="text-xs text-muted-foreground mt-2">Active subscriptions</p>
        </div>
        <div className="p-5 rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/10">
          <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1">Yearly Cost</p>
          <p className="text-3xl font-bold text-accent tracking-tight">₹{(monthlyTotal * 12).toFixed(0)}</p>
          <p className="text-xs text-muted-foreground mt-2">{subscriptions.filter((s) => s.isActive).length} active</p>
        </div>
      </div>

      {/* Quick Add Popular */}
      {subscriptions.length === 0 && (
        <div>
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quick Add</p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_SUBS.map((s) => (
              <button
                key={s.name}
                onClick={() => handleQuickAdd(s)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border/50 bg-card hover:bg-primary/5 hover:border-primary/30 transition-all text-sm font-medium"
              >
                <span>{s.emoji}</span>
                <span>{s.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Subscription List */}
      <div className="space-y-3">
        {subscriptions.map((sub) => {
          const days = daysUntil(sub.nextBillingDate);
          const isDueSoon = days <= 3 && days >= 0;
          return (
            <div
              key={sub.id}
              className={`group relative flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 ${
                sub.isActive
                  ? 'bg-card border-border/40 hover:border-primary/20 hover:shadow-sm'
                  : 'bg-muted/30 border-border/20 opacity-60'
              }`}
            >
              <div className="text-2xl w-10 h-10 flex items-center justify-center rounded-xl bg-muted">
                {sub.emoji || '📱'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold tracking-tight truncate">{sub.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground capitalize">{sub.billingCycle}</span>
                  {isDueSoon && sub.isActive && (
                    <span className="text-xs bg-destructive/10 text-destructive font-semibold px-1.5 py-0.5 rounded-md">
                      Due in {days}d
                    </span>
                  )}
                  {days < 0 && sub.isActive && (
                    <span className="text-xs bg-orange-500/10 text-orange-500 font-semibold px-1.5 py-0.5 rounded-md">
                      Overdue
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold tracking-tight">₹{sub.amount}</p>
                <div className="flex items-center gap-1 mt-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleToggle(sub)}
                    className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                    title={sub.isActive ? 'Pause' : 'Activate'}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(sub)}
                    className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Form */}
      {showAdd ? (
        <div className="p-5 rounded-2xl border border-primary/20 bg-primary/5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold">New Subscription</h3>
            <button onClick={() => setShowAdd(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex gap-3">
            <div className="w-20">
              <Label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Icon</Label>
              <Input
                className="mt-1.5 text-center text-xl"
                value={newSub.emoji}
                onChange={(e) => setNewSub({ ...newSub, emoji: e.target.value })}
                maxLength={2}
              />
            </div>
            <div className="flex-1">
              <Label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Name</Label>
              <Input className="mt-1.5" placeholder="e.g. Netflix" value={newSub.name} onChange={(e) => setNewSub({ ...newSub, name: e.target.value })} />
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <Label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Amount (₹)</Label>
              <Input
                className="mt-1.5"
                type="number"
                placeholder="499"
                value={newSub.amount || ''}
                onChange={(e) => setNewSub({ ...newSub, amount: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="flex-1">
              <Label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Cycle</Label>
              <Select value={newSub.billingCycle} onValueChange={(v) => setNewSub({ ...newSub, billingCycle: v as any })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Next Billing Date</Label>
            <Input className="mt-1.5" type="date" value={newSub.nextBillingDate} onChange={(e) => setNewSub({ ...newSub, nextBillingDate: e.target.value })} />
          </div>

          <div>
            <Label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Category</Label>
            <Select value={newSub.category} onValueChange={(v) => setNewSub({ ...newSub, category: v as Category })}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(categoryConfig).map(([key, cfg]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <cfg.icon className="w-4 h-4" style={{ color: cfg.color }} />
                      {cfg.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button className="w-full" onClick={handleAdd} disabled={loading || !newSub.name || !newSub.amount}>
            {loading ? 'Adding...' : `Add ${newSub.emoji} ${newSub.name}`}
          </Button>
        </div>
      ) : (
        <Button variant="outline" className="w-full border-dashed border-2" onClick={() => setShowAdd(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Subscription
        </Button>
      )}
    </div>
  );
};
