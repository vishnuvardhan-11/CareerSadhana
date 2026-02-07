-- CareerSadhana MySQL Database Creation Script
-- Run this as MySQL root user: mysql -u root -p < manual_create_db.sql

-- Create database
CREATE DATABASE IF NOT EXISTS careersadhana CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user with password (CHANGE THIS PASSWORD!)
CREATE USER IF NOT EXISTS 'careers_user'@'localhost' IDENTIFIED BY 'Ch@ngeMe#2024!';

-- Grant all privileges on careersadhana database to careers_user
GRANT ALL PRIVILEGES ON careersadhana.* TO 'careers_user'@'localhost';

-- Apply privileges
FLUSH PRIVILEGES;

-- Use the database
USE careersadhana;

-- Show databases to confirm creation
SELECT 'Database created successfully!' AS status;
SHOW DATABASES LIKE 'careersadhana';

-- Show user grants
SHOW GRANTS FOR 'careers_user'@'localhost';

-- Instructions for operator:
-- 1. Edit this file and change the password 'Ch@ngeMe#2024!' to a strong password
-- 2. Run: mysql -u root -p < manual_create_db.sql
-- 3. Update .env file with the same password in DB_PASS
-- 4. Run Django migrations: python manage.py migrate

-- Note: Django will create all tables automatically via migrations
-- No need to manually create tables - Django ORM handles this
