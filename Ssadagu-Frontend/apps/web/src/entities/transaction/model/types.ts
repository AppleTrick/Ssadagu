export type PaymentMethod = 'TRANSFER' | 'BANK_TRANSFER' | 'CARD' | 'PAY';
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'SUCCESS' | 'FAILED' | 'CANCELLED';

export interface Transaction {
  id: number;
  productId: number;
  productTitle: string;
  buyerId?: number;
  buyerNickname?: string;
  sellerId?: number;
  sellerNickname?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  failReason?: string | null;
  productImageUrl?: string | null;
  createdAt: string;
}

/** GET /api/v1/users/{userId}/purchases 응답 스펙 */
export type Purchase = Transaction;
