import { supabase } from '../lib/supabase';

export const profileService = {
    async getById(id) {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error && error.code !== 'PGRST116') throw error; // PGRST116 is no rows found
        return data;
    },

    async createOrUpdate(profileData) {
        const { data, error } = await supabase
            .from('user_profiles')
            .upsert({
                id: profileData.id,
                email: profileData.email,
                full_name: profileData.full_name,
                avatar: profileData.avatar,
                role: profileData.role || 'user',
                updated_at: new Date().toISOString()
            })
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },

    async update(id, updates) {
        const { data, error } = await supabase
            .from('user_profiles')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },

    async getAll() {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
    }
};
