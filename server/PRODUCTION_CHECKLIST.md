# 🚀 Production Deployment Checklist

Complete checklist for deploying SGTU Event Management Server to production.

---

## ✅ Pre-Deployment Checklist

### 1. Environment Configuration

- [ ] Copy `.env.production` to `.env`
- [ ] Update all `CHANGE_THIS` values with strong credentials
- [ ] Generate JWT secrets: `openssl rand -base64 64`
- [ ] Set `NODE_ENV=production`
- [ ] Update `CLIENT_URL` to production domain
- [ ] Configure production database URL (Neon DB)
- [ ] Configure production Redis URL (Redis Cloud)
- [ ] Set strong `ADMIN_PASSWORD`
- [ ] Configure SMTP credentials for email

### 2. Security Hardening

- [ ] Use strong, unique passwords (min 32 characters)
- [ ] Enable HTTPS/TLS certificates
- [ ] Configure firewall rules (allow only 80, 443, SSH)
- [ ] Set up SSH key authentication (disable password auth)
- [ ] Enable fail2ban for brute force protection
- [ ] Configure rate limiting in Nginx
- [ ] Review and update CORS settings
- [ ] Enable security headers (already in nginx.conf)
- [ ] Set up Web Application Firewall (WAF) if using AWS
- [ ] Scan Docker image for vulnerabilities: `docker scan sgtu-event-server`

### 3. Database Setup (Neon DB)

- [ ] Upgrade to Neon Pro Plan ($19/month)
- [ ] Configure "never suspend" in Neon dashboard
- [ ] Enable point-in-time recovery
- [ ] Create database branch for testing
- [ ] Run production migrations: `make migrate`
- [ ] Verify schema: `npm run migrate:verify`
- [ ] Set up automated backups (included in Pro)
- [ ] Test database connection from Docker container

### 4. Redis Configuration

- [ ] Upgrade to Redis Cloud Essentials ($7-10/month)
- [ ] Enable high availability
- [ ] Configure persistence (AOF + RDB)
- [ ] Test Redis connection
- [ ] Warm QR code cache: `npm run qr:warm-cache`

### 5. Docker & Infrastructure

- [ ] Build production image: `make prod-build`
- [ ] Test locally: `make prod-up`
- [ ] Verify health check: `curl http://localhost:5000/health`
- [ ] Test all API endpoints
- [ ] Configure resource limits in docker-compose.prod.yml
- [ ] Set up log rotation
- [ ] Create persistent volumes for uploads and logs
- [ ] Configure automatic container restart policies

### 6. SSL/TLS Certificates

- [ ] Obtain SSL certificate (Let's Encrypt or commercial)
- [ ] Copy certificates to `nginx/ssl/`
- [ ] Update nginx.conf with certificate paths
- [ ] Enable HTTPS server block in nginx.conf
- [ ] Test SSL configuration: `https://www.ssllabs.com/ssltest/`
- [ ] Configure auto-renewal for Let's Encrypt

### 7. Monitoring & Logging

- [ ] Set up log aggregation (CloudWatch, Datadog, etc.)
- [ ] Configure application performance monitoring (APM)
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom)
- [ ] Create alerting rules for errors/downtime
- [ ] Configure Slack/email notifications
- [ ] Set up Docker resource monitoring
- [ ] Enable Nginx access logs
- [ ] Configure error tracking (Sentry, Rollbar)

### 8. Performance Optimization

- [ ] Enable Nginx caching for static assets
- [ ] Configure Redis connection pooling
- [ ] Optimize database queries (add indexes)
- [ ] Enable gzip compression (already configured)
- [ ] Configure CDN for static files (if needed)
- [ ] Load test with Artillery: `artillery run load-test.yml`
- [ ] Optimize Docker image size
- [ ] Enable HTTP/2 in Nginx

### 9. Backup & Recovery

- [ ] Test database backup restoration
- [ ] Create backup script for uploads directory
- [ ] Set up automated daily backups
- [ ] Document disaster recovery procedure
- [ ] Test rollback process
- [ ] Create database snapshots before deployment

### 10. Documentation

- [ ] Update API documentation with production URLs
- [ ] Document deployment process
- [ ] Create runbook for common issues
- [ ] Document rollback procedure
- [ ] Update README with production setup
- [ ] Document monitoring dashboard access

---

## 🏭 Deployment Steps

### Step 1: Server Preparation

```bash
# SSH into production server
ssh user@your-server-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Create application directory
sudo mkdir -p /app/sgtu-event
sudo chown $USER:$USER /app/sgtu-event
```

### Step 2: Clone Repository

```bash
cd /app/sgtu-event
git clone https://github.com/Abhinandan-Sah/sgtu-event.git .
cd server
```

### Step 3: Configure Environment

```bash
# Copy production environment
cp .env.production .env

# Edit environment variables
nano .env

# Generate secrets
openssl rand -base64 64  # For JWT_SECRET
openssl rand -base64 64  # For JWT_REFRESH_SECRET
openssl rand -base64 32  # For ADMIN_PASSWORD
```

### Step 4: SSL Certificate Setup

```bash
# Option 1: Let's Encrypt (Free)
sudo apt install certbot
sudo certbot certonly --standalone -d api.your-domain.com

# Copy certificates
mkdir -p nginx/ssl
sudo cp /etc/letsencrypt/live/api.your-domain.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/api.your-domain.com/privkey.pem nginx/ssl/
sudo chown -R $USER:$USER nginx/ssl

# Option 2: Commercial Certificate
# Copy your .crt and .key files to nginx/ssl/
```

### Step 5: Build and Deploy

```bash
# Build production image
docker compose -f docker-compose.prod.yml build

# Start services
docker compose -f docker-compose.prod.yml up -d

# Check logs
docker compose -f docker-compose.prod.yml logs -f

# Run migrations
docker compose -f docker-compose.prod.yml exec app npm run migrate

# Seed initial data (if needed)
docker compose -f docker-compose.prod.yml exec app npm run seed
```

### Step 6: Verify Deployment

```bash
# Check container health
docker ps

# Test health endpoint
curl http://localhost/health

# Test API
curl http://localhost/api

# Check logs
docker compose -f docker-compose.prod.yml logs app

# Monitor resources
docker stats
```

### Step 7: Configure Firewall

```bash
# UFW (Ubuntu)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable

# Check status
sudo ufw status
```

### Step 8: Set Up Auto-Start

```bash
# Create systemd service
sudo nano /etc/systemd/system/sgtu-event.service
```

```ini
[Unit]
Description=SGTU Event Management Server
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/app/sgtu-event/server
ExecStart=/usr/bin/docker compose -f docker-compose.prod.yml up -d
ExecStop=/usr/bin/docker compose -f docker-compose.prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start
sudo systemctl enable sgtu-event
sudo systemctl start sgtu-event
sudo systemctl status sgtu-event
```

---

## 🧪 Testing

### Load Testing

```bash
# Install Artillery
npm install -g artillery

# Run load test
artillery quick --count 1000 --num 50 https://api.your-domain.com/health

# Custom scenario
artillery run load-test.yml
```

### Security Testing

```bash
# Scan Docker image
docker scan sgtu-event-server:latest

# SSL test
openssl s_client -connect api.your-domain.com:443

# Headers test
curl -I https://api.your-domain.com
```

---

## 📊 Monitoring

### Health Checks

```bash
# Application health
curl https://api.your-domain.com/health

# Container health
docker inspect sgtu-event-server-prod | grep Health

# Resource usage
docker stats
```

### Logs

```bash
# Application logs
docker compose -f docker-compose.prod.yml logs -f app

# Nginx logs
docker compose -f docker-compose.prod.yml logs -f nginx

# System logs
sudo journalctl -u sgtu-event -f
```

---

## 🔄 Updates & Rollback

### Rolling Update

```bash
# Pull latest changes
git pull origin production

# Rebuild image
docker compose -f docker-compose.prod.yml build

# Update with zero downtime
docker compose -f docker-compose.prod.yml up -d --no-deps app

# Verify
curl https://api.your-domain.com/health
```

### Rollback

```bash
# Stop current version
docker compose -f docker-compose.prod.yml down

# Restore from backup
git checkout <previous-commit>

# Rebuild and deploy
docker compose -f docker-compose.prod.yml up -d --build

# Restore database (if needed)
# Use Neon point-in-time recovery
```

---

## 🆘 Troubleshooting

### Container Won't Start

```bash
# Check logs
docker compose -f docker-compose.prod.yml logs app

# Inspect container
docker inspect sgtu-event-server-prod

# Check environment
docker compose -f docker-compose.prod.yml exec app env
```

### Database Connection Issues

```bash
# Test connection
docker compose -f docker-compose.prod.yml exec app node -e "
  const { neon } = require('@neondatabase/serverless');
  const sql = neon(process.env.NEON_DATABASE_URL);
  sql('SELECT NOW()').then(console.log).catch(console.error);
"
```

### High Memory Usage

```bash
# Check stats
docker stats

# Restart container
docker compose -f docker-compose.prod.yml restart app

# Adjust limits in docker-compose.prod.yml
```

---

## 📞 Support Contacts

- **System Admin**: admin@sgtu.ac.in
- **Database Issues**: Neon Support
- **Redis Issues**: Redis Cloud Support
- **SSL Issues**: Let's Encrypt Community

---

## ✅ Post-Deployment

- [ ] Monitor logs for 24 hours
- [ ] Test all critical user flows
- [ ] Verify email notifications work
- [ ] Check QR code generation
- [ ] Test student check-in/out
- [ ] Verify ranking system
- [ ] Monitor database performance
- [ ] Check Redis cache hit rate
- [ ] Review security logs
- [ ] Update documentation
- [ ] Notify stakeholders of deployment
- [ ] Schedule next maintenance window

---

**Last Updated**: November 18, 2025  
**Version**: 1.0.0  
**Environment**: Production
