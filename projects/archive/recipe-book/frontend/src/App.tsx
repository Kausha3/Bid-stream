import { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthForm from './components/AuthForm';
import RecipeCard from './components/RecipeCard';
import RecipeForm from './components/RecipeForm';
import RecipeDetail from './components/RecipeDetail';
import * as api from './services/api';
import type { Recipe, RecipeFormData } from './types';
import './App.css';

type View = 'list' | 'create' | 'edit' | 'detail';

const RecipeApp = () => {
  const { user, isLoading: authLoading, isAuthenticated, logout } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [view, setView] = useState<View>('list');
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState({ category: 'all', difficulty: 'all' });

  const fetchRecipes = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: { category?: string; difficulty?: string } = {};
      if (filter.category !== 'all') params.category = filter.category;
      if (filter.difficulty !== 'all') params.difficulty = filter.difficulty;

      const response = await api.getRecipes(params);
      if (response.success) {
        setRecipes(response.data.recipes);
      }
    } catch (error) {
      console.error('Failed to fetch recipes:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchRecipes();
    }
  }, [isAuthenticated, fetchRecipes]);

  const handleCreateRecipe = async (data: RecipeFormData) => {
    const response = await api.createRecipe(data);
    if (response.success) {
      setView('list');
      fetchRecipes();
    }
  };

  const handleUpdateRecipe = async (data: RecipeFormData) => {
    if (!selectedRecipe) return;
    const response = await api.updateRecipe(selectedRecipe._id, data);
    if (response.success) {
      setView('list');
      setSelectedRecipe(null);
      fetchRecipes();
    }
  };

  const handleDeleteRecipe = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recipe?')) return;
    const response = await api.deleteRecipe(id);
    if (response.success) {
      fetchRecipes();
    }
  };

  const handleViewRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setView('detail');
  };

  const handleEditRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setView('edit');
  };

  if (authLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <AuthForm
        mode={authMode}
        onToggleMode={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
      />
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1>Recipe Book</h1>
        </div>
        <div className="header-right">
          <span className="user-greeting">Hello, {user?.username}</span>
          <button className="logout-btn" onClick={logout}>Logout</button>
        </div>
      </header>

      <main className="app-main">
        {view === 'list' && (
          <>
            <div className="toolbar">
              <div className="filters">
                <select
                  value={filter.category}
                  onChange={(e) => setFilter({ ...filter, category: e.target.value })}
                >
                  <option value="all">All Categories</option>
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="dessert">Dessert</option>
                  <option value="snack">Snack</option>
                  <option value="beverage">Beverage</option>
                  <option value="other">Other</option>
                </select>

                <select
                  value={filter.difficulty}
                  onChange={(e) => setFilter({ ...filter, difficulty: e.target.value })}
                >
                  <option value="all">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <button className="add-recipe-btn" onClick={() => setView('create')}>
                + New Recipe
              </button>
            </div>

            {isLoading ? (
              <div className="loading">
                <div className="spinner"></div>
              </div>
            ) : recipes.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📖</div>
                <h3>No recipes yet</h3>
                <p>Start building your collection by adding your first recipe!</p>
                <button onClick={() => setView('create')}>Add Recipe</button>
              </div>
            ) : (
              <div className="recipe-grid">
                {recipes.map((recipe) => (
                  <RecipeCard
                    key={recipe._id}
                    recipe={recipe}
                    onView={handleViewRecipe}
                    onEdit={handleEditRecipe}
                    onDelete={handleDeleteRecipe}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {view === 'create' && (
          <RecipeForm
            onSubmit={handleCreateRecipe}
            onCancel={() => setView('list')}
          />
        )}

        {view === 'edit' && selectedRecipe && (
          <RecipeForm
            recipe={selectedRecipe}
            onSubmit={handleUpdateRecipe}
            onCancel={() => {
              setView('list');
              setSelectedRecipe(null);
            }}
          />
        )}

        {view === 'detail' && selectedRecipe && (
          <RecipeDetail
            recipe={selectedRecipe}
            onClose={() => {
              setView('list');
              setSelectedRecipe(null);
            }}
            onEdit={() => setView('edit')}
          />
        )}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <RecipeApp />
    </AuthProvider>
  );
}

export default App;
