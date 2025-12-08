// Bid status represents the lifecycle of a bid
export type BidStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'OUTBID';

// Connection status for WebSocket
export type ConnectionStatus = 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING';

// Auction status
export type AuctionStatus = 'LIVE' | 'ENDED' | 'SOLD' | 'CANCELLED';

// Payment hold status for Stripe
export type PaymentStatus = 'IDLE' | 'HOLDING' | 'HELD' | 'CAPTURED' | 'CANCELLED' | 'ERROR';

// Individual bid record
export interface Bid {
  id: string;
  auctionId: string;
  userId: string;
  userName: string;
  amount: number;
  timestamp: Date;
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
export interface Auction {
  id: string;
  item: AuctionItem;
  currentPrice: number;
  minIncrement: number;
  endTime: number;
  bids: Bid[];
  viewerCount: number;
  status: AuctionStatus;
  leadingBidder?: string;
  leadingBidderName?: string;
  leadingPaymentIntentId?: string;
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
  auction_state: (state: AuctionStateResponse) => void;
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

// Response sent to client
export interface AuctionStateResponse {
  id: string;
  item: AuctionItem;
  currentPrice: number;
  minIncrement: number;
  endTime: number;
  bids: Bid[];
  viewerCount: number;
  status: AuctionStatus;
  leadingBidder?: string;
  leadingBidderName?: string;
}

// Payment intent tracking
export interface PaymentHold {
  paymentIntentId: string;
  auctionId: string;
  userId: string;
  amount: number;
  status: PaymentStatus;
  createdAt: Date;
}

// Inter Server Events (for scaling)
export interface InterServerEvents {}

// Socket data attached to each socket
export interface SocketData {
  auctionId?: string;
  userId?: string;
}
