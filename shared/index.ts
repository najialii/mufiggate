// Shared Types & Schemas

export enum BankCode {
  BOK = 'BOK',
  FAISAL = 'FAISAL',
  AL_SALAM = 'AL_SALAM'
}

export interface Bank {
  code: BankCode;
  name: string;
  accountNumber: string;
  accountName: string;
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface Transaction {
  id: string;
  merchantId: string;
  orderId: string;
  amount: number;
  currency: string;
  bankCode: BankCode;
  transactionId: string;
  receiptUrl: string;
  status: TransactionStatus;
  customerEmail?: string;
  customerPhone?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Merchant {
  id: string;
  name: string;
  email: string;
  apiKey: string;
  webhookUrl?: string;
  webhookSecret?: string;
  banks: Bank[];
  createdAt: Date;
}

export interface WebhookPayload {
  event: 'payment.approved' | 'payment.rejected';
  transaction: Transaction;
  timestamp: number;
  signature: string;
}

export interface WidgetConfig {
  merchantId: string;
  apiKey: string;
  orderId: string;
  amount: number;
  currency?: string;
  onSuccess?: (transaction: Transaction) => void;
  onError?: (error: Error) => void;
}
