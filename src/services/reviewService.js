import { supabase } from '../lib/supabase';

export const reviewService = {
    /**
     * Fetch all reviews for a specific vehicle, newest first.
     */
    async getByVehicleId(vehicleId) {
        const { data, error } = await supabase
            .from('vehicle_reviews')
            .select('*')
            .eq('vehicle_id', vehicleId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    /**
     * Submit a new review for a vehicle.
     */
    async create({ vehicle_id, user_id, reviewer_name, rating, comment }) {
        const payload = {
            vehicle_id,
            user_id: user_id || null,
            reviewer_name: reviewer_name || 'Anonymous',
            rating: Number(rating),
            comment: comment.trim(),
        };

        const { data, error } = await supabase
            .from('vehicle_reviews')
            .insert([payload])
            .select()
            .single();

        if (error) throw error;
        return data;
    },
};
