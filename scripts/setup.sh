#!/bin/bash

echo "🚀 Setting up Sinaesta Backend..."
echo ""

# Check if PostgreSQL is running
echo "📊 Checking PostgreSQL connection..."
if ! pg_isready -h localhost -p 5432 -U postgres > /dev/null 2>&1; then
    echo "❌ PostgreSQL is not running on localhost:5432"
    echo "💡 Please start PostgreSQL or use: docker-compose up -d postgres"
    exit 1
fi

echo "✅ PostgreSQL is running"
echo ""

# Run migrations
echo "📝 Running database migrations..."
psql -h localhost -U postgres -d sinaesta -f server/migrations/001_initial_schema.sql

if [ $? -eq 0 ]; then
    echo "✅ Schema created successfully"
else
    echo "❌ Failed to create schema"
    echo "💡 Make sure the 'sinaesta' database exists: createdb -U postgres sinaesta"
    exit 1
fi

echo ""

# Run seed data
echo "🌱 Inserting seed data..."
psql -h localhost -U postgres -d sinaesta -f server/migrations/seed.sql

if [ $? -eq 0 ]; then
    echo "✅ Seed data inserted successfully"
else
    echo "⚠️  Failed to insert seed data (this is okay if data already exists)"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Default credentials:"
echo "   Admin:    admin@sinaesta.com    / admin123"
echo "   Mentor:    mentor1@sinaesta.com  / admin123"
echo "   Student:   student1@sinaesta.com / admin123"
echo "   Demo:      demo@sinaesta.com     / demo123"
echo ""
echo "🚀 Start the server with: npm run server"
echo "   or start both frontend & backend with: npm run dev:all"
