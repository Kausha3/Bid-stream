const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Auth
export const register = async (data: { username: string; email: string; password: string }) => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
};

export const login = async (data: { email: string; password: string }) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
};

export const getMe = async () => {
  const res = await fetch(`${API_URL}/auth/me`, { headers: getHeaders() });
  return res.json();
};

// Questions
export const getQuestions = async (params: {
  page?: number;
  sort?: string;
  tag?: string;
  search?: string;
}) => {
  const queryString = new URLSearchParams(params as Record<string, string>).toString();
  const res = await fetch(`${API_URL}/questions?${queryString}`, { headers: getHeaders() });
  return res.json();
};

export const getQuestion = async (id: string) => {
  const res = await fetch(`${API_URL}/questions/${id}`, { headers: getHeaders() });
  return res.json();
};

export const createQuestion = async (data: { title: string; body: string; tags: string[] }) => {
  const res = await fetch(`${API_URL}/questions`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
};

export const voteQuestion = async (id: string, value: number) => {
  const res = await fetch(`${API_URL}/questions/${id}/vote`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ value })
  });
  return res.json();
};

export const acceptAnswer = async (questionId: string, answerId: string) => {
  const res = await fetch(`${API_URL}/questions/${questionId}/accept/${answerId}`, {
    method: 'POST',
    headers: getHeaders()
  });
  return res.json();
};

// Answers
export const createAnswer = async (data: { body: string; questionId: string }) => {
  const res = await fetch(`${API_URL}/answers`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
};

export const voteAnswer = async (id: string, value: number) => {
  const res = await fetch(`${API_URL}/answers/${id}/vote`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ value })
  });
  return res.json();
};

// Tags
export const getTags = async (search?: string) => {
  const queryString = search ? `?search=${search}` : '';
  const res = await fetch(`${API_URL}/tags${queryString}`, { headers: getHeaders() });
  return res.json();
};

export const getPopularTags = async () => {
  const res = await fetch(`${API_URL}/tags/popular`, { headers: getHeaders() });
  return res.json();
};

// Users
export const getUser = async (id: string) => {
  const res = await fetch(`${API_URL}/users/${id}`, { headers: getHeaders() });
  return res.json();
};

export const getTopUsers = async () => {
  const res = await fetch(`${API_URL}/users`, { headers: getHeaders() });
  return res.json();
};
