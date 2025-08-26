#!/bin/bash

# MWIT Print System Docker Setup Script

set -e

echo "🚀 Setting up MWIT Print System with Docker..."

# Check if Docker and Docker Compose are installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env file from template if it doesn't exist
if [ ! -f .env ]; then
    echo "📄 Creating .env file from template..."
    cp .env.docker .env
    echo "⚠️  Please update the .env file with your actual values before continuing."
    echo "   Especially update GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and NEXTAUTH_SECRET"
    echo ""
    echo "Press any key to continue after updating .env file..."
    read -n 1
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p ssl
mkdir -p public/uploads
mkdir -p public/print

# Build and start services
echo "🏗️  Building Docker images..."
docker-compose build

echo "🔄 Starting services..."
docker-compose up -d database

echo "⏳ Waiting for database to be ready..."
sleep 10

echo "🗄️  Running database migrations..."
# We need to run Prisma migrations after the database is up
docker-compose run --rm frontend npx prisma db push

echo "🚀 Starting all services..."
docker-compose up -d

echo "✅ Setup complete!"
echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "🌐 Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Print API: http://localhost:8000"
echo "   Database: localhost:5432"
echo ""
echo "📝 To view logs:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 To stop all services:"
echo "   docker-compose down"
echo ""
echo "🔥 To completely reset (CAUTION - removes all data):"
echo "   docker-compose down -v && docker system prune -f"