export interface PaymentVerificationRequest {
  planId: string;
  channelId: string;
  paymentMethod: 'mobile_money' | 'wallet';
  // Informational only. The backend must never trust this value as proof of payment.
  amountCfa?: number;
  amountUsd?: number;
  senderPhone?: string;
  transactionReference?: string;
  // Deprecated and intentionally ignored by the backend.
  walletBalanceCfa?: never;
  walletBalanceUsd?: never;
}

export interface PaymentVerificationResult {
  success: boolean;
  verificationToken: string;
  receiptNumber: string;
  operator: string;
  country: string;
  senderPhone: string;
  operatorReference: string;
  amountPaid: number;
  currency: string;
  verifiedAt: string;
  status: 'VERIFIED' | 'REJECTED';
  error?: string;
  errorDetail?: string;
}
