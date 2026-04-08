import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon, ChevronRight, ChevronLeft, Check, IndianRupee, Fuel, ToggleLeft } from 'lucide-react';
import AsyncButton from './AsyncButton';
import { Button } from './Button';
import toast from 'react-hot-toast';
import { vehicleService } from '../../services/vehicleService';


const CATEGORIES = {
    'Car': {
        subtypes: ['Hatchback', 'Sedan', 'SUV', 'MUV', 'Luxury', 'Electric', 'Sports'],
        fuel: ['Petrol', 'Diesel', 'CNG', 'Electric'],
        trans: ['Manual', 'Auto']
    },
    'Bike': {
        subtypes: ['Standard', 'Sports', 'Cruiser', 'Commuter', 'Adventure', 'Electric'],
        fuel: ['Petrol', 'Electric'],
        trans: ['Manual']
    },
    'Scooty': {
        subtypes: ['Standard', 'Electric', 'Performance', 'Family'],
        fuel: ['Petrol', 'Electric'],
        trans: ['Auto']
    }
};

const BRANDS = {
    'Car': ['Mahindra', 'Tata', 'Hyundai', 'Toyota', 'Honda', 'Maruti Suzuki', 'Kia', 'Volkswagen', 'Skoda', 'MG', 'BMW', 'Audi', 'Mercedes'],
    'Bike': ['Royal Enfield', 'KTM', 'Yamaha', 'Hero', 'Bajaj', 'TVS', 'Honda', 'Suzuki', 'Kawasaki', 'Jawa'],
    'Scooty': ['Honda', 'TVS', 'Suzuki', 'Yamaha', 'Ola Electric', 'Ather', 'Bajaj Chetak']
};

export default function VehicleModal({ isOpen, onClose, onVehicleAdded, editingVehicle = null }) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({ 
        name: '', 
        brand: '',
        category: 'Car', 
        subtype: 'SUV', 
        price_per_day: '', 
        image_url: '',
        fuel_type: 'Petrol',
        transmission: 'Auto',
        status: 'available'
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editingVehicle) {
            setFormData({
                name: editingVehicle.name,
                brand: editingVehicle.brand,
                category: editingVehicle.category,
                subtype: editingVehicle.subtype,
                price_per_day: editingVehicle.price_per_day.toString(),
                image_url: editingVehicle.image_url,
                fuel_type: editingVehicle.fuel_type || 'Petrol',
                transmission: editingVehicle.transmission || 'Auto',
                status: editingVehicle.status
            });
        } else {
            setFormData({ 
                name: '', 
                brand: 'Mahindra',
                category: 'Car', 
                subtype: 'SUV', 
                price_per_day: '', 
                image_url: '',
                fuel_type: 'Petrol',
                transmission: 'Auto',
                status: 'available'
            });
            setStep(1);
        }
    }, [editingVehicle, isOpen]);

    if (!isOpen) return null;

    const handleNext = () => setStep(2);
    const handleBack = () => setStep(1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...formData,
                price_per_day: Number(formData.price_per_day)
            };

            if (editingVehicle) {
                await vehicleService.update(editingVehicle.id, payload);
                toast.success('Fleet machine updated');
            } else {
                await vehicleService.create(payload);
                toast.success('New beast added to Indian fleet');
            }
            onVehicleAdded && onVehicleAdded();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Failed to sync vehicle data');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 animate-in fade-in duration-500">
            <div className="bg-[#0A0A0A] border border-white/5 shadow-[0_0_100px_rgba(0,0,0,1)] rounded-[40px] w-full max-w-2xl relative animate-in zoom-in-95 duration-500 overflow-hidden">
                {/* Visual Accent */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
                
                {/* Header */}
                <div className="p-10 border-b border-white/5 flex justify-between items-center relative gap-6">
                    <div>
                        <h2 className="text-3xl font-black text-textMain tracking-tighter uppercase italic">
                            {editingVehicle ? 'Update' : 'Register'} <span className="text-primary">Machine</span>
                        </h2>
                        <div className="flex gap-2 mt-4">
                            <div className={`h-1.5 w-16 rounded-full transition-all duration-700 ${step >= 1 ? 'bg-primary shadow-glow' : 'bg-white/5'}`} />
                            <div className={`h-1.5 w-16 rounded-full transition-all duration-700 ${step >= 2 ? 'bg-primary shadow-glow' : 'bg-white/5'}`} />
                        </div>
                    </div>
                    <button onClick={onClose} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-textMuted hover:text-textMain transition-all active:scale-90 border border-white/5">
                        <X className="w-6 h-6"/>
                    </button>
                    
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 blur-[100px] pointer-events-none rounded-full" />
                </div>
                
                <form onSubmit={handleSubmit} className="p-10">
                    {step === 1 ? (
                        <div className="space-y-10 animate-in slide-in-from-right-12 duration-700">
                            {/* Category Selection */}
                            <div className="space-y-6">
                                <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-textMuted ml-1 opacity-50">Operational Class</label>
                                <div className="grid grid-cols-3 gap-6">
                                    {Object.keys(CATEGORIES).map(cat => (
                                        <button 
                                            key={cat}
                                            type="button"
                                            onClick={() => setFormData({
                                                ...formData, 
                                                category: cat, 
                                                brand: BRANDS[cat][0],
                                                subtype: CATEGORIES[cat].subtypes[0],
                                                fuel_type: CATEGORIES[cat].fuel[0],
                                                transmission: CATEGORIES[cat].trans[0]
                                            })}
                                            className={`p-6 rounded-[28px] border transition-all duration-500 flex flex-col items-center gap-3 group relative overflow-hidden ${formData.category === cat ? 'border-primary/50 bg-primary/5 text-primary shadow-glow-sm' : 'border-white/5 bg-white/[0.02] text-textMuted hover:border-white/10 hover:bg-white/[0.04]'}`}
                                        >
                                            <span className="font-black text-xs uppercase italic tracking-widest relative z-10">{cat}</span>
                                            {formData.category === cat && (
                                                <div className="absolute inset-0 bg-primary/5 animate-pulse" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>


                            {/* Dynamic Subtype & Brand */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-textMuted ml-1 opacity-50">Machine Variant</label>
                                    <select 
                                        value={formData.subtype}
                                        onChange={e => setFormData({...formData, subtype: e.target.value})}
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm text-textMain focus:border-primary focus:outline-none transition-all cursor-pointer font-bold appearance-none hover:bg-white/[0.05]"
                                    >
                                        {CATEGORIES[formData.category].subtypes.map(s => <option key={s} value={s} className="bg-surface">{s}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-4">
                                    <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-textMuted ml-1 opacity-50">Manufacturer</label>
                                    <select 
                                        value={formData.brand}
                                        onChange={e => setFormData({...formData, brand: e.target.value})}
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm text-textMain focus:border-primary focus:outline-none transition-all cursor-pointer font-bold appearance-none hover:bg-white/[0.05]"
                                    >
                                        {BRANDS[formData.category].map(b => <option key={b} value={b} className="bg-surface">{b}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="pt-10 flex justify-end">
                                <Button type="button" onClick={handleNext} className="h-14 rounded-2xl px-10 shadow-glow gap-3">
                                    <span className="font-black italic uppercase tracking-wider">Configure Dynamics</span>
                                    <ChevronRight className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>

                    ) : (
                        <div className="space-y-10 animate-in slide-in-from-left-12 duration-700">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-8">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-textMuted ml-1 mb-3 opacity-50">Technical Model Name</label>
                                        <input required type="text" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm text-textMain focus:border-primary focus:outline-none transition-all font-bold placeholder:text-textMuted/10" placeholder="e.g. THAR ROXX 4X4" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-textMuted ml-1 mb-3 opacity-50">Daily Rate (₹)</label>
                                        <div className="relative">
                                            <IndianRupee className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                                            <input required type="number" min="1" value={formData.price_per_day} onChange={e=>setFormData({...formData, price_per_day: e.target.value})} style={{ paddingLeft: '3.5rem' }} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pr-6 py-4 text-sm text-textMain focus:border-primary focus:outline-none transition-all font-bold text-left" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-textMuted ml-1 mb-3 opacity-50">Propulsion</label>
                                        <select value={formData.fuel_type} onChange={e=>setFormData({...formData, fuel_type: e.target.value})} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm text-textMain focus:border-primary focus:outline-none transition-all font-black uppercase italic tracking-tighter appearance-none">
                                            {CATEGORIES[formData.category].fuel.map(f => <option key={f} value={f} className="bg-surface">{f}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-textMuted ml-1 mb-3 opacity-50">Transmission Logic</label>
                                        <div className="flex bg-white/[0.02] border border-white/10 rounded-2xl p-1.5 gap-1.5">
                                            {CATEGORIES[formData.category].trans.map(t => (
                                                <button 
                                                    key={t}
                                                    type="button"
                                                    onClick={() => setFormData({...formData, transmission: t})}
                                                    className={`flex-1 py-3 text-[10px] font-black uppercase italic tracking-[0.2em] rounded-xl transition-all duration-500 ${formData.transmission === t ? 'bg-primary text-white shadow-glow' : 'text-textMuted hover:text-textMain hover:bg-white/5'}`}
                                                >
                                                    {t === 'Auto' ? 'Automatic' : 'Manual'}
                                                </button>
                                            ))}
                                            {CATEGORIES[formData.category].trans.length === 1 && (
                                                <div className="flex-1 py-3 text-[10px] font-black uppercase italic tracking-widest rounded-xl text-textMuted/20 pointer-events-none text-center">Locked</div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-textMuted ml-1 mb-3 opacity-50">Blueprint Visual URL</label>
                                        <input required type="url" value={formData.image_url} onChange={e=>setFormData({...formData, image_url: e.target.value})} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm text-textMain focus:border-primary focus:outline-none transition-all font-bold placeholder:text-textMuted/10" placeholder="https://..." />
                                    </div>
                                    <div className="relative aspect-video rounded-[32px] border border-white/5 bg-white/[0.01] overflow-hidden flex items-center justify-center group shadow-2xl">
                                        {formData.image_url ? (
                                            <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                                        ) : (
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="p-5 bg-white/5 rounded-full">
                                                    <ImageIcon className="w-8 h-8 text-textMuted/20" />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-textMuted/30">Visual Feed Empty</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                            </div>


                            <div className="pt-10 border-t border-white/5 flex justify-between items-center gap-6">
                                <Button type="button" variant="ghost" onClick={handleBack} className="h-14 rounded-2xl px-8 hover:bg-white/5 gap-3">
                                    <ChevronLeft className="w-5 h-5" />
                                    <span className="font-extrabold italic uppercase tracking-wider">Back</span>
                                </Button>
                                <div className="flex gap-4">
                                    <Button type="button" variant="ghost" onClick={onClose} className="h-14 rounded-2xl px-8 hover:bg-white/5 font-extrabold italic uppercase opacity-50 hover:opacity-100 transition-opacity">Abort</Button>
                                    <AsyncButton 
                                        type="submit" 
                                        loading={loading}
                                        className="min-w-[200px] h-14 rounded-2xl px-10 shadow-glow gap-3"
                                    >
                                        <Check className="w-5 h-5" />
                                        <span className="font-black italic uppercase tracking-wider">{editingVehicle ? 'Update Machine' : 'Deploy Machine'}</span>
                                    </AsyncButton>
                                </div>
                            </div>


                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
