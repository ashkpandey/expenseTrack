import { PaymentApp, Category } from './types';
import { categorizeExpense } from './categories';

export interface ParsedUPITransaction {
  amount: number;
  description: string;
  merchant: string;
  paymentApp: PaymentApp;
  category: Category;
  date: Date;
  upiRef?: string;
  isDebit: boolean;
}

/** Patterns for each payment app SMS format */
const APP_PATTERNS: { app: PaymentApp; patterns: RegExp[] }[] = [
  {
    app: 'gpay',
    patterns: [
      /google pay/i,
      /gpay/i,
      /paid via google/i,
    ],
  },
  {
    app: 'phonepe',
    patterns: [
      /phonepe/i,
      /phone pe/i,
      /paid via phonepe/i,
    ],
  },
  {
    app: 'paytm',
    patterns: [
      /paytm/i,
      /paid via paytm/i,
    ],
  },
  {
    app: 'amazonpay',
    patterns: [
      /amazon pay/i,
      /amazonpay/i,
      /amazon\.pay/i,
    ],
  },
  {
    app: 'slice',
    patterns: [
      /slice/i,
      /slicepay/i,
    ],
  },
  {
    app: 'cred',
    patterns: [
      /cred/i,
      /paid via cred/i,
    ],
  },
];

/** Patterns to extract amount */
const AMOUNT_PATTERNS = [
  /(?:rs\.?|inr|₹)\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
  /([0-9,]+(?:\.[0-9]{1,2})?)\s*(?:rs\.?|inr|₹)/i,
  /debited\s+(?:rs\.?|inr|₹)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
  /paid\s+(?:rs\.?|inr|₹)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
  /amount:?\s*(?:rs\.?|inr|₹)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
  /transferred\s+(?:rs\.?|inr|₹)?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
];

/** Patterns to extract merchant/payee */
const MERCHANT_PATTERNS = [
  /(?:to|paid to|sent to|at)\s+([A-Za-z0-9 &.'_\-]+?)(?:\s+(?:via|on|for|ref|upi|vpa|transaction|txn|id)|$)/i,
  /(?:vpa|upi id):\s*([^\s@]+)/i,
  /(?:for|towards)\s+([A-Za-z0-9 &.'_\-]+?)(?:\s+(?:via|on|ref|upi|transaction)|$)/i,
];

/** Patterns for UPI reference ID */
const UPI_REF_PATTERNS = [
  /(?:upi ref|ref no|ref id|ref[\.:]\s*|txn id|transaction id)[\s:]*([A-Z0-9]{12,})/i,
  /([0-9]{12,16})/,
];

/** Debit keywords — true = money left your account */
const DEBIT_KEYWORDS = [
  /debited/i,
  /paid/i,
  /sent/i,
  /transferred/i,
  /deducted/i,
  /payment of/i,
  /purchase/i,
];

const CREDIT_KEYWORDS = [
  /credited/i,
  /received/i,
  /refund/i,
  /cashback/i,
];

function detectApp(text: string): PaymentApp {
  for (const { app, patterns } of APP_PATTERNS) {
    if (patterns.some((p) => p.test(text))) return app;
  }
  if (/upi/i.test(text)) return 'other';
  if (/debit card|credit card/i.test(text)) return 'card';
  if (/cash/i.test(text)) return 'cash';
  return 'other';
}

function extractAmount(text: string): number | null {
  for (const pattern of AMOUNT_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      const cleaned = match[1].replace(/,/g, '');
      const amount = parseFloat(cleaned);
      if (!isNaN(amount) && amount > 0) return amount;
    }
  }
  return null;
}

function extractMerchant(text: string): string {
  for (const pattern of MERCHANT_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      return match[1].trim().replace(/\s+/g, ' ');
    }
  }
  return '';
}

function extractUPIRef(text: string): string | undefined {
  for (const pattern of UPI_REF_PATTERNS) {
    const match = text.match(pattern);
    if (match) return match[1];
  }
  return undefined;
}

function detectIsDebit(text: string): boolean {
  const hasCredit = CREDIT_KEYWORDS.some((p) => p.test(text));
  if (hasCredit) return false;
  return DEBIT_KEYWORDS.some((p) => p.test(text));
}

/**
 * Parses a raw UPI/SMS/notification string into a structured transaction.
 * Returns null if it cannot confidently detect an amount.
 */
export function parseUPIMessage(raw: string): ParsedUPITransaction | null {
  const text = raw.trim();
  if (!text) return null;

  const amount = extractAmount(text);
  if (!amount) return null;

  const paymentApp = detectApp(text);
  const merchant = extractMerchant(text);
  const upiRef = extractUPIRef(text);
  const isDebit = detectIsDebit(text);

  // Build a usable description for auto-categorization
  const description = merchant || text.substring(0, 60);
  const category = categorizeExpense(description);

  return {
    amount,
    description,
    merchant,
    paymentApp,
    category,
    date: new Date(),
    upiRef,
    isDebit,
  };
}

/** Pretty name for a payment app */
export const paymentAppLabels: Record<PaymentApp, { label: string; emoji: string }> = {
  gpay: { label: 'Google Pay', emoji: '🟢' },
  phonepe: { label: 'PhonePe', emoji: '🟣' },
  paytm: { label: 'Paytm', emoji: '🔵' },
  amazonpay: { label: 'Amazon Pay', emoji: '🟡' },
  slice: { label: 'Slice', emoji: '🔴' },
  cred: { label: 'CRED', emoji: '⚫' },
  cash: { label: 'Cash', emoji: '💵' },
  card: { label: 'Card', emoji: '💳' },
  other: { label: 'Other', emoji: '🏦' },
};
