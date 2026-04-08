import React, { useState, useEffect, useCallback } from 'react';
import { Hammer, Calendar, Plus, Trash2, RefreshCw, Wrench, AlertTriangle, CheckCircle, X, IndianRupee, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import PageTransition from '../components/layout/PageTransition';
import { TableSkeleton } from '../components/ui/SkeletonLoaders';
import { EmptyState } from '../components/ui/EmptyState';
import { maintenanceService } from '../services/maintenanceService';
import { vehicleService } from '../services/vehicleService';
import { formatINR } from '../lib/formatters';
import toast from 'react-hot-toast';

// ── Add Maintenance Log Modal ────────────────────────────────────────────────
function AddLogModal({ isOpen, onClose, onAdded, vehicles }) {
    const [form, setForm] = useState({
        vehicle_id: '',
        service_type: 'Routine Maintenance',
        description: '',
        cost: '',
        service_date: new Date().toISOString().split('T')[0],
    });
    const [loading, setLoading] = useState(false);

    const SERVICE_TYPES = ['Routine Maintenance', 'Engine Repair', 'Tyre Replacement', 'Oil Change', 'Brake Service', 'Battery Replacement', 'AC Service', 'Body Work', 'Electrical Repair', 'Other'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.vehicle_id) { toast.error('Select a vehicle'); return; }
        setLoading(true);
        try {
            const vehicle = vehicles.find(v => v.id === form.vehicle_id);
            await maintenanceService.addLog({
                ...form,
                vehicle_name: vehicle?.name || '',
                cost: Number(form.cost) || 0,
            });
            toast.success('Maintenance log recorded');
            onAdded();
            onClose();
        } catch (err) {
            toast.error('Failed to save log: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 animate-in fade-in duration-300">
            <div className="bg-[#0A0A0A] border border-white/5 shadow-[0_0_100px_rgba(0,0,0,1)] rounded-[40px] w-full max-w-lg relative animate-in zoom-in-95 duration-300 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50" />
                <div className="p-8 border-b border-white/5 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black text-textMain uppercase italic tracking-tight">Log <span className="text-amber-500">Maintenance</span></h2>
                        <p className="text-xs text-textMuted font-bold uppercase tracking-widest mt-1 opacity-50">Record a maintenance event</p>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-textMuted hover:text-textMain transition-all border border-white/5">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-textMuted opacity-50">Vehicle</label>
                        <select
                            required
                            value={form.vehicle_id}
                            onChange={e => setForm({ ...form, vehicle_id: e.target.value })}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-3 text-sm text-textMain focus:border-amber-500 focus:outline-none font-bold appearance-none"
                        >
                            <option value="">-- Select Vehicle --</option>
                            {vehicles.map(v => (
                                <option key={v.id} value={v.id} className="bg-surface">{v.brand} {v.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-textMuted opacity-50">Service Type</label>
                        <select
                            value={form.service_type}
                            onChange={e => setForm({ ...form, service_type: e.target.value })}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-3 text-sm text-textMain focus:border-amber-500 focus:outline-none font-bold appearance-none"
                        >
                            {SERVICE_TYPES.map(t => <option key={t} value={t} className="bg-surface">{t}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-textMuted opacity-50">Service Date</label>
                            <input
                                type="date"
                                value={form.service_date}
                                onChange={e => setForm({ ...form, service_date: e.target.value })}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-3 text-sm text-textMain focus:border-amber-500 focus:outline-none font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-textMuted opacity-50">Cost (₹)</label>
                            <input
                                type="number"
                                min="0"
                                placeholder="0"
                                value={form.cost}
                                onChange={e => setForm({ ...form, cost: e.target.value })}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-3 text-sm text-textMain focus:border-amber-500 focus:outline-none font-bold"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-textMuted opacity-50">Description</label>
                        <textarea
                            rows={3}
                            placeholder="Describe the maintenance performed..."
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-3 text-sm text-textMain focus:border-amber-500 focus:outline-none font-bold resize-none"
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="ghost" onClick={onClose} className="flex-1 h-12 rounded-2xl border border-white/10 font-bold uppercase text-xs tracking-widest">Cancel</Button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 h-12 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-widest text-xs transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                        >
                            {loading ? 'Saving...' : 'Record Log'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Add Calendar Block Modal ─────────────────────────────────────────────────
function AddCalendarModal({ isOpen, onClose, onAdded, vehicles }) {
    const [form, setForm] = useState({
        vehicle_id: '',
        unavailable_date: new Date().toISOString().split('T')[0],
        reason: '',
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.vehicle_id) { toast.error('Select a vehicle'); return; }
        setLoading(true);
        try {
            await maintenanceService.addUnavailableDate(form.vehicle_id, form.unavailable_date, form.reason);
            toast.success('Date blocked in calendar');
            onAdded();
            onClose();
        } catch (err) {
            if (err.message?.includes('duplicate') || err.code === '23505') {
                toast.error('That date is already blocked for this vehicle');
            } else {
                toast.error('Failed: ' + err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 animate-in fade-in duration-300">
            <div className="bg-[#0A0A0A] border border-white/5 shadow-[0_0_100px_rgba(0,0,0,1)] rounded-[40px] w-full max-w-md relative animate-in zoom-in-95 duration-300 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
                <div className="p-8 border-b border-white/5 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black text-textMain uppercase italic tracking-tight">Block <span className="text-primary">Date</span></h2>
                        <p className="text-xs text-textMuted font-bold uppercase tracking-widest mt-1 opacity-50">Mark a vehicle unavailable</p>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-textMuted hover:text-textMain transition-all border border-white/5">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-textMuted opacity-50">Vehicle</label>
                        <select
                            required
                            value={form.vehicle_id}
                            onChange={e => setForm({ ...form, vehicle_id: e.target.value })}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-3 text-sm text-textMain focus:border-primary focus:outline-none font-bold appearance-none"
                        >
                            <option value="">-- Select Vehicle --</option>
                            {vehicles.map(v => (
                                <option key={v.id} value={v.id} className="bg-surface">{v.brand} {v.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-textMuted opacity-50">Unavailable Date</label>
                        <input
                            required
                            type="date"
                            value={form.unavailable_date}
                            onChange={e => setForm({ ...form, unavailable_date: e.target.value })}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-3 text-sm text-textMain focus:border-primary focus:outline-none font-bold"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-textMuted opacity-50">Reason</label>
                        <input
                            type="text"
                            placeholder="e.g. Maintenance, Private Use..."
                            value={form.reason}
                            onChange={e => setForm({ ...form, reason: e.target.value })}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-3 text-sm text-textMain focus:border-primary focus:outline-none font-bold"
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="ghost" onClick={onClose} className="flex-1 h-12 rounded-2xl border border-white/10 font-bold uppercase text-xs tracking-widest">Cancel</Button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 h-12 rounded-2xl bg-primary hover:brightness-110 text-white font-black uppercase tracking-widest text-xs transition-all disabled:opacity-50 shadow-glow"
                        >
                            {loading ? 'Blocking...' : 'Block Date'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}


// ── Main Page ────────────────────────────────────────────────────────────────
export default function Maintenance() {
    const [activeTab, setActiveTab] = useState('logs');
    const [logs, setLogs] = useState([]);
    const [calendar, setCalendar] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [isCalModalOpen, setIsCalModalOpen] = useState(false);

    // Calendar month view state
    const today = new Date();
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const [logsData, calData, vehiclesData] = await Promise.all([
                maintenanceService.getAllLogs(),
                maintenanceService.getCalendar(),
                vehicleService.getAll(),
            ]);
            setLogs(logsData);
            setCalendar(calData);
            setVehicles(vehiclesData);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load maintenance data');
        } finally {
            setLoading(false);
        }
    }, []);

    // Silent refresh — does NOT trigger loading skeleton (used after mutations)
    const silentRefresh = useCallback(async () => {
        try {
            const [logsData, calData, vehiclesData] = await Promise.all([
                maintenanceService.getAllLogs(),
                maintenanceService.getCalendar(),
                vehicleService.getAll(),
            ]);
            setLogs(logsData);
            setCalendar(calData);
            setVehicles(vehiclesData);
        } catch (err) {
            console.error('[silentRefresh]', err);
        }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const [deletingLogId, setDeletingLogId] = useState(null);

    const handleDeleteLog = async (log) => {
        // log = full log object so we can show vehicle name in toast
        if (!window.confirm(`Delete maintenance log for "${log.vehicle_name}" on ${log.service_date}?\nThis will also unblock that date in the Availability Calendar and restore vehicle status to Available.`)) return;
        setDeletingLogId(log.id);
        try {
            await maintenanceService.deleteLog(log.id);
            toast.success(`Log deleted — calendar & vehicle status updated`);
            await silentRefresh(); // refresh both tabs without loading flash
        } catch (err) {
            console.error(err);
            toast.error('Failed to delete log: ' + err.message);
        } finally {
            setDeletingLogId(null);
        }
    };

    const handleDeleteCalEntry = async (id) => {
        try {
            await maintenanceService.removeUnavailableDate(id);
            toast.success('Date unblocked');
            await silentRefresh();
        } catch (err) {
            toast.error('Failed to remove entry');
        }
    };

    // Build calendar grid for current month view
    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const blockedDatesSet = new Set(
        calendar.map(e => e.unavailable_date)
    );
    const blockedByDay = {};
    calendar.forEach(e => {
        const day = e.unavailable_date;
        if (!blockedByDay[day]) blockedByDay[day] = [];
        blockedByDay[day].push(e);
    });

    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

    const calendarCells = [];
    for (let i = 0; i < firstDay; i++) calendarCells.push(null);
    for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

    const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const navMonth = (dir) => {
        let m = viewMonth + dir;
        let y = viewYear;
        if (m < 0) { m = 11; y--; }
        if (m > 11) { m = 0; y++; }
        setViewMonth(m);
        setViewYear(y);
    };

    const totalCost = logs.reduce((sum, l) => sum + (l.cost || 0), 0);
    const maintenanceVehicles = [...new Set(logs.map(l => l.vehicle_id))].length;

    return (
        <PageTransition className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter text-textMain">
                        Maintenance <span className="text-amber-500">Hub</span>
                    </h1>
                    <p className="text-textMuted mt-1 text-xs font-bold uppercase tracking-widest">
                        Full maintenance tracking & availability calendar
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        className="h-12 px-6 rounded-2xl gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:bg-amber-500/20"
                        onClick={() => setIsLogModalOpen(true)}
                    >
                        <Wrench className="w-4 h-4" />
                        <span className="font-extrabold italic uppercase tracking-wider text-xs">Log Maintenance</span>
                    </Button>
                    <Button
                        className="h-12 px-6 rounded-2xl gap-2 shadow-glow"
                        onClick={() => setIsCalModalOpen(true)}
                    >
                        <Plus className="w-4 h-4" />
                        <span className="font-extrabold italic uppercase tracking-wider text-xs">Block Date</span>
                    </Button>
                </div>
            </div>

            {/* Stats Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Logs', value: logs.length, color: 'text-amber-500', icon: Wrench },
                    { label: 'Vehicles Serviced', value: maintenanceVehicles, color: 'text-primary', icon: Hammer },
                    { label: 'Total Service Cost', value: formatINR(totalCost), color: 'text-green-500', icon: IndianRupee },
                    { label: 'Blocked Dates', value: calendar.length, color: 'text-red-400', icon: AlertTriangle },
                ].map((s, i) => (
                    <Card key={i} className="bg-surface-dark/40 border-white/5 rounded-[28px] overflow-hidden">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className={`p-3 rounded-2xl bg-white/5 border border-white/5 ${s.color}`}>
                                <s.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xl font-black text-textMain italic">{s.value}</p>
                                <p className="text-[9px] font-black uppercase tracking-widest text-textMuted opacity-50">{s.label}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 bg-surface border border-white/5 rounded-2xl p-1.5 w-fit">
                <button
                    onClick={() => setActiveTab('logs')}
                    className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'logs' ? 'bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.3)]' : 'text-textMuted hover:text-textMain'}`}
                >
                    Maintenance Logs
                </button>
                <button
                    onClick={() => setActiveTab('calendar')}
                    className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'calendar' ? 'bg-primary text-white shadow-glow' : 'text-textMuted hover:text-textMain'}`}
                >
                    Availability Calendar
                </button>
            </div>

            {/* ── TAB: MAINTENANCE LOGS ── */}
            {activeTab === 'logs' && (
                <Card className="overflow-hidden border-white/5 bg-surface-dark/40 rounded-[32px] shadow-2xl">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse whitespace-nowrap">
                                <thead>
                                    <tr className="bg-surface border-b border-white/10">
                                        {['Vehicle', 'Service Type', 'Description', 'Service Date', 'Cost', 'Action'].map(col => (
                                            <th key={col} className="py-5 px-8 text-[10px] font-black text-textMuted uppercase tracking-[0.3em] border-r border-white/5 last:border-r-0">
                                                {col}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {loading ? (
                                        <tr><td colSpan="6" className="p-8"><TableSkeleton rows={5} cols={6} /></td></tr>
                                    ) : logs.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="py-24 text-center">
                                                <EmptyState
                                                    title="No Maintenance Records"
                                                    description="No maintenance has been logged yet. Either set a vehicle to maintenance status or manually log a service event."
                                                    buttonText="Log Maintenance"
                                                    onButtonClick={() => setIsLogModalOpen(true)}
                                                    icon={Wrench}
                                                />
                                            </td>
                                        </tr>
                                    ) : logs.map((log) => (
                                        <tr key={log.id} className="hover:bg-amber-500/5 transition-all group">
                                            <td className="py-6 px-8">
                                                <div className="flex items-center gap-4">
                                                    {log.vehicle_image ? (
                                                        <img src={log.vehicle_image} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0 border border-white/10" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                                            <Hammer className="w-4 h-4 text-amber-500" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="text-[10px] text-textMuted font-black uppercase tracking-widest">{log.vehicle_brand}</p>
                                                        <p className="font-black text-sm text-textMain italic uppercase tracking-tight group-hover:text-amber-500 transition-colors">
                                                            {log.vehicle_name}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-6 px-8">
                                                <span className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                                    {log.service_type}
                                                </span>
                                            </td>
                                            <td className="py-6 px-8">
                                                <p className="text-xs text-textMuted font-bold max-w-[200px] truncate">{log.description || '—'}</p>
                                            </td>
                                            <td className="py-6 px-8">
                                                <p className="text-xs font-bold text-textMuted uppercase tracking-widest">
                                                    {log.service_date ? new Date(log.service_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                                                </p>
                                            </td>
                                            <td className="py-6 px-8">
                                                <p className="text-base font-black text-textMain italic">{formatINR(log.cost || 0)}</p>
                                            </td>
                                            <td className="py-6 px-8">
                                                <button
                                                    onClick={() => handleDeleteLog(log)}
                                                    disabled={deletingLogId === log.id}
                                                    className="p-2.5 rounded-xl text-textMuted hover:text-red-400 hover:bg-red-400/10 border border-white/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                                    title="Delete log & unblock calendar"
                                                >
                                                    {deletingLogId === log.id
                                                        ? <div className="w-4 h-4 border-2 border-red-400/40 border-t-red-400 rounded-full animate-spin" />
                                                        : <Trash2 className="w-4 h-4" />
                                                    }
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* ── TAB: AVAILABILITY CALENDAR ── */}
            {activeTab === 'calendar' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Calendar Grid */}
                    <Card className="lg:col-span-2 bg-surface-dark/40 border-white/5 rounded-[32px] overflow-hidden shadow-2xl">
                        <CardHeader className="p-8 border-b border-white/5">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xl font-black italic uppercase tracking-tight">
                                    {MONTH_NAMES[viewMonth]} <span className="text-primary">{viewYear}</span>
                                </CardTitle>
                                <div className="flex gap-2">
                                    <button onClick={() => navMonth(-1)} className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-primary/10 hover:border-primary/20 transition-all text-textMuted hover:text-primary">
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => { setViewMonth(today.getMonth()); setViewYear(today.getFullYear()); }} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-textMuted hover:text-primary hover:border-primary/20 transition-all">
                                        Today
                                    </button>
                                    <button onClick={() => navMonth(1)} className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-primary/10 hover:border-primary/20 transition-all text-textMuted hover:text-primary">
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            {/* Day headers */}
                            <div className="grid grid-cols-7 gap-1 mb-2">
                                {DAY_NAMES.map(d => (
                                    <div key={d} className="text-center text-[9px] font-black uppercase tracking-widest text-textMuted opacity-40 py-2">{d}</div>
                                ))}
                            </div>
                            {/* Day cells */}
                            <div className="grid grid-cols-7 gap-1">
                                {calendarCells.map((day, idx) => {
                                    if (!day) return <div key={idx} />;
                                    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                    const isToday = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
                                    const isBlocked = blockedDatesSet.has(dateStr);
                                    const entries = blockedByDay[dateStr] || [];

                                    return (
                                        <div
                                            key={idx}
                                            className={`relative aspect-square flex flex-col items-center justify-center rounded-xl text-xs font-black transition-all cursor-default border ${
                                                isBlocked
                                                    ? 'bg-red-500/10 border-red-500/30 text-red-400'
                                                    : isToday
                                                    ? 'bg-primary/10 border-primary/30 text-primary'
                                                    : 'border-white/5 text-textMuted hover:bg-white/5 hover:text-textMain'
                                            }`}
                                            title={entries.map(e => `${e.vehicle_name}: ${e.reason}`).join('\n')}
                                        >
                                            <span>{day}</span>
                                            {isBlocked && (
                                                <div className="absolute bottom-1 flex gap-0.5">
                                                    {entries.slice(0, 3).map((_, i) => (
                                                        <div key={i} className="w-1 h-1 rounded-full bg-red-400" />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            {/* Legend */}
                            <div className="flex items-center gap-6 mt-6 pt-4 border-t border-white/5">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-sm bg-red-500/20 border border-red-500/30" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-textMuted opacity-50">Blocked / Unavailable</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-sm bg-primary/20 border border-primary/30" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-textMuted opacity-50">Today</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Blocked Dates List */}
                    <Card className="bg-surface-dark/40 border-white/5 rounded-[32px] overflow-hidden shadow-2xl">
                        <CardHeader className="p-6 border-b border-white/5">
                            <CardTitle className="text-lg font-black italic uppercase tracking-tight">
                                Blocked <span className="text-red-400">Dates</span>
                            </CardTitle>
                            <p className="text-[10px] text-textMuted font-black uppercase tracking-widest mt-1 opacity-40">{calendar.length} entries</p>
                        </CardHeader>
                        <CardContent className="p-0">
                            {loading ? (
                                <div className="p-6"><TableSkeleton rows={4} cols={1} /></div>
                            ) : calendar.length === 0 ? (
                                <div className="py-16 text-center">
                                    <CheckCircle className="w-10 h-10 text-green-500/30 mx-auto mb-3" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-textMuted opacity-40">Fully Available</p>
                                    <p className="text-xs text-textMuted opacity-30 mt-1">No dates are blocked</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto custom-scrollbar">
                                    {calendar.map((entry) => (
                                        <div key={entry.id} className="px-6 py-4 flex items-center justify-between group hover:bg-red-500/5 transition-all">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-black text-textMain italic truncate group-hover:text-red-400 transition-colors">
                                                    {entry.vehicle_name}
                                                </p>
                                                <p className="text-[10px] font-bold text-textMuted uppercase tracking-widest mt-0.5 opacity-50">
                                                    {new Date(entry.unavailable_date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </p>
                                                {entry.reason && (
                                                    <p className="text-[9px] text-red-400/50 font-bold mt-0.5 truncate">{entry.reason}</p>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleDeleteCalEntry(entry.id)}
                                                className="ml-3 p-2 rounded-xl text-textMuted hover:text-red-400 hover:bg-red-400/10 border border-white/5 transition-all shrink-0"
                                                title="Unblock date"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Modals */}
            <AddLogModal
                isOpen={isLogModalOpen}
                onClose={() => setIsLogModalOpen(false)}
                onAdded={fetchAll}
                vehicles={vehicles}
            />
            <AddCalendarModal
                isOpen={isCalModalOpen}
                onClose={() => setIsCalModalOpen(false)}
                onAdded={fetchAll}
                vehicles={vehicles}
            />
        </PageTransition>
    );
}
