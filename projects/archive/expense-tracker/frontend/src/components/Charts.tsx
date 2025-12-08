import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import type { CategoryBreakdown, DailyTrend } from '../types';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const CATEGORY_COLORS: Record<string, string> = {
  food: '#ef4444',
  transportation: '#f97316',
  entertainment: '#eab308',
  utilities: '#22c55e',
  shopping: '#06b6d4',
  health: '#3b82f6',
  education: '#8b5cf6',
  other: '#6b7280'
};

interface ChartsProps {
  categoryBreakdown: CategoryBreakdown[];
  dailyTrend: DailyTrend[];
}

const Charts = ({ categoryBreakdown, dailyTrend }: ChartsProps) => {
  // Pie chart data
  const pieData = {
    labels: categoryBreakdown.map((c) => c._id.charAt(0).toUpperCase() + c._id.slice(1)),
    datasets: [
      {
        data: categoryBreakdown.map((c) => c.total),
        backgroundColor: categoryBreakdown.map((c) => CATEGORY_COLORS[c._id] || CATEGORY_COLORS.other),
        borderWidth: 0
      }
    ]
  };

  // Process daily trend for bar chart
  const dates = [...new Set(dailyTrend.map((d) => d._id.date))].sort();
  const expensesByDate = new Map<string, number>();
  const incomeByDate = new Map<string, number>();

  dailyTrend.forEach((d) => {
    if (d._id.type === 'expense') {
      expensesByDate.set(d._id.date, d.total);
    } else {
      incomeByDate.set(d._id.date, d.total);
    }
  });

  const barData = {
    labels: dates.map((d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Income',
        data: dates.map((d) => incomeByDate.get(d) || 0),
        backgroundColor: '#22c55e'
      },
      {
        label: 'Expenses',
        data: dates.map((d) => expensesByDate.get(d) || 0),
        backgroundColor: '#ef4444'
      }
    ]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <div className="charts">
      <div className="chart-card">
        <h3>Spending by Category</h3>
        <div className="pie-container">
          {categoryBreakdown.length > 0 ? (
            <Pie data={pieData} />
          ) : (
            <p className="no-data">No expense data</p>
          )}
        </div>
      </div>

      <div className="chart-card">
        <h3>Daily Trend</h3>
        <div className="bar-container">
          {dailyTrend.length > 0 ? (
            <Bar data={barData} options={barOptions} />
          ) : (
            <p className="no-data">No transaction data</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Charts;
