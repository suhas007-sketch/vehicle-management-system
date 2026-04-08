import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PageTransition from '../components/layout/PageTransition';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Filter, CalendarCheck, Hash } from 'lucide-react';

import { TableSkeleton } from '../components/ui/SkeletonLoaders';
import { EmptyState } from '../components/ui/EmptyState';
import { bookingService } from '../services/bookingService';
import { formatINR } from '../lib/formatters';
import toast from 'react-hot-toast';


export default function Bookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchBookings = useCallback(async () => {
        setLoading(true);
        try {
            const data = await bookingService.getAll();
            setBookings(data);
        } catch (error) {
            console.error('Error fetching bookings', error);
            toast.error('Failed to sync rental log');
        } finally {
            setLoading(false);
        }
    }, []);


    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const filteredAndSortedBookings = useMemo(() => {
        let result = [...bookings];

        // Filter
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            result = result.filter(b => 
                (b.customer_name || '').toLowerCase().includes(lowerSearch) || 
                (b.vehicle_name || '').toLowerCase().includes(lowerSearch) ||
                (b.id || '').toString().includes(lowerSearch)
            );
        }


        // Sort
        result.sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];
            
            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [bookings, searchTerm, sortConfig]);

    const totalPages = Math.ceil(filteredAndSortedBookings.length / itemsPerPage);
    const paginatedBookings = filteredAndSortedBookings.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const SortIcon = ({ column }) => {
        if (sortConfig.key !== column) return <ChevronDown className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-50" />;
        return sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3 ml-1 text-primary" /> : <ChevronDown className="w-3 h-3 ml-1 text-primary" />;
    };

    return (
        <PageTransition className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter text-textMain">Rental Registry</h1>
                    <p className="text-textMuted mt-1 font-bold text-xs uppercase tracking-[0.2em]">Live audit of global vehicle reservations</p>
                </div>
                <div className="relative group">
                    <input 
                        type="text" 
                        placeholder="Search by ID, machine or user (#hash)..." 
                        value={searchTerm}
                        onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
                        className="bg-surface border border-white/5 rounded-2xl px-5 py-3 text-sm text-textMain min-w-[320px] focus:outline-none focus:border-primary transition-all pl-12 shadow-inner shadow-black/20"
                    />
                    <Search className="w-5 h-5 text-textMuted absolute left-4 top-3 group-focus-within:text-primary transition-colors" />
                </div>
            </div>

            <Card className="overflow-hidden border-white/5 bg-surface-dark/40 rounded-[32px] shadow-2xl">
                <CardContent className="p-0">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                            <thead>
                                <tr className="bg-surface border-b border-white/10">
                                    {[
                                        { label: 'Booking ID',   key: 'id',           icon: Hash },
                                        { label: 'Vehicle Name', key: 'vehicle_name', icon: CalendarCheck },
                                        { label: 'Start Date',   key: 'start_date',   icon: null },
                                        { label: 'End Date',     key: 'end_date',     icon: null },
                                        { label: 'Amount',       key: 'total_price',  icon: null },
                                        { label: 'Status',       key: 'status',       icon: null }
                                    ].map((col) => (
                                        <th 
                                            key={col.key}
                                            onClick={() => handleSort(col.key)}
                                            className="group py-6 px-8 text-[10px] font-black text-textMuted uppercase tracking-[0.3em] cursor-pointer hover:bg-white/5 transition-colors border-r border-white/5 last:border-r-0"
                                        >
                                            <div className="flex items-center">
                                                {col.icon && <col.icon className="w-3.5 h-3.5 mr-2 opacity-50" />}
                                                {col.label}
                                                <SortIcon column={col.key} />
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                                <tbody className="divide-y divide-white/5">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="6" className="p-8">
                                                <TableSkeleton rows={8} cols={6} />
                                            </td>
                                        </tr>
                                    ) : paginatedBookings.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="py-32 text-center">
                                                <EmptyState 
                                                    title="Registry Vacuum"
                                                    description={searchTerm ? "No operational logs match your query." : "Fleet availability is 100%. No active reservations found."}
                                                    icon={Filter}
                                                />
                                            </td>
                                        </tr>
                                    ) : paginatedBookings.map((b) => (
                                        <tr key={b.id} className="hover:bg-primary/5 transition-all group cursor-pointer border-r last:border-r-0 border-white/5">
                                            {/* Booking ID */}
                                            <td className="py-7 px-10">
                                                <span className="text-[10px] font-black text-textMuted/40 group-hover:text-primary transition-colors tracking-widest uppercase">
                                                    #{b.id.toString().substring(0,8).toUpperCase()}
                                                </span>
                                            </td>
                                            {/* Vehicle Name */}
                                            <td className="py-7 px-10">
                                                <div>
                                                    <p className="text-[10px] text-textMuted font-black uppercase tracking-widest">
                                                        {b.vehicle_brand || '—'}
                                                    </p>
                                                    <h5 className="font-black text-sm text-textMain group-hover:text-primary transition-colors italic uppercase tracking-tight mt-0.5">
                                                        {b.vehicle_name || 'Unknown Vehicle'}
                                                    </h5>
                                                </div>
                                            </td>
                                            {/* Start Date */}
                                            <td className="py-7 px-10 text-xs font-bold text-textMuted uppercase tracking-widest">
                                                {b.start_date ? new Date(b.start_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase() : '—'}
                                            </td>
                                            {/* End Date */}
                                            <td className="py-7 px-10 text-xs font-bold text-textMuted uppercase tracking-widest">
                                                {b.end_date ? new Date(b.end_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase() : '—'}
                                            </td>
                                            {/* Amount */}
                                            <td className="py-7 px-10">
                                                <span className="text-base font-black text-textMain italic">{formatINR(b.total_price)}</span>
                                            </td>
                                            {/* Status */}
                                            <td className="py-7 px-10">
                                                <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] border ${
                                                    b.status === 'active' || b.status === 'confirmed' ? 'bg-primary/10 text-primary border-primary/20' :
                                                    b.status === 'completed' ? 'bg-green-400/10 text-green-400 border-green-400/20' :
                                                    b.status === 'cancelled' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                    'bg-white/5 border-white/10 text-textMuted'
                                                }`}>
                                                    {b.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>

                        </table>
                    </div>
                    {/* Pagination Controls */}
                    {!loading && filteredAndSortedBookings.length > 0 && (
                        <div className="p-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6 bg-surface">
                            <p className="text-[10px] text-textMuted font-black uppercase tracking-[0.2em]">
                                Page Cycle: <span className="text-textMain">{currentPage}</span> / <span className="text-textMain">{totalPages}</span> (Total <span className="text-primary">{filteredAndSortedBookings.length}</span> registries)
                            </p>
                            <div className="flex gap-3">
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                    className="h-12 px-6 rounded-2xl border border-white/10 hover:bg-white/5 font-black uppercase text-[10px] tracking-widest"
                                >
                                    <ChevronLeft className="w-5 h-5 mr-2" /> Prev Cycle
                                </Button>
                                <div className="flex gap-1.5 px-2 items-center">
                                    {Array.from({ length: Math.min(3, totalPages) }).map((_, i) => (
                                        <div key={i} className={`w-1.5 h-1.5 rounded-full ${currentPage === i + 1 ? 'bg-primary shadow-glow' : 'bg-white/20'}`} />
                                    ))}
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                    className="h-12 px-6 rounded-2xl border border-white/10 hover:bg-white/5 font-black uppercase text-[10px] tracking-widest"
                                >
                                    Next Cycle <ChevronRight className="w-5 h-5 ml-2" />
                                </Button>
                            </div>
                        </div>
                    )}

                </CardContent>
            </Card>
        </PageTransition>
    );
}
