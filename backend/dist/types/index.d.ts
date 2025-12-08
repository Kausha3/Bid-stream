export type BidStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'OUTBID';
export type ConnectionStatus = 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING';
export type AuctionStatus = 'LIVE' | 'ENDED' | 'SOLD' | 'CANCELLED';
export type PaymentStatus = 'IDLE' | 'HOLDING' | 'HELD' | 'CAPTURED' | 'CANCELLED' | 'ERROR';
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
export interface ClientToServerEvents {
    join_auction: (auctionId: string) => void;
    leave_auction: (auctionId: string) => void;
    place_bid: (payload: PlaceBidPayload) => void;
    heartbeat: () => void;
}
export interface ServerToClientEvents {
    auction_state: (state: AuctionStateResponse) => void;
    bid_update: (bid: Bid) => void;
    bid_error: (error: BidError) => void;
    viewer_update: (count: number) => void;
    auction_ended: (result: AuctionEndResult) => void;
    time_extended: (newEndTime: number) => void;
    connection_status: (status: ConnectionStatus) => void;
}
export interface PlaceBidPayload {
    auctionId: string;
    amount: number;
    userId: string;
    userName: string;
    paymentIntentId: string;
}
export interface BidError {
    code: string;
    message: string;
    currentPrice?: number;
}
export interface AuctionEndResult {
    auctionId: string;
    winnerId?: string;
    winnerName?: string;
    finalPrice: number;
    status: 'SOLD' | 'ENDED' | 'CANCELLED';
}
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
export interface PaymentHold {
    paymentIntentId: string;
    auctionId: string;
    userId: string;
    amount: number;
    status: PaymentStatus;
    createdAt: Date;
}
export interface InterServerEvents {
}
export interface SocketData {
    auctionId?: string;
    userId?: string;
}
