import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Category } from '../types';

interface ExpenseFormProps {
  onSubmit: (data: {
    description: string;
    amount: number;
    category: Category;
    type: 'expense' | 'income';
    date: string;
  }) => Promise<void>;
}

const CATEGORIES: Category[] = ['food', 'transportation', 'entertainment', 'utilities', 'shopping', 'health', 'education', 'other'];

const ExpenseForm = ({ onSubmit }: ExpenseFormProps) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'other' as Category,
    type: 'expense' as 'expense' | 'income',
    date: new Date().toISOString().split('T')[0]
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) return;

    setIsLoading(true);
    try {
      await onSubmit({
        ...formData,
        amount: parseFloat(formData.amount)
      });
      setFormData({
        description: '',
        amount: '',
        category: 'other',
        type: 'expense',
        date: new Date().toISOString().split('T')[0]
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="expense-form">
      <h3>Add Transaction</h3>

      <div className="form-row">
        <div className="form-group">
          <label>Type</label>
          <div className="type-toggle">
            <button
              type="button"
              className={`toggle-btn ${formData.type === 'expense' ? 'active expense' : ''}`}
              onClick={() => setFormData({ ...formData, type: 'expense' })}
            >
              Expense
            </button>
            <button
              type="button"
              className={`toggle-btn ${formData.type === 'income' ? 'active income' : ''}`}
              onClick={() => setFormData({ ...formData, type: 'income' })}
            >
              Income
            </button>
          </div>
        </div>
      </div>

      <div className="form-group">
        <label>Description</label>
        <input
          type="text"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="What was this for?"
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Amount ($)</label>
          <input
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="0.00"
            min="0.01"
            step="0.01"
            required
          />
        </div>

        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label>Category</label>
        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" className="submit-btn" disabled={isLoading}>
        {isLoading ? 'Adding...' : 'Add Transaction'}
      </button>
    </form>
  );
};

export default ExpenseForm;
