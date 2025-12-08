# Mini Stack Overflow

A simplified Stack Overflow clone demonstrating complex MongoDB relationships, reputation systems, and voting mechanics.

## Features

- User authentication with JWT
- Ask and answer questions
- Vote on questions and answers (upvote/downvote)
- Accept answers (question author only)
- Tag system with auto-creation
- Reputation system
- Sort by newest, votes, or unanswered
- Filter by tags

## Tech Stack

### Backend
- Node.js + Express
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing

### Frontend
- React 19 + TypeScript
- Vite
- CSS (Stack Overflow-inspired design)

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Data Models

### User
- username, email, password
- reputation (starts at 1)
- questionsCount, answersCount

### Question
- title, body, author
- tags (array of Tag references)
- votes, upvoters, downvoters
- answers (array of Answer references)
- acceptedAnswer, views

### Answer
- body, author, question
- votes, upvoters, downvoters
- isAccepted

### Tag
- name (unique, lowercase)
- questionsCount

### Vote
- user, targetType, targetId, value
- Compound index prevents double voting

## Reputation System

| Action | Points |
|--------|--------|
| Question upvoted | +10 |
| Question downvoted | -2 |
| Answer upvoted | +10 |
| Answer downvoted | -2 |
| Answer accepted | +15 |

## API Endpoints

### Auth
- POST `/api/auth/register` - Register
- POST `/api/auth/login` - Login
- GET `/api/auth/me` - Current user

### Questions
- GET `/api/questions` - List questions
- GET `/api/questions/:id` - Get question with answers
- POST `/api/questions` - Create question
- POST `/api/questions/:id/vote` - Vote on question
- POST `/api/questions/:id/accept/:answerId` - Accept answer

### Answers
- POST `/api/answers` - Create answer
- POST `/api/answers/:id/vote` - Vote on answer

### Tags
- GET `/api/tags` - List tags
- GET `/api/tags/popular` - Popular tags

## Learning Highlights

- Complex MongoDB relationships with multiple ObjectId references
- Polymorphic references (Comment can belong to Question or Answer)
- Compound unique indexes to prevent duplicate votes
- Reputation system with points calculation
- Vote toggling logic (click again to remove vote)
- Population and nested population with Mongoose
