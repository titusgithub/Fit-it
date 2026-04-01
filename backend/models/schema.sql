-- FindFix Database Schema (MySQL Version)

-- Create Database
CREATE DATABASE IF NOT EXISTS findfix;
USE findfix;

-- Users table (all roles)
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'customer',
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CHECK (role IN ('customer', 'technician', 'admin'))
) ENGINE=InnoDB;

-- Technician profiles
CREATE TABLE technicians (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) UNIQUE NOT NULL,
  bio TEXT,
  location VARCHAR(255),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  years_experience INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true,
  subscription_expires_at TIMESTAMP NULL,
  avg_rating DECIMAL(3, 2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  total_jobs INTEGER DEFAULT 0,
  id_number VARCHAR(50),
  id_document_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Service categories
CREATE TABLE services (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Junction table: technicians <-> services
CREATE TABLE technician_services (
  id VARCHAR(36) PRIMARY KEY,
  technician_id VARCHAR(36) NOT NULL,
  service_id VARCHAR(36) NOT NULL,
  price_from DECIMAL(10, 2),
  price_to DECIMAL(10, 2),
  UNIQUE(technician_id, service_id),
  FOREIGN KEY (technician_id) REFERENCES technicians(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Service requests from customers
CREATE TABLE service_requests (
  id VARCHAR(36) PRIMARY KEY,
  customer_id VARCHAR(36) NOT NULL,
  technician_id VARCHAR(36),
  service_id VARCHAR(36),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(255),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  budget DECIMAL(10, 2),
  status VARCHAR(30) DEFAULT 'pending',
  urgency VARCHAR(20) DEFAULT 'normal',
  images JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'disputed')),
  CHECK (urgency IN ('low', 'normal', 'urgent')),
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (technician_id) REFERENCES technicians(id),
  FOREIGN KEY (service_id) REFERENCES services(id)
) ENGINE=InnoDB;

-- Reviews
CREATE TABLE reviews (
  id VARCHAR(36) PRIMARY KEY,
  request_id VARCHAR(36) NOT NULL,
  reviewer_id VARCHAR(36) NOT NULL,
  technician_id VARCHAR(36) NOT NULL,
  rating INTEGER NOT NULL,
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CHECK (rating BETWEEN 1 AND 5),
  FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (technician_id) REFERENCES technicians(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Transactions (M-Pesa)
CREATE TABLE transactions (
  id VARCHAR(36) PRIMARY KEY,
  request_id VARCHAR(36),
  customer_id VARCHAR(36),
  technician_id VARCHAR(36),
  amount DECIMAL(10, 2) NOT NULL,
  phone VARCHAR(20),
  mpesa_receipt VARCHAR(100),
  checkout_request_id VARCHAR(100),
  merchant_request_id VARCHAR(100),
  transaction_type VARCHAR(20) DEFAULT 'job',
  status VARCHAR(30) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CHECK (transaction_type IN ('job', 'subscription')),
  CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES users(id),
  FOREIGN KEY (technician_id) REFERENCES technicians(id)
) ENGINE=InnoDB;

-- Chat messages
CREATE TABLE messages (
  id VARCHAR(36) PRIMARY KEY,
  request_id VARCHAR(36) NOT NULL,
  sender_id VARCHAR(36) NOT NULL,
  receiver_id VARCHAR(36) NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id),
  FOREIGN KEY (receiver_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- Disputes
CREATE TABLE disputes (
  id VARCHAR(36) PRIMARY KEY,
  request_id VARCHAR(36) NOT NULL,
  raised_by VARCHAR(36) NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'open',
  resolution TEXT,
  admin_id VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
  FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (raised_by) REFERENCES users(id)
) ENGINE=InnoDB;

-- Seed default services
INSERT INTO services (id, name, description, icon, category) VALUES
  (UUID(), 'Plumbing', 'Pipe repairs, installations, and water system maintenance', '🔧', 'Home Repairs'),
  (UUID(), 'Electrical', 'Wiring, installations, and electrical system repair', '⚡', 'Home Repairs'),
  (UUID(), 'Carpentry', 'Wood furniture, cabinets, and structural work', '🪚', 'Home Repairs'),
  (UUID(), 'Painting', 'Interior and exterior painting services', '🎨', 'Home Repairs'),
  (UUID(), 'Appliance Repair', 'TV, fridge, washing machine, and electronics repair', '📺', 'Electronics'),
  (UUID(), 'Phone Repair', 'Screen replacement, battery, and software fixes', '📱', 'Electronics'),
  (UUID(), 'Computer Repair', 'Laptop and desktop hardware/software repair', '💻', 'Electronics'),
  (UUID(), 'AC & Refrigeration', 'Air conditioning and refrigeration services', '❄️', 'HVAC'),
  (UUID(), 'Cleaning', 'Deep cleaning, fumigation, and janitorial services', '🧹', 'Cleaning'),
  (UUID(), 'Gardening', 'Lawn care, landscaping, and garden maintenance', '🌱', 'Outdoor'),
  (UUID(), 'Roofing', 'Roof repair, installation, and waterproofing', '🏠', 'Construction'),
  (UUID(), 'Welding', 'Metal fabrication, gates, and grills', '🔥', 'Construction'),
  (UUID(), 'CCTV Installation', 'Security camera setup and maintenance', '📹', 'Security'),
  (UUID(), 'Locksmith', 'Lock repair, key cutting, and security systems', '🔐', 'Security'),
  (UUID(), 'Moving Services', 'House and office relocation', '🚛', 'Logistics');
