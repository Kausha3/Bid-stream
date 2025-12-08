import { Router } from 'express';
import { stripeService } from '../services/stripeService.js';
import { auctionService } from '../services/auctionService.js';
const router = Router();
/**
 * POST /api/payments/create-hold
 * Create a payment intent with manual capture (authorization hold)
 */
router.post('/create-hold', async (req, res) => {
    try {
        const { auctionId, amount, userId } = req.body;
        // Validate request
        if (!auctionId || !amount || !userId) {
            res.status(400).json({
                error: 'MISSING_FIELDS',
                message: 'auctionId, amount, and userId are required',
            });
            return;
        }
        // Validate auction exists and is live
        const auction = auctionService.getAuction(auctionId);
        if (!auction) {
            res.status(404).json({
                error: 'AUCTION_NOT_FOUND',
                message: 'Auction not found',
            });
            return;
        }
        if (auction.status !== 'LIVE') {
            res.status(400).json({
                error: 'AUCTION_ENDED',
                message: 'Auction has ended',
            });
            return;
        }
        // Validate bid amount
        const minBid = auction.currentPrice + auction.minIncrement;
        if (amount < minBid) {
            res.status(400).json({
                error: 'BID_TOO_LOW',
                message: `Bid must be at least $${minBid}`,
                currentPrice: auction.currentPrice,
            });
            return;
        }
        // Create payment hold
        // Note: We use a fixed hold amount (e.g., $500) as a deposit
        // This prevents holding the full bid amount on the card
        const holdAmount = 500; // $500 deposit hold
        const result = await stripeService.createPaymentHold(holdAmount, {
            auctionId,
            userId,
            bidAmount: amount,
        });
        res.json({
            clientSecret: result.clientSecret,
            paymentIntentId: result.paymentIntentId,
            holdAmount,
        });
    }
    catch (error) {
        console.error('Error creating payment hold:', error);
        res.status(500).json({
            error: 'PAYMENT_ERROR',
            message: 'Failed to create payment hold',
        });
    }
});
/**
 * POST /api/payments/confirm-hold
 * Confirm that a payment hold was successful (called after client-side confirmation)
 */
router.post('/confirm-hold', async (req, res) => {
    try {
        const { paymentIntentId } = req.body;
        if (!paymentIntentId) {
            res.status(400).json({
                error: 'MISSING_FIELDS',
                message: 'paymentIntentId is required',
            });
            return;
        }
        const isConfirmed = await stripeService.confirmPaymentHold(paymentIntentId);
        res.json({ confirmed: isConfirmed });
    }
    catch (error) {
        console.error('Error confirming payment hold:', error);
        res.status(500).json({
            error: 'PAYMENT_ERROR',
            message: 'Failed to confirm payment hold',
        });
    }
});
/**
 * GET /api/payments/status/:paymentIntentId
 * Get the status of a payment intent
 */
router.get('/status/:paymentIntentId', async (req, res) => {
    try {
        const { paymentIntentId } = req.params;
        const status = await stripeService.getPaymentIntentStatus(paymentIntentId);
        if (!status) {
            res.status(404).json({
                error: 'NOT_FOUND',
                message: 'Payment intent not found',
            });
            return;
        }
        res.json({ status });
    }
    catch (error) {
        console.error('Error getting payment status:', error);
        res.status(500).json({
            error: 'PAYMENT_ERROR',
            message: 'Failed to get payment status',
        });
    }
});
export default router;
