-- ============================================================
-- PATCH: Fix Vehicle Return + Add vehicle_name to bookings
-- Run this in Supabase SQL Editor
-- Safe to re-run. No data loss.
-- ============================================================

-- 1. Add vehicle_name column to bookings table (if it doesn't exist)
--    This lets the bookings table show the vehicle name even if the
--    vehicles row is later deleted.
ALTER TABLE public.bookings
    ADD COLUMN IF NOT EXISTS vehicle_name TEXT;

-- 2. Backfill vehicle_name for existing bookings
UPDATE public.bookings b
SET vehicle_name = v.name
FROM public.vehicles v
WHERE b.vehicle_id = v.id
  AND b.vehicle_name IS NULL;

-- 3. Auto-populate vehicle_name on new booking inserts
CREATE OR REPLACE FUNCTION public.fn_set_booking_vehicle_name()
RETURNS TRIGGER AS $$
BEGIN
    SELECT name INTO NEW.vehicle_name FROM public.vehicles WHERE id = NEW.vehicle_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_set_booking_vehicle_name ON public.bookings;
CREATE TRIGGER tr_set_booking_vehicle_name
BEFORE INSERT ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.fn_set_booking_vehicle_name();

-- 4. Ensure the return trigger completes bookings correctly
--    (Fires when vehicle status changes from 'rented' -> 'available')
CREATE OR REPLACE FUNCTION public.fn_complete_booking_on_return()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'available' AND OLD.status = 'rented' THEN
        UPDATE public.bookings
        SET status = 'completed'
        WHERE vehicle_id = NEW.id
          AND status IN ('pending', 'confirmed', 'active');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_complete_booking_on_return ON public.vehicles;
CREATE TRIGGER tr_complete_booking_on_return
AFTER UPDATE ON public.vehicles
FOR EACH ROW
EXECUTE FUNCTION public.fn_complete_booking_on_return();

-- Done! Verify with:
-- SELECT b.id, b.vehicle_name, b.status, v.name AS vehicle_join_name
-- FROM bookings b LEFT JOIN vehicles v ON b.vehicle_id = v.id
-- ORDER BY b.created_at DESC LIMIT 10;
