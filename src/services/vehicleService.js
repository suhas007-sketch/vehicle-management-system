import { supabase } from '../lib/supabase';

export const vehicleService = {
    async getAll(filters = {}) {
        let query = supabase.from('vehicles').select('*');

        if (filters.category && filters.category !== 'All') {
            query = query.eq('category', filters.category);
        }
        if (filters.subtype && filters.subtype !== 'All') {
            query = query.eq('subtype', filters.subtype);
        }
        if (filters.status && filters.status !== 'All') {
            query = query.eq('status', filters.status);
        }
        if (filters.minPrice) {
            query = query.gte('price_per_day', filters.minPrice);
        }
        if (filters.maxPrice) {
            query = query.lte('price_per_day', filters.maxPrice);
        }
        if (filters.search) {
            query = query.or(`name.ilike.%${filters.search}%,brand.ilike.%${filters.search}%`);
        }

        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    async getRecommended() {
        const { data, error } = await supabase
            .from('recommended_vehicles')
            .select('*')
            .limit(10);
        if (error) throw error;
        return data;
    },

    async getById(id) {
        const { data, error } = await supabase
            .from('vehicles')
            .select('*, vehicle_images(*)')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    },

    async create(vehicleData) {
        const { data, error } = await supabase
            .from('vehicles')
            .insert([{
                ...vehicleData,
                status: vehicleData.status || 'available',
                created_at: new Date().toISOString()
            }])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async update(id, vehicleData) {
        const { data, error } = await supabase
            .from('vehicles')
            .update(vehicleData)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async delete(id) {
        const { error } = await supabase
            .from('vehicles')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    async updateStatus(id, status) {
        const { data, error } = await supabase
            .from('vehicles')
            .update({ status })
            .eq('id', id)
            .select();

        if (error) {
            console.error('[vehicleService.updateStatus] Error:', error);
            throw error;
        }
        return data?.[0] ?? null;
    },

    async getStats() {
        // Optimized stats fetching using single query with counts
        const { data: vehicles, error } = await supabase
            .from('vehicles')
            .select('status, price_per_day, booking_count');
        
        if (error) throw error;

        const totalVehicles = vehicles.length;
        const activeRentals = vehicles.filter(v => v.status === 'rented').length;
        const revenue = vehicles.reduce((acc, v) => acc + (v.price_per_day * (v.booking_count || 0)), 0) * 0.1;
        const availability = totalVehicles > 0 ? Math.round(((totalVehicles - activeRentals) / totalVehicles) * 100) : 0;

        return {
            totalVehicles,
            activeRentals,
            revenue: Math.round(revenue),
            availability
        };
    }
};
