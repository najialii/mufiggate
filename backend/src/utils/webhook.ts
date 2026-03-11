import crypto from 'crypto';
import { WebhookPayload } from '@sudanpay/shared';

export const generateSignature = (payload: string, secret: string): string => {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
};

export const sendWebhook = async (
  url: string,
  payload: WebhookPayload,
  secret: string
): Promise<boolean> => {
  try {
    const payloadString = JSON.stringify(payload);
    const signature = generateSignature(payloadString, secret);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
      },
      body: payloadString,
    });

    return response.ok;
  } catch (error) {
    console.error('Webhook delivery failed:', error);
    return false;
  }
};
