import { supabase } from '../lib/supabase';

export const bookingService = {
    async getAll() {
        const { data, error } = await supabase
            .from('bookings')
            .select(`
                *,
                vehicles:vehicle_id (
                    name,
                    brand,
                    image_url,
                    price_per_day
                )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return data.map(b => ({
            ...b,
            vehicle_name: b.vehicles?.name || 'Unknown',
            vehicle_brand: b.vehicles?.brand || '',
            vehicle_image: b.vehicles?.image_url || '',
            vehicle_price: b.vehicles?.price_per_day || 0
        }));
    },

    async getByUserId(userId) {
        const { data, error } = await supabase
            .from('bookings')
            .select(`
                *,
                vehicles:vehicle_id (
                    name,
                    brand,
                    image_url,
                    price_per_day
                )
            `)
            .eq('customer_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return data.map(b => ({
            ...b,
            vehicle_name: b.vehicles?.name || 'Unknown',
            vehicle_brand: b.vehicles?.brand || '',
            vehicle_image: b.vehicles?.image_url || '',
            vehicle_price: b.vehicles?.price_per_day || 0
        }));
    },

    async create(id, bookingData) {
        // Trigger handle_on_booking_confirmed will automatically update vehicle status
        const { data, error } = await supabase
            .from('bookings')
            .insert([{
                vehicle_id: id,
                customer_id: bookingData.customer_id,
                customer_name: bookingData.customer_name,
                start_date: bookingData.start_date,
                end_date: bookingData.end_date,
                status: 'pending' // trigger will work based on this
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateStatus(id, status) {
        const { error } = await supabase
            .from('bookings')
            .update({ status })
            .eq('id', id);
        if (error) throw error;
    }
};
