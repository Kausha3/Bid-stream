import type { Expense } from '../types';

interface TransactionListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  food: '🍔',
  transportation: '🚗',
  entertainment: '🎬',
  utilities: '💡',
  shopping: '🛍️',
  health: '🏥',
  education: '📚',
  other: '📦'
};

const TransactionList = ({ expenses, onDelete }: TransactionListProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatAmount = (amount: number, type: string) => {
    const prefix = type === 'income' ? '+' : '-';
    return `${prefix}$${amount.toFixed(2)}`;
  };

  return (
    <div className="transaction-list">
      <h3>Recent Transactions</h3>
      {expenses.length === 0 ? (
        <p className="no-transactions">No transactions yet</p>
      ) : (
        <ul>
          {expenses.slice(0, 10).map((expense) => (
            <li key={expense._id} className={`transaction-item ${expense.type}`}>
              <span className="category-icon">{CATEGORY_ICONS[expense.category] || '📦'}</span>
              <div className="transaction-info">
                <span className="description">{expense.description}</span>
                <span className="date">{formatDate(expense.date)}</span>
              </div>
              <span className={`amount ${expense.type}`}>
                {formatAmount(expense.amount, expense.type)}
              </span>
              <button className="delete-btn" onClick={() => onDelete(expense._id)}>×</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TransactionList;
