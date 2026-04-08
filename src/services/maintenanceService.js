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
        const { data, error } = await supabase
            .from('maintenance_logs')
            .insert([{
                vehicle_id: logData.vehicle_id,
                vehicle_name: logData.vehicle_name,
                service_type: logData.service_type,
                description: logData.description || '',
                cost: logData.cost || 0,
                service_date: logData.service_date || new Date().toISOString().split('T')[0],
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteLog(id) {
        const { error } = await supabase
            .from('maintenance_logs')
            .delete()
            .eq('id', id);
        if (error) throw error;
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

    // Auto-populate calendar from existing bookings
    async syncCalendarFromBookings() {
        const { data: bookings, error } = await supabase
            .from('bookings')
            .select('vehicle_id, start_date, end_date, status')
            .in('status', ['confirmed', 'active', 'pending']);

        if (error) throw error;

        const entries = [];
        for (const b of bookings || []) {
            const start = new Date(b.start_date);
            const end = new Date(b.end_date);
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                entries.push({
                    vehicle_id: b.vehicle_id,
                    unavailable_date: d.toISOString().split('T')[0],
                    reason: 'Booked',
                });
            }
        }

        if (entries.length === 0) return [];

        const { data, error: insertError } = await supabase
            .from('availability_calendar')
            .upsert(entries, { onConflict: 'vehicle_id,unavailable_date', ignoreDuplicates: true })
            .select();

        if (insertError) throw insertError;
        return data;
    }
};
