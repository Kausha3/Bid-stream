import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type {
  AuctionState,
  Bid,
  ConnectionStatus,
  AuctionEndResult,
  BidError,
  ClientToServerEvents,
  ServerToClientEvents,
} from '../types/auction';

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

interface UseAuctionOptions {
  auctionId: string;
  userId: string;
  userName: string;
}

interface UseAuctionReturn {
  auctionState: AuctionState | null;
  connectionStatus: ConnectionStatus;
  placeBid: (amount: number, paymentIntentId: string) => void;
  error: BidError | null;
  clearError: () => void;
  isLoading: boolean;
}

export function useAuction({
  auctionId,
  userId,
  userName,
}: UseAuctionOptions): UseAuctionReturn {
  const socketRef = useRef<TypedSocket | null>(null);
  const [auctionState, setAuctionState] = useState<AuctionState | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>('DISCONNECTED');
  const [error, setError] = useState<BidError | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize socket connection
  useEffect(() => {
    const socket: TypedSocket = io({
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      setConnectionStatus('CONNECTED');
      socket.emit('join_auction', auctionId);
    });

    socket.on('disconnect', () => {
      setConnectionStatus('DISCONNECTED');
    });

    socket.on('connect_error', () => {
      setConnectionStatus('RECONNECTING');
    });

    // Auction events
    socket.on('auction_state', (state) => {
      setAuctionState({
        ...state,
        connectionStatus: 'CONNECTED',
        bids: state.bids.map((bid) => ({
          ...bid,
          timestamp: new Date(bid.timestamp),
        })),
      });
      setIsLoading(false);
    });

    socket.on('bid_update', (bid: Bid) => {
      setAuctionState((prev) => {
        if (!prev) return prev;

        // Mark previous leading bid as outbid
        const updatedBids = prev.bids.map((b, index) =>
          index === 0 && b.status === 'ACCEPTED' ? { ...b, status: 'OUTBID' as const } : b
        );

        return {
          ...prev,
          currentPrice: bid.amount,
          leadingBidder: bid.userId,
          leadingBidderName: bid.userName,
          bids: [
            { ...bid, timestamp: new Date(bid.timestamp) },
            ...updatedBids,
          ],
        };
      });
    });

    socket.on('bid_error', (err: BidError) => {
      setError(err);
      // Update current price if provided
      if (err.currentPrice) {
        setAuctionState((prev) =>
          prev ? { ...prev, currentPrice: err.currentPrice! } : prev
        );
      }
    });

    socket.on('viewer_update', (count: number) => {
      setAuctionState((prev) => (prev ? { ...prev, viewerCount: count } : prev));
    });

    socket.on('time_extended', (newEndTime: number) => {
      setAuctionState((prev) => (prev ? { ...prev, endTime: newEndTime } : prev));
    });

    socket.on('auction_ended', (result: AuctionEndResult) => {
      setAuctionState((prev) =>
        prev
          ? {
              ...prev,
              status: result.status,
              currentPrice: result.finalPrice,
            }
          : prev
      );
    });

    socket.on('connection_status', (status) => {
      setConnectionStatus(status);
    });

    // Heartbeat to keep connection alive
    const heartbeatInterval = setInterval(() => {
      if (socket.connected) {
        socket.emit('heartbeat');
      }
    }, 30000);

    return () => {
      clearInterval(heartbeatInterval);
      socket.emit('leave_auction', auctionId);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [auctionId]);

  const placeBid = useCallback(
    (amount: number, paymentIntentId: string) => {
      if (!socketRef.current?.connected) {
        setError({
          code: 'NOT_CONNECTED',
          message: 'Not connected to server',
        });
        return;
      }

      setError(null);
      socketRef.current.emit('place_bid', {
        auctionId,
        amount,
        userId,
        userName,
        paymentIntentId,
      });
    },
    [auctionId, userId, userName]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    auctionState,
    connectionStatus,
    placeBid,
    error,
    clearError,
    isLoading,
  };
}
