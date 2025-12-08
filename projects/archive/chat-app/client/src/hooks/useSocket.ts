import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Message, SystemMessage, User, TypingUser } from '../types';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<(Message | SystemMessage)[]>([]);
  const [roomUsers, setRoomUsers] = useState<User[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const typingTimeoutRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    socketRef.current = io(SERVER_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to server');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from server');
    });

    socket.on('receive_message', (data: Message) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on('user_joined', (data: SystemMessage) => {
      setMessages((prev) => [...prev, { ...data, id: `system-${Date.now()}` }]);
    });

    socket.on('user_left', (data: SystemMessage) => {
      setMessages((prev) => [...prev, { ...data, id: `system-${Date.now()}` }]);
    });

    socket.on('room_users', (users: User[]) => {
      setRoomUsers(users);
    });

    socket.on('user_typing', (data: TypingUser) => {
      const { username, isTyping } = data;

      // Clear existing timeout for this user
      if (typingTimeoutRef.current.has(username)) {
        clearTimeout(typingTimeoutRef.current.get(username));
        typingTimeoutRef.current.delete(username);
      }

      if (isTyping) {
        setTypingUsers((prev) => {
          if (!prev.includes(username)) {
            return [...prev, username];
          }
          return prev;
        });

        // Auto-remove after 3 seconds
        const timeout = setTimeout(() => {
          setTypingUsers((prev) => prev.filter((u) => u !== username));
          typingTimeoutRef.current.delete(username);
        }, 3000);
        typingTimeoutRef.current.set(username, timeout);
      } else {
        setTypingUsers((prev) => prev.filter((u) => u !== username));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const joinRoom = useCallback((username: string, room: string) => {
    if (socketRef.current) {
      setMessages([]); // Clear messages when joining new room
      socketRef.current.emit('join_room', { username, room });
    }
  }, []);

  const sendMessage = useCallback((message: string, room: string) => {
    if (socketRef.current && message.trim()) {
      socketRef.current.emit('send_message', { message, room });
    }
  }, []);

  const sendTyping = useCallback((room: string, isTyping: boolean) => {
    if (socketRef.current) {
      socketRef.current.emit('typing', { room, isTyping });
    }
  }, []);

  return {
    isConnected,
    messages,
    roomUsers,
    typingUsers,
    joinRoom,
    sendMessage,
    sendTyping
  };
};
