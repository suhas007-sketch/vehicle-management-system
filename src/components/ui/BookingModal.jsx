import React, { useState, useEffect, useContext, useMemo } from 'react';
import { X, Calendar, Wallet, Car, IndianRupee, MapPin, CheckCircle2 } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import AsyncButton from './AsyncButton';
import { Button } from './Button';
import toast from 'react-hot-toast';
import { bookingService } from '../../services/bookingService';
import { vehicleService } from '../../services/vehicleService';
import { formatINR } from '../../lib/formatters';


export default function BookingModal({ isOpen, onClose, onBookingAdded, preSelectedVehicle = null }) {
    const { user } = useContext(AuthContext);
    const [vehicles, setVehicles] = useState([]);
    const [formData, setFormData] = useState({ 
        vehicle: '', 
        startDate: new Date().toISOString().split('T')[0], 
        endDate: '' 
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if(isOpen) {
            if (preSelectedVehicle) {
                setFormData(prev => ({...prev, vehicle: preSelectedVehicle.id.toString()}));
            }
            
            vehicleService.getAll()
                .then(data => {
                    setVehicles(data.filter(v => v.status === 'available'));
                })
                .catch(err => {
                    console.error(err);
                    toast.error('Failed to load available fleet');
                });
        }
    }, [isOpen, preSelectedVehicle]);


    const selectedVehicle = useMemo(() => {
        const vId = formData.vehicle.toString();
        return vehicles.find(v => v.id.toString() === vId) || preSelectedVehicle;
    }, [vehicles, formData.vehicle, preSelectedVehicle]);

    const bookingDetails = useMemo(() => {
        if (!formData.startDate || !formData.endDate || !selectedVehicle) return null;
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        if (start >= end) return null;
        
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return {
            days: diffDays,
            totalPrice: diffDays * selectedVehicle.price_per_day
        };
    }, [formData.startDate, formData.endDate, selectedVehicle]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!user || !user.id) {
            return toast.error("Please login to book a vehicle.");
        }
        
        if (!bookingDetails) {
            return toast.error("Please check your rental dates.");
        }
        
        if (!formData.vehicle) {
            return toast.error("Please select a vehicle.");
        }

        setLoading(true);
        try {
            const bookingData = {
                customer_id: user.id,
                customer_name: user.name || user.email || 'Anonymous Operator',
                start_date: formData.startDate,
                end_date: formData.endDate,
                total_price: bookingDetails.totalPrice
            };
            
            await bookingService.create(formData.vehicle, bookingData);
            
            toast.success(`Booking confirmed for ${selectedVehicle.name}!`);
            setFormData({ vehicle: '', startDate: '', endDate: '' });
            onBookingAdded && onBookingAdded();
            onClose();
        } catch (err) {
            console.error("Booking error:", err);
            toast.error(err.message || "Error confirming rental.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-surface border border-border shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-[32px] w-full max-w-lg relative animate-in zoom-in-95 duration-300 overflow-hidden">
                {/* Visual Header */}
                <div className="h-32 relative bg-primary/20 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-transparent z-10" />
                    <div className="relative z-20 flex flex-col items-center">
                        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-lg mb-2">
                             <Calendar className="w-6 h-6 text-primary" />
                        </div>
                        <h2 className="text-xl font-black text-white tracking-widest uppercase italic">Secure Your Ride</h2>
                    </div>
                    {selectedVehicle?.image_url && (
                        <img src={selectedVehicle.image_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale" />
                    )}
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white/70 hover:text-white transition-all z-30">
                        <X className="w-5 h-5"/>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black uppercase tracking-[0.25em] text-textMuted ml-1">Select Machine</label>
                            <div className="relative">
                                <Car className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                                <select 
                                    required 
                                    value={formData.vehicle} 
                                    onChange={e=>setFormData({...formData, vehicle: e.target.value})} 
                                    className="w-full bg-background/50 border border-border rounded-2xl px-12 py-4 text-sm text-textMain focus:border-primary focus:outline-none transition-all cursor-pointer font-bold appearance-none"
                                >
                                    {!preSelectedVehicle && <option value="">-- Choose Your Vehicle --</option>}
                                    {preSelectedVehicle && <option value={preSelectedVehicle.id}>{preSelectedVehicle.brand} {preSelectedVehicle.name}</option>}
                                    {vehicles.map(v => (
                                        v.id !== preSelectedVehicle?.id && (
                                            <option key={v.id} value={v.id}>{v.brand} {v.name} ({v.subtype}) - {formatINR(v.price_per_day)}/day</option>
                                        )
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black uppercase tracking-[0.25em] text-textMuted ml-1">Pickup Date</label>
                                <input required type="date" value={formData.startDate} onChange={e=>setFormData({...formData, startDate: e.target.value})} className="w-full bg-background/50 border border-border rounded-2xl px-5 py-4 text-sm text-textMain focus:border-primary focus:outline-none transition-all font-bold" />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black uppercase tracking-[0.25em] text-textMuted ml-1">Return Date</label>
                                <input required type="date" value={formData.endDate} onChange={e=>setFormData({...formData, endDate: e.target.value})} className="w-full bg-background/50 border border-border rounded-2xl px-5 py-4 text-sm text-textMain focus:border-primary focus:outline-none transition-all font-bold" />
                            </div>
                        </div>
                    </div>

                    {bookingDetails && (
                        <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 animate-in slide-in-from-bottom-2 duration-500 overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <CheckCircle2 className="w-20 h-20 text-primary" />
                            </div>
                            
                            <div className="flex justify-between items-center mb-1">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-textMuted" />
                                    <span className="text-xs font-bold text-textMuted uppercase tracking-widest">Duration</span>
                                </div>
                                <span className="text-sm font-black text-textMain italic uppercase">{bookingDetails.days} Days Rental</span>
                            </div>
                            
                            <div className="flex justify-between items-center bg-primary/10 -mx-6 px-6 py-4 mt-4 border-y border-primary/5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/20 rounded-xl">
                                        <Wallet className="w-5 h-5 text-primary" />
                                    </div>
                                    <span className="text-xs font-black text-primary uppercase tracking-[0.15em]">Total Estimate</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-3xl font-black text-textMain italic">{formatINR(bookingDetails.totalPrice)}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="pt-10 border-t border-white/5 flex justify-end gap-6 items-center">
                        <Button type="button" variant="ghost" onClick={onClose} disabled={loading} className="h-14 rounded-2xl px-8 hover:bg-white/5 font-extrabold italic uppercase opacity-50 hover:opacity-100 transition-opacity">Abort</Button>
                        <AsyncButton 
                            type="submit" 
                            loading={loading} 
                            disabled={!bookingDetails} 
                            className="min-w-[200px] h-14 rounded-2xl px-10 shadow-glow gap-3"
                        >
                            <Calendar className="w-5 h-5" />
                            <span className="font-black italic uppercase tracking-wider">Confirm Rental</span>
                        </AsyncButton>
                    </div>

                </form>
            </div>
        </div>
    );
}
