# Recipe Book

A full-stack MERN application for managing personal recipes with JWT authentication.

## Features

- **User Authentication**: Register/Login with JWT tokens
- **CRUD Operations**: Create, Read, Update, Delete recipes
- **Recipe Management**: Ingredients, instructions, cook time, difficulty
- **Filtering**: Filter by category and difficulty
- **Responsive Design**: Works on desktop and mobile

## Tech Stack

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs for password hashing

### Frontend
- React 19 + TypeScript
- Vite (build tool)
- Context API for state management

## Key Learning Concepts

1. **JWT Authentication**: Token-based auth with middleware protection
2. **Mongoose Schemas**: Data modeling with references between collections
3. **RESTful API Design**: Proper HTTP methods and status codes
4. **Password Security**: bcrypt hashing with salt rounds
5. **React Context**: Global state management for auth
6. **Protected Routes**: Middleware to verify tokens

## Project Structure

```
recipe-book/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   │   ├── User.js       # User schema with password hashing
│   │   │   └── Recipe.js     # Recipe schema with user reference
│   │   ├── routes/
│   │   │   ├── auth.js       # Register, Login, Get user
│   │   │   └── recipes.js    # CRUD operations
│   │   ├── middleware/
│   │   │   └── auth.js       # verifyToken middleware
│   │   └── index.js          # Express app entry
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/       # React components
    │   ├── context/          # Auth context
    │   ├── services/         # API calls
    │   ├── types/            # TypeScript interfaces
    │   └── App.tsx
    └── package.json
```

## Setup

### Backend

1. Navigate to backend directory:
   ```bash
   cd backend
   npm install
   ```

2. Create `.env` file:
   ```
   MONGODB_URI=mongodb://localhost:27017/recipe-book
   JWT_SECRET=your-secret-key
   JWT_EXPIRES_IN=7d
   PORT=5000
   CLIENT_URL=http://localhost:5173
   ```

3. Start MongoDB and run:
   ```bash
   npm run dev
   ```

### Frontend

1. Navigate to frontend directory:
   ```bash
   cd frontend
   npm install
   ```

2. Create `.env` file:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Recipes (all protected)
- `GET /api/recipes` - Get all recipes for user
- `GET /api/recipes/:id` - Get single recipe
- `POST /api/recipes` - Create recipe
- `PUT /api/recipes/:id` - Update recipe
- `DELETE /api/recipes/:id` - Delete recipe

## The Secret Sauce

**Middleware**: The `verifyToken` function sits before protected routes. It checks the Authorization header, verifies the JWT, and attaches the user ID to the request. No token? No access!

```javascript
// Place middleware before your route
router.post('/recipes', verifyToken, async (req, res) => {
  // Only authenticated users reach this code
  const recipe = new Recipe({ ...req.body, user: req.user.userId });
});
```
