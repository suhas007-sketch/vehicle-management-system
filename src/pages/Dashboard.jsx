import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Car, Calendar, IndianRupee, Users, Activity, Shield, TrendingUp, Plus } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import PageTransition from '../components/layout/PageTransition';
import VehicleModal from '../components/ui/VehicleModal';
import BookingModal from '../components/ui/BookingModal';
import { DashboardSkeleton } from '../components/ui/SkeletonLoaders';
import { vehicleService } from '../services/vehicleService';
import { bookingService } from '../services/bookingService';
import { profileService } from '../services/profileService';
import { formatINR } from '../lib/formatters';

export default function Dashboard() {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState({ totalVehicles: 0, activeBookings: 0, totalRevenue: 0, totalCustomers: 0 });
    const [recentBookings, setRecentBookings] = useState([]);
    const [isSynced, setIsSynced] = useState(true);
    const [lastSync, setLastSync] = useState(new Date().toLocaleTimeString());
    const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [vehicles, bookings, users] = await Promise.all([
                vehicleService.getAll(),
                bookingService.getAll(),
                profileService.getAll()
            ]);

            setStats({
                totalVehicles: (vehicles || []).length,
                activeBookings: (bookings || []).filter(b => b.status === 'confirmed').length,
                totalRevenue: (bookings || []).reduce((sum, b) => sum + (b.total_price || 0), 0),
                totalCustomers: (users || []).length
            });

            setRecentBookings((bookings || []).slice(0, 5));
            setIsSynced(true);
            setLastSync(new Date().toLocaleTimeString());
        } catch (error) {
            console.error('Dashboard sync error', error);
            setIsSynced(false);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) return <DashboardSkeleton />;

    return (
        <PageTransition className="space-y-12">
            {/* Hero Section / Greeting */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-[2px] w-12 bg-primary shadow-glow" />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary italic">Operational Command Center</span>
                    </div>
                    <h1 className="text-6xl font-black italic uppercase tracking-tighter text-textMain leading-none">
                        Welcome, <span className="text-primary">{user?.name?.split(' ')[0] || 'Operator'}</span>
                    </h1>
                    <div className="flex items-center gap-4">
                        <p className="text-textMuted font-bold text-sm uppercase tracking-[0.3em] opacity-40">System Node: <span className="text-textMain">VRMS.IND.ALPHA-01</span></p>
                        <div className="h-4 w-[1px] bg-white/10" />
                        <p className={`text-[10px] font-black uppercase tracking-widest ${isSynced ? 'text-green-500' : 'text-red-500'} italic animate-pulse`}>
                            {isSynced ? 'Synced • ' + lastSync : 'Sync Offline'}
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-6 bg-white/[0.02] border border-white/5 rounded-[32px] p-2 pr-8 shadow-2xl">
                    <div className="w-16 h-16 rounded-3xl bg-surface flex items-center justify-center border border-white/5 shadow-inner">
                        <Activity className={`w-6 h-6 ${isSynced ? 'text-primary' : 'text-red-500'} animate-pulse`} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-textMuted mb-1 opacity-50">Supabase Node</p>
                        <p className={`text-lg font-black italic tracking-widest ${isSynced ? 'text-green-500' : 'text-red-500'}`}>
                            {isSynced ? 'OPTIMIZED' : 'ERROR: CHECK CONFIG'}
                        </p>
                    </div>
                </div>
            </div>


            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: 'Fleet Assets', value: stats.totalVehicles, icon: Car, color: 'text-primary' },
                    { label: 'Active Rents', value: stats.activeBookings, icon: Calendar, color: 'text-accent' },
                    { label: 'Gross Revenue', value: formatINR(stats.totalRevenue), icon: IndianRupee, color: 'text-green-500' },
                    { label: 'Client Census', value: stats.totalCustomers, icon: Users, color: 'text-purple-500' }
                ].map((stat, i) => (
                    <Card key={i} className="bg-surface-dark/40 border-white/5 overflow-hidden group hover:border-primary/20 transition-all rounded-[40px] shadow-2xl relative">
                        <CardContent className="p-10">
                            <div className="flex justify-between items-start mb-8">
                                <div className={`p-5 rounded-2xl bg-white/[0.02] border border-white/5 group-hover:scale-110 transition-transform ${stat.color} shadow-2xl`}>
                                    <stat.icon className="w-7 h-7" />
                                </div>
                                <div className="text-[10px] font-black text-textMuted uppercase tracking-widest opacity-20 italic">MTRIC.0{i+1}</div>
                            </div>
                            <h3 className="text-4xl font-black text-textMain tracking-tighter mb-2 italic leading-none">{stat.value}</h3>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-textMuted opacity-50">{stat.label}</p>
                            
                            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-white/[0.01] rounded-full group-hover:bg-primary/5 transition-all duration-1000" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Deployment Log Feed */}
                <Card className="lg:col-span-2 bg-surface-dark border-white/5 rounded-[48px] shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden">
                    <CardHeader className="p-12 border-b border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6 bg-white/[0.01]">
                        <div>
                            <CardTitle className="text-2xl font-black italic uppercase tracking-tight">Deployment Log</CardTitle>
                            <p className="text-[10px] text-textMuted font-black uppercase tracking-[0.4em] mt-2 opacity-50">Real-time Node Synchronized</p>
                        </div>
                        <Button variant="ghost" className="h-12 px-8 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all">Download Log</Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-white/5">
                            {recentBookings.length === 0 ? (
                                <div className="py-32 text-center text-textMuted font-black uppercase tracking-[0.5em] text-[10px] animate-pulse">Scanning for data packets...</div>
                            ) : recentBookings.map((booking) => (
                                <div key={booking.id} className="p-10 flex items-center justify-between hover:bg-white/[0.02] transition-all group cursor-pointer relative overflow-hidden">
                                    <div className="flex items-center gap-8 relative z-10">
                                        <div className="w-16 h-16 rounded-[24px] bg-surface-dark border border-white/10 flex items-center justify-center text-xs font-black text-primary shadow-2xl group-hover:scale-110 transition-transform">
                                            <Calendar className="w-7 h-7 opacity-50" />
                                        </div>
                                        <div>
                                            <h5 className="font-black text-lg text-textMain italic uppercase tracking-tighter group-hover:text-primary transition-colors">{booking.customer_name || 'Anonymous User'}</h5>
                                            <p className="text-[10px] text-textMuted font-black uppercase tracking-[0.3em] mt-1 opacity-40">{booking.vehicle_name || 'Machine Unspecified'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right relative z-10">
                                        <p className="text-lg font-black text-textMain italic tracking-tight">{formatINR(booking.total_price)}</p>
                                        <span className={`inline-block mt-2 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                                            booking.status === 'confirmed' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                                        }`}>
                                            {booking.status}
                                        </span>
                                    </div>
                                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Hub Actions */}
                <div className="space-y-10">
                    <Card className="bg-primary/5 border border-primary/20 rounded-[48px] p-12 relative overflow-hidden group shadow-glow-sm">
                        <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-10 transition-all duration-1000 rotate-12">
                            <Activity className="w-48 h-48" />
                        </div>
                        <h4 className="text-xs font-black uppercase tracking-[0.4em] text-primary mb-8 italic">Action Interface</h4>
                        <div className="space-y-5 relative z-10">
                            <Button className="w-full h-20 rounded-[32px] shadow-glow gap-4 font-black italic uppercase tracking-[0.2em] text-xs" onClick={() => setIsVehicleModalOpen(true)}>
                                <Plus className="w-6 h-6" /> Add Machine
                            </Button>
                            <Button variant="ghost" className="w-full h-20 rounded-[32px] bg-white/[0.03] border border-white/5 hover:bg-white/10 gap-4 font-black italic uppercase tracking-[0.2em] text-xs" onClick={() => window.location.href='/app/vehicles'}>
                                <TrendingUp className="w-6 h-6 text-accent" /> Fleet Manager
                            </Button>

                        </div>
                    </Card>

                    <Card className="bg-[#050505] border border-white/5 rounded-[48px] p-12 shadow-2xl relative overflow-hidden">
                        <div className="flex items-center gap-4 mb-10">
                            <Shield className="w-6 h-6 text-primary" />
                            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-textMuted opacity-50">Security Protocol</h4>
                        </div>
                        <div className="space-y-8">
                            <div className="flex justify-between items-center pb-6 border-b border-white/5 group">
                                <span className="text-sm font-black text-textMuted italic tracking-tight group-hover:text-textMain transition-colors">Encrypted Flux</span>
                                <span className="text-[9px] font-black text-green-500 uppercase tracking-widest bg-green-500/10 px-3 py-1 rounded-xl border border-green-500/20 shadow-glow-sm">SSL.01</span>
                            </div>
                            <div className="flex justify-between items-center pb-6 border-b border-white/5 group">
                                <span className="text-sm font-black text-textMuted italic tracking-tight group-hover:text-textMain transition-colors">Admin Authority</span>
                                <span className="text-[9px] font-black text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-xl border border-primary/20 shadow-glow-sm">ROOT</span>
                            </div>
                        </div>
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary/5 blur-[50px] rounded-full pointer-events-none" />
                    </Card>
                </div>
            </div>

            <VehicleModal 
                isOpen={isVehicleModalOpen} 
                onClose={() => setIsVehicleModalOpen(false)} 
                onVehicleAdded={fetchData} 
            />
            
            <BookingModal 
                isOpen={isBookingModalOpen} 
                onClose={() => setIsBookingModalOpen(false)} 
                onBookingAdded={fetchData} 
            />
        </PageTransition>
    );
}
