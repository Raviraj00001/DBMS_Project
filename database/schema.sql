-- ============================================================================
-- College DBMS Group Project: Wedding Planning & Booking Management System
-- Database Schema (PostgreSQL 3NF Normalized)
-- Team Members: Ravi Raj, Manpreet, Perirt, Raj Tripathi
-- ============================================================================

-- Drop existing views and triggers if present for clean recreation
DROP VIEW IF EXISTS view_monthly_revenue CASCADE;
DROP VIEW IF EXISTS view_upcoming_weddings CASCADE;
DROP VIEW IF EXISTS view_vendor_analytics CASCADE;
DROP VIEW IF EXISTS view_venue_performance CASCADE;
DROP VIEW IF EXISTS view_booking_details CASCADE;

DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS booking_services CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS package_services CASCADE;
DROP TABLE IF EXISTS packages CASCADE;
DROP TABLE IF EXISTS vendor_services CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS vendors CASCADE;
DROP TABLE IF EXISTS venue_availability CASCADE;
DROP TABLE IF EXISTS venues CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop custom types if present
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS booking_status CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS payment_method CASCADE;
DROP TYPE IF EXISTS vendor_category CASCADE;
DROP TYPE IF EXISTS venue_type CASCADE;

-- ============================================================================
-- 1. ENUMS & DOMAINS
-- ============================================================================
CREATE TYPE user_role AS ENUM ('customer', 'vendor', 'admin');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE payment_method AS ENUM ('credit_card', 'debit_card', 'upi', 'net_banking', 'cash');
CREATE TYPE vendor_category AS ENUM (
    'catering',
    'photography',
    'videography',
    'decoration',
    'music_dj',
    'makeup_artist',
    'mehndi_artist',
    'wedding_planner',
    'florist',
    'attire_jewellery'
);
CREATE TYPE venue_type AS ENUM (
    'palace',
    'resort',
    'banquet_hall',
    'lawn',
    'beachside',
    'hotel'
);

-- ============================================================================
-- 2. TABLES DEFINITIONS (3NF Normalized)
-- ============================================================================

-- Table 1: USERS
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role user_role NOT NULL DEFAULT 'customer',
    avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_user_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Table 2: VENUES
CREATE TABLE venues (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(80) NOT NULL,
    state VARCHAR(80) NOT NULL,
    capacity_min INT NOT NULL CHECK (capacity_min > 0),
    capacity_max INT NOT NULL,
    price_per_day NUMERIC(12, 2) NOT NULL CHECK (price_per_day >= 0),
    venue_type venue_type NOT NULL,
    rating NUMERIC(3, 2) NOT NULL DEFAULT 5.00 CHECK (rating >= 1.00 AND rating <= 5.00),
    image_urls TEXT[] NOT NULL,
    amenities TEXT[] NOT NULL DEFAULT '{}',
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_venue_capacity CHECK (capacity_max >= capacity_min)
);

-- Table 3: VENUE_AVAILABILITY
CREATE TABLE venue_availability (
    id SERIAL PRIMARY KEY,
    venue_id INT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    available_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'booked', 'blocked', 'maintenance')),
    booking_id INT, -- Will be set as FK after bookings table creation or kept loose
    notes VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_venue_date UNIQUE (venue_id, available_date)
);

-- Table 4: VENDORS
CREATE TABLE vendors (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(200) NOT NULL,
    category vendor_category NOT NULL,
    description TEXT NOT NULL,
    experience_years INT NOT NULL DEFAULT 1 CHECK (experience_years >= 0),
    address TEXT NOT NULL,
    city VARCHAR(80) NOT NULL,
    rating NUMERIC(3, 2) NOT NULL DEFAULT 5.00 CHECK (rating >= 1.00 AND rating <= 5.00),
    starting_price NUMERIC(10, 2) NOT NULL CHECK (starting_price >= 0),
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    portfolio_images TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table 5: SERVICES (Master Service Catalog)
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    category vendor_category NOT NULL,
    description TEXT NOT NULL,
    standard_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (standard_price >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table 6: VENDOR_SERVICES (Vendors mapping to Services with custom pricing)
CREATE TABLE vendor_services (
    id SERIAL PRIMARY KEY,
    vendor_id INT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    service_id INT NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
    custom_title VARCHAR(200) NOT NULL,
    custom_description TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    duration_hours INT DEFAULT 4 CHECK (duration_hours > 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_vendor_service UNIQUE (vendor_id, service_id)
);

-- Table 7: PACKAGES (Pre-packaged Wedding Tiers)
CREATE TABLE packages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL UNIQUE,
    tier VARCHAR(50) NOT NULL, -- 'Silver', 'Gold', 'Platinum', 'Royal Bespoke'
    description TEXT NOT NULL,
    guest_count INT NOT NULL CHECK (guest_count > 0),
    base_price NUMERIC(12, 2) NOT NULL CHECK (base_price >= 0),
    discount_percent NUMERIC(5, 2) NOT NULL DEFAULT 0.00 CHECK (discount_percent >= 0 AND discount_percent <= 100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    image_url TEXT,
    features TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table 8: PACKAGE_SERVICES (Services bundled in each package)
CREATE TABLE package_services (
    id SERIAL PRIMARY KEY,
    package_id INT NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
    service_id INT NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    notes VARCHAR(255),
    CONSTRAINT uq_package_service UNIQUE (package_id, service_id)
);

-- Table 9: BOOKINGS
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    booking_reference VARCHAR(30) NOT NULL UNIQUE,
    customer_id INT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    venue_id INT REFERENCES venues(id) ON DELETE SET NULL,
    package_id INT REFERENCES packages(id) ON DELETE SET NULL,
    wedding_date DATE NOT NULL,
    guest_count INT NOT NULL CHECK (guest_count > 0),
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
    paid_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (paid_amount >= 0),
    status booking_status NOT NULL DEFAULT 'pending',
    special_requests TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_paid_vs_total CHECK (paid_amount <= total_amount + 0.01)
);

-- Add foreign key constraint to venue_availability after bookings is created
ALTER TABLE venue_availability 
    ADD CONSTRAINT fk_venue_availability_booking 
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL;

-- Table 10: BOOKING_SERVICES (Specific vendor services booked for an event)
CREATE TABLE booking_services (
    id SERIAL PRIMARY KEY,
    booking_id INT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    vendor_service_id INT NOT NULL REFERENCES vendor_services(id) ON DELETE RESTRICT,
    price_at_booking NUMERIC(10, 2) NOT NULL CHECK (price_at_booking >= 0),
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    service_date DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table 11: PAYMENTS
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    booking_id INT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    transaction_reference VARCHAR(50) NOT NULL UNIQUE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    payment_method payment_method NOT NULL DEFAULT 'upi',
    payment_status payment_status NOT NULL DEFAULT 'completed',
    payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table 12: REVIEWS
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    booking_id INT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    venue_id INT REFERENCES venues(id) ON DELETE CASCADE,
    vendor_id INT REFERENCES vendors(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_review_target CHECK (
        (venue_id IS NOT NULL AND vendor_id IS NULL) OR 
        (venue_id IS NULL AND vendor_id IS NOT NULL)
    )
);

-- Customer questions and complaints, managed by the admin team
CREATE TABLE IF NOT EXISTS customer_support_requests (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(160) NOT NULL,
    category VARCHAR(30) NOT NULL CHECK (category IN ('general', 'booking', 'payment', 'venue', 'vendor', 'complaint')),
    message TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_review', 'resolved')),
    admin_response TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_support_requests_user_created
    ON customer_support_requests(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_requests_status_created
    ON customer_support_requests(status, created_at DESC);

-- ============================================================================
-- 3. INDEXES FOR PERFORMANCE OPTIMIZATION
-- ============================================================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_venues_city ON venues(city);
CREATE INDEX idx_venues_type ON venues(venue_type);
CREATE INDEX idx_venues_price ON venues(price_per_day);
CREATE INDEX idx_venue_availability_lookup ON venue_availability(venue_id, available_date);
CREATE INDEX idx_vendors_category ON vendors(category);
CREATE INDEX idx_vendors_city ON vendors(city);
CREATE INDEX idx_vendors_user_id ON vendors(user_id);
CREATE INDEX idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX idx_bookings_wedding_date ON bookings(wedding_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_reference ON bookings(booking_reference);
CREATE INDEX idx_booking_services_booking ON booking_services(booking_id);
CREATE INDEX idx_booking_services_vendor_service ON booking_services(vendor_service_id);
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_reviews_venue_id ON reviews(venue_id);
CREATE INDEX idx_reviews_vendor_id ON reviews(vendor_id);

-- ============================================================================
-- 4. DATABASE VIEWS
-- ============================================================================

-- View 1: Complete Booking Overview (Comprehensive joins across 5 tables)
CREATE OR REPLACE VIEW view_booking_details AS
SELECT 
    b.id AS booking_id,
    b.booking_reference,
    b.wedding_date,
    b.guest_count,
    b.total_amount,
    b.paid_amount,
    (b.total_amount - b.paid_amount) AS balance_amount,
    b.status AS booking_status,
    u.id AS customer_id,
    u.full_name AS customer_name,
    u.email AS customer_email,
    u.phone AS customer_phone,
    v.id AS venue_id,
    v.name AS venue_name,
    v.city AS venue_city,
    v.price_per_day AS venue_price,
    p.id AS package_id,
    p.name AS package_name,
    p.tier AS package_tier,
    COUNT(bs.id) AS service_count,
    b.created_at AS booked_at
FROM bookings b
JOIN users u ON b.customer_id = u.id
LEFT JOIN venues v ON b.venue_id = v.id
LEFT JOIN packages p ON b.package_id = p.id
LEFT JOIN booking_services bs ON b.id = bs.booking_id
GROUP BY b.id, b.booking_reference, b.wedding_date, b.guest_count, 
         b.total_amount, b.paid_amount, b.status, u.id, u.full_name, 
         u.email, u.phone, v.id, v.name, v.city, v.price_per_day, 
         p.id, p.name, p.tier, b.created_at;

-- View 2: Venue Performance & Utilization
CREATE OR REPLACE VIEW view_venue_performance AS
SELECT 
    v.id AS venue_id,
    v.name AS venue_name,
    v.city,
    v.venue_type,
    v.price_per_day,
    v.rating,
    COUNT(b.id) AS total_bookings,
    COALESCE(SUM(b.total_amount), 0) AS gross_revenue_generated,
    COUNT(CASE WHEN b.status = 'confirmed' THEN 1 END) AS confirmed_bookings,
    COUNT(CASE WHEN b.status = 'completed' THEN 1 END) AS completed_bookings,
    COUNT(r.id) AS total_reviews,
    COALESCE(ROUND(AVG(r.rating), 2), v.rating) AS average_user_rating
FROM venues v
LEFT JOIN bookings b ON v.id = b.venue_id
LEFT JOIN reviews r ON v.id = r.venue_id
GROUP BY v.id, v.name, v.city, v.venue_type, v.price_per_day, v.rating;

-- View 3: Vendor Analytics & Work Orders
CREATE OR REPLACE VIEW view_vendor_analytics AS
SELECT 
    vn.id AS vendor_id,
    vn.business_name,
    vn.category,
    vn.city,
    vn.rating,
    u.full_name AS contact_person,
    u.email AS vendor_email,
    u.phone AS vendor_phone,
    COUNT(DISTINCT vs.id) AS total_services_offered,
    COUNT(bs.id) AS total_orders_fulfilled,
    COALESCE(SUM(bs.price_at_booking * bs.quantity), 0) AS total_vendor_earnings,
    COUNT(r.id) AS review_count,
    COALESCE(ROUND(AVG(r.rating), 2), vn.rating) AS computed_rating
FROM vendors vn
JOIN users u ON vn.user_id = u.id
LEFT JOIN vendor_services vs ON vn.id = vs.vendor_id
LEFT JOIN booking_services bs ON vs.id = bs.vendor_service_id
LEFT JOIN reviews r ON vn.id = r.vendor_id
GROUP BY vn.id, vn.business_name, vn.category, vn.city, vn.rating, u.full_name, u.email, u.phone;

-- View 4: Upcoming Weddings Schedule
CREATE OR REPLACE VIEW view_upcoming_weddings AS
SELECT 
    b.id AS booking_id,
    b.booking_reference,
    b.wedding_date,
    (b.wedding_date - CURRENT_DATE) AS days_remaining,
    b.guest_count,
    u.full_name AS customer_name,
    u.phone AS customer_phone,
    v.name AS venue_name,
    v.city AS venue_city,
    b.status,
    b.total_amount,
    b.paid_amount
FROM bookings b
JOIN users u ON b.customer_id = u.id
LEFT JOIN venues v ON b.venue_id = v.id
WHERE b.wedding_date >= CURRENT_DATE 
  AND b.status IN ('pending', 'confirmed')
ORDER BY b.wedding_date ASC;

-- View 5: Monthly Revenue Breakdown
CREATE OR REPLACE VIEW view_monthly_revenue AS
SELECT 
    TO_CHAR(p.payment_date, 'YYYY-MM') AS payment_month,
    p.payment_method,
    COUNT(p.id) AS transaction_count,
    SUM(p.amount) AS total_revenue
FROM payments p
WHERE p.payment_status = 'completed'
GROUP BY TO_CHAR(p.payment_date, 'YYYY-MM'), p.payment_method
ORDER BY payment_month DESC, total_revenue DESC;

-- ============================================================================
-- 5. STORED FUNCTIONS & PROCEDURES
-- ============================================================================

-- Function 1: Check Venue Availability
CREATE OR REPLACE FUNCTION fn_check_venue_availability(
    p_venue_id INT,
    p_wedding_date DATE
)
RETURNS BOOLEAN AS $$
DECLARE
    v_is_booked BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM venue_availability 
        WHERE venue_id = p_venue_id 
          AND available_date = p_wedding_date 
          AND status IN ('booked', 'blocked')
    ) INTO v_is_booked;

    IF v_is_booked THEN
        RETURN FALSE;
    END IF;

    -- Also check bookings table directly
    SELECT EXISTS (
        SELECT 1 FROM bookings 
        WHERE venue_id = p_venue_id 
          AND wedding_date = p_wedding_date 
          AND status IN ('pending', 'confirmed')
    ) INTO v_is_booked;

    RETURN NOT v_is_booked;
END;
$$ LANGUAGE plpgsql;

-- Function 2: Recalculate Booking Total (Venue price + Package price + Custom Services)
CREATE OR REPLACE FUNCTION fn_calculate_booking_total(
    p_booking_id INT
)
RETURNS NUMERIC AS $$
DECLARE
    v_venue_price NUMERIC := 0;
    v_package_price NUMERIC := 0;
    v_services_total NUMERIC := 0;
    v_final_total NUMERIC := 0;
BEGIN
    -- 1. Venue cost
    SELECT COALESCE(v.price_per_day, 0)
    INTO v_venue_price
    FROM bookings b
    JOIN venues v ON b.venue_id = v.id
    WHERE b.id = p_booking_id;

    -- 2. Package cost (applying package discount if any)
    SELECT COALESCE(p.base_price * (1 - (p.discount_percent / 100.0)), 0)
    INTO v_package_price
    FROM bookings b
    JOIN packages p ON b.package_id = p.id
    WHERE b.id = p_booking_id;

    -- 3. Custom services cost
    SELECT COALESCE(SUM(price_at_booking * quantity), 0)
    INTO v_services_total
    FROM booking_services
    WHERE booking_id = p_booking_id AND status != 'cancelled';

    v_final_total := COALESCE(v_venue_price, 0) + COALESCE(v_package_price, 0) + COALESCE(v_services_total, 0);

    RETURN v_final_total;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 6. TRIGGERS
-- ============================================================================

-- Trigger Function 1: Updated Timestamp
CREATE OR REPLACE FUNCTION fn_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();
CREATE TRIGGER trg_venues_updated_at BEFORE UPDATE ON venues FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();
CREATE TRIGGER trg_vendors_updated_at BEFORE UPDATE ON vendors FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();
CREATE TRIGGER trg_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

-- Trigger Function 2: Double Booking Prevention
CREATE OR REPLACE FUNCTION fn_prevent_double_booking()
RETURNS TRIGGER AS $$
DECLARE
    v_conflict_count INT;
BEGIN
    IF NEW.venue_id IS NOT NULL AND NEW.status IN ('pending', 'confirmed') THEN
        SELECT COUNT(*)
        INTO v_conflict_count
        FROM bookings
        WHERE venue_id = NEW.venue_id
          AND wedding_date = NEW.wedding_date
          AND id != COALESCE(NEW.id, 0)
          AND status IN ('pending', 'confirmed');

        IF v_conflict_count > 0 THEN
            RAISE EXCEPTION 'Venue ID % is already booked or reserved on %', NEW.venue_id, NEW.wedding_date;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_booking_prevent_double_booking
BEFORE INSERT OR UPDATE OF venue_id, wedding_date, status ON bookings
FOR EACH ROW EXECUTE FUNCTION fn_prevent_double_booking();

-- Trigger Function 3: Auto-update Booking Paid Amount & Status upon Payment
CREATE OR REPLACE FUNCTION fn_process_payment_update()
RETURNS TRIGGER AS $$
DECLARE
    v_total_paid NUMERIC;
    v_booking_total NUMERIC;
BEGIN
    -- Calculate total completed payments for this booking
    SELECT COALESCE(SUM(amount), 0)
    INTO v_total_paid
    FROM payments
    WHERE booking_id = NEW.booking_id AND payment_status = 'completed';

    SELECT total_amount INTO v_booking_total FROM bookings WHERE id = NEW.booking_id;

    -- Update booking paid_amount and optionally update status
    UPDATE bookings
    SET paid_amount = v_total_paid,
        status = CASE 
            WHEN v_total_paid >= v_booking_total AND v_booking_total > 0 THEN 'confirmed'::booking_status
            WHEN v_total_paid >= (v_booking_total * 0.25) AND status = 'pending' THEN 'confirmed'::booking_status
            ELSE status
        END,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.booking_id;

    -- Also mark venue_availability as booked if confirmed
    IF (SELECT status FROM bookings WHERE id = NEW.booking_id) = 'confirmed' THEN
        INSERT INTO venue_availability (venue_id, available_date, status, booking_id, notes)
        SELECT venue_id, wedding_date, 'booked', NEW.booking_id, 'Auto-reserved on confirmation payment'
        FROM bookings WHERE id = NEW.booking_id AND venue_id IS NOT NULL
        ON CONFLICT (venue_id, available_date) 
        DO UPDATE SET status = 'booked', booking_id = NEW.booking_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_payment_after_insert_update
AFTER INSERT OR UPDATE OF amount, payment_status ON payments
FOR EACH ROW EXECUTE FUNCTION fn_process_payment_update();

