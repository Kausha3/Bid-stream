// Bid status represents the lifecycle of a bid
export type BidStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'OUTBID';

// Connection status for WebSocket
export type ConnectionStatus = 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING';

// Auction status
export type AuctionStatus = 'LIVE' | 'ENDED' | 'SOLD' | 'CANCELLED';

// Payment hold status for Stripe
export type PaymentStatus = 'IDLE' | 'HOLDING' | 'SUCCESS' | 'ERROR';

// Individual bid record
export interface Bid {
  id: string;
  auctionId: string;
  userId: string;
  userName: string;
  amount: number;
  timestamp: Date | string;
  status: BidStatus;
  paymentIntentId?: string;
}

// Auction item details
export interface AuctionItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  condition: string;
  marketValue: number;
  startingPrice: number;
  reservePrice?: number;
}

// Full auction state
export interface AuctionState {
  id: string;
  item: AuctionItem;
  currentPrice: number;
  minIncrement: number;
  endTime: number; // Unix timestamp in milliseconds
  bids: Bid[];
  viewerCount: number;
  status: AuctionStatus;
  connectionStatus: ConnectionStatus;
  leadingBidder?: string;
}

// Socket events - Client to Server
export interface ClientToServerEvents {
  join_auction: (auctionId: string) => void;
  leave_auction: (auctionId: string) => void;
  place_bid: (payload: PlaceBidPayload) => void;
  heartbeat: () => void;
}

// Socket events - Server to Client
export interface ServerToClientEvents {
  auction_state: (state: AuctionState) => void;
  bid_update: (bid: Bid) => void;
  bid_error: (error: BidError) => void;
  viewer_update: (count: number) => void;
  auction_ended: (result: AuctionEndResult) => void;
  time_extended: (newEndTime: number) => void;
  connection_status: (status: ConnectionStatus) => void;
}

// Payload for placing a bid
export interface PlaceBidPayload {
  auctionId: string;
  amount: number;
  userId: string;
  userName: string;
  paymentIntentId: string;
}

// Bid error from server
export interface BidError {
  code: string;
  message: string;
  currentPrice?: number;
}

// Auction end result
export interface AuctionEndResult {
  auctionId: string;
  winnerId?: string;
  winnerName?: string;
  finalPrice: number;
  status: 'SOLD' | 'ENDED' | 'CANCELLED';
}

// API response types
export interface CreatePaymentIntentRequest {
  auctionId: string;
  amount: number;
}

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

export interface ApiError {
  error: string;
  message: string;
}
