import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import type { Recipe, RecipeFormData, Ingredient } from '../types';

interface RecipeFormProps {
  recipe?: Recipe;
  onSubmit: (data: RecipeFormData) => Promise<void>;
  onCancel: () => void;
}

const CATEGORIES = ['breakfast', 'lunch', 'dinner', 'dessert', 'snack', 'beverage', 'other'] as const;
const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;

const RecipeForm = ({ recipe, onSubmit, onCancel }: RecipeFormProps) => {
  const [formData, setFormData] = useState<RecipeFormData>({
    title: '',
    description: '',
    ingredients: [{ name: '', amount: '' }],
    instructions: [{ step: 1, text: '' }],
    cookTime: undefined,
    prepTime: undefined,
    servings: undefined,
    category: 'other',
    difficulty: 'medium'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (recipe) {
      setFormData({
        title: recipe.title,
        description: recipe.description || '',
        ingredients: recipe.ingredients.length > 0 ? recipe.ingredients : [{ name: '', amount: '' }],
        instructions: recipe.instructions.length > 0 ? recipe.instructions : [{ step: 1, text: '' }],
        cookTime: recipe.cookTime,
        prepTime: recipe.prepTime,
        servings: recipe.servings,
        category: recipe.category,
        difficulty: recipe.difficulty
      });
    }
  }, [recipe]);

  const handleAddIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, { name: '', amount: '' }]
    });
  };

  const handleRemoveIngredient = (index: number) => {
    if (formData.ingredients.length > 1) {
      setFormData({
        ...formData,
        ingredients: formData.ingredients.filter((_, i) => i !== index)
      });
    }
  };

  const handleIngredientChange = (index: number, field: keyof Ingredient, value: string) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const handleAddInstruction = () => {
    setFormData({
      ...formData,
      instructions: [...formData.instructions, { step: formData.instructions.length + 1, text: '' }]
    });
  };

  const handleRemoveInstruction = (index: number) => {
    if (formData.instructions.length > 1) {
      const newInstructions = formData.instructions
        .filter((_, i) => i !== index)
        .map((inst, i) => ({ ...inst, step: i + 1 }));
      setFormData({ ...formData, instructions: newInstructions });
    }
  };

  const handleInstructionChange = (index: number, value: string) => {
    const newInstructions = [...formData.instructions];
    newInstructions[index] = { ...newInstructions[index], text: value };
    setFormData({ ...formData, instructions: newInstructions });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Filter out empty ingredients and instructions
    const cleanedData: RecipeFormData = {
      ...formData,
      ingredients: formData.ingredients.filter(i => i.name.trim()),
      instructions: formData.instructions.filter(i => i.text.trim())
    };

    if (cleanedData.ingredients.length === 0) {
      setError('Please add at least one ingredient');
      setIsLoading(false);
      return;
    }

    if (cleanedData.instructions.length === 0) {
      setError('Please add at least one instruction');
      setIsLoading(false);
      return;
    }

    try {
      await onSubmit(cleanedData);
    } catch {
      setError('Failed to save recipe');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="recipe-form-container">
      <h2>{recipe ? 'Edit Recipe' : 'New Recipe'}</h2>

      <form onSubmit={handleSubmit} className="recipe-form">
        <div className="form-section">
          <h3>Basic Info</h3>

          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Recipe title"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of your recipe"
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as Recipe['category'] })}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="difficulty">Difficulty</label>
              <select
                id="difficulty"
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as Recipe['difficulty'] })}
              >
                {DIFFICULTIES.map(diff => (
                  <option key={diff} value={diff}>
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="prepTime">Prep Time (min)</label>
              <input
                type="number"
                id="prepTime"
                value={formData.prepTime || ''}
                onChange={(e) => setFormData({ ...formData, prepTime: e.target.value ? parseInt(e.target.value) : undefined })}
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="cookTime">Cook Time (min)</label>
              <input
                type="number"
                id="cookTime"
                value={formData.cookTime || ''}
                onChange={(e) => setFormData({ ...formData, cookTime: e.target.value ? parseInt(e.target.value) : undefined })}
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="servings">Servings</label>
              <input
                type="number"
                id="servings"
                value={formData.servings || ''}
                onChange={(e) => setFormData({ ...formData, servings: e.target.value ? parseInt(e.target.value) : undefined })}
                min="1"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Ingredients</h3>
          {formData.ingredients.map((ingredient, index) => (
            <div key={index} className="ingredient-row">
              <input
                type="text"
                value={ingredient.amount || ''}
                onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
                placeholder="Amount"
                className="ingredient-amount"
              />
              <input
                type="text"
                value={ingredient.name}
                onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                placeholder="Ingredient name"
                className="ingredient-name"
              />
              <button
                type="button"
                className="remove-btn"
                onClick={() => handleRemoveIngredient(index)}
                disabled={formData.ingredients.length === 1}
              >
                ×
              </button>
            </div>
          ))}
          <button type="button" className="add-btn" onClick={handleAddIngredient}>
            + Add Ingredient
          </button>
        </div>

        <div className="form-section">
          <h3>Instructions</h3>
          {formData.instructions.map((instruction, index) => (
            <div key={index} className="instruction-row">
              <span className="step-number">{instruction.step}</span>
              <textarea
                value={instruction.text}
                onChange={(e) => handleInstructionChange(index, e.target.value)}
                placeholder={`Step ${instruction.step} instructions`}
                rows={2}
              />
              <button
                type="button"
                className="remove-btn"
                onClick={() => handleRemoveInstruction(index)}
                disabled={formData.instructions.length === 1}
              >
                ×
              </button>
            </div>
          ))}
          <button type="button" className="add-btn" onClick={handleAddInstruction}>
            + Add Step
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? 'Saving...' : recipe ? 'Update Recipe' : 'Create Recipe'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RecipeForm;
