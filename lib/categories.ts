import { Category } from './types';
import { UtensilsCrossed, Zap, Gamepad2, ShoppingBag, Heart, BookOpen, Plane, MoreHorizontal } from 'lucide-react';

export const categoryConfig: Record<Category, { name: string; color: string; icon: any; keywords: string[] }> = {
  food: {
    name: 'Food & Dining',
    color: 'oklch(0.72 0.2 10)',
    icon: UtensilsCrossed,
    keywords: ['restaurant', 'cafe', 'lunch', 'dinner', 'breakfast', 'food', 'pizza', 'burger', 'coffee', 'snack'],
  },
  transport: {
    name: 'Transport',
    color: 'oklch(0.65 0.2 50)',
    icon: Plane,
    keywords: ['uber', 'taxi', 'bus', 'train', 'fuel', 'parking', 'transport', 'travel', 'flight'],
  },
  entertainment: {
    name: 'Entertainment',
    color: 'oklch(0.75 0.15 150)',
    icon: Gamepad2,
    keywords: ['movie', 'cinema', 'game', 'entertainment', 'concert', 'ticket', 'show'],
  },
  utilities: {
    name: 'Utilities',
    color: 'oklch(0.55 0.25 280)',
    icon: Zap,
    keywords: ['electricity', 'water', 'internet', 'phone', 'gas', 'bill', 'utility'],
  },
  shopping: {
    name: 'Shopping',
    color: 'oklch(0.65 0.2 10)',
    icon: ShoppingBag,
    keywords: ['shopping', 'clothes', 'groceries', 'mall', 'amazon', 'shop', 'buy'],
  },
  health: {
    name: 'Health',
    color: 'oklch(0.72 0.2 10)',
    icon: Heart,
    keywords: ['doctor', 'pharmacy', 'medicine', 'hospital', 'health', 'gym', 'fitness'],
  },
  education: {
    name: 'Education',
    color: 'oklch(0.7 0.15 200)',
    icon: BookOpen,
    keywords: ['school', 'college', 'course', 'book', 'education', 'tuition', 'learning'],
  },
  other: {
    name: 'Other',
    color: 'oklch(0.5 0.02 280)',
    icon: MoreHorizontal,
    keywords: [],
  },
};

export const categorizeExpense = (description: string): Category => {
  const normalizedDesc = description.toLowerCase();

  for (const [category, config] of Object.entries(categoryConfig)) {
    if (config.keywords.length === 0) continue;

    for (const keyword of config.keywords) {
      if (normalizedDesc.includes(keyword)) {
        return category as Category;
      }
    }
  }

  return 'other';
};

export const getCategoryIcon = (category: Category) => {
  return categoryConfig[category]?.icon;
};

export const getCategoryColor = (category: Category) => {
  return categoryConfig[category]?.color;
};

export const getCategoryName = (category: Category) => {
  return categoryConfig[category]?.name;
};
