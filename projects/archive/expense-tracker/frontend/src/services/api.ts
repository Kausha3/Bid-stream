import type { Expense, Summary } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getExpenses = async (params?: {
  startDate?: string;
  endDate?: string;
  category?: string;
  type?: string;
}): Promise<{ success: boolean; data: { expenses: Expense[] } }> => {
  const searchParams = new URLSearchParams();
  if (params?.startDate) searchParams.set('startDate', params.startDate);
  if (params?.endDate) searchParams.set('endDate', params.endDate);
  if (params?.category) searchParams.set('category', params.category);
  if (params?.type) searchParams.set('type', params.type);

  const response = await fetch(`${API_URL}/expenses?${searchParams}`);
  return response.json();
};

export const getSummary = async (period?: string): Promise<{ success: boolean; data: Summary }> => {
  const searchParams = new URLSearchParams();
  if (period) searchParams.set('period', period);

  const response = await fetch(`${API_URL}/expenses/summary?${searchParams}`);
  return response.json();
};

export const createExpense = async (data: Omit<Expense, '_id'>): Promise<{ success: boolean; data: { expense: Expense } }> => {
  const response = await fetch(`${API_URL}/expenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return response.json();
};

export const deleteExpense = async (id: string): Promise<{ success: boolean }> => {
  const response = await fetch(`${API_URL}/expenses/${id}`, {
    method: 'DELETE'
  });
  return response.json();
};
