export interface Expense {
  _id: string;
  description: string;
  amount: number;
  category: Category;
  type: 'expense' | 'income';
  date: string;
}

export type Category = 'food' | 'transportation' | 'entertainment' | 'utilities' | 'shopping' | 'health' | 'education' | 'other';

export interface CategoryBreakdown {
  _id: Category;
  total: number;
  count: number;
}

export interface DailyTrend {
  _id: {
    date: string;
    type: string;
  };
  total: number;
}

export interface Summary {
  categoryBreakdown: CategoryBreakdown[];
  dailyTrend: DailyTrend[];
  totals: {
    expenses: number;
    income: number;
    balance: number;
  };
}
