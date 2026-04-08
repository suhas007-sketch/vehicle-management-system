import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { 
  Shield, 
  BarChart3, 
  Users, 
  Navigation, 
  Calendar, 
  FileText, 
  ChevronRight, 
  Play,
  ArrowRight,
  TrendingUp,
  Activity,
  Twitter,
  Linkedin,
  Github
} from 'lucide-react';
import { Link } from 'react-router-dom';
import LandingNav from '../components/layout/LandingNav';

// Live Counter Sub-component
const LiveCounter = ({ target, duration = 2000, suffix = '', prefix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;
    
    let startTime;
    let animationFrame;
    const targetVal = parseFloat(target.replace(/,/g, ''));
    
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      
      if (progress < duration) {
        // easeOutQuart
        const easeProgress = 1 - Math.pow(1 - progress / duration, 4);
        setCount(targetVal * easeProgress);
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(targetVal);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, target, duration]);

  const displayCount = count % 1 !== 0 || target.includes('.') 
    ? count.toFixed(1) 
    : Math.floor(count).toLocaleString();

  return <span ref={ref}>{prefix}{displayCount}{suffix}</span>;
};


export default function Landing() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const brands = ['LOGISTICX', 'VOLVO', 'TRANSIT', 'VELOCITY', 'NEXUS', 'AEROMOVE', 'FREIGHTIQ'];
  const doubledBrands = [...brands, ...brands];

  return (
    <div className="min-h-screen bg-landing-bg text-white overflow-x-hidden selection:bg-primary/30">
      <LandingNav />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">


        {/* Cinematic Glows */}
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="cinematic-glow top-[10%] right-[10%] w-[400px] h-[400px] bg-primary/30 rounded-full blur-[120px] mix-blend-screen"
        ></motion.div>
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="cinematic-glow bottom-[20%] left-[5%] w-[300px] h-[300px] bg-blue-400/20 rounded-full blur-[100px] mix-blend-screen"
        ></motion.div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col gap-8"
            >
              <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface/50 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(59,130,246,0.15)] backdrop-blur-md self-start w-auto">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]"></span>
                Next Gen Fleet Management
              </motion.div>
              
              <motion.h1 variants={itemVariants} className="text-5xl lg:text-7xl font-black font-display leading-[1.05] tracking-tight text-white drop-shadow-2xl">
                Control Your Entire Fleet <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-primary to-indigo-400">From One Intelligent Dashboard</span>
              </motion.h1>

              <motion.p variants={itemVariants} className="text-lg lg:text-xl text-textMuted max-w-lg leading-relaxed font-medium">
                Manage bookings, vehicles, customers, analytics, and live operations with a single premium platform built for modern transport businesses.
              </motion.p>

              <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-5 mt-4">
                <Link to="/register" className="group relative px-8 py-4 rounded-xl font-bold bg-primary overflow-hidden text-white shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:shadow-[0_0_40px_rgba(59,130,246,0.6)] transition-all duration-300">
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                  <div className="relative flex items-center gap-2 z-10">
                    Start Free Trial <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
                <button className="px-8 py-4 rounded-xl font-bold bg-surface/40 border border-white/10 hover:bg-surface hover:border-white/20 transition-all duration-300 flex items-center gap-2 backdrop-blur-md shadow-lg group">
                  <Play className="w-5 h-5 fill-current text-white group-hover:text-primary transition-colors" /> Watch Demo
                </button>
              </motion.div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 50, rotateY: -10 }}
              animate={{ opacity: 1, x: 0, rotateY: 5 }}
              transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
              className="relative perspective-1000 hidden lg:block"
            >
              <div className="relative z-20 transform hover:scale-[1.02] hover:rotateY-0 transition-all duration-700 shadow-2xl w-full aspect-video bg-surface/80 backdrop-blur-2xl rounded-2xl border border-white/10 ring-1 ring-white/5 overflow-hidden flex flex-col">
                <div className="h-10 border-b border-white/5 flex items-center px-4 gap-2 bg-white/[0.02]">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                  <div className="ml-4 h-4 w-32 bg-white/5 rounded-full"></div>
                </div>
                <div className="flex-1 p-6 flex flex-col gap-6">
                  <div className="grid grid-cols-3 gap-4">
                     <div className="h-20 bg-white/5 rounded-xl border border-white/5 p-4 flex flex-col justify-between">
                       <div className="h-2 w-12 bg-white/10 rounded-full"></div>
                       <div className="h-6 w-20 bg-emerald-500/20 rounded-md"></div>
                     </div>
                     <div className="h-20 bg-white/5 rounded-xl border border-white/5 p-4 flex flex-col justify-between">
                       <div className="h-2 w-16 bg-white/10 rounded-full"></div>
                       <div className="h-6 w-16 bg-blue-500/20 rounded-md"></div>
                     </div>
                     <div className="h-20 bg-white/5 rounded-xl border border-white/5 p-4 flex flex-col justify-between">
                       <div className="h-2 w-10 bg-white/10 rounded-full"></div>
                       <div className="h-6 w-24 bg-indigo-500/20 rounded-md"></div>
                     </div>
                  </div>
                  <div className="flex-1 bg-white/5 rounded-xl border border-white/5 relative overflow-hidden flex">
                    {/* Fake Chart Lines */}
                    <div className="absolute inset-0 flex flex-col justify-between py-6 px-4 pointer-events-none opacity-20">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="w-full border-b border-white/20 border-dashed"></div>
                      ))}
                    </div>
                    <div className="w-full h-full flex items-end px-8 gap-4 pt-10">
                       {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                         <motion.div key={i} initial={{ height: 0 }} whileInView={{ height: `${h}%` }} transition={{ duration: 1, delay: i * 0.1 }} className="flex-1 bg-gradient-to-t from-primary/80 to-primary/20 rounded-t-md border-t border-primary/50 relative group">
                            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                         </motion.div>
                       ))}
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-primary/10 via-transparent to-transparent pointer-events-none"></div>
              </div>

              {/* Floating Cards */}
              <motion.div 
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-12 -left-8 glass-card border-white/10 p-5 flex flex-col gap-3 z-30 shadow-[0_10px_30px_rgba(0,0,0,0.3)] bg-surface/80 backdrop-blur-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                    <Activity className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-[11px] text-textMuted uppercase font-bold tracking-widest mb-1">Active Vehicles</div>
                    <div className="text-xl font-black">42 <span className="text-emerald-400 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 ml-1">Live</span></div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-8 -right-8 glass-card border-white/10 p-5 flex flex-col gap-3 z-30 shadow-[0_10px_30px_rgba(0,0,0,0.3)] bg-surface/80 backdrop-blur-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                    <TrendingUp className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-[11px] text-textMuted uppercase font-bold tracking-widest mb-1">Weekly Growth</div>
                    <div className="text-xl font-black text-white">+18.4%</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trusted By Section - Marquee */}
      <section className="py-16 border-y border-white/5 bg-surface/20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-10">
          <p className="text-center text-xs font-black uppercase tracking-[0.25em] text-textMuted">Trusted by Global Mobility Leaders</p>
        </div>
        <div className="relative flex w-full overflow-hidden leading-none">
          {/* Fading Edges */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-landing-bg to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-landing-bg to-transparent z-10 pointer-events-none"></div>
          
          <motion.div 
            className="flex flex-nowrap whitespace-nowrap gap-16 md:gap-32 px-8"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          >
            {doubledBrands.map((brand, i) => (
              <span key={`${brand}-${i}`} className="text-3xl font-black font-display tracking-tighter italic text-white/30 hover:text-white/80 transition-colors duration-500 select-none">
                {brand}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-landing-bg to-landing-bg -z-10"></div>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl lg:text-6xl font-black font-display mb-6 tracking-tight text-gradient"
            >
              Built for High-Growth Fleets
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, delay: 0.1 }}
              className="text-textMuted text-lg font-medium"
            >
              Every tool you need to scale your transportation business, all in one premium interface.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Navigation, title: 'Live Fleet Tracking', desc: 'Real-time GPS tracking and geofencing for your entire fleet with granular precision.' },
              { icon: Calendar, title: 'Smart Bookings', desc: 'Automated reservation system with dynamic pricing, conflict resolution and live availability.' },
              { icon: Users, title: 'Customer Management', desc: 'Centralized directory for all your users with loyalty tracking and automated communication.' },
              { icon: BarChart3, title: 'Real-Time Analytics', desc: 'Predictive insights and performance metrics at your fingertips, updated by the second.' },
              { icon: FileText, title: 'Automated Reports', desc: 'Generate financial and operational reports with a single click or schedule them automatically.' },
              { icon: Shield, title: 'Driver Insights', desc: 'Monitor driver behavior and vehicle health to ensure maximum safety and compliance.' },
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="group relative p-[1px] rounded-3xl bg-gradient-to-br from-white/10 to-transparent hover:from-primary/50 hover:to-primary/10 transition-colors duration-500 overflow-hidden"
              >
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-700"></div>
                <div className="bg-surface/90 h-full w-full rounded-3xl p-10 backdrop-blur-xl relative z-10 flex flex-col items-start border border-white/5">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-blue-600/10 rounded-2xl flex items-center justify-center mb-8 border border-primary/20 group-hover:scale-110 group-hover:bg-primary group-hover:border-primary/50 transition-all duration-500 shadow-xl">
                    <feature.icon className="w-8 h-8 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-2xl font-black mb-4 tracking-tight group-hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="text-textMuted leading-relaxed font-medium group-hover:text-white/80 transition-colors">{feature.desc}</p>
                  
                  <div className="mt-8 flex items-center gap-2 text-primary font-bold text-sm opacity-0 -translate-x-4 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                    Explore Feature <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Analytics Showcase */}
      <section id="analytics" className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-surface/30"></div>
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 blur-[150px] mix-blend-screen rounded-full"
        ></motion.div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="rounded-[2.5rem] overflow-hidden p-[1px] bg-gradient-to-br from-white/20 via-white/5 to-transparent relative group">
            <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-2xl"></div>
            <div className="bg-surface/90 backdrop-blur-3xl rounded-[calc(2.5rem-1px)] p-12 lg:p-24 relative overflow-hidden">
              {/* Internal subtle gradient */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[80px] rounded-full"></div>

              <div className="grid lg:grid-cols-2 gap-20 items-center relative z-10">
                <div>
                  <h2 className="text-4xl lg:text-5xl font-black font-display mb-10 leading-tight tracking-tight">Performance Insights That Drive Revenue</h2>
                  <div className="space-y-10">
                    {[
                      { label: 'Active Trips', value: '2847', isCount: true, growth: '+12%', color: 'from-blue-400 to-blue-600' },
                      { label: 'Fleet Utilization', value: '94', suffix: '%', isCount: true, growth: '+5%', color: 'from-emerald-400 to-emerald-600' },
                      { label: 'Revenue Growth', value: '32.4', prefix: '+', suffix: '%', isCount: true, growth: 'Record', color: 'from-indigo-400 to-indigo-600' },
                    ].map((stat, i) => (
                      <div key={i} className="flex flex-col gap-2 border-b border-white/10 pb-6 group/stat">
                        <div className="flex justify-between items-end">
                          <div>
                            <div className="text-xs font-black text-textMuted uppercase tracking-[0.2em] mb-3 group-hover/stat:text-white/70 transition-colors">{stat.label}</div>
                            <div className={`text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r ${stat.color} drop-shadow-sm`}>
                              {stat.isCount ? (
                                <LiveCounter target={stat.value} prefix={stat.prefix} suffix={stat.suffix} duration={2500 + (i * 500)} />
                              ) : stat.value}
                            </div>
                          </div>
                          <div className="bg-emerald-500/10 text-emerald-400 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-sm ring-1 ring-emerald-500/20">
                            <TrendingUp className="w-4 h-4" /> {stat.growth}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="relative">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="aspect-square bg-landing-bg/50 rounded-[2rem] border border-white/10 p-10 flex flex-col relative overflow-hidden shadow-2xl backdrop-blur-md"
                  >
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
                    
                    <div className="flex justify-between items-center mb-8">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center border border-white/10">
                          <BarChart3 className="w-5 h-5 text-white/50" />
                        </div>
                        <div className="font-bold text-sm">Live Activity</div>
                      </div>
                      <div className="flex gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-red-400"></div>
                        <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                        <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-end gap-6 relative">
                       {/* Grid lines */}
                       <div className="absolute inset-x-0 bottom-0 top-0 flex flex-col justify-between z-0 pointer-events-none border-t border-white/5 pt-4">
                         {[...Array(5)].map((_, i) => (
                           <div key={i} className="w-full border-b border-white/5 h-0 relative">
                             <span className="absolute -left-6 -top-2 text-[10px] text-white/20 font-mono hidden sm:block">{100 - i * 25}</span>
                           </div>
                         ))}
                       </div>

                       {/* Abstract mini charts */}
                       <div className="relative z-10 w-full h-8 rounded-lg overflow-hidden bg-surface group/bar cursor-pointer">
                          <motion.div initial={{ width: 0 }} whileInView={{ width: '85%' }} viewport={{ once:true }} transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }} className="h-full bg-gradient-to-r from-blue-600 to-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)] relative overflow-hidden">
                            <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover/bar:translate-x-full transition-transform duration-1000"></div>
                          </motion.div>
                       </div>
                       <div className="relative z-10 w-full h-8 rounded-lg overflow-hidden bg-surface group/bar cursor-pointer">
                          <motion.div initial={{ width: 0 }} whileInView={{ width: '65%' }} viewport={{ once:true }} transition={{ duration: 1.5, delay: 0.4, ease: "easeOut" }} className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] relative overflow-hidden">
                            <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover/bar:translate-x-full transition-transform duration-1000"></div>
                          </motion.div>
                       </div>
                       <div className="relative z-10 w-full h-8 rounded-lg overflow-hidden bg-surface group/bar cursor-pointer">
                          <motion.div initial={{ width: 0 }} whileInView={{ width: '92%' }} viewport={{ once:true }} transition={{ duration: 1.5, delay: 0.6, ease: "easeOut" }} className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.3)] relative overflow-hidden">
                            <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover/bar:translate-x-full transition-transform duration-1000"></div>
                          </motion.div>
                       </div>
                       
                       {/* Points */}
                       <div className="absolute bottom-6 left-1/4 w-3 h-3 rounded-full bg-white border-2 border-primary shadow-[0_0_10px_rgba(255,255,255,1)] z-20 animate-pulse"></div>
                       <div className="absolute bottom-24 right-1/3 w-3 h-3 rounded-full bg-white border-2 border-emerald-500 shadow-[0_0_10px_rgba(255,255,255,1)] z-20 animate-pulse delay-700"></div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 lg:py-48 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/20 via-landing-bg to-landing-bg -z-10"></div>
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/20 blur-[120px] rounded-[100%] pointer-events-none mix-blend-screen"
        ></motion.div>
        
        <div className="max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex flex-col gap-10 items-center relative z-10 glass-card bg-surface/50 border border-white/10 p-16 lg:p-24 rounded-[3rem] shadow-2xl backdrop-blur-2xl"
          >
            <h2 className="text-5xl lg:text-7xl font-black font-display text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 leading-[1.1] tracking-tight">Run Your Fleet <br /> Like The Future</h2>
            <p className="text-xl text-textMuted max-w-2xl font-medium leading-relaxed">Join innovative transport businesses already using VRMS to optimize their operations, reduce costs, and maximize their revenue.</p>
            <div className="flex flex-wrap justify-center gap-6 mt-4">
              <Link to="/register" className="group relative overflow-hidden bg-white text-slate-900 hover:text-white hover:bg-primary px-10 py-5 rounded-xl font-black text-lg flex items-center gap-3 transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                Get Started Today <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <p className="text-sm font-bold text-textMuted/50 tracking-widest uppercase">No Credit Card Required • 14 Day Free Trial</p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-24 pb-12 bg-surface/50 border-t border-white/10 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
            <div className="col-span-1 lg:col-span-1 flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                  <Shield className="text-white w-6 h-6" />
                </div>
                <span className="font-black text-white tracking-widest text-2xl font-display">VRMS</span>
              </div>
              <p className="text-textMuted text-sm font-medium leading-relaxed">
                The premium fleet management ecosystem designed for modern mobility companies looking to scale flawlessly.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-textMuted hover:text-white hover:bg-white/10 hover:border-white/20 transition-all">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-textMuted hover:text-white hover:bg-white/10 hover:border-white/20 transition-all">
                  <Linkedin className="w-4 h-4" />
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-textMuted hover:text-white hover:bg-white/10 hover:border-white/20 transition-all">
                  <Github className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <h4 className="font-black text-white uppercase tracking-widest text-sm">Product</h4>
              <nav className="flex flex-col gap-4 text-textMuted text-sm font-medium">
                <a href="#" className="hover:text-primary transition-colors">Features</a>
                <a href="#" className="hover:text-primary transition-colors">Pricing</a>
                <a href="#" className="hover:text-primary transition-colors">Integrations</a>
                <a href="#" className="hover:text-primary transition-colors">Changelog</a>
              </nav>
            </div>

            <div className="flex flex-col gap-6">
              <h4 className="font-black text-white uppercase tracking-widest text-sm">Company</h4>
              <nav className="flex flex-col gap-4 text-textMuted text-sm font-medium">
                <a href="#" className="hover:text-primary transition-colors">About Us</a>
                <a href="#" className="hover:text-primary transition-colors">Careers</a>
                <a href="#" className="hover:text-primary transition-colors">Blog</a>
                <a href="#" className="hover:text-primary transition-colors">Contact</a>
              </nav>
            </div>

            <div className="flex flex-col gap-6">
              <h4 className="font-black text-white uppercase tracking-widest text-sm">Legal</h4>
              <nav className="flex flex-col gap-4 text-textMuted text-sm font-medium">
                <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-primary transition-colors">Cookie Policy</a>
                <a href="#" className="hover:text-primary transition-colors">Security</a>
              </nav>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-white/10 text-textMuted text-xs font-bold">
            <p>© {new Date().getFullYear()} VRMS Cloud. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
                All systems operational
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
