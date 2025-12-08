import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/index.js';
import type {
  Auction,
  AuctionItem,
  Bid,
  BidStatus,
  AuctionStatus,
  PlaceBidPayload,
  AuctionStateResponse,
  AuctionEndResult,
  PaymentHold,
} from '../types/index.js';

/**
 * In-memory auction store with atomic operations
 * In production, use Redis with Lua scripts or PostgreSQL with row-level locking
 */
class AuctionService {
  private auctions: Map<string, Auction> = new Map();
  private paymentHolds: Map<string, PaymentHold> = new Map();
  private bidLocks: Map<string, boolean> = new Map();

  constructor() {
    // Initialize demo auction
    this.initializeDemoAuction();
  }

  private initializeDemoAuction(): void {
    const demoItem: AuctionItem = {
      id: 'item-001',
      title: 'Vintage 1972 Rolex Submariner',
      description:
        'Authentic vintage Rolex Submariner ref. 1680 from 1972. Original dial, hands, and bezel insert. Recently serviced with full documentation.',
      imageUrl:
        'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=2400&auto=format&fit=crop',
      condition: 'Mint',
      marketValue: 18500,
      startingPrice: 10000,
      reservePrice: 12000,
    };

    const demoAuction: Auction = {
      id: 'auction-001',
      item: demoItem,
      currentPrice: 12500,
      minIncrement: 100,
      endTime: Date.now() + 120000, // 2 minutes from now
      bids: [],
      viewerCount: 0,
      status: 'LIVE',
    };

    this.auctions.set(demoAuction.id, demoAuction);
  }

  /**
   * Get auction by ID
   */
  getAuction(auctionId: string): Auction | undefined {
    return this.auctions.get(auctionId);
  }

  /**
   * Get auction state for client (excludes sensitive data)
   */
  getAuctionState(auctionId: string): AuctionStateResponse | null {
    const auction = this.auctions.get(auctionId);
    if (!auction) return null;

    return {
      id: auction.id,
      item: auction.item,
      currentPrice: auction.currentPrice,
      minIncrement: auction.minIncrement,
      endTime: auction.endTime,
      bids: auction.bids.slice(0, 50), // Limit to last 50 bids
      viewerCount: auction.viewerCount,
      status: auction.status,
      leadingBidder: auction.leadingBidder,
      leadingBidderName: auction.leadingBidderName,
    };
  }

  /**
   * Atomic bid placement with optimistic locking
   * Returns { success, bid?, error?, newEndTime? }
   */
  async placeBid(
    payload: PlaceBidPayload
  ): Promise<{
    success: boolean;
    bid?: Bid;
    error?: { code: string; message: string; currentPrice?: number };
    newEndTime?: number;
    previousLeaderPaymentIntentId?: string;
  }> {
    const { auctionId, amount, userId, userName, paymentIntentId } = payload;

    // Acquire lock (simple mutex - in production use Redis SETNX or DB transaction)
    const lockKey = `bid-lock-${auctionId}`;
    if (this.bidLocks.get(lockKey)) {
      // Wait briefly and retry
      await new Promise((resolve) => setTimeout(resolve, 50));
      if (this.bidLocks.get(lockKey)) {
        return {
          success: false,
          error: {
            code: 'LOCK_CONTENTION',
            message: 'High traffic - please try again',
          },
        };
      }
    }

    try {
      this.bidLocks.set(lockKey, true);

      const auction = this.auctions.get(auctionId);

      if (!auction) {
        return {
          success: false,
          error: { code: 'AUCTION_NOT_FOUND', message: 'Auction not found' },
        };
      }

      if (auction.status !== 'LIVE') {
        return {
          success: false,
          error: { code: 'AUCTION_ENDED', message: 'Auction has ended' },
        };
      }

      if (Date.now() >= auction.endTime) {
        return {
          success: false,
          error: { code: 'AUCTION_ENDED', message: 'Auction has ended' },
        };
      }

      // Atomic check: bid must be higher than current price + minimum increment
      const minBid = auction.currentPrice + auction.minIncrement;
      if (amount < minBid) {
        return {
          success: false,
          error: {
            code: 'BID_TOO_LOW',
            message: `Bid must be at least ${minBid}`,
            currentPrice: auction.currentPrice,
          },
        };
      }

      // Store previous leader's payment intent to cancel their hold
      const previousLeaderPaymentIntentId = auction.leadingPaymentIntentId;

      // Mark previous leading bid as outbid
      if (auction.bids.length > 0 && auction.bids[0].status === 'ACCEPTED') {
        auction.bids[0].status = 'OUTBID';
      }

      // Create new bid
      const newBid: Bid = {
        id: uuidv4(),
        auctionId,
        userId,
        userName,
        amount,
        timestamp: new Date(),
        status: 'ACCEPTED',
        paymentIntentId,
      };

      // Update auction state atomically
      auction.currentPrice = amount;
      auction.leadingBidder = userId;
      auction.leadingBidderName = userName;
      auction.leadingPaymentIntentId = paymentIntentId;
      auction.bids.unshift(newBid);

      // Anti-sniping: extend auction if bid placed in final seconds
      let newEndTime: number | undefined;
      const timeRemaining = auction.endTime - Date.now();
      if (timeRemaining < config.antiSnipingThreshold) {
        auction.endTime = Date.now() + config.antiSnipingExtension;
        newEndTime = auction.endTime;
      }

      // Track payment hold
      this.paymentHolds.set(paymentIntentId, {
        paymentIntentId,
        auctionId,
        userId,
        amount,
        status: 'HELD',
        createdAt: new Date(),
      });

      return {
        success: true,
        bid: newBid,
        newEndTime,
        previousLeaderPaymentIntentId,
      };
    } finally {
      this.bidLocks.set(lockKey, false);
    }
  }

  /**
   * Update viewer count for an auction
   */
  updateViewerCount(auctionId: string, count: number): void {
    const auction = this.auctions.get(auctionId);
    if (auction) {
      auction.viewerCount = count;
    }
  }

  /**
   * End auction and determine winner
   */
  endAuction(auctionId: string): AuctionEndResult | null {
    const auction = this.auctions.get(auctionId);
    if (!auction) return null;

    if (auction.bids.length > 0) {
      const winningBid = auction.bids[0];
      auction.status = 'SOLD';

      return {
        auctionId,
        winnerId: winningBid.userId,
        winnerName: winningBid.userName,
        finalPrice: auction.currentPrice,
        status: 'SOLD',
      };
    } else {
      auction.status = 'ENDED';

      return {
        auctionId,
        finalPrice: auction.currentPrice,
        status: 'ENDED',
      };
    }
  }

  /**
   * Reset demo auction (for testing)
   */
  resetDemoAuction(): void {
    this.initializeDemoAuction();
  }

  /**
   * Get all active payment holds for an auction (for cleanup)
   */
  getPaymentHoldsForAuction(auctionId: string): PaymentHold[] {
    return Array.from(this.paymentHolds.values()).filter(
      (hold) => hold.auctionId === auctionId && hold.status === 'HELD'
    );
  }

  /**
   * Update payment hold status
   */
  updatePaymentHoldStatus(
    paymentIntentId: string,
    status: PaymentHold['status']
  ): void {
    const hold = this.paymentHolds.get(paymentIntentId);
    if (hold) {
      hold.status = status;
    }
  }
}

// Export singleton instance
export const auctionService = new AuctionService();
