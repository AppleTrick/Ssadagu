export type PaymentMethod = 'BANK_TRANSFER' | 'CARD' | 'PAY';
export type TransactionStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';

export interface Transaction {
  id: number;
  productId: number;
  productTitle: string;
  buyerId: number;
  buyerNickname: string;
  sellerId: number;
  sellerNickname: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  failReason: string | null;
  createdAt: string;
}
