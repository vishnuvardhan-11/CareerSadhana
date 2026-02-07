# Quick Deployment Guide

## Prerequisites Installed
```bash
sudo apt update
sudo apt install -y python3.11 python3.11-venv python3-pip mysql-server nginx certbot python3-certbot-nginx
```

## 1. Database Setup
```bash
# Secure MySQL
sudo mysql_secure_installation

# Create database
sudo mysql -u root -p < manual_create_db.sql
# Edit manual_create_db.sql first to change the password!
```

## 2. Application Setup
```bash
# Create app user
sudo useradd -m -s /bin/bash careersadhana

# Setup app
cd /home/careersadhana
git clone <your-repo> careersadhana
cd careersadhana

# Create venv
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
nano .env  # EDIT ALL VALUES!

# Database migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Collect static
python manage.py collectstatic --noinput

# Create logs directory
mkdir -p logs
chmod 755 logs
```

## 3. Gunicorn Service
Create `/etc/systemd/system/careersadhana.service` - see README for full content.

```bash
sudo systemctl daemon-reload
sudo systemctl enable careersadhana
sudo systemctl start careersadhana
sudo systemctl status careersadhana
```

## 4. Nginx Configuration
Create `/etc/nginx/sites-available/careersadhana` - see README for full content.

```bash
sudo ln -s /etc/nginx/sites-available/careersadhana /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 5. SSL Certificate
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
sudo systemctl reload nginx
```

## 6. Test
```bash
curl https://yourdomain.com/healthz
```

## Maintenance Mode
```bash
# Enable
sudo touch /home/careersadhana/careersadhana/maintenance.flag
sudo systemctl reload nginx

# Disable
sudo rm /home/careersadhana/careersadhana/maintenance.flag
sudo systemctl reload nginx
```

Done! Visit https://yourdomain.com
