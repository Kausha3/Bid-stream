import type { AuthResponse, RecipesResponse, RecipeResponse, RecipeFormData } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Auth APIs
export const register = async (username: string, email: string, password: string): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  });
  return response.json();
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return response.json();
};

export const getMe = async (): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: getHeaders()
  });
  return response.json();
};

// Recipe APIs
export const getRecipes = async (params?: {
  category?: string;
  difficulty?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<RecipesResponse> => {
  const searchParams = new URLSearchParams();
  if (params?.category) searchParams.set('category', params.category);
  if (params?.difficulty) searchParams.set('difficulty', params.difficulty);
  if (params?.search) searchParams.set('search', params.search);
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());

  const response = await fetch(`${API_URL}/recipes?${searchParams}`, {
    headers: getHeaders()
  });
  return response.json();
};

export const getRecipe = async (id: string): Promise<RecipeResponse> => {
  const response = await fetch(`${API_URL}/recipes/${id}`, {
    headers: getHeaders()
  });
  return response.json();
};

export const createRecipe = async (data: RecipeFormData): Promise<RecipeResponse> => {
  const response = await fetch(`${API_URL}/recipes`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return response.json();
};

export const updateRecipe = async (id: string, data: RecipeFormData): Promise<RecipeResponse> => {
  const response = await fetch(`${API_URL}/recipes/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return response.json();
};

export const deleteRecipe = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`${API_URL}/recipes/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  return response.json();
};
