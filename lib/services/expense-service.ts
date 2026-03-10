import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  Timestamp,
  getDocs,
  onSnapshot,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Expense, Category } from '../types';
import { getBudgets } from './budget-service';

export const addExpense = async (userId: string, expenseData: Omit<Expense, 'id' | 'createdAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'expenses'), {
      ...expenseData,
      date: Timestamp.fromDate(new Date(expenseData.date)),
      createdAt: Timestamp.now(),
      userId,
    });

    // Update budget spent amount
    await updateBudgetAfterExpense(userId, expenseData.category, expenseData.date);

    return docRef.id;
  } catch (error) {
    console.error('Error adding expense:', error);
    throw error;
  }
};

// Helper function to update budget spent amount
const updateBudgetAfterExpense = async (userId: string, category: Category, expenseDate: Date) => {
  try {
    const expenseMonth = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`;
    const budgets = await getBudgets(userId, expenseMonth);
    
    const categoryBudget = budgets.find(b => b.category === category);
    if (!categoryBudget) return; // No budget set for this category
    
    // Calculate total spent for this category in this month
    const expenses = await getExpensesByCategory(userId, category);
    const monthExpenses = expenses.filter(e => {
      const month = `${e.date.getFullYear()}-${String(e.date.getMonth() + 1).padStart(2, '0')}`;
      return month === expenseMonth;
    });
    
    const totalSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    // Update budget
    const budgetRef = doc(db, 'budgets', categoryBudget.id);
    await updateDoc(budgetRef, { spent: totalSpent });
  } catch (error) {
    console.error('Error updating budget:', error);
    // Don't throw - budget update failure shouldn't prevent expense creation
  }
};

export const updateExpense = async (expenseId: string, updates: Partial<Expense>) => {
  try {
    const ref = doc(db, 'expenses', expenseId);
    const updateData: any = { ...updates };

    if (updates.date) {
      updateData.date = Timestamp.fromDate(new Date(updates.date));
    }

    await updateDoc(ref, updateData);
  } catch (error) {
    console.error('Error updating expense:', error);
    throw error;
  }
};

export const deleteExpense = async (expenseId: string) => {
  try {
    await deleteDoc(doc(db, 'expenses', expenseId));
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
};

export const subscribeToExpenses = (
  userId: string,
  callback: (expenses: Expense[]) => void,
  constraints: QueryConstraint[] = [],
) => {
  const q = query(
    collection(db, 'expenses'),
    where('userId', '==', userId),
    orderBy('date', 'desc'),
    ...constraints,
  );
  return onSnapshot(q, (snapshot) => {
    const expenses = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate(),
      createdAt: doc.data().createdAt.toDate(),
    } as Expense));
    callback(expenses);
  });
};

export const getExpenses = async (userId: string, constraints: QueryConstraint[] = []) => {
  try {
    const q = query(
      collection(db, 'expenses'),
      where('userId', '==', userId),
      orderBy('date', 'desc'),
      ...constraints,
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate(),
      createdAt: doc.data().createdAt.toDate(),
    } as Expense));
  } catch (error) {
    console.error('Error getting expenses:', error);
    throw error;
  }
};

export const getExpensesByCategory = async (userId: string, category: Category) => {
  try {
    const q = query(
      collection(db, 'expenses'),
      where('userId', '==', userId),
      where('category', '==', category),
      orderBy('date', 'desc'),
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate(),
      createdAt: doc.data().createdAt.toDate(),
    } as Expense));
  } catch (error) {
    console.error('Error getting expenses by category:', error);
    throw error;
  }
};

export const getMonthlyExpenses = async (userId: string, month: string) => {
  try {
    const [year, monthNum] = month.split('-');
    const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(monthNum), 0, 23, 59, 59);

    const q = query(
      collection(db, 'expenses'),
      where('userId', '==', userId),
      where('date', '>=', Timestamp.fromDate(startDate)),
      where('date', '<=', Timestamp.fromDate(endDate)),
      orderBy('date', 'desc'),
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate(),
      createdAt: doc.data().createdAt.toDate(),
    } as Expense));
  } catch (error) {
    console.error('Error getting monthly expenses:', error);
    throw error;
  }
};

export const getTotalSpent = async (userId: string, category?: Category): Promise<number> => {
  try {
    let q;
    if (category) {
      q = query(
        collection(db, 'expenses'),
        where('userId', '==', userId),
        where('category', '==', category),
      );
    } else {
      q = query(collection(db, 'expenses'), where('userId', '==', userId));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.reduce((total, doc) => total + (doc.data().amount || 0), 0);
  } catch (error) {
    console.error('Error calculating total spent:', error);
    throw error;
  }
};
