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
import { Income } from '../types';

export const addIncome = async (userId: string, data: Omit<Income, 'id' | 'createdAt'>) => {
  try {
    // Strip undefined fields — Firestore rejects them
    const payload: Record<string, any> = {
      userId,
      amount: data.amount,
      source: data.source,
      description: data.description,
      date: Timestamp.fromDate(new Date(data.date)),
      createdAt: Timestamp.now(),
    };
    if (data.isRecurring) payload.isRecurring = true;
    if (data.recurringFrequency) payload.recurringFrequency = data.recurringFrequency;
    const docRef = await addDoc(collection(db, 'income'), payload);
    return docRef.id;
  } catch (error) {
    console.error('Error adding income:', error);
    throw error;
  }
};

export const getIncome = async (userId: string): Promise<Income[]> => {
  try {
    const q = query(
      collection(db, 'income'),
      where('userId', '==', userId),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map((d) => ({
        id: d.id,
        ...d.data(),
        date: d.data().date.toDate(),
        createdAt: d.data().createdAt.toDate(),
      } as Income))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error('Error getting income:', error);
    throw error;
  }
};

export const getMonthlyIncome = async (userId: string, month: string): Promise<number> => {
  try {
    const [year, monthNum] = month.split('-');
    const y = parseInt(year);
    const m = parseInt(monthNum) - 1;

    const all = await getIncome(userId);
    return all
      .filter((i) => {
        const d = new Date(i.date);
        return d.getFullYear() === y && d.getMonth() === m;
      })
      .reduce((sum, i) => sum + i.amount, 0);
  } catch (error) {
    console.error('Error getting monthly income:', error);
    throw error;
  }
};

export const deleteIncome = async (incomeId: string) => {
  try {
    await deleteDoc(doc(db, 'income', incomeId));
  } catch (error) {
    console.error('Error deleting income:', error);
    throw error;
  }
};

export const updateIncome = async (incomeId: string, updates: Partial<Income>) => {
  try {
    const ref = doc(db, 'income', incomeId);
    const updateData: any = { ...updates };
    if (updates.date) {
      updateData.date = Timestamp.fromDate(new Date(updates.date));
    }
    await updateDoc(ref, updateData);
  } catch (error) {
    console.error('Error updating income:', error);
    throw error;
  }
};
