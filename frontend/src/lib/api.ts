import type { CreatePaymentIntentResponse, ApiError } from '../types/auction';

const API_BASE = '/api';

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  /**
   * Create a payment hold for a bid
   */
  async createPaymentHold(
    auctionId: string,
    amount: number,
    userId: string
  ): Promise<CreatePaymentIntentResponse> {
    return this.request<CreatePaymentIntentResponse>('/payments/create-hold', {
      method: 'POST',
      body: JSON.stringify({ auctionId, amount, userId }),
    });
  }

  /**
   * Confirm payment hold after client-side confirmation
   */
  async confirmPaymentHold(paymentIntentId: string): Promise<{ confirmed: boolean }> {
    return this.request('/payments/confirm-hold', {
      method: 'POST',
      body: JSON.stringify({ paymentIntentId }),
    });
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentIntentId: string): Promise<{ status: string }> {
    return this.request(`/payments/status/${paymentIntentId}`);
  }

  /**
   * Reset demo auction
   */
  async resetAuction(auctionId: string): Promise<{ success: boolean }> {
    return this.request(`/auctions/${auctionId}/reset`, {
      method: 'POST',
    });
  }
}

export const api = new ApiClient();
