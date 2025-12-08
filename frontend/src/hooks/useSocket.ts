import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  ConnectionStatus,
} from '../types/auction';

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

interface UseSocketOptions {
  url?: string;
  autoConnect?: boolean;
}

interface UseSocketReturn {
  socket: TypedSocket | null;
  connectionStatus: ConnectionStatus;
  connect: () => void;
  disconnect: () => void;
  isConnected: boolean;
}

export function useSocket(options: UseSocketOptions = {}): UseSocketReturn {
  const { url = '', autoConnect = true } = options;
  const socketRef = useRef<TypedSocket | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>('DISCONNECTED');

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    const socket = io(url, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      setConnectionStatus('CONNECTED');
    });

    socket.on('disconnect', () => {
      setConnectionStatus('DISCONNECTED');
    });

    socket.on('connect_error', () => {
      setConnectionStatus('RECONNECTING');
    });

    socket.on('connection_status', (status) => {
      setConnectionStatus(status);
    });

    socket.connect();
    socketRef.current = socket;
  }, [url]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setConnectionStatus('DISCONNECTED');
    }
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    socket: socketRef.current,
    connectionStatus,
    connect,
    disconnect,
    isConnected: connectionStatus === 'CONNECTED',
  };
}
