'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';

function ShareTargetHandler() {
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const text = params.get('text') || params.get('url') || '';
    if (text) {
      // Store the shared text so the UPI import tab can pick it up
      try {
        localStorage.setItem('pendingUPIText', text);
      } catch {}
    }
    // Redirect to home with UPI tab active
    router.replace('/?tab=upi');
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="relative w-12 h-12 mx-auto">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin" />
        </div>
        <p className="text-muted-foreground font-medium">Loading transaction...</p>
      </div>
    </div>
  );
}

export default function ShareTargetPage() {
  return (
    <Suspense>
      <ShareTargetHandler />
    </Suspense>
  );
}
