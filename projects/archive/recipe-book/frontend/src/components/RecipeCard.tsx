import type { Recipe } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
  onView: (recipe: Recipe) => void;
  onEdit: (recipe: Recipe) => void;
  onDelete: (id: string) => void;
}

const RecipeCard = ({ recipe, onView, onEdit, onDelete }: RecipeCardProps) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#27ae60';
      case 'medium': return '#f39c12';
      case 'hard': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  return (
    <div className="recipe-card">
      <div className="recipe-card-header">
        <span className="recipe-category">{recipe.category}</span>
        <span
          className="recipe-difficulty"
          style={{ backgroundColor: getDifficultyColor(recipe.difficulty) }}
        >
          {recipe.difficulty}
        </span>
      </div>

      <h3 className="recipe-title">{recipe.title}</h3>

      {recipe.description && (
        <p className="recipe-description">{recipe.description}</p>
      )}

      <div className="recipe-meta">
        {totalTime > 0 && (
          <span className="meta-item">
            <span className="meta-icon">⏱️</span>
            {totalTime} min
          </span>
        )}
        {recipe.servings && (
          <span className="meta-item">
            <span className="meta-icon">👥</span>
            {recipe.servings} servings
          </span>
        )}
        <span className="meta-item">
          <span className="meta-icon">🥗</span>
          {recipe.ingredients.length} ingredients
        </span>
      </div>

      <div className="recipe-actions">
        <button className="action-btn view" onClick={() => onView(recipe)}>
          View
        </button>
        <button className="action-btn edit" onClick={() => onEdit(recipe)}>
          Edit
        </button>
        <button className="action-btn delete" onClick={() => onDelete(recipe._id)}>
          Delete
        </button>
      </div>
    </div>
  );
};

export default RecipeCard;
