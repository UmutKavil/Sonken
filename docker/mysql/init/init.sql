-- Sonken MySQL Initialization Script
-- This script creates the initial database structure

CREATE DATABASE IF NOT EXISTS sonken CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE sonken;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    path VARCHAR(255) NOT NULL,
    user_id INT,
    status ENUM('active', 'inactive', 'archived') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_name (name),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Server logs table
CREATE TABLE IF NOT EXISTS server_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    level ENUM('info', 'warn', 'error', 'debug') NOT NULL,
    message TEXT NOT NULL,
    details JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_level (level),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin user (password: admin123 - hashed)
-- Note: This is a sample hash, you should generate a proper bcrypt hash
INSERT INTO users (username, email, password_hash, is_admin) 
VALUES ('admin', 'admin@sonken.local', '$2b$10$rqzH8ZqQGHKqTlqPJcwvDOKKPRKJYXwOIGZXHhH5YKqKPRKJYXwOI', TRUE)
ON DUPLICATE KEY UPDATE username=username;

-- Insert default settings
INSERT INTO settings (setting_key, setting_value, description) VALUES
    ('app_name', 'Sonken', 'Application name'),
    ('app_version', '1.0.0', 'Application version'),
    ('maintenance_mode', 'false', 'Enable maintenance mode'),
    ('max_upload_size', '50', 'Maximum upload size in MB')
ON DUPLICATE KEY UPDATE setting_key=setting_key;

-- Create a sample log entry
INSERT INTO server_logs (level, message, details) 
VALUES ('info', 'Database initialized successfully', JSON_OBJECT('timestamp', NOW()));

-- Show tables
SHOW TABLES;

SELECT 'Sonken database initialized successfully!' as Status;
