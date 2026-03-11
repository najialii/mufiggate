-- Sample data for testing

-- Insert a test merchant
INSERT INTO merchants (id, name, email, api_key, webhook_url, webhook_secret)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'Test Merchant',
  'merchant@example.com',
  'test_api_key_12345',
  'https://example.com/webhook',
  'webhook_secret_12345'
);

-- Insert bank accounts for the test merchant
INSERT INTO merchant_banks (merchant_id, bank_code, account_number, account_name)
VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'BOK', '1234567890', 'Test Merchant - BOK'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'FAISAL', '0987654321', 'Test Merchant - Faisal'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'AL_SALAM', '5555555555', 'Test Merchant - Al Salam');
