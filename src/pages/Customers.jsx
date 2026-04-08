import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PageTransition from '../components/layout/PageTransition';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, User, ShieldCheck, Mail, Phone, CalendarRange } from 'lucide-react';
import { TableSkeleton } from '../components/ui/SkeletonLoaders';
import { EmptyState } from '../components/ui/EmptyState';
import { profileService } from '../services/profileService';
import toast from 'react-hot-toast';


export default function Customers() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const fetchCustomers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await profileService.getAll();
            setCustomers(data);
        } catch (error) {
            console.error('Error fetching customers', error);
            toast.error('Failed to sync CRM records');
        } finally {
            setLoading(false);
        }
    }, []);


    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const filteredAndSortedCustomers = useMemo(() => {
        let result = [...customers];

        // Filter
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            result = result.filter(c => 
                (c.full_name || '').toLowerCase().includes(lowerSearch) || 
                (c.email || '').toLowerCase().includes(lowerSearch) 
            );
        }


        // Sort
        result.sort((a, b) => {
            const aValue = (a[sortConfig.key] || '').toString().toLowerCase();
            const bValue = (b[sortConfig.key] || '').toString().toLowerCase();
            
            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [customers, searchTerm, sortConfig]);

    const totalPages = Math.ceil(filteredAndSortedCustomers.length / itemsPerPage);
    const paginatedCustomers = filteredAndSortedCustomers.slice(
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
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter text-textMain">Customer CRM</h1>
                    <p className="text-textMuted mt-1 font-bold text-xs uppercase tracking-[0.2em]">Manage your premium Indian rental community</p>
                </div>
                <div className="relative group">
                    <input 
                        type="text" 
                        placeholder="Search regular or elite profiles..." 
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
                                        { label: 'Customer Profile', key: 'full_name', icon: User },
                                        { label: 'Contact Details', key: 'email', icon: Mail },
                                        { label: 'Account Authority', key: 'role', icon: ShieldCheck },
                                        { label: 'Joined On', key: 'created_at', icon: CalendarRange }
                                    ].map((col) => (
                                        <th 
                                            key={col.key}
                                            onClick={() => handleSort(col.key)}
                                            className="group py-8 px-10 text-[10px] font-black text-textMuted uppercase tracking-[0.3em] cursor-pointer hover:bg-white/5 transition-colors border-r border-white/5 last:border-r-0"
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
                                            <td colSpan="4" className="p-8">
                                                <TableSkeleton rows={8} cols={4} />
                                            </td>
                                        </tr>
                                    ) : paginatedCustomers.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="py-32 text-center text-textMuted font-black uppercase tracking-[0.3em]">Operational Void</td>
                                        </tr>
                                    ) : paginatedCustomers.map((c) => (
                                        <tr key={c.id} className="hover:bg-primary/5 transition-all group cursor-pointer border-r last:border-r-0 border-white/5">
                                            <td className="py-8 px-10">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-14 h-14 rounded-2xl bg-surface border border-white/10 flex items-center justify-center text-sm font-black text-primary shadow-2xl group-hover:scale-110 transition-transform overflow-hidden">
                                                        {c.avatar ? <img src={c.avatar} alt="" className="w-full h-full object-cover" /> : (c.full_name?.charAt(0).toUpperCase() || '?')}
                                                    </div>
                                                    <div>
                                                        <h5 className="font-black text-base text-textMain group-hover:text-primary transition-colors italic uppercase tracking-tighter">{c.full_name}</h5>
                                                        <p className="text-[10px] text-textMuted font-bold uppercase tracking-widest mt-1 opacity-40">UID: {c.id.substring(0,8).toUpperCase()}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-8 px-10">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-3 text-sm text-textMuted group-hover:text-textMain transition-colors">
                                                        <Mail className="w-4 h-4 opacity-30" />
                                                        <span className="font-bold tracking-tight">{c.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-8 px-10">
                                                <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border shadow-glow-sm ${
                                                    c.role === 'admin' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-glow-sm' :
                                                    'bg-primary/10 text-primary border-primary/20'
                                                }`}>
                                                    {c.role || 'Member'}
                                                </span>
                                            </td>
                                            <td className="py-8 px-10">
                                                <span className="text-xs font-black text-textMuted uppercase tracking-widest italic">
                                                    {new Date(c.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>

                        </table>
                    </div>
                    {/* Pagination Controls */}
                    {!loading && filteredAndSortedCustomers.length > 0 && (
                        <div className="p-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6 bg-surface">
                            <p className="text-[10px] text-textMuted font-black uppercase tracking-[0.2em]">
                                User Census: <span className="text-textMain">{currentPage}</span> / <span className="text-textMain">{totalPages}</span>
                            </p>
                            <div className="flex gap-3">
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                    className="h-12 px-6 rounded-2xl border border-white/10 hover:bg-white/5 font-black uppercase text-[10px] tracking-widest"
                                >
                                    <ChevronLeft className="w-5 h-5 mr-3" /> Prev Census
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                    className="h-12 px-6 rounded-2xl border border-white/10 hover:bg-white/5 font-black uppercase text-[10px] tracking-widest"
                                >
                                    Next Census <ChevronRight className="w-5 h-5 ml-3" />
                                </Button>
                            </div>
                        </div>
                    )}

                </CardContent>
            </Card>
        </PageTransition>
    );
}
