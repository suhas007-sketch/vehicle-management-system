import React, { createContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { profileService } from '../services/profileService';
import { seedSupabase } from '../lib/seedSupabase';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [initializing, setInitializing] = useState(true);

    useEffect(() => {
        let mounted = true;

        const getUser = async () => {
            try {
                setLoading(true);
                // Also kick off an async seed internally, independently
                import('../lib/seedSupabase').then(({ seedSupabase }) => seedSupabase().catch(() => {}));

                const { data, error } = await supabase.auth.getSession();
                if (!mounted) return;

                if (error) {
                    setUser(null);
                } else if (data?.session?.user) {
                    const supaUser = data.session.user;
                    setUser({
                        id: supaUser.id,
                        email: supaUser.email,
                        name: supaUser.user_metadata?.full_name || supaUser.email.split('@')[0],
                        raw: supaUser
                    });
                } else {
                    setUser(null);
                }
            } catch (err) {
                console.error('Session error:', err);
                if (mounted) setUser(null);
            } finally {
                if (mounted) {
                    setLoading(false);
                    setInitializing(false);
                }
            }
        };

        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                const supaUser = session.user;
                setUser({
                    id: supaUser.id,
                    email: supaUser.email,
                    name: supaUser.user_metadata?.full_name || supaUser.email.split('@')[0],
                    raw: supaUser
                });
            } else {
                setUser(null);
            }
            setLoading(false);
            setInitializing(false);
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const login = async (email, password) => {
        console.log('AuthContext: Attempting signInWithPassword');
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        if (data?.user) {
            setUser({
                id: data.user.id,
                email: data.user.email,
                name: data.user.user_metadata?.full_name || data.user.email.split('@')[0],
                raw: data.user
            });
        }
        return data.user;
    };

    const register = async (name, email, password) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: name } },
        });
        
        if (error) throw error;
        
        if (data?.user && data?.session) {
             setUser({
                 id: data.user.id,
                 email: data.user.email,
                 name: data.user.user_metadata?.full_name || data.user.email.split('@')[0],
                 raw: data.user
             });
        }
        
        return {
            user: data.user,
            session: data.session,
            isPending: data.user && !data.session
        };
    };

    const logout = async () => {
        setLoading(true);
        await supabase.auth.signOut();
        setUser(null);
        setLoading(false);
    };

    const updateUserData = async (newData) => {
        if (!user) return;
        setUser(prev => ({
            ...prev,
            name: newData.name || prev.name,
            avatar: newData.avatar || prev.avatar,
            bio: newData.bio || prev.bio
        }));
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            register,
            logout,
            updateUserData,
            loading,
            initializing
        }}>
            {children}
        </AuthContext.Provider>
    );
};

