# Expense Tracker

A full-stack expense tracking application with data visualization using Chart.js and MongoDB aggregation pipelines.

## Features

- Track income and expenses with categories
- Summary cards showing totals and balance
- Period filtering (week, month, year)
- Pie chart for category breakdown
- Bar chart for daily income vs expenses trend
- MongoDB aggregation for efficient data analysis

## Tech Stack

### Backend
- Node.js + Express
- MongoDB with Mongoose
- Aggregation pipelines for analytics

### Frontend
- React 19 + TypeScript
- Vite
- Chart.js with react-chartjs-2
- CSS (no framework)

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/expenses | Get all expenses |
| POST | /api/expenses | Create expense |
| DELETE | /api/expenses/:id | Delete expense |
| GET | /api/expenses/summary | Get aggregated summary |

## Categories

- Food
- Transportation
- Entertainment
- Utilities
- Shopping
- Health
- Education
- Other

## Learning Highlights

- MongoDB Aggregation Pipeline ($match, $group, $sort)
- Chart.js integration with React
- Date-based data filtering
- Category-based expense analysis
