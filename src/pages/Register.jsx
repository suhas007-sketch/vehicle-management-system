import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Card, CardContent } from '../components/ui/Card';
import AsyncButton from '../components/ui/AsyncButton';
import { Shield, Mail, Lock, User, ArrowRight, Zap } from 'lucide-react';
import PageTransition from '../components/layout/PageTransition';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register, user } = useContext(AuthContext);
    const navigate = useNavigate();

    React.useEffect(() => {
        if (user) navigate('/app/dashboard');
    }, [user, navigate]);

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const result = await register(name, email, password);
            
            if (result.isPending) {
                // Supabase needs email confirmation
                import('react-hot-toast').then(({ toast }) => {
                    toast.success('Registration successful! Please check your email for confirmation.', {
                        duration: 6000,
                        icon: '📧'
                    });
                });
                setLoading(false);
            } else {
                import('react-hot-toast').then(({ toast }) => {
                    toast.success('Fleet Commander Access Granted.');
                });
                // Let useEffect handle navigation to avoid race conditions
            }
        } catch (err) {
            console.error('Registration Error:', err);
            setError(err.message || 'Registration failed. Check your data.');
            import('react-hot-toast').then(({ toast }) => {
                toast.error(err.message || 'Registration failed.');
            });
            setLoading(false);
        }
    };


    return (
        <PageTransition className="min-h-screen flex items-center justify-center bg-[#050505] p-6 relative overflow-hidden w-full">
            {/* Cinematic Background Elements */}
            <div className="absolute top-0 right-0 w-full h-full -z-10 opacity-30">
                <div className="absolute top-[-15%] right-[-15%] w-[700px] h-[700px] bg-primary/20 rounded-full blur-[140px]" />
                <div className="absolute bottom-[-15%] left-[-15%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />
            </div>
            
            <div className="w-full max-w-lg relative z-10">
                <div className="flex justify-center mb-10">
                    <div className="p-5 bg-white/[0.02] border border-white/5 rounded-[32px] shadow-glow-sm">
                        <Zap className="w-10 h-10 text-primary shadow-glow animate-pulse" />
                    </div>
                </div>

                <Card className="bg-surface-dark/40 border border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.8)] rounded-[48px] overflow-hidden backdrop-blur-xl">
                    <CardContent className="p-12">
                        <div className="text-center mb-10 space-y-3">
                            <h2 className="text-4xl font-black italic uppercase tracking-tighter text-textMain">Register <span className="text-primary">License</span></h2>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-textMuted opacity-50">Create Your Fleet Commander Profile</p>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl mb-8 text-[10px] font-black uppercase tracking-widest text-center italic shadow-glow-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={submitHandler} className="space-y-6">
                            <div className="space-y-3">
                                <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-textMuted ml-1 opacity-50">Operator Designation</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm text-textMain focus:border-primary focus:outline-none transition-all pl-14 font-extrabold italic"
                                        placeholder="Suhas Operator"
                                    />
                                    <User className="w-5 h-5 text-primary/40 absolute left-5 top-1/2 -translate-y-1/2" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-textMuted ml-1 opacity-50">Operational Email</label>
                                <div className="relative">
                                    <input 
                                        type="email" 
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm text-textMain focus:border-primary focus:outline-none transition-all pl-14 font-bold"
                                        placeholder="operator@vrms.ind"
                                    />
                                    <Mail className="w-5 h-5 text-primary/40 absolute left-5 top-1/2 -translate-y-1/2" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-textMuted ml-1 opacity-50">Security Access Key</label>
                                <div className="relative">
                                    <input 
                                        type="password" 
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm text-textMain focus:border-primary focus:outline-none transition-all pl-14 font-bold"
                                        placeholder="••••••••"
                                    />
                                    <Lock className="w-5 h-5 text-primary/40 absolute left-5 top-1/2 -translate-y-1/2" />
                                </div>
                            </div>
                            
                            <div className="pt-4">
                                <AsyncButton 
                                    type="submit" 
                                    loading={loading}
                                    className="w-full h-16 rounded-[24px] shadow-glow gap-3"
                                >
                                    <span className="font-black italic uppercase tracking-widest text-sm">Create Profile</span>
                                    <ArrowRight className="w-5 h-5" />
                                </AsyncButton>
                            </div>
                        </form>

                        <div className="mt-10 text-center pt-8 border-t border-white/5">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-textMuted opacity-50">
                                Existing Operator? <Link to="/login" className="text-primary hover:text-primaryDark transition-all italic ml-2">Authenticate Node</Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>
                
                <div className="mt-8 flex justify-center items-center gap-4 opacity-20">
                    <Shield className="w-4 h-4 text-textMuted" />
                    <span className="text-[8px] font-black uppercase tracking-[0.4em] text-textMuted italic">End-to-End Encrypted Recruitment</span>
                </div>
            </div>
        </PageTransition>
    );
}
