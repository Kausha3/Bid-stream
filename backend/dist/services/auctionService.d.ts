import type { Auction, Bid, PlaceBidPayload, AuctionStateResponse, AuctionEndResult, PaymentHold } from '../types/index.js';
/**
 * In-memory auction store with atomic operations
 * In production, use Redis with Lua scripts or PostgreSQL with row-level locking
 */
declare class AuctionService {
    private auctions;
    private paymentHolds;
    private bidLocks;
    constructor();
    private initializeDemoAuction;
    /**
     * Get auction by ID
     */
    getAuction(auctionId: string): Auction | undefined;
    /**
     * Get auction state for client (excludes sensitive data)
     */
    getAuctionState(auctionId: string): AuctionStateResponse | null;
    /**
     * Atomic bid placement with optimistic locking
     * Returns { success, bid?, error?, newEndTime? }
     */
    placeBid(payload: PlaceBidPayload): Promise<{
        success: boolean;
        bid?: Bid;
        error?: {
            code: string;
            message: string;
            currentPrice?: number;
        };
        newEndTime?: number;
        previousLeaderPaymentIntentId?: string;
    }>;
    /**
     * Update viewer count for an auction
     */
    updateViewerCount(auctionId: string, count: number): void;
    /**
     * End auction and determine winner
     */
    endAuction(auctionId: string): AuctionEndResult | null;
    /**
     * Reset demo auction (for testing)
     */
    resetDemoAuction(): void;
    /**
     * Get all active payment holds for an auction (for cleanup)
     */
    getPaymentHoldsForAuction(auctionId: string): PaymentHold[];
    /**
     * Update payment hold status
     */
    updatePaymentHoldStatus(paymentIntentId: string, status: PaymentHold['status']): void;
}
export declare const auctionService: AuctionService;
export {};
