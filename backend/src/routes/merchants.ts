import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { query } from '../db/index.js';

const router = Router();

router.get('/:merchantId/banks', authenticate, async (req: AuthRequest, res) => {
  try {
    const { merchantId } = req.params;

    if (req.merchantId !== merchantId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const result = await query(
      'SELECT bank_code as code, account_number, account_name FROM merchant_banks WHERE merchant_id = $1',
      [merchantId]
    );

    const banks = result.rows.map(row => ({
      code: row.code,
      name: row.code,
      accountNumber: row.account_number,
      accountName: row.account_name,
    }));

    res.json({ banks });
  } catch (error) {
    console.error('Error fetching banks:', error);
    res.status(500).json({ error: 'Failed to fetch banks' });
  }
});

export default router;
