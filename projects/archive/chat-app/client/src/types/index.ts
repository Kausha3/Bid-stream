export interface Message {
  id: string;
  username: string;
  message: string;
  room: string;
  color: string;
  timestamp: string;
}

export interface SystemMessage {
  username: string;
  message: string;
  timestamp: string;
}

export interface User {
  id: string;
  username: string;
  color: string;
}

export interface TypingUser {
  username: string;
  isTyping: boolean;
}
