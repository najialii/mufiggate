# SudanPay Widget

React widget for accepting payments through SudanPay.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

This creates a library bundle in `dist/` that can be imported:

```javascript
import { SudanPayWidget } from '@sudanpay/widget';

<SudanPayWidget
  merchantId="your-merchant-id"
  apiKey="your-api-key"
  orderId="unique-order-id"
  amount={1000}
  currency="SDG"
  onSuccess={(transaction) => console.log(transaction)}
  onError={(error) => console.error(error)}
/>
```

## Integration

### NPM Package
```bash
npm install @sudanpay/widget
```

### CDN (UMD)
```html
<script src="https://unpkg.com/@sudanpay/widget/dist/sudanpay-widget.umd.js"></script>
<script>
  const { SudanPayWidget } = window.SudanPay;
</script>
```

## Features

- Multi-bank support (BOK, Faisal, Al Salam)
- Drag & drop receipt upload
- Real-time payment verification via WebSocket
- Mobile-responsive design
- Tailwind CSS with Sudan flag colors
