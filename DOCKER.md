# Docker Deployment Guide

This guide explains how to deploy the MWIT Print System using Docker containers.

## 🏗️ Architecture

The Docker setup includes:
- **Frontend**: Next.js application (Port 3000)
- **Print API**: Python FastAPI service (Port 8000) 
- **Database**: PostgreSQL 15 (Port 5432)
- **Load Balancer**: Nginx reverse proxy (Port 80/443)

## 🚀 Quick Start

### 1. Prerequisites

Install Docker and Docker Compose:
```bash
# On Ubuntu/Debian
sudo apt update
sudo apt install docker.io docker-compose

# On macOS with Homebrew
brew install docker docker-compose

# On Windows, install Docker Desktop
```

### 2. Environment Setup

```bash
# Clone the repository
git clone <repository-url>
cd sc-printer

# Copy environment template
cp .env.docker .env

# Edit environment variables
nano .env
```

Required environment variables in `.env`:
```env
# Database
DB_PASSWORD=your_secure_database_password

# NextAuth
NEXTAUTH_SECRET=your_super_secret_key_min_32_characters
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (get from Google Cloud Console)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 3. Automated Setup

```bash
# Run the setup script
./docker-scripts/setup.sh
```

### 4. Manual Setup

```bash
# Build all services
docker-compose build

# Start database first
docker-compose up -d database

# Wait for database, then run migrations
sleep 10
docker-compose run --rm frontend npx prisma db push

# Start all services
docker-compose up -d
```

## 📊 Service Management

### Check Status
```bash
docker-compose ps
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f frontend
docker-compose logs -f print-api
docker-compose logs -f database
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart frontend
```

### Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ REMOVES ALL DATA)
docker-compose down -v
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DB_PASSWORD` | PostgreSQL password | Yes |
| `NEXTAUTH_SECRET` | NextAuth.js secret (min 32 chars) | Yes |
| `NEXTAUTH_URL` | Full URL of your application | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Yes |
| `DOMAIN` | Your domain name (for production) | No |
| `SSL_EMAIL` | Email for SSL certificates | No |

### Volume Mounts

- `postgres_data`: Database files
- `print_files`: Uploaded and print files
- `/var/run/cups/cups.sock`: System printer access (Linux/macOS)

### Networks

All services communicate through the `sc-printer-network` bridge network.

## 🚀 Production Deployment

### 1. Production Script
```bash
# Set environment variables
export GOOGLE_CLIENT_ID="your_real_client_id"
export GOOGLE_CLIENT_SECRET="your_real_client_secret" 
export NEXTAUTH_SECRET="your_super_secure_secret_key"

# Run production deployment
./docker-scripts/production-deploy.sh
```

### 2. With Load Balancer
```bash
# Start with Nginx reverse proxy
docker-compose --profile production up -d
```

### 3. SSL Setup (HTTPS)

1. Obtain SSL certificates (Let's Encrypt recommended):
```bash
# Install certbot
sudo apt install certbot

# Get certificates
sudo certbot certonly --standalone -d your-domain.com
```

2. Copy certificates to `ssl/` directory:
```bash
mkdir -p ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ssl/key.pem
```

3. Update `nginx.conf` to enable HTTPS section

## 🔍 Troubleshooting

### Common Issues

**Database Connection Failed**
```bash
# Check database logs
docker-compose logs database

# Restart database
docker-compose restart database
```

**Frontend Build Errors**
```bash
# Clear build cache
docker-compose down
docker system prune -f
docker-compose build --no-cache frontend
```

**Printer Access Issues (Linux/macOS)**
```bash
# Check CUPS socket permissions
ls -la /var/run/cups/cups.sock

# Add docker group access to cups
sudo usermod -a -G lpadmin $(whoami)
```

**Port Conflicts**
```bash
# Check what's using ports
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :8000
sudo netstat -tulpn | grep :5432

# Kill processes or change ports in docker-compose.yml
```

### Health Checks

Each service has health checks:
```bash
# Check service health
docker-compose ps

# Manual health check
curl http://localhost:3000/api/health
curl http://localhost:8000/health
```

### Database Management

```bash
# Access PostgreSQL
docker-compose exec database psql -U sc_printer_user -d sc_printer

# Backup database
docker-compose exec database pg_dump -U sc_printer_user sc_printer > backup.sql

# Restore database
docker-compose exec -T database psql -U sc_printer_user sc_printer < backup.sql
```

## 🔄 Updates and Maintenance

### Update Application
```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d

# Run any new migrations
docker-compose run --rm frontend npx prisma db push
```

### Database Backups
```bash
# Create backup script
cat << 'EOF' > backup.sh
#!/bin/bash
timestamp=$(date +%Y%m%d_%H%M%S)
docker-compose exec database pg_dump -U sc_printer_user sc_printer > "backup_${timestamp}.sql"
echo "Backup created: backup_${timestamp}.sql"
EOF

chmod +x backup.sh

# Run backup
./backup.sh

# Set up cron job for regular backups
echo "0 2 * * * /path/to/your/project/backup.sh" | crontab -
```

## 📊 Monitoring

### Resource Usage
```bash
# Check container resources
docker stats

# Check disk usage
docker system df
```

### Log Management
```bash
# Limit log size in docker-compose.yml
services:
  frontend:
    logging:
      options:
        max-size: "10m"
        max-file: "3"
```

## 🔐 Security

### Best Practices

1. **Change default passwords**
2. **Use strong secrets** (32+ character NEXTAUTH_SECRET)
3. **Enable firewall** on production servers
4. **Regular updates** of Docker images
5. **SSL certificates** for HTTPS
6. **Backup strategy** for data recovery

### Firewall Configuration (Ubuntu)
```bash
# Install UFW
sudo apt install ufw

# Allow SSH
sudo ufw allow ssh

# Allow HTTP/HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Allow application ports (if needed for direct access)
sudo ufw allow 3000
sudo ufw allow 8000

# Enable firewall
sudo ufw --force enable
```

## 🏷️ Service Tags

Images are built with these tags:
- `sc-printer-frontend:latest`
- `sc-printer-api:latest`

For production, consider using specific version tags instead of `latest`.