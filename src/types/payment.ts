export interface PaymentVerificationRequest {
  planId: string;
  channelId: string;
  paymentMethod: 'mobile_money' | 'wallet';
  amountCfa: number;
  amountUsd?: number;
  senderPhone?: string;
  transactionReference?: string;
  walletBalanceCfa?: number;
  walletBalanceUsd?: number;
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
