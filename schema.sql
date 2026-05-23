-- SQL Schema for Janova GovTech Portal
-- Target Database: PostgreSQL

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'citizen',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS profiles (
    user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    citizen_id VARCHAR(50) UNIQUE NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    photo VARCHAR(500),
    notification_preferences JSONB DEFAULT '{"email": true, "sms": true, "push": false}',
    two_factor_enabled BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- Identity, Education, Property, Tax, Healthcare
    size VARCHAR(50) NOT NULL,
    url VARCHAR(500) NOT NULL,
    expiry_date DATE,
    verified BOOLEAN DEFAULT FALSE,
    upload_date DATE DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL, -- Certificates, Education, Business, Healthcare, Agriculture, Taxation, Identity Documents
    eligibility TEXT,
    required_documents JSONB DEFAULT '[]',
    estimated_time VARCHAR(100),
    application_steps JSONB DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS schemes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL, -- Scholarships, Grants, Subsidies, Welfare
    amount VARCHAR(100) NOT NULL,
    eligibility_rules JSONB DEFAULT '{}',
    deadline DATE,
    requirements JSONB DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS complaints (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- Potholes, Garbage, Water Leakage, Streetlight Failure, Road Damage, Illegal Dumping
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    x_coord INT NOT NULL,
    y_coord INT NOT NULL,
    photo_url VARCHAR(500),
    status VARCHAR(50) DEFAULT 'new', -- new, investigating, resolved
    upvotes INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS applications (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, reviewing, approved
    progress INT DEFAULT 25,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    history JSONB DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS deadlines (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    type VARCHAR(50) NOT NULL, -- license, certificate, tax, application, election
    urgency VARCHAR(50) DEFAULT 'medium' -- low, medium, high
);

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info', -- success, warning, info, danger
    read_status BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS business_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL, -- Pharmacy, Restaurant, Retail Shop, Startup, Consultancy, Manufacturing
    licenses JSONB DEFAULT '[]',
    approvals JSONB DEFAULT '[]',
    estimated_cost VARCHAR(100),
    documents JSONB DEFAULT '[]',
    timeline VARCHAR(100),
    compliance_checklist JSONB DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS life_events (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL, -- Birth of Child, Marriage, College Admission, Employment, Starting Business, Property Purchase, Retirement, Death in Family
    description TEXT NOT NULL,
    required_registrations JSONB DEFAULT '[]',
    services_needed JSONB DEFAULT '[]',
    documents_required JSONB DEFAULT '[]',
    timeline_est VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS checklists (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    life_event_id INT REFERENCES life_events(id) ON DELETE CASCADE,
    checked_items JSONB DEFAULT '{}'
);
