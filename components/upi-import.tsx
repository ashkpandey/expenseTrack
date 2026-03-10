'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { parseUPIMessage, paymentAppLabels, ParsedUPITransaction } from '@/lib/upi-parser';
import { categoryConfig } from '@/lib/categories';
import { addExpense } from '@/lib/services/expense-service';
import { useAuth } from '@/lib/auth-context';
import { Category, PaymentApp } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Sparkles, ClipboardPaste, Check, RefreshCw, X, Clipboard } from 'lucide-react';

interface UPIImportProps {
  onSuccess?: () => void;
}

export const UPIImport: React.FC<UPIImportProps> = ({ onSuccess }) => {
  const { firebaseUser } = useAuth();
  const [raw, setRaw] = useState('');
  const [parsed, setParsed] = useState<ParsedUPITransaction | null>(null);
  const [editedCategory, setEditedCategory] = useState<Category>('other');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clipboardStatus, setClipboardStatus] = useState<'idle' | 'detected' | 'denied'>('idle');
  const hasAutoReadRef = useRef(false);

  // UPI keywords to detect in clipboard
  const looksLikeUPI = (text: string) =>
    /debited|credited|paid|upi|gpay|phonepe|paytm|₹|rs\.|inr/i.test(text);

  const readClipboard = async (silent = false) => {
    if (!navigator.clipboard) return;
    try {
      const text = await navigator.clipboard.readText();
      if (text && looksLikeUPI(text)) {
        setRaw(text);
        setClipboardStatus('detected');
        // Auto-parse immediately
        const result = parseUPIMessage(text);
        if (result?.isDebit) {
          setParsed(result);
          setEditedCategory(result.category);
        }
        if (!silent) toast.success('Transaction detected from clipboard!');
      } else if (!silent) {
        toast.info('No UPI transaction found in clipboard');
      }
    } catch {
      setClipboardStatus('denied');
    }
  };

  // Auto-read clipboard on mount (works on Android Chrome without prompt)
  useEffect(() => {
    if (hasAutoReadRef.current) return;
    hasAutoReadRef.current = true;

    // First check localStorage for text shared via Share Target API
    try {
      const pending = localStorage.getItem('pendingUPIText');
      if (pending) {
        localStorage.removeItem('pendingUPIText');
        setRaw(pending);
        const result = parseUPIMessage(pending);
        if (result?.isDebit) {
          setParsed(result);
          setEditedCategory(result.category);
          setClipboardStatus('detected');
        }
        return;
      }
    } catch {}

    readClipboard(true);
  }, []);

  // Re-check clipboard when the page regains focus (user copied SMS then switched back)
  useEffect(() => {
    const onFocus = () => {
      if (!parsed) readClipboard(true);
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [parsed]);

  const EXAMPLE_MESSAGES = [
    'Rs. 250 debited from your account to Swiggy via Google Pay UPI on 02-03-2026. UPI Ref No: 123456789012.',
    'Your A/c XX1234 debited INR 549 for Netflix via PhonePe on 02/03/26. Ref: 987654321098.',
    'Paid ₹1,200 to Big Bazaar via Paytm. Transaction ID: 456789012345.',
  ];

  const handleParse = () => {
    setError('');
    const result = parseUPIMessage(raw);
    if (!result) {
      setError('Could not detect a transaction in this message. Make sure it contains an amount.');
      return;
    }
    if (!result.isDebit) {
      setError('This looks like a credit/refund, not a debit. Only expenses can be imported.');
      return;
    }
    setParsed(result);
    setEditedCategory(result.category);
  };

  const handleConfirm = async () => {
    if (!firebaseUser || !parsed) return;
    setLoading(true);
    try {
      await addExpense(firebaseUser.uid, {
        userId: firebaseUser.uid,
        amount: parsed.amount,
        description: parsed.merchant || parsed.description,
        category: editedCategory,
        date: new Date(),
        paymentMethod: parsed.paymentApp,
        isFromUPI: true,
        upiRef: parsed.upiRef,
      });
      toast.success(`₹${parsed.amount} imported from ${paymentAppLabels[parsed.paymentApp].label}!`);
      setRaw('');
      setParsed(null);
      onSuccess?.();
    } catch {
      toast.error('Failed to import transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setParsed(null);
    setError('');
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <div className="p-2.5 bg-primary/10 rounded-xl text-primary mt-0.5">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold tracking-tight">Import from Payment App</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Copy any UPI SMS — we auto-detect it from your clipboard. Or paste it below.
          </p>
        </div>
      </div>

      {/* Clipboard auto-detect banner */}
      {clipboardStatus === 'detected' && !parsed && !raw && (
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-sm">
          <span className="text-emerald-600">✓</span>
          <span className="font-medium text-emerald-700 dark:text-emerald-400">UPI transaction detected in clipboard!</span>
        </div>
      )}

      {!parsed ? (
        <>
          {/* Read clipboard button */}
          <button
            onClick={() => readClipboard(false)}
            className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-all text-primary font-semibold text-sm"
          >
            <Clipboard className="w-4 h-4" />
            Read from Clipboard
          </button>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex-1 h-px bg-border" />
            <span>or paste manually</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="space-y-2">
            <div className="relative">
              <textarea
                value={raw}
                onChange={(e) => { setRaw(e.target.value); setError(''); }}
                placeholder={`Paste your UPI SMS here...\n\nExample:\n"Rs. 250 debited from your account to Swiggy via Google Pay UPI on 02-03-2026. UPI Ref No: 123456789012."`}
                className="w-full h-36 rounded-2xl border border-border/50 bg-background p-4 text-sm resize-none focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/50 font-mono"
              />
              {raw && (
                <button
                  onClick={() => setRaw('')}
                  className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {error && (
              <p className="text-destructive text-sm flex items-center gap-2">
                <span className="w-4 h-4 text-xs">⚠️</span> {error}
              </p>
            )}
          </div>

          {/* Example messages */}
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">Try an example</p>
            <div className="space-y-2">
              {EXAMPLE_MESSAGES.map((msg, i) => (
                <button
                  key={i}
                  onClick={() => setRaw(msg)}
                  className="w-full text-left text-xs p-3 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted/60 hover:border-primary/20 transition-all font-mono text-muted-foreground line-clamp-2"
                >
                  {msg}
                </button>
              ))}
            </div>
          </div>

          <Button className="w-full" onClick={handleParse} disabled={!raw.trim()}>
            <ClipboardPaste className="w-4 h-4 mr-2" />
            Parse Transaction
          </Button>
        </>
      ) : (
        <div className="space-y-4">
          {/* Parsed preview card */}
          <div className="p-5 rounded-2xl border border-primary/20 bg-primary/5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{paymentAppLabels[parsed.paymentApp].emoji}</span>
                <div>
                  <p className="font-bold">{paymentAppLabels[parsed.paymentApp].label}</p>
                  {parsed.upiRef && <p className="text-xs text-muted-foreground font-mono">Ref: {parsed.upiRef}</p>}
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-extrabold tracking-tight text-primary">₹{parsed.amount.toFixed(2)}</p>
              </div>
            </div>

            <div className="border-t border-border/30 pt-4 space-y-1">
              <p className="text-sm font-semibold">{parsed.merchant || parsed.description}</p>
              <p className="text-xs text-muted-foreground">{new Date(parsed.date).toLocaleDateString()}</p>
            </div>

            {/* Category editor */}
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1.5">Category (auto-detected, editable)</p>
              <Select value={editedCategory} onValueChange={(v) => setEditedCategory(v as Category)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
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
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={handleReset}>
              <RefreshCw className="w-4 h-4 mr-2" /> Re-parse
            </Button>
            <Button className="flex-1" onClick={handleConfirm} disabled={loading}>
              {loading ? 'Saving...' : <><Check className="w-4 h-4 mr-2" /> Confirm & Save</>}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
