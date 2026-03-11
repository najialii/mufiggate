# SudanPay Backend

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up PostgreSQL database and create `.env` file:
```bash
cp .env.example .env
```

3. Initialize database:
```bash
psql -U your_user -d sudanpay -f src/db/schema.sql
psql -U your_user -d sudanpay -f src/db/seed.sql
```

4. Start development server:
```bash
npm run dev
```

## API Endpoints

### Public Endpoints

#### POST /api/transactions
Create a new transaction (requires API key)
- Headers: `X-API-Key: your_api_key`
- Body: FormData with fields:
  - merchantId
  - orderId
  - amount
  - currency
  - bankCode
  - transactionId
  - receipt (file)
  - customerEmail (optional)
  - customerPhone (optional)
  - metadata (optional JSON string)

#### GET /api/transactions/:transactionId
Get transaction details (requires API key)

#### GET /api/transactions
List all transactions for merchant (requires API key)
- Query params: status, limit, offset

#### GET /api/merchants/:merchantId/banks
Get merchant's bank accounts (requires API key)

### Admin Endpoints

#### PATCH /api/admin/transactions/:transactionId/status
Update transaction status (approve/reject)
- Body: `{ "status": "APPROVED" | "REJECTED" }`

## WebSocket Events

Clients can listen to real-time transaction updates:
```javascript
socket.on('transaction:ORDER_ID', (data) => {
  console.log(data.status, data.transaction);
});
```

## Webhooks

When a transaction status changes, a webhook is sent to the merchant's webhook URL with:
- Event type: `payment.approved` or `payment.rejected`
- Transaction data
- HMAC signature in `X-Webhook-Signature` header

Verify signature:
```javascript
const crypto = require('crypto');
const signature = crypto
  .createHmac('sha256', webhookSecret)
  .update(JSON.stringify(payload))
  .digest('hex');
```
