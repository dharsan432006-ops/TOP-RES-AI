import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import {
    BarChart3,
    LayoutDashboard,
    Users,
    Settings,
    Search,
    Bell,
    ExternalLink,
    ChevronRight,
    TrendingUp,
    Zap,
    Globe,
    PieChart,
    Activity
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from 'recharts';

const data = [
    { name: 'Mon', value: 4000 },
    { name: 'Tue', value: 3000 },
    { name: 'Wed', value: 2000 },
    { name: 'Thu', value: 2780 },
    { name: 'Fri', value: 1890 },
    { name: 'Sat', value: 2390 },
    { name: 'Sun', value: 3490 },
];

const barData = [
    { name: 'Eng', value: 85 },
    { name: 'Des', value: 65 },
    { name: 'Mar', value: 45 },
    { name: 'Ops', value: 90 },
];

export default function ModernDashboard() {
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    // Parallax effects
    const heroY = useTransform(smoothProgress, [0, 0.2], [0, -100]);
    const heroOpacity = useTransform(smoothProgress, [0, 0.15], [1, 0]);
    const dashboardScale = useTransform(smoothProgress, [0.1, 0.3], [0.8, 1]);
    const dashboardY = useTransform(smoothProgress, [0.1, 0.3], [100, 0]);

    return (
        <div ref={containerRef} className="relative min-h-screen bg-black text-white selection:bg-purple-500/30 overflow-x-hidden font-jakarta">
            {/* Dynamic Background */}
            <div className="fixed inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/20 blur-[120px] rounded-full" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 pointer-events-none" />
            </div>

            {/* Navbar */}
            <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] md:w-[calc(100%-3rem)] max-w-6xl h-20 glass rounded-3xl flex items-center justify-between px-4 md:px-8 z-50">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-cyan-400 flex items-center justify-center">
                        <Zap size={18} className="text-white fill-current" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">Antigravity</span>
                </div>

                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
                    <a href="#" className="hover:text-white transition-colors">Platform</a>
                    <a href="#" className="hover:text-white transition-colors">Solutions</a>
                    <a href="#" className="hover:text-white transition-colors">Intelligence</a>
                    <a href="#" className="hover:text-white transition-colors">Pricing</a>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/login')}
                        className="hidden sm:block text-sm font-medium hover:text-purple-400 transition-colors"
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => navigate('/login')}
                        className="px-5 py-2 rounded-full bg-white text-black text-sm font-semibold hover:bg-gray-200 transition-all active:scale-95"
                    >
                        Get Started
                    </button>
                </div>
            </nav>

            <main className="relative z-10">
                {/* Hero Section */}
                <section className="min-h-screen flex flex-col items-center justify-center px-6 pt-32 pb-20 text-center">
                    <motion.div
                        style={{ y: heroY, opacity: heroOpacity }}
                        className="max-w-4xl"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-purple-400 mb-8"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                            </span>
                            Next-Gen Neural Intelligence
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                            className="text-5xl md:text-8xl font-extrabold tracking-tighter mb-8 leading-[0.95]"
                        >
                            Scale with <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-500 animate-gradient-x">
                                Antigravity Flow
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed"
                        >
                            The first immersive SaaS dashboard built to defy conventional data visualization.
                            Real-time insights wrapped in a high-end neural experience.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
                        >
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-black font-bold text-lg hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:scale-105 transition-all flex items-center justify-center gap-2"
                            >
                                Explore Dashboard <ChevronRight size={20} />
                            </button>
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/5 border border-white/10 font-semibold text-lg hover:bg-white/10 transition-all"
                            >
                                Watch Demo
                            </button>
                        </motion.div>

                        {/* Scroll Indicator */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1, duration: 1 }}
                            className="flex flex-col items-center gap-2 text-gray-500"
                        >
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Scroll to Explore</span>
                            <div className="w-[1px] h-12 bg-gradient-to-b from-purple-500 to-transparent" />
                        </motion.div>
                    </motion.div>
                </section>

                {/* Dashboard Preview Section */}
                <section className="min-h-screen py-16 md:py-24 px-4 md:px-12 flex flex-col items-center">
                    <motion.div
                        style={{ scale: dashboardScale, y: dashboardY }}
                        className="w-full max-w-6xl min-h-[500px] md:aspect-[16/10] glass rounded-[2rem] md:rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden relative"
                    >
                        {/* Mock Dashboard UI */}
                        <div className="absolute inset-0 flex">
                            {/* Sidebar */}
                            <div className="w-64 border-r border-white/5 hidden lg:flex flex-col p-6 gap-8">
                                <div className="flex items-center gap-3 px-2">
                                    <div className="w-8 h-8 rounded bg-white/10" />
                                    <div className="h-4 w-24 bg-white/10 rounded" />
                                </div>
                                <div className="flex flex-col gap-4">
                                    {[LayoutDashboard, Activity, Users, PieChart, Settings].map((Icon, i) => (
                                        <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${i === 0 ? 'bg-purple-600/20 text-purple-400' : 'text-gray-500 hover:text-white hover:bg-white/5 transition-all'}`}>
                                            <Icon size={20} />
                                            <div className={`h-3 w-20 rounded ${i === 0 ? 'bg-purple-400/30' : 'bg-white/5'}`} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Main Content */}
                            <div className="flex-1 flex flex-col min-w-0 bg-black/40">
                                {/* Dashboard Header */}
                                <div className="h-20 border-b border-white/5 flex items-center justify-between px-8">
                                    <div className="flex flex-col gap-1">
                                        <div className="h-5 w-40 bg-white/20 rounded" />
                                        <div className="h-3 w-24 bg-white/5 rounded" />
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 rounded-full bg-white/5 text-gray-400"><Search size={18} /></div>
                                        <div className="p-2 rounded-full bg-white/5 text-gray-400"><Bell size={18} /></div>
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500" />
                                    </div>
                                </div>

                                {/* Dashboard Widgets */}
                                <div className="p-4 md:p-8 grid grid-cols-12 gap-4 md:gap-6 overflow-y-auto custom-scrollbar">
                                    {/* KPI Cards */}
                                    {[
                                        { label: "Active Nodes", val: "12,482", trend: "+12%", color: "purple" },
                                        { label: "Throughput", val: "84.2 GB/s", trend: "+5.4%", color: "cyan" },
                                        { label: "Uptime", val: "99.99%", trend: "0.01%", color: "blue" }
                                    ].map((card, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="col-span-12 md:col-span-4 p-6 glass rounded-3xl border border-white/5"
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{card.label}</span>
                                                <TrendingUp size={16} className={`text-${card.color}-400`} />
                                            </div>
                                            <div className="text-3xl font-bold mb-2">{card.val}</div>
                                            <div className={`text-xs text-${card.color}-400 font-medium`}>{card.trend} vs last month</div>
                                        </motion.div>
                                    ))}

                                    {/* Large Chart */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        className="col-span-12 md:col-span-8 p-6 glass rounded-3xl border border-white/5 min-h-[300px]"
                                    >
                                        <div className="flex items-center justify-between mb-8">
                                            <div className="text-lg font-bold">Network Performance</div>
                                            <div className="flex gap-2">
                                                <div className="px-3 py-1 rounded-full bg-white/5 text-xs text-gray-400">Day</div>
                                                <div className="px-3 py-1 rounded-full bg-purple-600/20 text-xs text-purple-400">Week</div>
                                            </div>
                                        </div>
                                        <div className="h-56 w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={data}>
                                                    <defs>
                                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 10 }} />
                                                    <YAxis hide />
                                                    <Tooltip
                                                        contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                                        itemStyle={{ color: '#8b5cf6' }}
                                                    />
                                                    <Area type="monotone" dataKey="value" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorValue)" strokeWidth={3} />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </motion.div>

                                    {/* Side Widget */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        className="col-span-12 md:col-span-4 p-6 glass rounded-3xl border border-white/5"
                                    >
                                        <div className="text-lg font-bold mb-6">Resource Allocation</div>
                                        <div className="h-56 w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={barData}>
                                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 10 }} />
                                                    <Tooltip
                                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                                        contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                                    />
                                                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                                        {barData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#06b6d4' : '#8b5cf6'} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </div>

                        {/* Floating elements for depth */}
                        <motion.div
                            animate={{ y: [0, -15, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-1/4 -right-12 p-4 glass rounded-2xl border border-white/10 shadow-2xl z-20 flex items-center gap-3"
                        >
                            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                                <Globe size={20} />
                            </div>
                            <div>
                                <div className="text-[10px] text-gray-500 uppercase">Live Traffic</div>
                                <div className="text-sm font-bold">+2.4k users/s</div>
                            </div>
                        </motion.div>

                        <motion.div
                            animate={{ y: [0, 20, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute bottom-1/4 -left-12 p-4 glass rounded-2xl border border-white/10 shadow-2xl z-20 flex items-center gap-3"
                        >
                            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                                <Activity size={20} />
                            </div>
                            <div>
                                <div className="text-[10px] text-gray-500 uppercase">System Status</div>
                                <div className="text-sm font-bold">All Systems Nominal</div>
                            </div>
                        </motion.div>
                    </motion.div>
                </section>

                {/* Features with Scroll Reveal */}
                <section className="py-32 px-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-24">
                            <h2 className="text-4xl md:text-5xl font-bold mb-6">Built for the future of tech</h2>
                            <p className="text-gray-400 text-lg max-w-2xl mx-auto">Everything you need to manage your infrastructure with unparalleled precision and style.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                { title: "Neural Sync", desc: "Automated synchronization with zero latency across all your global points of presence." },
                                { title: "Quantum Analytics", desc: "Advanced predictive modeling that identifies trends before they even happen." },
                                { title: "Ironclad Security", desc: "Multi-layered encryption protocols that keep your most sensitive data safe." }
                            ].map((feat, i) => (
                                <FeatureCard key={i} index={i} title={feat.title} desc={feat.desc} />
                            ))}
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-48 px-6 text-center overflow-hidden">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-purple-600/10 blur-[100px] rounded-full -z-10" />
                        <h2 className="text-5xl md:text-7xl font-bold mb-12 tracking-tighter">Ready to touch <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Antigravity</span>?</h2>
                        <button
                            onClick={() => navigate('/login')}
                            className="px-12 py-5 rounded-full bg-white text-black font-bold text-xl hover:scale-110 hover:shadow-[0_0_50px_rgba(139,92,246,0.3)] transition-all"
                        >
                            Build Your Ecosystem Now
                        </button>
                    </motion.div>
                </section>
            </main>

            <footer className="py-20 px-6 border-t border-white/5 relative z-10">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2">
                        <Zap size={24} className="text-purple-500 fill-current" />
                        <span className="text-xl font-bold">Antigravity</span>
                    </div>
                    <div className="flex gap-8 text-sm text-gray-500">
                        <a href="#" className="hover:text-white">Privacy</a>
                        <a href="#" className="hover:text-white">Terms</a>
                        <a href="#" className="hover:text-white">API Docs</a>
                        <a href="#" className="hover:text-white">Status</a>
                    </div>
                    <div className="text-sm text-gray-500">
                        © 2026 Antigravity Labs. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ title, desc, index }: { title: string, desc: string, index: number, key?: any }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: index * 0.1 }}
            className="p-8 glass rounded-[2.5rem] border border-white/5 hover:border-white/20 transition-all group"
        >
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-purple-600 group-hover:text-white transition-all text-purple-400">
                <Zap size={24} />
            </div>
            <h3 className="text-xl font-bold mb-4">{title}</h3>
            <p className="text-gray-400 leading-relaxed font-light">{desc}</p>
            <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-purple-400 cursor-pointer group-hover:translate-x-1 transition-transform">
                Learn more <ExternalLink size={14} />
            </div>
        </motion.div>
    );
}
