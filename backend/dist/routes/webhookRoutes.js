import { Router, raw } from 'express';
import { stripeService } from '../services/stripeService.js';
import { auctionService } from '../services/auctionService.js';
const router = Router();
/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhook events
 *
 * Important events:
 * - payment_intent.amount_capturable_updated: Card authorized, ready to capture
 * - payment_intent.succeeded: Payment captured successfully
 * - payment_intent.canceled: Payment hold canceled
 * - payment_intent.payment_failed: Payment failed
 */
router.post('/stripe', raw({ type: 'application/json' }), async (req, res) => {
    const signature = req.headers['stripe-signature'];
    if (!signature) {
        res.status(400).json({ error: 'Missing stripe-signature header' });
        return;
    }
    const event = stripeService.constructWebhookEvent(req.body, signature);
    if (!event) {
        // In demo mode or invalid signature
        res.status(200).json({ received: true, demo: true });
        return;
    }
    try {
        switch (event.type) {
            case 'payment_intent.amount_capturable_updated': {
                // Card has been authorized, hold is in place
                const paymentIntent = event.data.object;
                const { auctionId, userId } = paymentIntent.metadata;
                console.log(`Payment authorized for user ${userId} on auction ${auctionId}`);
                // Update payment hold status
                auctionService.updatePaymentHoldStatus(paymentIntent.id, 'HELD');
                break;
            }
            case 'payment_intent.succeeded': {
                // Payment was captured successfully (winner paid)
                const paymentIntent = event.data.object;
                const { auctionId, userId } = paymentIntent.metadata;
                console.log(`Payment captured for user ${userId} on auction ${auctionId}`);
                auctionService.updatePaymentHoldStatus(paymentIntent.id, 'CAPTURED');
                break;
            }
            case 'payment_intent.canceled': {
                // Payment hold was released
                const paymentIntent = event.data.object;
                console.log(`Payment hold released: ${paymentIntent.id}`);
                auctionService.updatePaymentHoldStatus(paymentIntent.id, 'CANCELLED');
                break;
            }
            case 'payment_intent.payment_failed': {
                // Payment failed
                const paymentIntent = event.data.object;
                const { auctionId, userId } = paymentIntent.metadata;
                console.error(`Payment failed for user ${userId} on auction ${auctionId}`);
                auctionService.updatePaymentHoldStatus(paymentIntent.id, 'ERROR');
                // Could emit error to specific user socket here
                break;
            }
            default:
                console.log(`Unhandled webhook event: ${event.type}`);
        }
        res.json({ received: true });
    }
    catch (error) {
        console.error('Webhook processing error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});
export default router;
