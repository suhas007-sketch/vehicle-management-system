-- ============================================================
-- PATCH: Auto-complete booking when vehicle is returned
-- Run this in Supabase SQL Editor (safe, no data loss)
-- ============================================================

CREATE OR REPLACE FUNCTION public.fn_complete_booking_on_return()
RETURNS TRIGGER AS $$
BEGIN
    -- Only fire when vehicle transitions from 'rented' -> 'available'
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
