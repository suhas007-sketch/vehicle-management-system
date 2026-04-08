import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import PageTransition from '../components/layout/PageTransition';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import AsyncButton from '../components/ui/AsyncButton';
import { User, Mail, Shield, Camera, Save, IndianRupee, Bell, Globe, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Settings() {
    const { user, updateUserData } = useContext(AuthContext);
    const [formData, setFormData] = useState({ name: '', avatar: '', bio: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                avatar: user.avatar || '',
                bio: user.bio || ''
            });
        }
    }, [user]);

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateUserData(formData);
            toast.success('Neural configurations updated');
        } catch (err) {
            console.error(err);
            toast.error('Sync failure: check connectivity');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageTransition className="max-w-6xl mx-auto space-y-12 pb-32">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 py-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-[2px] w-12 bg-primary shadow-glow" />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary italic">Global Node Settings</span>
                    </div>
                    <h1 className="text-5xl font-black italic uppercase tracking-tighter text-textMain leading-none">System <span className="text-primary">Core</span></h1>
                    <p className="text-textMuted font-bold text-xs uppercase tracking-[0.3em] opacity-40">Operator Identity & Deployment Preferences</p>
                </div>
            </div>
            
            <form onSubmit={handleSave} className="space-y-12">
                <Card className="overflow-hidden border-white/5 bg-[#0A0A0A] shadow-[0_0_100px_rgba(0,0,0,1)] rounded-[48px] relative">
                    {/* Visual Accent */}
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
                    
                    <CardHeader className="p-12 border-b border-white/5 bg-white/[0.01] flex flex-row items-center justify-between relative z-10">
                        <div>
                            <CardTitle className="text-2xl font-black italic uppercase tracking-tight">Identity Matrix</CardTitle>
                            <p className="text-[10px] text-textMuted font-black uppercase tracking-widest mt-2 opacity-50">Secure Operator Credentials</p>
                        </div>
                        <div className="px-6 py-2.5 bg-primary/10 border border-primary/20 rounded-2xl text-[10px] font-black uppercase tracking-widest text-primary italic shadow-glow-sm">Encryption Active</div>
                    </CardHeader>
                    
                    <CardContent className="p-12 space-y-16 relative z-10">
                        {/* Avatar & Basic Info */}
                        <div className="flex flex-col lg:flex-row items-start gap-16">
                            <div className="flex flex-col items-center gap-6 group">
                                <div className="relative">
                                    <div className="w-48 h-48 rounded-[56px] bg-surface-dark border-2 border-white/5 group-hover:border-primary/50 transition-all duration-700 flex items-center justify-center text-6xl font-black text-primary shadow-2xl overflow-hidden relative">
                                        {formData.avatar ? (
                                            <img src={formData.avatar} alt="Profile" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                                        ) : (
                                            <span className="italic">{user?.name?.charAt(0).toUpperCase() || 'A'}</span>
                                        )}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                            <Camera className="w-8 h-8 text-white animate-bounce" />
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-glow border-4 border-[#0A0A0A]">
                                        <Shield className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-textMuted opacity-50 italic">Operator Visual ID</p>
                            </div>
                            
                            <div className="flex-1 w-full space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-textMuted ml-1 opacity-50">Full Designation</label>
                                        <div className="relative">
                                            <input 
                                                required
                                                type="text" 
                                                value={formData.name} 
                                                onChange={e => setFormData({...formData, name: e.target.value})}
                                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm text-textMain focus:border-primary focus:outline-none transition-all pl-14 font-extrabold italic" 
                                                placeholder="Suhas Admin"
                                            />
                                            <User className="w-5 h-5 text-primary absolute left-5 top-1/2 -translate-y-1/2" />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-textMuted ml-1 opacity-50">Comm Channel (Locked)</label>
                                        <div className="relative">
                                            <input 
                                                disabled 
                                                type="email" 
                                                value={user?.email || ''} 
                                                className="w-full bg-white/[0.01] border border-white/5 rounded-2xl px-6 py-4 text-sm text-textMuted opacity-30 cursor-not-allowed pl-14 font-bold" 
                                            />
                                            <Mail className="w-5 h-5 text-textMuted absolute left-5 top-1/2 -translate-y-1/2" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-textMuted ml-1 opacity-50">Asset Repository (Avatar URL)</label>
                                    <div className="relative">
                                        <input 
                                            type="url" 
                                            value={formData.avatar} 
                                            onChange={e => setFormData({...formData, avatar: e.target.value})}
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm text-textMain focus:border-primary focus:outline-none transition-all pl-14 font-bold" 
                                            placeholder="https://images.unsplash.com/..."
                                        />
                                        <Globe className="w-5 h-5 text-primary absolute left-5 top-1/2 -translate-y-1/2" />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-textMuted ml-1 opacity-50">Operator Briefing (Bio)</label>
                                    <div className="relative">
                                        <textarea 
                                            rows="3"
                                            value={formData.bio} 
                                            onChange={e => setFormData({...formData, bio: e.target.value})}
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-3xl px-6 py-5 text-sm text-textMain focus:border-primary focus:outline-none transition-all font-medium resize-none" 
                                            placeholder="System administrator for the premium vehicle fleet..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Operational Logic */}
                        <div className="pt-16 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-16">
                            <div className="space-y-8">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 bg-primary/10 rounded-xl">
                                        <Briefcase className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="text-base font-black uppercase tracking-widest text-textMain italic">Fleet Parameters</h4>
                                        <p className="text-[10px] text-textMuted font-bold uppercase tracking-widest opacity-40">Regional Deployment Sync</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                   <div className="p-6 bg-white/[0.02] rounded-[32px] border border-white/5 hover:border-primary/20 transition-all">
                                        <p className="text-[9px] font-black text-textMuted uppercase tracking-widest mb-3 opacity-50">Global Currency</p>
                                        <div className="flex items-center gap-3 text-primary font-black text-xl italic italic">
                                            <IndianRupee className="w-5 h-5 shadow-glow" /> INR (₹)
                                        </div>
                                   </div>
                                   <div className="p-6 bg-white/[0.02] rounded-[32px] border border-white/5 hover:border-primary/20 transition-all">
                                        <p className="text-[9px] font-black text-textMuted uppercase tracking-widest mb-3 opacity-50">Local Language</p>
                                        <div className="font-black text-xl italic text-textMain tracking-tight">ENG (IND)</div>
                                   </div>
                                </div>
                            </div>
                            
                            <div className="space-y-8">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 bg-accent/10 rounded-xl">
                                        <Bell className="w-6 h-6 text-accent" />
                                    </div>
                                    <div>
                                        <h4 className="text-base font-black uppercase tracking-widest text-textMain italic">Neural Feed</h4>
                                        <p className="text-[10px] text-textMuted font-bold uppercase tracking-widest opacity-40">Real-time Push Overrides</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-8 bg-white/[0.02] rounded-[32px] border border-white/5 group hover:border-accent/20 transition-all">
                                    <div className="space-y-1">
                                        <p className="text-sm font-black text-textMain italic uppercase tracking-tight">Booking Alerts</p>
                                        <p className="text-[10px] text-textMuted font-bold uppercase tracking-widest opacity-40">New machine deployments</p>
                                    </div>
                                    <div className="w-14 h-7 bg-accent/10 rounded-full border border-accent/20 relative cursor-pointer group-hover:shadow-glow-sm transition-all duration-500">
                                        <div className="absolute top-1 right-1 w-5 h-5 bg-accent rounded-full shadow-glow" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-6 items-center">
                    <Button type="button" variant="ghost" className="h-20 px-10 rounded-[32px] font-black uppercase tracking-[0.2em] italic text-xs opacity-50 hover:opacity-100 transition-opacity">Abort Changes</Button>
                    <AsyncButton 
                        type="submit" 
                        loading={loading} 
                        className="min-w-[280px] h-20 px-12 rounded-[32px] shadow-glow flex items-center justify-center gap-4 group"
                    >
                        <Save className="w-6 h-6 group-hover:scale-110 transition-transform duration-700" />
                        <span className="font-black italic uppercase tracking-[0.2em] text-sm">{loading ? 'Syncing...' : 'Commit Configuration'}</span>
                    </AsyncButton>
                </div>
            </form>
        </PageTransition>
    );
}
