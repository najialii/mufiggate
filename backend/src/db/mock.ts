import { BankCode, TransactionStatus } from '@sudanpay/shared';

interface MockMerchant {
  id: string;
  name: string;
  email: string;
  apiKey: string;
  webhookUrl?: string;
  webhookSecret?: string;
  banks: Array<{
    code: string;
    accountNumber: string;
    accountName: string;
  }>;
}

interface MockTransaction {
  id: string;
  merchantId: string;
  orderId: string;
  amount: number;
  currency: string;
  bankCode: string;
  transactionId: string;
  receiptUrl: string;
  status: string;
  customerEmail?: string;
  customerPhone?: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export const merchants: MockMerchant[] = [
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    name: 'Test Merchant',
    email: 'merchant@example.com',
    apiKey: 'test_api_key_12345',
    webhookUrl: 'https://example.com/webhook',
    webhookSecret: 'webhook_secret_12345',
    banks: [
      { code: BankCode.BOK, accountNumber: '1234567890', accountName: 'Test Merchant - BOK' },
      { code: BankCode.FAISAL, accountNumber: '0987654321', accountName: 'Test Merchant - Faisal' },
      { code: BankCode.AL_SALAM, accountNumber: '5555555555', accountName: 'Test Merchant - Al Salam' }
    ]
  }
];

export const transactions: MockTransaction[] = [];

export const mockQuery = async (text: string, params?: any[]) => {
  if (text.includes('SELECT id FROM merchants WHERE api_key')) {
    const apiKey = params?.[0];
    const merchant = merchants.find(m => m.apiKey === apiKey);
    return { rows: merchant ? [{ id: merchant.id }] : [] };
  }

  if (text.includes('SELECT bank_code as code')) {
    const merchantId = params?.[0];
    const merchant = merchants.find(m => m.id === merchantId);
    return { rows: merchant?.banks || [] };
  }

  if (text.includes('INSERT INTO transactions')) {
    const [merchantId, orderId, amount, currency, bankCode, transactionId, receiptUrl, status, customerEmail, customerPhone, metadata] = params || [];
    const newTransaction: MockTransaction = {
      id: `txn-${Date.now()}`,
      merchantId,
      orderId,
      amount: parseFloat(amount),
      currency,
      bankCode,
      transactionId,
      receiptUrl,
      status,
      customerEmail,
      customerPhone,
      metadata,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    transactions.push(newTransaction);
    return { rows: [newTransaction] };
  }

  if (text.includes('SELECT * FROM transactions WHERE merchant_id')) {
    const merchantId = params?.[0];
    const status = params?.[1];
    let filtered = transactions.filter(t => t.merchantId === merchantId);
    if (status) {
      filtered = filtered.filter(t => t.status === status);
    }
    return { rows: filtered };
  }

  if (text.includes('SELECT * FROM transactions WHERE id')) {
    const id = params?.[0];
    const transaction = transactions.find(t => t.id === id);
    return { rows: transaction ? [transaction] : [] };
  }

  if (text.includes('UPDATE transactions SET status')) {
    const [status, id] = params || [];
    const transaction = transactions.find(t => t.id === id);
    if (transaction) {
      transaction.status = status;
      transaction.updatedAt = new Date();
      return { rows: [transaction] };
    }
    return { rows: [] };
  }

  if (text.includes('SELECT webhook_url, webhook_secret FROM merchants')) {
    const merchantId = params?.[0];
    const merchant = merchants.find(m => m.id === merchantId);
    return { rows: merchant ? [{ webhook_url: merchant.webhookUrl, webhook_secret: merchant.webhookSecret }] : [] };
  }

  return { rows: [] };
};
