#!/bin/bash

# Production deployment script for MWIT Print System

set -e

echo "🚀 Deploying MWIT Print System to Production..."

# Check if running as root (not recommended for production)
if [ "$EUID" -eq 0 ]; then
    echo "⚠️  Warning: Running as root is not recommended for production."
    echo "   Consider creating a dedicated user for the application."
fi

# Validate environment variables
if [ -z "$GOOGLE_CLIENT_ID" ] || [ -z "$GOOGLE_CLIENT_SECRET" ] || [ -z "$NEXTAUTH_SECRET" ]; then
    echo "❌ Missing required environment variables:"
    echo "   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXTAUTH_SECRET"
    echo "   Please set these in your .env file or environment."
    exit 1
fi

# Create production environment
echo "📄 Setting up production environment..."
export NODE_ENV=production

# Backup existing data if this is an update
if [ -d "postgres_data" ]; then
    echo "💾 Creating backup of existing data..."
    timestamp=$(date +%Y%m%d_%H%M%S)
    tar -czf "backup_${timestamp}.tar.gz" postgres_data/
    echo "   Backup saved as: backup_${timestamp}.tar.gz"
fi

# Pull latest images and rebuild
echo "🏗️  Building production images..."
docker-compose -f docker-compose.yml build --no-cache

# Start database first
echo "🗄️  Starting database..."
docker-compose -f docker-compose.yml up -d database

echo "⏳ Waiting for database to be ready..."
sleep 15

# Run migrations
echo "📊 Running database migrations..."
docker-compose -f docker-compose.yml run --rm frontend npx prisma db push
docker-compose -f docker-compose.yml run --rm frontend npx prisma generate

# Start all services
echo "🚀 Starting all production services..."
docker-compose -f docker-compose.yml --profile production up -d

# Wait a moment for services to start
sleep 10

# Check service health
echo "🔍 Checking service health..."
services=("database" "print-api" "frontend")
for service in "${services[@]}"; do
    if docker-compose -f docker-compose.yml ps | grep -q "${service}.*Up"; then
        echo "✅ ${service}: Running"
    else
        echo "❌ ${service}: Failed to start"
        docker-compose -f docker-compose.yml logs "${service}"
        exit 1
    fi
done

echo ""
echo "🎉 Production deployment complete!"
echo ""
echo "📊 Service URLs:"
echo "   Application: http://localhost:3000"
echo "   Print API: http://localhost:8000"
if docker-compose -f docker-compose.yml --profile production ps | grep -q nginx; then
    echo "   Load Balancer: http://localhost"
fi
echo ""
echo "📝 Management Commands:"
echo "   View logs: docker-compose logs -f"
echo "   Stop services: docker-compose down"
echo "   Update: git pull && ./docker-scripts/production-deploy.sh"
echo ""
echo "⚠️  Important:"
echo "   - Monitor logs for any issues"
echo "   - Set up regular database backups"
echo "   - Consider setting up SSL certificates for HTTPS"
echo "   - Configure firewall rules appropriately"