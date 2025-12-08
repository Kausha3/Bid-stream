import Stripe from 'stripe';
/**
 * Stripe Service for Payment Intents with Manual Capture
 *
 * Flow:
 * 1. User places bid -> Create PaymentIntent with capture_method: 'manual'
 * 2. This places a HOLD on the card (money reserved but not charged)
 * 3. If user is outbid -> Cancel the PaymentIntent (releases hold)
 * 4. If user wins -> Capture the PaymentIntent (money actually transfers)
 */
declare class StripeService {
    private stripe;
    constructor();
    /**
     * Check if Stripe is configured
     */
    isConfigured(): boolean;
    /**
     * Create a PaymentIntent with manual capture (authorization hold)
     * The card is authorized but not charged until capture() is called
     */
    createPaymentHold(amount: number, metadata: {
        auctionId: string;
        userId: string;
        bidAmount: number;
    }): Promise<{
        clientSecret: string;
        paymentIntentId: string;
    }>;
    /**
     * Confirm a PaymentIntent (after client-side card input)
     * Called via webhook when payment_intent.amount_capturable_updated
     */
    confirmPaymentHold(paymentIntentId: string): Promise<boolean>;
    /**
     * Capture a PaymentIntent (charge the card)
     * Called when user wins the auction
     */
    capturePayment(paymentIntentId: string): Promise<{
        success: boolean;
        error?: string;
    }>;
    /**
     * Cancel a PaymentIntent (release the hold)
     * Called when user is outbid or auction is cancelled
     */
    cancelPaymentHold(paymentIntentId: string): Promise<{
        success: boolean;
        error?: string;
    }>;
    /**
     * Get PaymentIntent status
     */
    getPaymentIntentStatus(paymentIntentId: string): Promise<Stripe.PaymentIntent.Status | null>;
    /**
     * Handle Stripe webhook events
     */
    constructWebhookEvent(payload: string | Buffer, signature: string): Stripe.Event | null;
}
export declare const stripeService: StripeService;
export {};
