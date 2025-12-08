# BidStream

A real-time auction platform where users can bid on items with live updates and secure payment processing.

## What it does

BidStream enables live auction experiences with instant bid updates across all connected users. When someone places a bid, everyone sees it immediately - no page refresh needed. The platform integrates with Stripe for secure payment processing.

## Tech Stack

**Backend**
- Node.js + Express
- Socket.io for real-time WebSocket communication
- Stripe API for payment processing
- TypeScript

**Frontend**
- React 18
- Tailwind CSS
- Socket.io Client
- Stripe.js

## Getting Started

### Prerequisites
- Node.js 18+
- Stripe account (optional - runs in demo mode without it)

### Installation

1. Clone and install dependencies:
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

2. Set up environment variables:
```bash
# backend/.env
STRIPE_SECRET_KEY=sk_test_xxx  # Optional
FRONTEND_URL=http://localhost:5173
PORT=3000
```

3. Start the servers:
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

4. Open http://localhost:5173

## Features

- Real-time bidding with WebSocket updates
- Live auction countdown timers
- Stripe payment integration
- Bid history tracking
- Multi-user support with instant sync

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/auctions` | List all auctions |
| POST | `/api/payments/create-intent` | Create payment intent |

## Project Structure

```
bid-stream/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── routes/
│   │   ├── services/
│   │   └── index.ts
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   └── App.tsx
    └── package.json
```

## License

MIT
