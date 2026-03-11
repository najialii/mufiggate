#!/bin/bash

# SudanPay Backend Setup Script

echo "🚀 Setting up SudanPay Backend..."

# Create uploads directory
mkdir -p uploads

# Check if .env exists
if [ ! -f .env ]; then
  echo "📝 Creating .env file..."
  cp .env.example .env
  echo "⚠️  Please update .env with your database credentials"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Database setup
echo "🗄️  Setting up database..."
read -p "Enter PostgreSQL username: " DB_USER
read -p "Enter database name (default: sudanpay): " DB_NAME
DB_NAME=${DB_NAME:-sudanpay}

# Create database if it doesn't exist
psql -U $DB_USER -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || psql -U $DB_USER -c "CREATE DATABASE $DB_NAME"

# Run schema
echo "📊 Creating tables..."
psql -U $DB_USER -d $DB_NAME -f src/db/schema.sql

# Run seed data
echo "🌱 Seeding test data..."
psql -U $DB_USER -d $DB_NAME -f src/db/seed.sql

echo "✅ Setup complete!"
echo ""
echo "Test credentials:"
echo "  Merchant ID: a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"
echo "  API Key: test_api_key_12345"
echo ""
echo "Start the server with: npm run dev"
