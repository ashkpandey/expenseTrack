'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard-header';
import { SubscriptionManager } from '@/components/subscription-manager';
import { getSubscriptions, processSubscriptionsDue } from '@/lib/services/subscription-service';
import { useAuth } from '@/lib/auth-context';
import { Subscription } from '@/lib/types';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function SubscriptionsPage() {
  const router = useRouter();
  const { firebaseUser } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const hasAutoProcessed = useRef(false);

  const fetchSubscriptions = useCallback(async () => {
    if (!firebaseUser) return;
    setLoading(true);
    try {
      const data = await getSubscriptions(firebaseUser.uid);
      setSubscriptions(data);
    } catch {
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  }, [firebaseUser]);

  const handleProcessDue = useCallback(async () => {
    if (!firebaseUser) return;
    setProcessing(true);
    try {
      const added = await processSubscriptionsDue(firebaseUser.uid);
      if (added.length > 0) {
        toast.success(`${added.length} subscription${added.length > 1 ? 's' : ''} auto-added as expenses`);
      }
      fetchSubscriptions();
    } catch {
      toast.error('Failed to process subscriptions');
    } finally {
      setProcessing(false);
    }
  }, [firebaseUser, fetchSubscriptions]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  // Auto-process overdue subs once on initial load only
  useEffect(() => {
    if (!loading && !hasAutoProcessed.current) {
      hasAutoProcessed.current = true;
      handleProcessDue();
    }
  }, [loading, handleProcessDue]);

  return (
    <main className="min-h-screen bg-background pb-32">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center justify-between pt-6 pb-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2.5 rounded-xl hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-extrabold tracking-tight">Subscriptions</h1>
          </div>
          <button
            onClick={handleProcessDue}
            disabled={processing}
            className="flex items-center gap-1.5 text-sm text-primary font-semibold hover:bg-primary/10 px-3 py-2 rounded-xl transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${processing ? 'animate-spin' : ''}`} />
            Sync
          </button>
        </div>

        <DashboardHeader />

        <div className="mt-6">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          ) : (
            <SubscriptionManager subscriptions={subscriptions} onUpdate={fetchSubscriptions} />
          )}
        </div>
      </div>
    </main>
  );
}
