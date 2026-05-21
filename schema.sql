-- ADI Global Database Schema
-- For Hostinger MySQL

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS travel_requests;
DROP TABLE IF EXISTS animals;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS activities;
SET FOREIGN_KEY_CHECKS = 1;

-- Users Table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  residential_country VARCHAR(100),
  address TEXT,
  role ENUM('admin', 'owner') NOT NULL DEFAULT 'owner',
  registry_id VARCHAR(50) UNIQUE,
  member_since VARCHAR(50) DEFAULT 'May 2026',
  status VARCHAR(50) DEFAULT 'Active',
  img VARCHAR(500)
);

-- Animals Table
CREATE TABLE animals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  registry_id VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  breed VARCHAR(255) NOT NULL,
  gender VARCHAR(50) DEFAULT 'Male',
  weight VARCHAR(50) DEFAULT '25kg',
  microchip VARCHAR(50) NOT NULL UNIQUE,
  date_of_birth DATE,
  color VARCHAR(255),
  rabies_expiration DATE,
  rabies_serial VARCHAR(100),
  rabies_brand VARCHAR(100),
  rabies_type VARCHAR(100),
  facility_name VARCHAR(255),
  trainer_name VARCHAR(255),
  trained_task VARCHAR(255),
  completion_date DATE,
  handler_id INT,
  status VARCHAR(50) DEFAULT 'Certified',
  img VARCHAR(500),
  FOREIGN KEY (handler_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Travel Requests Table
CREATE TABLE travel_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  owner_id INT NOT NULL,
  animal_id INT NOT NULL,
  travel_date DATE NOT NULL,
  flight_number VARCHAR(50) NOT NULL,
  confirmation_number VARCHAR(50) NOT NULL,
  route VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'Pending',
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (animal_id) REFERENCES animals(id) ON DELETE CASCADE
);

-- Applications Table
CREATE TABLE applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  handler_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255) NOT NULL,
  country VARCHAR(100),
  address TEXT,
  id_type VARCHAR(50) DEFAULT 'Passport',
  id_last4 VARCHAR(4),
  pet_name VARCHAR(255) NOT NULL,
  pet_breed VARCHAR(255) NOT NULL,
  pet_gender VARCHAR(50) DEFAULT 'Male',
  pet_weight VARCHAR(50) DEFAULT '25kg',
  pet_microchip VARCHAR(50) NOT NULL,
  pet_dob DATE,
  pet_color VARCHAR(255),
  rabies_expiration DATE,
  rabies_serial VARCHAR(100),
  rabies_brand VARCHAR(100),
  rabies_type VARCHAR(100) DEFAULT '3-Year Vaccine',
  facility_name VARCHAR(255),
  trainer_name VARCHAR(255),
  trained_task VARCHAR(255),
  completion_date DATE,
  status VARCHAR(50) DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activities Table
CREATE TABLE activities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  timestamp VARCHAR(50) NOT NULL,
  user_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Seed Initial Users
-- Admin credentials: petflyusa@hotmail.com / Jz10191019@@
-- Owner credentials: elena@example.com / elena123
INSERT INTO users (email, password, name, phone, residential_country, address, role, registry_id, member_since, status, img) VALUES
('petflyusa@hotmail.com', 'Jz10191019@@', 'Registrar General', '+1 (555) 019-9911', 'United States', 'ADI Headquarters, Austin, TX', 'admin', 'REG-ADM-01', 'Jan 2021', 'Active', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100'),
('elena@example.com', 'elena123', 'Elena Rodriguez', '+1 (555) 234-5678', 'United States', '128 Pinecrest Ave, Austin, TX 78704', 'owner', 'REG-7721', 'Oct 2023', 'Active', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100'),
('mark@example.com', 'mark123', 'Mark Thompson', '+1 (555) 987-6543', 'Canada', '456 Oak Dr, Toronto, ON M4B 1B3', 'owner', 'MB-THOM-11203', 'Feb 2024', 'Active', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100'),
('sarah@example.com', 'sarah123', 'Sarah Jenkins', '+1 (555) 111-2222', 'United States', '789 Elms Way, Seattle, WA 98101', 'owner', 'REG-4402', 'Jun 2022', 'Active', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100');

-- Seed Initial Animals
INSERT INTO animals (registry_id, name, breed, gender, weight, microchip, date_of_birth, color, rabies_expiration, rabies_serial, rabies_brand, rabies_type, facility_name, trainer_name, trained_task, completion_date, handler_id, status, img) VALUES
('SAR-9921', 'Cooper', 'Golden Retriever', 'Male', '32kg', '985112000012345', '2021-05-15', 'Golden', '2027-08-20', 'RAB-9921A', 'Merial', '3-Year Vaccine', 'Austin Assistance Dogs Training Center', 'Sarah Jenkins', 'Mobility Assistance', '2023-10-10', 2, 'Certified', 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=400'),
('SAR-8842', 'Luna', 'German Shepherd', 'Female', '28kg', '985112000874551', '2022-02-10', 'Black & Tan', '2026-12-05', 'RAB-8842B', 'Zoetis', '3-Year Vaccine', 'Guardian Angels Medical Service Dogs', 'Mark Thompson', 'Seizure Alert', '2024-02-15', 3, 'Pending', 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&q=80&w=400'),
('SAR-5529', 'Bella', 'Border Collie', 'Female', '20kg', '9851120000459', '2020-11-01', 'Black & White', '2025-04-12', 'RAB-5529C', 'Boehringer', '1-Year Vaccine', 'Freedom Dogs Training Center', 'Robert Davis', 'PTSD Support', '2022-06-20', 2, 'Expired', 'https://images.unsplash.com/photo-1503256207526-0d5d80fa2f47?auto=format&fit=crop&q=80&w=400');

-- Seed Travel Requests
INSERT INTO travel_requests (owner_id, animal_id, travel_date, flight_number, confirmation_number, route, status, submitted_at) VALUES
(2, 1, '2026-11-15', 'DL442', 'GH7W2Q', 'JFK → LAX', 'Approved', '2026-05-01 10:00:00'),
(2, 3, '2026-12-05', 'BA117', 'XP8L9Z', 'LHR → JFK', 'Pending', '2026-05-02 14:30:00');

-- Seed Activities
INSERT INTO activities (type, description, timestamp, user_id) VALUES
('auth', 'Elena Rodriguez logged in from IP 192.168.1.1', '2 hours ago', 2),
('animal_registration', 'Cooper (SAR-9921) registry record was successfully updated by Registrar General', '1 day ago', 1),
('travel_request', 'Travel request REQ-8821 for Cooper was Approved by Registrar General', '2 days ago', 1),
('auth', 'Mark Thompson logged in from IP 104.22.1.84', 'Yesterday', 3);
