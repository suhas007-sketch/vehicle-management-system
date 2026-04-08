import { supabase } from '../lib/supabase';

export const maintenanceService = {
    // ── Maintenance Logs ────────────────────────────────────────────
    async getAllLogs() {
        const { data, error } = await supabase
            .from('maintenance_logs')
            .select(`
                *,
                vehicles:vehicle_id (
                    name,
                    brand,
                    image_url,
                    category,
                    status
                )
            `)
            .order('service_date', { ascending: false });

        if (error) throw error;

        return (data || []).map(log => ({
            ...log,
            vehicle_name: log.vehicle_name || log.vehicles?.name || 'Unknown',
            vehicle_brand: log.vehicles?.brand || '',
            vehicle_image: log.vehicles?.image_url || '',
            vehicle_category: log.vehicles?.category || '',
            vehicle_status: log.vehicles?.status || '',
        }));
    },

    async addLog(logData) {
        const serviceDate = logData.service_date || new Date().toISOString().split('T')[0];

        // 1. Insert the maintenance log
        const { data, error } = await supabase
            .from('maintenance_logs')
            .insert([{
                vehicle_id: logData.vehicle_id,
                vehicle_name: logData.vehicle_name,
                service_type: logData.service_type,
                description: logData.description || '',
                cost: logData.cost || 0,
                service_date: serviceDate,
            }])
            .select()
            .single();

        if (error) throw error;

        // 2. Also block the service date in availability_calendar
        // (ignore duplicate errors silently)
        await supabase
            .from('availability_calendar')
            .upsert(
                [{
                    vehicle_id: logData.vehicle_id,
                    unavailable_date: serviceDate,
                    reason: 'Maintenance',
                }],
                { onConflict: 'vehicle_id,unavailable_date', ignoreDuplicates: true }
            );

        // 3. Also set the vehicle status to maintenance
        await supabase
            .from('vehicles')
            .update({ status: 'maintenance' })
            .eq('id', logData.vehicle_id);

        return data;
    },

    /**
     * Delete a maintenance log AND:
     *  - Remove matching availability_calendar entries (same vehicle, same date, reason = 'Maintenance')
     *  - Restore vehicle status to 'available' ONLY if no other maintenance logs exist for that vehicle
     */
    async deleteLog(id) {
        // Step 1: fetch the log first so we have vehicle_id + service_date
        const { data: log, error: fetchErr } = await supabase
            .from('maintenance_logs')
            .select('id, vehicle_id, service_date')
            .eq('id', id)
            .single();

        if (fetchErr) throw fetchErr;

        const { vehicle_id, service_date } = log;

        // Step 2: delete the log
        const { error: delErr } = await supabase
            .from('maintenance_logs')
            .delete()
            .eq('id', id);

        if (delErr) throw delErr;

        // Step 3: remove the matching calendar entry for this vehicle + date (maintenance-reason only)
        await supabase
            .from('availability_calendar')
            .delete()
            .eq('vehicle_id', vehicle_id)
            .eq('unavailable_date', service_date)
            .eq('reason', 'Maintenance');

        // Step 4: check if any remaining maintenance logs exist for this vehicle
        const { data: remaining } = await supabase
            .from('maintenance_logs')
            .select('id')
            .eq('vehicle_id', vehicle_id);

        // Step 5: if no more logs, restore vehicle to 'available'
        if (!remaining || remaining.length === 0) {
            await supabase
                .from('vehicles')
                .update({ status: 'available' })
                .eq('id', vehicle_id)
                .eq('status', 'maintenance'); // only if it's still in maintenance
        }
    },

    // ── Availability Calendar ────────────────────────────────────────
    async getCalendar(vehicleId = null) {
        let query = supabase
            .from('availability_calendar')
            .select(`
                *,
                vehicles:vehicle_id (
                    name,
                    brand,
                    category,
                    image_url
                )
            `)
            .order('unavailable_date', { ascending: true });

        if (vehicleId) {
            query = query.eq('vehicle_id', vehicleId);
        }

        const { data, error } = await query;
        if (error) throw error;

        return (data || []).map(entry => ({
            ...entry,
            vehicle_name: entry.vehicles?.name || 'Unknown',
            vehicle_brand: entry.vehicles?.brand || '',
            vehicle_image: entry.vehicles?.image_url || '',
            vehicle_category: entry.vehicles?.category || '',
        }));
    },

    async addUnavailableDate(vehicleId, date, reason = '') {
        const { data, error } = await supabase
            .from('availability_calendar')
            .insert([{
                vehicle_id: vehicleId,
                unavailable_date: date,
                reason: reason || 'Manually blocked',
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async removeUnavailableDate(id) {
        const { error } = await supabase
            .from('availability_calendar')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },
};
