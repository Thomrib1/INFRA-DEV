CREATE DATABASE projet_infra;
USE projet_infra;

CREATE TABLE agencies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    address VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(150) UNIQUE
);

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    agency_id INT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'agent') NOT NULL DEFAULT 'agent',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agency_id) REFERENCES agencies(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE TABLE properties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    agency_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    city VARCHAR(100) NOT NULL,
    property_type ENUM('house', 'apartment', 'office') NOT NULL,
    transaction_type ENUM('sale', 'rent') NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    surface_area DECIMAL(8,2) NOT NULL,
    rooms INT DEFAULT 0,
    bedrooms INT DEFAULT 0,
    status ENUM('available', 'sold', 'rented', 'pending') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agency_id) REFERENCES agencies(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE contact_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(20),
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    agent_id INT NOT NULL,
    final_price DECIMAL(12,2) NOT NULL,
    sold_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    FOREIGN KEY (agent_id) REFERENCES users(id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE
);