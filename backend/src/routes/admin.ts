import { Router } from 'express';
import { query } from '../db/index.js';
import { TransactionStatus } from '@sudanpay/shared';
import { sendWebhook } from '../utils/webhook.js';
import { Server } from 'socket.io';

const router = Router();

export const createAdminRouter = (io: Server) => {
  router.patch('/transactions/:transactionId/status', async (req, res) => {
    try {
      const { transactionId } = req.params;
      const { status } = req.body;

      if (!Object.values(TransactionStatus).includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const result = await query(
        'UPDATE transactions SET status = $1 WHERE id = $2 RETURNING *',
        [status, transactionId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      const transaction = result.rows[0];

      // Emit socket event
      io.emit(`transaction:${transaction.order_id}`, {
        status: transaction.status,
        transaction: {
          id: transaction.id,
          orderId: transaction.order_id,
          amount: transaction.amount,
          status: transaction.status,
        }
      });

      // Send webhook
      const merchantResult = await query(
        'SELECT webhook_url, webhook_secret FROM merchants WHERE id = $1',
        [transaction.merchant_id]
      );

      if (merchantResult.rows.length > 0) {
        const merchant = merchantResult.rows[0];
        if (merchant.webhook_url && merchant.webhook_secret) {
          const webhookPayload = {
            event: status === TransactionStatus.APPROVED ? 'payment.approved' : 'payment.rejected',
            transaction: {
              id: transaction.id,
              merchantId: transaction.merchant_id,
              orderId: transaction.order_id,
              amount: parseFloat(transaction.amount),
              currency: transaction.currency,
              bankCode: transaction.bank_code,
              transactionId: transaction.transaction_id,
              receiptUrl: transaction.receipt_url,
              status: transaction.status,
              customerEmail: transaction.customer_email,
              customerPhone: transaction.customer_phone,
              metadata: transaction.metadata,
              createdAt: transaction.created_at,
              updatedAt: transaction.updated_at,
            },
            timestamp: Date.now(),
            signature: '',
          } as any;

          await sendWebhook(merchant.webhook_url, webhookPayload, merchant.webhook_secret);
        }
      }

      res.json({ transaction });
    } catch (error) {
      console.error('Error updating transaction:', error);
      res.status(500).json({ error: 'Failed to update transaction' });
    }
  });

  return router;
};
