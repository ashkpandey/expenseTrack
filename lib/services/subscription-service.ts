import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Subscription } from '../types';
import { addExpense } from './expense-service';

export const addSubscription = async (userId: string, data: Omit<Subscription, 'id' | 'createdAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'subscriptions'), {
      ...data,
      nextBillingDate: Timestamp.fromDate(new Date(data.nextBillingDate)),
      createdAt: Timestamp.now(),
      userId,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding subscription:', error);
    throw error;
  }
};

export const getSubscriptions = async (userId: string): Promise<Subscription[]> => {
  try {
    const q = query(
      collection(db, 'subscriptions'),
      where('userId', '==', userId),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      nextBillingDate: d.data().nextBillingDate.toDate(),
      createdAt: d.data().createdAt.toDate(),
      lastAutoAdded: d.data().lastAutoAdded?.toDate(),
    } as Subscription));
  } catch (error) {
    console.error('Error getting subscriptions:', error);
    throw error;
  }
};

export const updateSubscription = async (subId: string, updates: Partial<Subscription>) => {
  try {
    const ref = doc(db, 'subscriptions', subId);
    const updateData: any = { ...updates };
    if (updates.nextBillingDate) {
      updateData.nextBillingDate = Timestamp.fromDate(new Date(updates.nextBillingDate));
    }
    await updateDoc(ref, updateData);
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
};

export const deleteSubscription = async (subId: string) => {
  try {
    await deleteDoc(doc(db, 'subscriptions', subId));
  } catch (error) {
    console.error('Error deleting subscription:', error);
    throw error;
  }
};

/**
 * Checks all active subscriptions and auto-adds them as expenses
 * if their nextBillingDate has passed and hasn't been added yet today.
 */
export const processSubscriptionsDue = async (userId: string): Promise<string[]> => {
  const subscriptions = await getSubscriptions(userId);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const added: string[] = [];

  for (const sub of subscriptions) {
    if (!sub.isActive) continue;

    const billing = new Date(sub.nextBillingDate);
    billing.setHours(0, 0, 0, 0);

    const lastAdded = sub.lastAutoAdded ? new Date(sub.lastAutoAdded) : null;
    lastAdded?.setHours(0, 0, 0, 0);

    const isDue = billing <= today;
    const alreadyAddedToday = lastAdded?.getTime() === today.getTime();

    if (isDue && !alreadyAddedToday) {
      // Add as expense
      await addExpense(userId, {
        userId,
        amount: sub.amount,
        description: `${sub.emoji ? sub.emoji + ' ' : ''}${sub.name} (subscription)`,
        category: sub.category,
        date: new Date(sub.nextBillingDate),
        isFromUPI: false,
      });

      // Advance next billing date
      const next = new Date(sub.nextBillingDate);
      if (sub.billingCycle === 'monthly') next.setMonth(next.getMonth() + 1);
      else if (sub.billingCycle === 'yearly') next.setFullYear(next.getFullYear() + 1);
      else if (sub.billingCycle === 'weekly') next.setDate(next.getDate() + 7);

      await updateSubscription(sub.id, {
        nextBillingDate: next,
        lastAutoAdded: today,
      });

      added.push(sub.name);
    }
  }

  return added;
};

/** Returns total monthly cost of active subscriptions */
export const getMonthlySubscriptionCost = (subscriptions: Subscription[]): number => {
  return subscriptions
    .filter((s) => s.isActive)
    .reduce((sum, s) => {
      if (s.billingCycle === 'monthly') return sum + s.amount;
      if (s.billingCycle === 'yearly') return sum + s.amount / 12;
      if (s.billingCycle === 'weekly') return sum + s.amount * 4.33;
      return sum;
    }, 0);
};
