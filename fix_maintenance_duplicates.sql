-- ============================================================
-- PATCH: Fix duplicate maintenance logs + strengthen trigger
-- Run this in Supabase SQL Editor.
-- Safe to re-run, no data loss.
-- ============================================================

-- 1. Remove existing duplicate maintenance log rows (keep only the latest per vehicle per date)
DELETE FROM public.maintenance_logs
WHERE id NOT IN (
    SELECT DISTINCT ON (vehicle_id, service_date) id
    FROM public.maintenance_logs
    ORDER BY vehicle_id, service_date, created_at DESC
);

-- 2. Recreate the fn_log_maintenance_event trigger function.
--    This is the ONLY place a log is auto-created (when vehicle status changes to 'maintenance').
--    The frontend addLog() no longer calls vehicles.update(), so no double-fire will occur.
CREATE OR REPLACE FUNCTION public.fn_log_maintenance_event()
RETURNS TRIGGER AS $$
BEGIN
    -- Only fire when a vehicle ENTERS maintenance status (not already in it)
    IF NEW.status = 'maintenance' AND (OLD.status IS DISTINCT FROM 'maintenance') THEN
        INSERT INTO public.maintenance_logs (vehicle_id, vehicle_name, service_type, description, cost, service_date)
        VALUES (
            NEW.id,
            NEW.name,
            'Routine Maintenance',
            'Vehicle status set to maintenance from Fleet Operations.',
            0,
            CURRENT_DATE
        );
        -- Also block today in availability_calendar
        INSERT INTO public.availability_calendar (vehicle_id, unavailable_date, reason)
        VALUES (NEW.id, CURRENT_DATE, 'Maintenance')
        ON CONFLICT (vehicle_id, unavailable_date) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_log_maintenance_event ON public.vehicles;
CREATE TRIGGER tr_log_maintenance_event
AFTER UPDATE ON public.vehicles
FOR EACH ROW
EXECUTE FUNCTION public.fn_log_maintenance_event();

-- 3. Backfill: auto-create calendar entries for vehicles currently in maintenance
--    that somehow have no availability_calendar row
INSERT INTO public.availability_calendar (vehicle_id, unavailable_date, reason)
SELECT v.id, CURRENT_DATE, 'Maintenance'
FROM public.vehicles v
WHERE v.status = 'maintenance'
  AND NOT EXISTS (
    SELECT 1 FROM public.availability_calendar c WHERE c.vehicle_id = v.id
  )
ON CONFLICT (vehicle_id, unavailable_date) DO NOTHING;

-- Done! Verify:
-- SELECT v.name, v.status, c.unavailable_date
-- FROM vehicles v LEFT JOIN availability_calendar c ON c.vehicle_id = v.id
-- WHERE v.status = 'maintenance';
