#!/bin/bash

echo "🚀 Setting up SudanPay monorepo..."

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Setup backend
echo ""
echo "🔧 Setting up backend..."
cd backend
if [ ! -f .env ]; then
  cp .env.example .env
  echo "✅ Created backend/.env (please configure)"
fi
mkdir -p uploads
cd ..

# Setup widget
echo ""
echo "🎨 Setting up widget..."
cd widget
if [ ! -f .env ]; then
  cp .env.example .env
  echo "✅ Created widget/.env"
fi
cd ..

# Setup dashboard
echo ""
echo "📊 Setting up dashboard..."
cd dashboard
if [ ! -f .env ]; then
  cp .env.example .env
  echo "✅ Created dashboard/.env"
fi
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure backend/.env with your PostgreSQL credentials"
echo "2. Initialize database:"
echo "   cd backend"
echo "   psql -U your_user -d sudanpay -f src/db/schema.sql"
echo "   psql -U your_user -d sudanpay -f src/db/seed.sql"
echo "3. Start services:"
echo "   npm run dev:backend   # Terminal 1"
echo "   npm run dev:widget    # Terminal 2"
echo "   npm run dev:dashboard # Terminal 3"
