import Stripe from 'stripe';
import { config } from '../config/index.js';

/**
 * Stripe Service for Payment Intents with Manual Capture
 *
 * Flow:
 * 1. User places bid -> Create PaymentIntent with capture_method: 'manual'
 * 2. This places a HOLD on the card (money reserved but not charged)
 * 3. If user is outbid -> Cancel the PaymentIntent (releases hold)
 * 4. If user wins -> Capture the PaymentIntent (money actually transfers)
 */
class StripeService {
  private stripe: Stripe | null = null;

  constructor() {
    if (config.stripe.secretKey) {
      this.stripe = new Stripe(config.stripe.secretKey);
    }
  }

  /**
   * Check if Stripe is configured
   */
  isConfigured(): boolean {
    return this.stripe !== null;
  }

  /**
   * Create a PaymentIntent with manual capture (authorization hold)
   * The card is authorized but not charged until capture() is called
   */
  async createPaymentHold(
    amount: number,
    metadata: {
      auctionId: string;
      userId: string;
      bidAmount: number;
    }
  ): Promise<{
    clientSecret: string;
    paymentIntentId: string;
  }> {
    if (!this.stripe) {
      // Return mock data for demo mode
      const mockId = `pi_demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      return {
        clientSecret: `${mockId}_secret_demo`,
        paymentIntentId: mockId,
      };
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      capture_method: 'manual', // Key: This creates a HOLD, not a charge
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        auctionId: metadata.auctionId,
        userId: metadata.userId,
        bidAmount: metadata.bidAmount.toString(),
      },
      description: `Bid hold for auction ${metadata.auctionId}`,
    });

    return {
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
    };
  }

  /**
   * Confirm a PaymentIntent (after client-side card input)
   * Called via webhook when payment_intent.amount_capturable_updated
   */
  async confirmPaymentHold(paymentIntentId: string): Promise<boolean> {
    if (!this.stripe) {
      // Demo mode - always succeed
      return true;
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(
        paymentIntentId
      );
      return paymentIntent.status === 'requires_capture';
    } catch {
      return false;
    }
  }

  /**
   * Capture a PaymentIntent (charge the card)
   * Called when user wins the auction
   */
  async capturePayment(
    paymentIntentId: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.stripe) {
      // Demo mode - always succeed
      console.log(`[Demo] Would capture payment: ${paymentIntentId}`);
      return { success: true };
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.capture(
        paymentIntentId
      );
      return { success: paymentIntent.status === 'succeeded' };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error(`Failed to capture payment ${paymentIntentId}:`, errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Cancel a PaymentIntent (release the hold)
   * Called when user is outbid or auction is cancelled
   */
  async cancelPaymentHold(
    paymentIntentId: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.stripe) {
      // Demo mode - always succeed
      console.log(`[Demo] Would cancel payment hold: ${paymentIntentId}`);
      return { success: true };
    }

    try {
      await this.stripe.paymentIntents.cancel(paymentIntentId);
      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error(`Failed to cancel payment ${paymentIntentId}:`, errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Get PaymentIntent status
   */
  async getPaymentIntentStatus(
    paymentIntentId: string
  ): Promise<Stripe.PaymentIntent.Status | null> {
    if (!this.stripe) {
      return 'requires_capture'; // Demo mode
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(
        paymentIntentId
      );
      return paymentIntent.status;
    } catch {
      return null;
    }
  }

  /**
   * Handle Stripe webhook events
   */
  constructWebhookEvent(
    payload: string | Buffer,
    signature: string
  ): Stripe.Event | null {
    if (!this.stripe || !config.stripe.webhookSecret) {
      return null;
    }

    try {
      return this.stripe.webhooks.constructEvent(
        payload,
        signature,
        config.stripe.webhookSecret
      );
    } catch {
      return null;
    }
  }
}

// Export singleton instance
export const stripeService = new StripeService();
