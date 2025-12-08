export interface User {
  _id: string;
  username: string;
  email?: string;
  reputation: number;
  questionsCount?: number;
  answersCount?: number;
  bio?: string;
  createdAt?: string;
}

export interface Tag {
  _id: string;
  name: string;
  questionsCount: number;
}

export interface Answer {
  _id: string;
  body: string;
  author: User;
  votes: number;
  isAccepted: boolean;
  createdAt: string;
  userVote?: number | null;
}

export interface Question {
  _id: string;
  title: string;
  body: string;
  author: User;
  tags: Tag[];
  votes: number;
  answers: Answer[];
  acceptedAnswer?: string | null;
  views: number;
  createdAt: string;
  userVote?: number | null;
}

export interface QuestionSummary {
  _id: string;
  title: string;
  author: User;
  tags: Tag[];
  votes: number;
  answers: string[];
  views: number;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
