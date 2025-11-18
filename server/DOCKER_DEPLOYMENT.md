# 🐳 Docker Deployment Guide - SGTU Event Management Server

Complete guide for deploying your Node.js API server with Docker in development and production environments.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Development Setup](#development-setup)
4. [Production Deployment](#production-deployment)
5. [AWS Deployment](#aws-deployment)
6. [Troubleshooting](#troubleshooting)

---

## ✅ Prerequisites

### Required Software

```bash
# Check if Docker is installed
docker --version
# Docker version 20.10.0 or higher

# Check Docker Compose
docker compose version
# Docker Compose version v2.0.0 or higher
```

### Install Docker

**Windows/Mac**: Download [Docker Desktop](https://www.docker.com/products/docker-desktop/)

**Linux (Ubuntu)**:
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

---

## 📁 Project Structure

```
server/
├── Dockerfile                    # Multi-stage production build
├── .dockerignore                 # Files to exclude from image
├── docker-compose.yml            # Development + local Redis
├── docker-compose.prod.yml       # Production (Neon DB + Redis Cloud)
├── .env.docker                   # Environment template
├── nginx/
│   └── nginx.conf               # Reverse proxy config
├── src/                         # Application source code
├── package.json
└── DOCKER_DEPLOYMENT.md         # This file
```

---

## 🚀 Development Setup

### 1. Prepare Environment Variables

```bash
# Copy environment template
cp .env.docker .env

# Edit .env with your credentials
nano .env
```

**Required Variables**:
```bash
NEON_DATABASE_URL=postgresql://user:pass@host/db
REDIS_PASSWORD=your_redis_password
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:3000
```

### 2. Build and Run (Development)

```bash
# Build the Docker image
docker compose build

# Start all services (app + local Redis)
docker compose up -d

# View logs
docker compose logs -f app

# Check running containers
docker ps
```

### 3. Access the Application

- **API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/health
- **Redis**: localhost:6379

### 4. Run Database Migrations

```bash
# Execute migrations inside container
docker compose exec app npm run migrate

# Seed database
docker compose exec app npm run seed

# Verify setup
docker compose exec app npm run seed:verify
```

### 5. Development Commands

```bash
# Stop all services
docker compose down

# Stop and remove volumes (fresh start)
docker compose down -v

# Rebuild after code changes
docker compose up -d --build

# View logs (specific service)
docker compose logs -f app
docker compose logs -f redis-local

# Execute commands inside container
docker compose exec app sh
docker compose exec app npm run qr:regenerate

# Scale application (multiple instances)
docker compose up -d --scale app=3
```

---

## 🏭 Production Deployment

### 1. Use Production Compose File

```bash
# Build production image
docker compose -f docker-compose.prod.yml build

# Start production services (no local Redis, uses Redis Cloud)
docker compose -f docker-compose.prod.yml up -d

# Monitor logs
docker compose -f docker-compose.prod.yml logs -f
```

### 2. Production Environment Variables

Update `.env` for production:

```bash
NODE_ENV=production
CLIENT_URL=https://your-domain.com
REDIS_URL=redis://your-redis-cloud-url
NEON_DATABASE_URL=postgresql://neon-production-url
JWT_SECRET=<strong-random-secret>
```

### 3. SSL/TLS Setup (Nginx)

```bash
# Create SSL directory
mkdir -p nginx/ssl

# Add your SSL certificates
cp /path/to/cert.pem nginx/ssl/
cp /path/to/key.pem nginx/ssl/

# Uncomment HTTPS server block in nginx/nginx.conf
```

### 4. Health Monitoring

```bash
# Check container health
docker ps

# Manual health check
curl http://localhost:5000/health

# View resource usage
docker stats
```

---

## ☁️ AWS Deployment Options

### Option 1: AWS EC2 with Docker

**Setup Steps**:

```bash
# 1. Launch EC2 instance (Ubuntu 22.04, t3.medium)
# 2. Connect via SSH
ssh -i your-key.pem ubuntu@ec2-instance-ip

# 3. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# 4. Clone repository
git clone https://github.com/yourusername/sgtu-event.git
cd sgtu-event/server

# 5. Set environment variables
nano .env

# 6. Deploy with Docker Compose
docker compose -f docker-compose.prod.yml up -d

# 7. Setup systemd service (optional - auto-restart on reboot)
sudo nano /etc/systemd/system/sgtu-event.service
```

**Systemd Service File** (`/etc/systemd/system/sgtu-event.service`):
```ini
[Unit]
Description=SGTU Event Management Server
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/ubuntu/sgtu-event/server
ExecStart=/usr/bin/docker compose -f docker-compose.prod.yml up -d
ExecStop=/usr/bin/docker compose -f docker-compose.prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl enable sgtu-event
sudo systemctl start sgtu-event
sudo systemctl status sgtu-event
```

**Cost**: ~$60-70/month (t3.medium EC2)

---

### Option 2: AWS ECS (Elastic Container Service)

**Setup**:

```bash
# 1. Build and push to ECR (Elastic Container Registry)
aws ecr create-repository --repository-name sgtu-event-server

# 2. Authenticate Docker to ECR
aws ecr get-login-password --region ap-south-1 | \
  docker login --username AWS --password-stdin \
  123456789012.dkr.ecr.ap-south-1.amazonaws.com

# 3. Build and tag image
docker build -t sgtu-event-server .
docker tag sgtu-event-server:latest \
  123456789012.dkr.ecr.ap-south-1.amazonaws.com/sgtu-event-server:latest

# 4. Push to ECR
docker push 123456789012.dkr.ecr.ap-south-1.amazonaws.com/sgtu-event-server:latest

# 5. Create ECS task definition and service via AWS Console or CLI
```

**Cost**: ~$40-50/month (Fargate 0.5 vCPU, 1GB RAM)

---

### Option 3: AWS Lightsail Container Service

**Simplest AWS Option**:

```bash
# 1. Create Lightsail container service
aws lightsail create-container-service \
  --service-name sgtu-event \
  --power small \
  --scale 1

# 2. Push container
aws lightsail push-container-image \
  --service-name sgtu-event \
  --label sgtu-server \
  --image sgtu-event-server:latest

# 3. Deploy
aws lightsail create-container-service-deployment \
  --service-name sgtu-event \
  --containers file://containers.json \
  --public-endpoint file://public-endpoint.json
```

**Cost**: $10-20/month (nano/micro instance)

---

## 🐛 Troubleshooting

### Container Won't Start

```bash
# Check logs for errors
docker compose logs app

# Verify environment variables
docker compose exec app env | grep NEON

# Check container health
docker inspect sgtu-event-server | grep Health
```

### Database Connection Issues

```bash
# Test Neon DB connection from container
docker compose exec app node -e "
  const { neon } = require('@neondatabase/serverless');
  const sql = neon(process.env.NEON_DATABASE_URL);
  sql('SELECT NOW()').then(console.log).catch(console.error);
"

# Verify connection string format
echo $NEON_DATABASE_URL
```

### Redis Connection Issues

```bash
# Test Redis connection
docker compose exec app node -e "
  const { createClient } = require('redis');
  const client = createClient({ url: process.env.REDIS_URL });
  client.connect().then(() => client.ping()).then(console.log);
"

# Check if Redis is accessible
docker compose exec app nc -zv redis-local 6379
```

### Port Already in Use

```bash
# Find process using port 5000
sudo lsof -i :5000

# Kill process
sudo kill -9 <PID>

# Or change port in .env
PORT=5001
```

### Image Size Too Large

```bash
# Check image size
docker images sgtu-event-server

# Optimize by removing dev dependencies
# (already done in multi-stage Dockerfile)

# Prune unused images
docker image prune -a
```

### Out of Memory

```bash
# Check container memory usage
docker stats

# Increase memory limit in docker-compose.yml
deploy:
  resources:
    limits:
      memory: 1G  # Increase from 512M
```

---

## 📊 Performance Optimization

### 1. Enable Caching

```bash
# Build with cache
docker compose build --parallel

# Use BuildKit for faster builds
DOCKER_BUILDKIT=1 docker compose build
```

### 2. Multi-Container Deployment

```bash
# Scale application horizontally
docker compose up -d --scale app=3

# Add load balancer (nginx) to distribute traffic
```

### 3. Resource Monitoring

```bash
# Real-time resource usage
docker stats

# Export metrics (Prometheus/Grafana integration)
# Add monitoring services to docker-compose.yml
```

---

## 🔒 Security Best Practices

1. **Never commit `.env` files** - Use `.env.example` template
2. **Use strong secrets** - Generate with `openssl rand -base64 32`
3. **Run as non-root user** - Already configured in Dockerfile
4. **Keep base images updated** - `docker pull node:20-alpine`
5. **Scan for vulnerabilities** - `docker scan sgtu-event-server`
6. **Use HTTPS in production** - Configure Nginx with SSL certificates
7. **Enable rate limiting** - Already configured in Nginx

---

## 📈 Scaling for 1000+ Users

### Horizontal Scaling (Recommended)

```bash
# Run multiple container instances
docker compose up -d --scale app=5

# Add Nginx load balancer
# Already configured in docker-compose.prod.yml
```

### Vertical Scaling

```yaml
# Increase resources in docker-compose.yml
deploy:
  resources:
    limits:
      cpus: '2.0'
      memory: 2G
```

### Database Optimization

- **Neon Pro Plan**: Autoscaling compute (0.5-4 CU)
- **Connection Pooling**: Already enabled via Neon pooler
- **Read Replicas**: Configure in Neon dashboard

---

## 🎯 Quick Reference

### Common Commands

```bash
# Development
docker compose up -d                  # Start all services
docker compose down                   # Stop all services
docker compose logs -f app            # View logs
docker compose exec app sh            # Shell access
docker compose restart app            # Restart app

# Production
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml logs -f

# Cleanup
docker compose down -v                # Remove volumes
docker system prune -a                # Remove all unused data
docker volume prune                   # Remove unused volumes
```

### Health Checks

```bash
curl http://localhost:5000/health
curl http://localhost:5000/api
docker compose exec app npm run migrate:verify
```

---

## ✅ Deployment Checklist

Before deploying to production:

- [ ] Update `.env` with production values
- [ ] Set `NODE_ENV=production`
- [ ] Configure strong `JWT_SECRET`
- [ ] Update `CLIENT_URL` to production domain
- [ ] Run database migrations
- [ ] Test health check endpoint
- [ ] Configure SSL certificates
- [ ] Enable monitoring/logging
- [ ] Set up automated backups
- [ ] Test with load testing tools
- [ ] Configure domain DNS
- [ ] Enable rate limiting

---

## 📞 Support

- **Documentation**: See other `.md` files in `/server`
- **Issues**: Check logs with `docker compose logs -f`
- **Health**: Monitor `/health` endpoint

---

**Last Updated**: November 18, 2025
**Docker Version**: 24.0+
**Node.js Version**: 20.x (Alpine)
