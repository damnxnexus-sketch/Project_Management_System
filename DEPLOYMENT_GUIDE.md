# 🚀 NEXUS Project Management System - VPS Deployment Guide

**Last Updated:** May 24, 2026  
**Status:** Production Ready  
**Target:** Ubuntu/Debian VPS  

---

## 📋 Prerequisites

Before deploying, ensure you have:

### Server Requirements
- **OS:** Ubuntu 20.04+ or Debian 11+
- **RAM:** Minimum 2GB (4GB+ recommended)
- **Storage:** 20GB SSD minimum
- **CPU:** 1 vCore minimum (2+ cores recommended)
- **Bandwidth:** Unlimited or 1TB+/month

### Software Requirements
- Node.js 20.x LTS
- npm 10.x+
- Git
- PostgreSQL 14+ (or SQLite)
- Nginx (reverse proxy)
- PM2 or systemd (process manager)
- SSL Certificate (Let's Encrypt)

---

## 🔧 Step 1: Server Setup

### 1.1 Connect to Your VPS

```bash
ssh root@your_vps_ip
```

### 1.2 Update System

```bash
apt update && apt upgrade -y
```

### 1.3 Install Node.js 20.x

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs
```

**Verify installation:**
```bash
node --version  # v20.x.x
npm --version   # 10.x.x
```

### 1.4 Install Git

```bash
apt install -y git
```

### 1.5 Install Nginx

```bash
apt install -y nginx
systemctl start nginx
systemctl enable nginx
```

### 1.6 Install SSL Support

```bash
apt install -y certbot python3-certbot-nginx
```

---

## 📁 Step 2: Application Setup

### 2.1 Create Application Directory

```bash
mkdir -p /var/www/nexus-pms
cd /var/www/nexus-pms
```

### 2.2 Clone Repository

```bash
git clone https://github.com/your-username/nexus-pms.git .
```

Or if you don't have a git repository yet, copy files:

```bash
# From your local machine
scp -r /path/to/project/* root@your_vps_ip:/var/www/nexus-pms/
```

### 2.3 Navigate to Project

```bash
cd /var/www/nexus-pms
```

### 2.4 Install Dependencies

```bash
npm install
```

**Verify build:**
```bash
npm run build
```

Expected output:
```
✓ Compiled successfully
✓ Finished TypeScript
✓ Generating static pages (15/15)
```

---

## 🗄️ Step 3: Database Setup

### Option A: SQLite (Recommended for small deployments)

SQLite is already configured. The database will be created automatically:

```bash
# Prisma will create database on first run
npx prisma migrate deploy
```

### Option B: PostgreSQL (Recommended for production)

#### 3B.1 Install PostgreSQL

```bash
apt install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql
```

#### 3B.2 Create Database

```bash
sudo -u postgres psql
```

In PostgreSQL prompt:
```sql
CREATE DATABASE nexus_pms;
CREATE USER nexus_user WITH PASSWORD 'your_secure_password';
ALTER ROLE nexus_user SET client_encoding TO 'utf8';
ALTER ROLE nexus_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE nexus_user SET default_transaction_deferrable TO on;
ALTER ROLE nexus_user SET default_transaction_read_only TO off;
GRANT ALL PRIVILEGES ON DATABASE nexus_pms TO nexus_user;
\q
```

#### 3B.3 Update .env.production

```bash
nano .env.production
```

Add:
```env
DATABASE_URL="postgresql://nexus_user:your_secure_password@localhost:5432/nexus_pms"
```

#### 3B.4 Run Migrations

```bash
npx prisma migrate deploy
```

---

## 🔐 Step 4: Environment Configuration

### 4.1 Create Production Environment File

```bash
nano /var/www/nexus-pms/.env.production
```

Add the following:

```env
# Application
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-domain.com

# Database
DATABASE_URL="file:./prisma/prod.db"  # For SQLite
# OR for PostgreSQL:
# DATABASE_URL="postgresql://user:password@localhost:5432/nexus_pms"

# Authentication
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=https://your-domain.com

# Claude AI
CLAUDE_API_KEY=your_claude_api_key

# File Upload
MAX_FILE_SIZE=10485760  # 10MB in bytes

# Email (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### 4.2 Generate Secure Keys

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Copy and paste the output to .env.production
```

### 4.3 Load Environment Variables

```bash
export NODE_ENV=production
```

---

## ⚙️ Step 5: Process Management

### Option A: Using PM2 (Recommended)

#### 5A.1 Install PM2

```bash
npm install -g pm2
```

#### 5A.2 Create Ecosystem File

```bash
nano /var/www/nexus-pms/ecosystem.config.js
```

Add:
```javascript
module.exports = {
  apps: [
    {
      name: 'nexus-pms',
      script: '.next/standalone/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      merge_logs: true,
      max_memory_restart: '1G',
      autorestart: true,
      watch: false,
    },
  ],
};
```

#### 5A.3 Create Logs Directory

```bash
mkdir -p /var/www/nexus-pms/logs
```

#### 5A.4 Start Application

```bash
pm2 start ecosystem.config.js
pm2 startup
pm2 save
```

#### 5A.5 Monitor Application

```bash
pm2 logs nexus-pms
pm2 monit
```

### Option B: Using Systemd

#### 5B.1 Create Service File

```bash
nano /etc/systemd/system/nexus-pms.service
```

Add:
```ini
[Unit]
Description=NEXUS Project Management System
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/nexus-pms
Environment="NODE_ENV=production"
Environment="PORT=3000"
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

#### 5B.2 Enable and Start Service

```bash
systemctl daemon-reload
systemctl enable nexus-pms
systemctl start nexus-pms
systemctl status nexus-pms
```

#### 5B.3 View Logs

```bash
journalctl -u nexus-pms -f
```

---

## 🌐 Step 6: Nginx Configuration

### 6.1 Create Nginx Config

```bash
nano /etc/nginx/sites-available/nexus-pms
```

Add:
```nginx
upstream nexus_backend {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL Certificates
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_proxied any;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/json application/javascript;

    # Client Upload Limit
    client_max_body_size 100M;

    # Proxy Settings
    location / {
        proxy_pass http://nexus_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static Files Caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### 6.2 Enable Site

```bash
ln -s /etc/nginx/sites-available/nexus-pms /etc/nginx/sites-enabled/
```

### 6.3 Test Nginx Configuration

```bash
nginx -t
```

Expected output:
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### 6.4 Reload Nginx

```bash
systemctl reload nginx
```

---

## 🔒 Step 7: SSL Certificate (Let's Encrypt)

### 7.1 Obtain Certificate

```bash
certbot certonly --nginx -d your-domain.com -d www.your-domain.com
```

### 7.2 Auto-Renewal

```bash
systemctl enable certbot.timer
systemctl start certbot.timer
```

**Verify renewal:**
```bash
certbot renew --dry-run
```

---

## ✅ Step 8: Verification

### 8.1 Check Application Status

```bash
# If using PM2
pm2 status

# If using systemd
systemctl status nexus-pms
```

### 8.2 Check Logs

```bash
# If using PM2
pm2 logs nexus-pms

# If using systemd
journalctl -u nexus-pms -f
```

### 8.3 Test URL

Open in browser:
```
https://your-domain.com
```

### 8.4 Check Application Logs

```bash
tail -f /var/www/nexus-pms/logs/out.log
```

---

## 🔧 Step 9: Post-Deployment Configuration

### 9.1 Create Admin User

```bash
cd /var/www/nexus-pms
node seed-admin.js
```

### 9.2 Configure Backups

```bash
# Create backup script
nano /var/www/nexus-pms/backup.sh
```

Add:
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/nexus-pms"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/nexus_backup_$DATE.tar.gz"

mkdir -p $BACKUP_DIR

# Backup database and uploads
tar -czf $BACKUP_FILE \
  /var/www/nexus-pms/prisma \
  /var/www/nexus-pms/public/uploads

# Keep only last 7 days
find $BACKUP_DIR -mtime +7 -delete

echo "Backup completed: $BACKUP_FILE"
```

### 9.3 Schedule Automatic Backups

```bash
# Make script executable
chmod +x /var/www/nexus-pms/backup.sh

# Add to crontab
crontab -e
```

Add line:
```
0 2 * * * /var/www/nexus-pms/backup.sh
```

(Runs daily at 2 AM)

---

## 🔄 Step 10: Update Process

### 10.1 Pull Latest Changes

```bash
cd /var/www/nexus-pms
git pull origin main
```

### 10.2 Install Dependencies

```bash
npm install
```

### 10.3 Build Application

```bash
npm run build
```

### 10.4 Run Migrations

```bash
npx prisma migrate deploy
```

### 10.5 Restart Application

```bash
# If using PM2
pm2 restart nexus-pms

# If using systemd
systemctl restart nexus-pms
```

---

## 🚨 Troubleshooting

### Issue: Application Won't Start

**Check logs:**
```bash
pm2 logs nexus-pms
# or
journalctl -u nexus-pms -n 50
```

**Common fixes:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Rebuild application
npm run build

# Check environment variables
cat .env.production
```

### Issue: Nginx 502 Bad Gateway

**Check application:**
```bash
curl http://127.0.0.1:3000
```

**Check Nginx logs:**
```bash
tail -f /var/log/nginx/error.log
```

**Solution:**
```bash
# Ensure application is running
pm2 status
pm2 restart nexus-pms
```

### Issue: Database Connection Error

**Check database:**
```bash
# For SQLite
ls -la /var/www/nexus-pms/prisma/

# For PostgreSQL
psql -U nexus_user -d nexus_pms -h localhost
```

**Verify environment:**
```bash
echo $DATABASE_URL
cat .env.production | grep DATABASE_URL
```

### Issue: Out of Memory

**Increase PM2 memory limit:**
```bash
# Edit ecosystem.config.js
# max_memory_restart: '1G' → '2G'

pm2 restart nexus-pms
```

**Check system memory:**
```bash
free -h
top
```

---

## 📊 Monitoring

### Check Server Resources

```bash
# CPU and Memory
top
htop  # if installed

# Disk usage
df -h

# Application processes
ps aux | grep node
```

### Monitor Application

```bash
# PM2 monitoring
pm2 monit

# Application logs
pm2 logs nexus-pms --lines 100

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Setup Alerts (Optional)

```bash
# Install New Relic for monitoring
npm install newrelic
```

---

## 🔐 Security Hardening

### 10.1 Configure Firewall

```bash
# Install UFW
apt install -y ufw

# Allow SSH
ufw allow 22/tcp

# Allow HTTP/HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Enable firewall
ufw enable
```

### 10.2 Disable Root Login

```bash
nano /etc/ssh/sshd_config
```

Change:
```
PermitRootLogin no
PasswordAuthentication no
```

Restart SSH:
```bash
systemctl restart ssh
```

### 10.3 Add User for Application

```bash
adduser --system --group --disabled-login nexus-user
usermod -aG www-data nexus-user

# Change ownership
chown -R nexus-user:www-data /var/www/nexus-pms
```

### 10.4 Set Proper Permissions

```bash
chmod 755 /var/www/nexus-pms
chmod 640 /var/www/nexus-pms/.env.production
```

---

## 📈 Performance Optimization

### 10.1 Enable Compression

Already configured in Nginx config above.

### 10.2 Optimize Database

```bash
# For SQLite
npx prisma optimize

# For PostgreSQL
sudo -u postgres vacuumdb nexus_pms
```

### 10.3 Enable Caching

Already configured in Nginx config with expires and Cache-Control headers.

### 10.4 Monitor Performance

```bash
# Check response times
curl -w "@curl-format.txt" -o /dev/null https://your-domain.com

# Or use online tools
# https://www.webpagetest.org/
# https://pagespeed.web.dev/
```

---

## 🎉 Deployment Complete!

Your NEXUS Project Management System is now live! 

### What's Running:
✅ Next.js application on port 3000  
✅ Nginx reverse proxy on ports 80/443  
✅ SSL/TLS encryption  
✅ Process management (PM2 or systemd)  
✅ Database (SQLite or PostgreSQL)  

### Next Steps:
1. Access application at `https://your-domain.com`
2. Login with admin credentials
3. Configure team members
4. Set up projects and tasks
5. Monitor application logs

---

## 📞 Support

For deployment issues:
1. Check application logs
2. Review Nginx configuration
3. Verify environment variables
4. Check database connectivity
5. Monitor server resources

---

**Happy Deploying! 🚀**

Last Updated: May 24, 2026
