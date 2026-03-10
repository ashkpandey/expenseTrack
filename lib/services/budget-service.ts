import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Budget } from '../types';

export const setBudget = async (userId: string, budgetData: Omit<Budget, 'id'>) => {
  try {
    // Check if budget for this month/category already exists
    const q = query(
      collection(db, 'budgets'),
      where('userId', '==', userId),
      where('category', '==', budgetData.category),
      where('month', '==', budgetData.month),
    );

    const existingBudgets = await getDocs(q);

    if (existingBudgets.docs.length > 0) {
      // Update existing budget
      const budgetId = existingBudgets.docs[0].id;
      await updateDoc(doc(db, 'budgets', budgetId), {
        limit: budgetData.limit,
        alertThreshold: budgetData.alertThreshold,
      });
      return budgetId;
    }

    // Create new budget
    const docRef = await addDoc(collection(db, 'budgets'), budgetData);
    return docRef.id;
  } catch (error) {
    console.error('Error setting budget:', error);
    throw error;
  }
};

export const getBudgets = async (userId: string, month: string): Promise<Budget[]> => {
  try {
    const q = query(
      collection(db, 'budgets'),
      where('userId', '==', userId),
      where('month', '==', month),
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Budget));
  } catch (error) {
    console.error('Error getting budgets:', error);
    throw error;
  }
};

export const updateBudgetSpent = async (budgetId: string, amount: number) => {
  try {
    const ref = doc(db, 'budgets', budgetId);
    await updateDoc(ref, {
      spent: amount,
    });
  } catch (error) {
    console.error('Error updating budget spent:', error);
    throw error;
  }
};

export const deleteBudget = async (budgetId: string) => {
  try {
    await deleteDoc(doc(db, 'budgets', budgetId));
  } catch (error) {
    console.error('Error deleting budget:', error);
    throw error;
  }
};

export const checkBudgetAlerts = async (userId: string, month: string) => {
  try {
    const budgets = await getBudgets(userId, month);
    return budgets.filter((b) => {
      const percentage = (b.spent / b.limit) * 100;
      return percentage >= b.alertThreshold;
    });
  } catch (error) {
    console.error('Error checking budget alerts:', error);
    throw error;
  }
};

export const recalculateBudgetSpent = async (userId: string, budgetId: string, category: string, month: string) => {
  try {
    // Import here to avoid circular dependency
    const { getExpenses } = await import('./expense-service');
    
    const [year, monthNum] = month.split('-');
    const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(monthNum), 0, 23, 59, 59);

    const expenses = await getExpenses(userId);
    const categoryExpenses = expenses.filter(
      e => e.category === category && 
           e.date >= startDate && 
           e.date <= endDate
    );

    const totalSpent = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);

    await updateBudgetSpent(budgetId, totalSpent);
    return totalSpent;
  } catch (error) {
    console.error('Error recalculating budget spent:', error);
    throw error;
  }
};
