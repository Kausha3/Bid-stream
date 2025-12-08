import type { Recipe } from '../types';

interface RecipeDetailProps {
  recipe: Recipe;
  onClose: () => void;
  onEdit: () => void;
}

const RecipeDetail = ({ recipe, onClose, onEdit }: RecipeDetailProps) => {
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  return (
    <div className="recipe-detail-overlay" onClick={onClose}>
      <div className="recipe-detail" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>

        <div className="recipe-detail-header">
          <div className="recipe-badges">
            <span className="badge category">{recipe.category}</span>
            <span className={`badge difficulty ${recipe.difficulty}`}>{recipe.difficulty}</span>
          </div>
          <h2>{recipe.title}</h2>
          {recipe.description && <p className="description">{recipe.description}</p>}
        </div>

        <div className="recipe-detail-meta">
          {recipe.prepTime && (
            <div className="meta-item">
              <span className="meta-label">Prep Time</span>
              <span className="meta-value">{recipe.prepTime} min</span>
            </div>
          )}
          {recipe.cookTime && (
            <div className="meta-item">
              <span className="meta-label">Cook Time</span>
              <span className="meta-value">{recipe.cookTime} min</span>
            </div>
          )}
          {totalTime > 0 && (
            <div className="meta-item">
              <span className="meta-label">Total Time</span>
              <span className="meta-value">{totalTime} min</span>
            </div>
          )}
          {recipe.servings && (
            <div className="meta-item">
              <span className="meta-label">Servings</span>
              <span className="meta-value">{recipe.servings}</span>
            </div>
          )}
        </div>

        <div className="recipe-detail-content">
          <div className="ingredients-section">
            <h3>Ingredients</h3>
            <ul className="ingredients-list">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index}>
                  {ingredient.amount && <span className="amount">{ingredient.amount}</span>}
                  <span className="name">{ingredient.name}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="instructions-section">
            <h3>Instructions</h3>
            <ol className="instructions-list">
              {recipe.instructions.map((instruction) => (
                <li key={instruction.step}>
                  <span className="step-number">{instruction.step}</span>
                  <p>{instruction.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="recipe-detail-actions">
          <button className="edit-btn" onClick={onEdit}>Edit Recipe</button>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;
