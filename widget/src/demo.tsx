import React from 'react';
import ReactDOM from 'react-dom/client';
import { SudanPayWidget } from './SudanPayWidget';
import './style.css';

console.log('Demo script loaded');

const Demo = () => {
  console.log('Demo component rendering');
  return (
    <div style={{ padding: '2rem', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>SudanPay Widget Demo</h1>
      <SudanPayWidget
        merchantId="a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"
        apiKey="test_api_key_12345"
        orderId={`ORDER-${Date.now()}`}
        amount={1000}
        currency="SDG"
        onSuccess={(transaction) => {
          console.log('Payment successful:', transaction);
          alert('Payment approved!');
        }}
        onError={(error) => {
          console.error('Payment error:', error);
          alert('Payment failed: ' + error.message);
        }}
      />
    </div>
  );
};

const rootElement = document.getElementById('root');
console.log('Root element:', rootElement);

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <Demo />
    </React.StrictMode>
  );
} else {
  console.error('Root element not found!');
}
