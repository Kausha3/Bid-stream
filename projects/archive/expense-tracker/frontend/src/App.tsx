import { useState, useEffect, useCallback } from 'react';
import ExpenseForm from './components/ExpenseForm';
import TransactionList from './components/TransactionList';
import Charts from './components/Charts';
import * as api from './services/api';
import type { Expense, Summary, Category } from './types';
import './App.css';

function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [period, setPeriod] = useState('month');
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [expensesRes, summaryRes] = await Promise.all([
        api.getExpenses(),
        api.getSummary(period)
      ]);

      if (expensesRes.success) {
        setExpenses(expensesRes.data.expenses);
      }
      if (summaryRes.success) {
        setSummary(summaryRes.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddExpense = async (data: {
    description: string;
    amount: number;
    category: Category;
    type: 'expense' | 'income';
    date: string;
  }) => {
    const response = await api.createExpense(data);
    if (response.success) {
      fetchData();
    }
  };

  const handleDeleteExpense = async (id: string) => {
    const response = await api.deleteExpense(id);
    if (response.success) {
      fetchData();
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Expense Tracker</h1>
        <p>Track your spending, visualize your habits</p>
      </header>

      {summary && (
        <div className="summary-cards">
          <div className="summary-card income">
            <span className="label">Income</span>
            <span className="value">+${summary.totals.income.toFixed(2)}</span>
          </div>
          <div className="summary-card expense">
            <span className="label">Expenses</span>
            <span className="value">-${summary.totals.expenses.toFixed(2)}</span>
          </div>
          <div className={`summary-card balance ${summary.totals.balance >= 0 ? 'positive' : 'negative'}`}>
            <span className="label">Balance</span>
            <span className="value">
              {summary.totals.balance >= 0 ? '+' : ''}${summary.totals.balance.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      <div className="period-selector">
        <span>Period:</span>
        {['week', 'month', 'year'].map((p) => (
          <button
            key={p}
            className={`period-btn ${period === p ? 'active' : ''}`}
            onClick={() => setPeriod(p)}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      <main className="main-content">
        <aside className="sidebar">
          <ExpenseForm onSubmit={handleAddExpense} />
          <TransactionList expenses={expenses} onDelete={handleDeleteExpense} />
        </aside>

        <section className="chart-section">
          {isLoading ? (
            <div className="loading">Loading...</div>
          ) : summary ? (
            <Charts
              categoryBreakdown={summary.categoryBreakdown}
              dailyTrend={summary.dailyTrend}
            />
          ) : null}
        </section>
      </main>
    </div>
  );
}

export default App;
