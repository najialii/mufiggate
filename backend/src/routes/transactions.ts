import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { query } from '../db/index.js';
import { TransactionStatus } from '@sudanpay/shared';

const router = Router();

const storage = multer.diskStorage({
  destination: process.env.UPLOAD_DIR || './uploads',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'receipt-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

router.post('/', authenticate, upload.single('receipt'), async (req: AuthRequest, res) => {
  try {
    const { orderId, amount, currency, bankCode, transactionId, customerEmail, customerPhone, metadata } = req.body;
    const merchantId = req.merchantId;

    if (!req.file) {
      return res.status(400).json({ error: 'Receipt file is required' });
    }

    const receiptUrl = `/uploads/${req.file.filename}`;

    const result = await query(
      `INSERT INTO transactions 
       (merchant_id, order_id, amount, currency, bank_code, transaction_id, receipt_url, status, customer_email, customer_phone, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        merchantId,
        orderId,
        parseFloat(amount),
        currency || 'SDG',
        bankCode,
        transactionId,
        receiptUrl,
        TransactionStatus.PENDING,
        customerEmail || null,
        customerPhone || null,
        metadata ? JSON.parse(metadata) : null
      ]
    );

    res.status(201).json({
      transaction: {
        id: result.rows[0].id,
        status: result.rows[0].status,
        orderId: result.rows[0].order_id,
      }
    });
  } catch (error: any) {
    console.error('Error creating transaction:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Transaction with this order ID already exists' });
    }
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

router.get('/:transactionId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { transactionId } = req.params;

    const result = await query(
      'SELECT * FROM transactions WHERE id = $1 AND merchant_id = $2',
      [transactionId, req.merchantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ transaction: result.rows[0] });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    let queryText = 'SELECT * FROM transactions WHERE merchant_id = $1';
    const params: any[] = [req.merchantId];

    if (status) {
      queryText += ' AND status = $2';
      params.push(status);
    }

    queryText += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(parseInt(limit as string), parseInt(offset as string));

    const result = await query(queryText, params);

    res.json({ transactions: result.rows });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

export default router;
