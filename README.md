# CareerSadhana - Job Portal with ATS Resume Checker

A full-stack Python web application for job seekers featuring government and private job listings, plus an ATS (Applicant Tracking System) resume score checker.

## Features

- **ATS Resume Score Checker**: Upload your resume and get AI-powered feedback with scoring (0-100)
- **Government Job Listings**: Browse and search government job postings
- **Private Job Listings**: Explore private sector opportunities
- **Admin Portal**: Django admin interface for managing job postings and users
- **Secure Authentication**: Session-based login with password hashing
- **Contact Form**: Get in touch via email submission
- **Responsive Design**: Mobile-first UI using Bootstrap with custom color scheme

## Tech Stack

- **Backend**: Django 4.2 (Python 3.11+)
- **Frontend**: Django Templates + Bootstrap 5
- **Database**: MySQL 8+
- **Web Server**: Gunicorn + Nginx
- **Security**: HTTPS (Certbot), CSRF protection, rate limiting
- **Deployment**: Ubuntu 22.04 with systemd

## Color Scheme

- Dark Blue: `#0B3D91`
- Accent Orange: `#FF6A00`
- White: `#FFFFFF`

## Quick Start (Development)

### Prerequisites

- Python 3.11+
- MySQL 8+
- pip and virtualenv

### 1. Clone and Setup Virtual Environment

```bash
git clone <repository-url>
cd careersadhana
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Create MySQL Database

```bash
# Login to MySQL as root
mysql -u root -p

# Run the manual database creation script
source manual_create_db.sql

# Or copy-paste the SQL commands from manual_create_db.sql
```

### 4. Configure Environment Variables

```bash
cp .env.example .env
# Edit .env with your actual values
```

Required environment variables:
- `SECRET_KEY`: Django secret key (generate with `python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'`)
- `DEBUG`: Set to `False` in production
- `ALLOWED_HOSTS`: Your domain name
- `DB_NAME`, `DB_USER`, `DB_PASS`, `DB_HOST`, `DB_PORT`: MySQL credentials
- `ATS_API_URL`, `ATS_API_KEY`: ATS API endpoint (leave empty to use mock adapter)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`: Email configuration

### 5. Run Migrations

```bash
python manage.py migrate
```

### 6. Create Superuser

```bash
python manage.py createsuperuser
```

### 7. Collect Static Files

```bash
python manage.py collectstatic --noinput
```

### 8. Run Development Server

```bash
python manage.py runserver
```

Visit `http://localhost:8000`

## Development with Docker (Optional)

```bash
# Build and run
docker-compose up --build

# Create superuser in Docker
docker-compose exec web python manage.py createsuperuser
```

## ATS API Configuration

### Using Real ATS API

Set environment variables:
```
ATS_API_URL=https://api.example.com/ats/analyze
ATS_API_KEY=your_api_key_here
```

### Using Mock Adapter (Development)

Leave `ATS_API_URL` and `ATS_API_KEY` empty or unset. The system will automatically use the mock adapter which provides deterministic scoring based on:
- Word count
- Keyword matching (common job-related terms)
- File format compliance

## Admin Portal

1. Login at `/admin/` with superuser credentials
2. Add job postings manually or use CSV bulk import
3. Manage users and view analysis metadata

### CSV Import Format

**Government Jobs CSV:**
```csv
company,post_name,education,total_posts,location,last_date,apply_link
"ISRO","Scientist","B.Tech",50,"Bangalore","2024-12-31","https://example.com/apply"
```

**Private Jobs CSV:**
```csv
company_name,role,salary,location,qualification,experience,apply_link
"Tech Corp","Software Engineer","₹8-12 LPA","Bangalore","B.Tech/B.E.",2-5 years,"https://example.com/apply"
```

## Production Deployment

### System Requirements

- Ubuntu 22.04 LTS
- 2GB+ RAM
- Python 3.11+
- MySQL 8+
- Nginx
- Certbot (for SSL)

### Step-by-Step Deployment

#### 1. Install System Packages

```bash
sudo apt update
sudo apt install -y python3.11 python3.11-venv python3-pip mysql-server nginx certbot python3-certbot-nginx
```

#### 2. Setup MySQL Database

```bash
sudo mysql_secure_installation
sudo mysql -u root -p < manual_create_db.sql
```

#### 3. Setup Application

```bash
# Create application user
sudo useradd -m -s /bin/bash careersadhana
sudo su - careersadhana

# Clone repository
git clone <repository-url> /home/careersadhana/careersadhana
cd /home/careersadhana/careersadhana

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
nano .env  # Edit with production values

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic --noinput
```

#### 4. Setup Gunicorn Systemd Service

Create `/etc/systemd/system/careersadhana.service`:

```ini
[Unit]
Description=CareerSadhana Gunicorn Application
After=network.target mysql.service

[Service]
Type=notify
User=careersadhana
Group=www-data
WorkingDirectory=/home/careersadhana/careersadhana
Environment="PATH=/home/careersadhana/careersadhana/venv/bin"
EnvironmentFile=/home/careersadhana/careersadhana/.env
ExecStart=/home/careersadhana/careersadhana/venv/bin/gunicorn \
    --workers 3 \
    --bind unix:/home/careersadhana/careersadhana/gunicorn.sock \
    --timeout 60 \
    --access-logfile /home/careersadhana/careersadhana/logs/gunicorn-access.log \
    --error-logfile /home/careersadhana/careersadhana/logs/gunicorn-error.log \
    careersadhana_project.wsgi:application
ExecReload=/bin/kill -s HUP $MAINPID
KillMode=mixed
TimeoutStopSec=5
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

```bash
# Create logs directory
sudo mkdir -p /home/careersadhana/careersadhana/logs
sudo chown careersadhana:www-data /home/careersadhana/careersadhana/logs

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable careersadhana
sudo systemctl start careersadhana
sudo systemctl status careersadhana
```

#### 5. Setup Nginx

Create `/etc/nginx/sites-available/careersadhana`:

```nginx
# Rate limiting zone
limit_req_zone $binary_remote_addr zone=ats_limit:10m rate=10r/m;

# Maintenance mode flag (create file to enable)
geo $maintenance {
    default 0;
}

# Check if maintenance file exists
map $maintenance $maintenance_mode {
    default 0;
}

upstream careersadhana_app {
    server unix:/home/careersadhana/careersadhana/gunicorn.sock fail_timeout=0;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL certificates (will be configured by Certbot)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    client_max_body_size 5M;
    
    access_log /var/log/nginx/careersadhana-access.log;
    error_log /var/log/nginx/careersadhana-error.log;
    
    # Check for maintenance mode
    if (-f /home/careersadhana/careersadhana/maintenance.flag) {
        set $maintenance_mode 1;
    }
    
    # Serve maintenance page (503)
    if ($maintenance_mode = 1) {
        return 503;
    }
    
    # Custom error pages
    error_page 404 /404.html;
    error_page 500 502 504 /500.html;
    error_page 503 /maintenance.html;
    
    # Serve static error pages directly
    location = /404.html {
        root /home/careersadhana/careersadhana/common/templates;
        internal;
    }
    
    location = /500.html {
        root /home/careersadhana/careersadhana/common/templates;
        internal;
    }
    
    location = /maintenance.html {
        root /home/careersadhana/careersadhana/common/templates;
        internal;
    }
    
    # Static files
    location /static/ {
        alias /home/careersadhana/careersadhana/staticfiles/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    # Media files (if needed)
    location /media/ {
        alias /home/careersadhana/careersadhana/media/;
        expires 30d;
    }
    
    # Rate limiting for ATS upload
    location /ats/upload/ {
        limit_req zone=ats_limit burst=5 nodelay;
        limit_req_status 429;
        
        proxy_pass http://careersadhana_app;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Host $http_host;
        proxy_redirect off;
    }
    
    # Health check endpoint
    location /healthz {
        proxy_pass http://careersadhana_app;
        access_log off;
    }
    
    # Main application
    location / {
        proxy_pass http://careersadhana_app;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Host $http_host;
        proxy_redirect off;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/careersadhana /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 6. Setup SSL with Certbot

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
sudo systemctl reload nginx
```

Certbot will auto-renew. Test renewal:
```bash
sudo certbot renew --dry-run
```

#### 7. Setup Database Backups

Create `/home/careersadhana/backup_db.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/home/careersadhana/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_NAME="careersadhana"
DB_USER="careers_user"
DB_PASS="your_password"

mkdir -p $BACKUP_DIR
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_DIR/careersadhana_$TIMESTAMP.sql.gz

# Keep only last 30 days of backups
find $BACKUP_DIR -name "careersadhana_*.sql.gz" -mtime +30 -delete
```

```bash
chmod +x /home/careersadhana/backup_db.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /home/careersadhana/backup_db.sh
```

## Maintenance Mode

### Enable Maintenance Mode

```bash
# Create maintenance flag
sudo touch /home/careersadhana/careersadhana/maintenance.flag
sudo systemctl reload nginx
```

During maintenance:
- All requests return HTTP 503
- Custom maintenance.html is displayed
- Custom 404 page still works for actual 404s after maintenance ends

### Disable Maintenance Mode

```bash
# Remove maintenance flag
sudo rm /home/careersadhana/careersadhana/maintenance.flag
sudo systemctl reload nginx
```

## Zero-Downtime Updates

### Blue-Green Deployment Strategy

1. **Prepare new version** in separate directory
2. **Test** new version on alternate port
3. **Switch Nginx upstream** to new version
4. **Reload Nginx** (no downtime)
5. **Verify** and rollback if needed

Example:

```bash
# Deploy to new directory
cd /home/careersadhana
git clone <repo> careersadhana-new
cd careersadhana-new
# ... setup as above but use different socket ...

# Update Nginx to point to new socket
sudo nano /etc/nginx/sites-available/careersadhana
# Change: server unix:/home/careersadhana/careersadhana-new/gunicorn.sock;

# Reload Nginx (zero downtime)
sudo nginx -t && sudo systemctl reload nginx

# If successful, swap directories
cd /home/careersadhana
mv careersadhana careersadhana-old
mv careersadhana-new careersadhana
```

### Rolling Update (Recommended)

```bash
# 1. Enable maintenance mode (optional)
sudo touch /home/careersadhana/careersadhana/maintenance.flag
sudo systemctl reload nginx

# 2. Pull latest code
cd /home/careersadhana/careersadhana
git pull origin main

# 3. Activate venv and update dependencies
source venv/bin/activate
pip install -r requirements.txt --upgrade

# 4. Run migrations
python manage.py migrate

# 5. Collect static files
python manage.py collectstatic --noinput

# 6. Restart Gunicorn
sudo systemctl restart careersadhana

# 7. Disable maintenance mode
sudo rm /home/careersadhana/careersadhana/maintenance.flag
sudo systemctl reload nginx
```

## Monitoring & Logging

### View Logs

```bash
# Gunicorn logs
tail -f /home/careersadhana/careersadhana/logs/gunicorn-access.log
tail -f /home/careersadhana/careersadhana/logs/gunicorn-error.log

# Nginx logs
sudo tail -f /var/log/nginx/careersadhana-access.log
sudo tail -f /var/log/nginx/careersadhana-error.log

# Systemd service logs
sudo journalctl -u careersadhana -f
```

### Health Check

```bash
curl https://yourdomain.com/healthz
# Should return: {"status": "healthy"}
```

## Testing

### Run Unit Tests

```bash
# Activate virtualenv
source venv/bin/activate

# Run all tests
python manage.py test

# Run specific test module
python manage.py test tests.test_ats

# Run with pytest (if installed)
pytest tests/
```

### Test Coverage

```bash
coverage run --source='.' manage.py test
coverage report
coverage html  # Generate HTML report
```

## Security Checklist

- [ ] `DEBUG = False` in production
- [ ] Strong `SECRET_KEY` (never commit to git)
- [ ] HTTPS enabled (Certbot)
- [ ] Database credentials in `.env` only
- [ ] CSRF protection enabled (Django default)
- [ ] XSS sanitization enabled
- [ ] Rate limiting on resume upload
- [ ] File upload validation (type, size, MIME)
- [ ] Firewall configured (ufw)
- [ ] Regular backups scheduled
- [ ] Security headers configured in Nginx
- [ ] SQL injection protection (Django ORM)

## Troubleshooting

### Gunicorn won't start

```bash
# Check logs
sudo journalctl -u careersadhana -n 50

# Check socket permissions
ls -la /home/careersadhana/careersadhana/gunicorn.sock

# Test manually
cd /home/careersadhana/careersadhana
source venv/bin/activate
gunicorn careersadhana_project.wsgi:application --bind 127.0.0.1:8000
```

### Database connection errors

```bash
# Test MySQL connection
mysql -u careers_user -p -h 127.0.0.1 careersadhana

# Check Django settings
python manage.py dbshell
```

### Static files not loading

```bash
# Recollect static files
python manage.py collectstatic --noinput --clear

# Check Nginx configuration
sudo nginx -t

# Verify permissions
ls -la /home/careersadhana/careersadhana/staticfiles/
```

## License

Proprietary - All rights reserved

## Support

For issues or questions, please contact the development team or use the contact form on the website.
