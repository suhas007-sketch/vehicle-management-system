-- ==========================================
-- VRMS PRODUCTION SCHEMA (V8.0)
-- 9-TABLE SYSTEM (vehicle_subtypes REMOVED)
-- ==========================================
-- SAFE TO RE-RUN (Cleans app tables first)
-- Author: Antigravity AI
-- Updated: 2026-04-08
-- ==========================================

-- 0. SAFE CLEANUP (ONLY TABLES WE OWN)
DELETE FROM auth.users;
DROP VIEW IF EXISTS public.recommended_vehicles CASCADE;
DROP TABLE IF EXISTS public.vehicle_reviews CASCADE;
DROP TABLE IF EXISTS public.maintenance_logs CASCADE;
DROP TABLE IF EXISTS public.availability_calendar CASCADE;
DROP TABLE IF EXISTS public.vehicle_images CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.vehicles CASCADE;
DROP TABLE IF EXISTS public.user_emails CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;
DROP TABLE IF EXISTS public.vehicle_subtypes CASCADE;
DROP TABLE IF EXISTS public.vehicle_categories CASCADE;

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
DO $$ BEGIN
    CREATE TYPE public.booking_status_enum AS ENUM ('pending', 'confirmed', 'active', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. USER PROFILES (SAFE FOR SUPABASE)
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY, -- Matches auth.users.id
    email TEXT UNIQUE,
    full_name TEXT,
    role TEXT DEFAULT 'user',
    avatar TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. VEHICLE CATEGORIES (lookup table, no subtypes)
CREATE TABLE public.vehicle_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. THE FLEET (subtype is TEXT column, no separate table needed)
CREATE TABLE public.vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    category TEXT NOT NULL,
    subtype TEXT,                         -- plain text, no FK to vehicle_subtypes
    price_per_day NUMERIC NOT NULL,
    image_url TEXT,
    fuel_type TEXT,
    transmission TEXT,
    seating_capacity INTEGER DEFAULT 5,
    status TEXT DEFAULT 'available',
    booking_count INTEGER DEFAULT 0,
    rating NUMERIC(3,2) DEFAULT 4.5,
    recommendation_score NUMERIC DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_bestseller BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.vehicle_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. CORE BOOKING ENGINE
CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    customer_name TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_price NUMERIC,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT valid_dates CHECK (end_date >= start_date)
);

-- 7. AVAILABILITY CALENDAR
CREATE TABLE public.availability_calendar (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    unavailable_date DATE NOT NULL,
    reason TEXT,
    UNIQUE(vehicle_id, unavailable_date)
);

-- 8. VEHICLE REVIEWS
CREATE TABLE public.vehicle_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. MAINTENANCE LOGS
CREATE TABLE public.maintenance_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    vehicle_name TEXT,
    service_type TEXT NOT NULL,
    description TEXT,
    cost NUMERIC DEFAULT 0,
    service_date DATE DEFAULT current_date,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. AUTOMATION FUNCTIONS (DATABASE TRIGGERS)

-- Instant Signup Sync
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, role)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(
            NEW.raw_user_meta_data ->> 'full_name', 
            NEW.raw_user_meta_data ->> 'name', 
            NEW.email
        ),
        'user'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Safe Trigger on auth.users
DO $$ BEGIN
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'Skipping trigger (restricted)'; END $$;

-- Auto-calculate total price
CREATE OR REPLACE FUNCTION public.fn_calculate_booking_price()
RETURNS TRIGGER AS $$
DECLARE v_price NUMERIC;
BEGIN
    SELECT price_per_day INTO v_price FROM public.vehicles WHERE id = NEW.vehicle_id;
    NEW.total_price := v_price * (NEW.end_date - NEW.start_date + 1);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_calculate_booking_price ON public.bookings;
CREATE TRIGGER tr_calculate_booking_price
BEFORE INSERT ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.fn_calculate_booking_price();

-- Auto-update fleet counts on booking
CREATE OR REPLACE FUNCTION public.fn_update_vehicle_on_booking()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.vehicles 
    SET booking_count = booking_count + 1,
        status = 'rented'
    WHERE id = NEW.vehicle_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_on_booking_confirmed ON public.bookings;
CREATE TRIGGER tr_on_booking_confirmed
AFTER INSERT ON public.bookings
FOR EACH ROW
WHEN (NEW.status = 'confirmed' OR NEW.status = 'active' OR NEW.status = 'pending')
EXECUTE FUNCTION public.fn_update_vehicle_on_booking();

-- Auto-inject Maintenance Logs when vehicle is set to maintenance
CREATE OR REPLACE FUNCTION public.fn_log_maintenance_event()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log when transitioning INTO maintenance status
    IF NEW.status = 'maintenance' AND (OLD.status IS DISTINCT FROM 'maintenance') THEN
        INSERT INTO public.maintenance_logs (vehicle_id, vehicle_name, service_type, description, cost, service_date)
        VALUES (
            NEW.id,
            NEW.name,
            'Routine Maintenance',
            'Status escalated to maintenance from Fleet Operations module.',
            0,
            CURRENT_DATE
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_log_maintenance_event ON public.vehicles;
CREATE TRIGGER tr_log_maintenance_event
AFTER UPDATE ON public.vehicles
FOR EACH ROW
EXECUTE FUNCTION public.fn_log_maintenance_event();

-- 11. SMART VIEWS
CREATE OR REPLACE VIEW public.recommended_vehicles AS
SELECT 
    v.*,
    (
        (CASE WHEN v.status = 'available' THEN 500 ELSE 0 END) +
        (CASE WHEN v.is_featured THEN 300 ELSE 0 END) +
        (CASE WHEN v.is_bestseller THEN 200 ELSE 0 END) +
        (v.rating * 20) +
        (v.booking_count / 5.0)
    ) as priority_score
FROM public.vehicles v
ORDER BY priority_score DESC;

-- 12. SECURITY (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_calendar ENABLE ROW LEVEL SECURITY;

-- Vehicles
CREATE POLICY "Public Read Vehicles" ON public.vehicles FOR SELECT USING (true);
CREATE POLICY "Authenticated Update Vehicles" ON public.vehicles FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated Insert Vehicles" ON public.vehicles FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated Delete Vehicles" ON public.vehicles FOR DELETE USING (auth.uid() IS NOT NULL);

-- User Profiles
CREATE POLICY "Manage Own Profile" ON public.user_profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Public Read Profiles" ON public.user_profiles FOR SELECT USING (true);

-- Bookings
CREATE POLICY "Create Own Bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "View All Bookings" ON public.bookings FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Update Bookings" ON public.bookings FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Maintenance Logs (authenticated users can do all — admins manage fleet)
CREATE POLICY "View Maintenance Logs" ON public.maintenance_logs FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Insert Maintenance Logs" ON public.maintenance_logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Delete Maintenance Logs" ON public.maintenance_logs FOR DELETE USING (auth.uid() IS NOT NULL);

-- Availability Calendar
CREATE POLICY "Public Read Calendar" ON public.availability_calendar FOR SELECT USING (true);
CREATE POLICY "Authenticated Manage Calendar" ON public.availability_calendar FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- 13. SEED VEHICLE CATEGORIES
INSERT INTO public.vehicle_categories (name) VALUES ('Car'), ('Bike'), ('Scooty') ON CONFLICT DO NOTHING;

-- 14. BIG DATA SEED (50+ PREMIUM VEHICLES)
INSERT INTO public.vehicles (name, brand, category, subtype, price_per_day, fuel_type, transmission, is_featured, is_bestseller, rating) VALUES
-- Mahindra Premium
('Scorpio N', 'Mahindra', 'Car', 'SUV', 3500, 'Diesel', 'Auto', true, true, 4.8),
('XUV700', 'Mahindra', 'Car', 'SUV', 4200, 'Petrol', 'Auto', true, true, 4.9),
('Thar', 'Mahindra', 'Car', 'Offroader', 3000, 'Diesel', 'Manual', true, true, 4.7),
('Bolero Neo', 'Mahindra', 'Car', 'SUV', 1800, 'Diesel', 'Manual', false, true, 4.4),
('XUV300', 'Mahindra', 'Car', 'Crossover', 1600, 'Petrol', 'Auto', false, false, 4.5),
-- Tata
('Harrier', 'Tata', 'Car', 'SUV', 3200, 'Diesel', 'Manual', false, true, 4.6),
('Safari', 'Tata', 'Car', 'SUV', 3400, 'Diesel', 'Auto', true, false, 4.7),
('Nexon', 'Tata', 'Car', 'SUV', 1500, 'Petrol', 'Auto', true, true, 4.5),
('Punch', 'Tata', 'Car', 'Crossover', 1200, 'Petrol', 'Auto', false, true, 4.3),
('Altroz', 'Tata', 'Car', 'Hatchback', 1100, 'Diesel', 'Manual', false, false, 4.4),
-- Toyota Luxury
('Fortuner', 'Toyota', 'Car', 'SUV', 6500, 'Diesel', 'Auto', true, true, 4.9),
('Innova Hycross', 'Toyota', 'Car', 'MPV', 3800, 'Hybrid', 'Auto', true, true, 4.8),
('Glanza', 'Toyota', 'Car', 'Hatchback', 1300, 'Petrol', 'Auto', false, false, 4.5),
('Camry', 'Toyota', 'Car', 'Luxury', 12000, 'Hybrid', 'Auto', true, false, 4.9),
('Hilux', 'Toyota', 'Car', 'Pickup', 7500, 'Diesel', 'Auto', true, false, 4.8),
-- Premium German
('3 Series', 'BMW', 'Car', 'Luxury', 15000, 'Petrol', 'Auto', true, true, 4.9),
('X5', 'BMW', 'Car', 'Luxury SUV', 25000, 'Diesel', 'Auto', true, true, 4.9),
('C-Class', 'Mercedes-Benz', 'Car', 'Luxury', 16000, 'Diesel', 'Auto', true, false, 4.8),
('E-Class LWB', 'Mercedes-Benz', 'Car', 'Luxury', 22000, 'Diesel', 'Auto', true, true, 4.9),
('A6', 'Audi', 'Car', 'Luxury', 14000, 'Petrol', 'Auto', false, false, 4.7),
-- Bikes
('Himalayan 450', 'Royal Enfield', 'Bike', 'Adventure', 1500, 'Petrol', 'Manual', true, true, 4.8),
('Classic 350', 'Royal Enfield', 'Bike', 'Cruiser', 1200, 'Petrol', 'Manual', false, true, 4.7),
('Interceptor 650', 'Royal Enfield', 'Bike', 'Cruiser', 2500, 'Petrol', 'Manual', true, false, 4.9),
('Hunter 350', 'Royal Enfield', 'Bike', 'Urban', 1000, 'Petrol', 'Manual', false, true, 4.5),
('Scram 411', 'Royal Enfield', 'Bike', 'Scrambler', 1300, 'Petrol', 'Manual', false, false, 4.4),
('Duke 390', 'KTM', 'Bike', 'Sports', 1800, 'Petrol', 'Manual', true, true, 4.6),
('RC 200', 'KTM', 'Bike', 'Sports', 1400, 'Petrol', 'Manual', false, true, 4.5),
('Super Meteor 650', 'Royal Enfield', 'Bike', 'Cruiser', 3500, 'Petrol', 'Manual', true, false, 4.9),
('ZX-10R', 'Kawasaki', 'Bike', 'Superbike', 12000, 'Petrol', 'Manual', true, false, 4.9),
('Tiger 900', 'Triumph', 'Bike', 'Adventure', 9500, 'Petrol', 'Manual', true, false, 4.9),
-- Scooty
('S1 Pro', 'Ola Electric', 'Scooty', 'Electric', 800, 'Electric', 'Auto', true, true, 4.7),
('Activa 6G', 'Honda', 'Scooty', 'Family', 700, 'Petrol', 'Auto', false, true, 4.5),
('Jupiter XL', 'TVS', 'Scooty', 'Family', 680, 'Petrol', 'Auto', false, false, 4.4),
('Ntorq 125', 'TVS', 'Scooty', 'Sports', 900, 'Petrol', 'Auto', true, true, 4.6),
('Chetak', 'Bajaj', 'Scooty', 'Electric', 750, 'Electric', 'Auto', false, true, 4.4),
-- More Cars
('Swift', 'Maruti Suzuki', 'Car', 'Hatchback', 1000, 'Petrol', 'Manual', false, true, 4.5),
('Baleno', 'Maruti Suzuki', 'Car', 'Hatchback', 1200, 'Petrol', 'Auto', false, true, 4.4),
('Brezza', 'Maruti Suzuki', 'Car', 'SUV', 1500, 'Petrol', 'Auto', false, true, 4.5),
('Grand Vitara', 'Maruti Suzuki', 'Car', 'SUV', 1800, 'Hybrid', 'Auto', true, true, 4.6),
('Jimny', 'Maruti Suzuki', 'Car', 'Offroader', 2500, 'Petrol', 'Manual', true, false, 4.7),
('Magnite', 'Nissan', 'Car', 'Crossover', 1100, 'Petrol', 'Auto', false, false, 4.3),
('Kiger', 'Renault', 'Car', 'Crossover', 1100, 'Petrol', 'Auto', false, false, 4.3),
('Astor', 'MG', 'Car', 'SUV', 1800, 'Petrol', 'Auto', false, false, 4.5),
('Hector', 'MG', 'Car', 'SUV', 2200, 'Diesel', 'Manual', true, false, 4.4),
('ZS EV', 'MG', 'Car', 'Electric', 3000, 'Electric', 'Auto', true, false, 4.6),
('Kona Electric', 'Hyundai', 'Car', 'Electric', 2800, 'Electric', 'Auto', false, false, 4.5),
('Ioniq 5', 'Hyundai', 'Car', 'Electric', 8500, 'Electric', 'Auto', true, true, 4.9),
('Verna', 'Hyundai', 'Car', 'Sedan', 2400, 'Petrol', 'Auto', false, true, 4.6),
('Creta N-Line', 'Hyundai', 'Car', 'SUV', 3000, 'Petrol', 'Auto', true, false, 4.7),
('Carens', 'Kia', 'Car', 'MPV', 1800, 'Diesel', 'Auto', false, true, 4.5);

-- 15. UPDATE IMAGE PLACEHOLDERS
UPDATE public.vehicles SET image_url = 'https://images.unsplash.com/photo-1621245023072-454462151bae' WHERE brand = 'Mahindra' AND name = 'Thar';
UPDATE public.vehicles SET image_url = 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a' WHERE brand = 'Tata' AND name = 'Nexon';
UPDATE public.vehicles SET image_url = 'https://images.unsplash.com/photo-1549317661-bd32c860f2b5' WHERE brand = 'Honda' AND name = 'Activa 6G';

-- 16. BACKFILL: Ensure existing auth users have profiles
INSERT INTO public.user_profiles (id, email, full_name, role, created_at)
SELECT id, email, COALESCE(raw_user_meta_data ->> 'full_name', email), 'user', created_at
FROM auth.users
ON CONFLICT (id) DO NOTHING;
