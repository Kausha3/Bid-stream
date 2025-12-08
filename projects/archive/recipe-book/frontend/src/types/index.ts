export interface User {
  id: string;
  username: string;
  email: string;
}

export interface Ingredient {
  name: string;
  amount?: string;
}

export interface Instruction {
  step: number;
  text: string;
}

export interface Recipe {
  _id: string;
  title: string;
  description?: string;
  ingredients: Ingredient[];
  instructions: Instruction[];
  cookTime?: number;
  prepTime?: number;
  servings?: number;
  category: 'breakfast' | 'lunch' | 'dinner' | 'dessert' | 'snack' | 'beverage' | 'other';
  difficulty: 'easy' | 'medium' | 'hard';
  imageUrl?: string;
  user: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecipeFormData {
  title: string;
  description?: string;
  ingredients: Ingredient[];
  instructions: Instruction[];
  cookTime?: number;
  prepTime?: number;
  servings?: number;
  category: Recipe['category'];
  difficulty: Recipe['difficulty'];
  imageUrl?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
  };
}

export interface RecipesResponse {
  success: boolean;
  data: {
    recipes: Recipe[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface RecipeResponse {
  success: boolean;
  data: {
    recipe: Recipe;
  };
}
