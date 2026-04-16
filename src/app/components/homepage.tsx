import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'motion/react';
import {
    ChevronDown,
    AlertTriangle,
    Clock,
    EyeOff,
    FileText,
    ShieldCheck,
    Vote,
    Wrench,
    Megaphone,
    CalendarCheck,
    LayoutDashboard,
    Activity,
    Lock,
    CheckCircle,
    GraduationCap,
    ArrowRight,
    ChevronRight
} from 'lucide-react';

const COLLEGE_NAME = (import.meta.env.VITE_COLLEGE_EMAIL_DOMAIN || 'college.edu').split('.')[0].toUpperCase();

/* ─── types ─── */
interface HomepageProps {
    onGetStarted: () => void;
    onSignIn: () => void;
}

/* ─── scroll reveal wrapper ─── */
function Reveal({
    children,
    delay = 0,
    direction = 'up',
    className = ''
}: {
    children: React.ReactNode;
    delay?: number;
    direction?: 'up' | 'down' | 'left' | 'right' | 'scale';
    className?: string;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-60px' });

    const variants: Record<string, { x?: number; y?: number; scale?: number }> = {
        up: { y: 50 },
        down: { y: -50 },
        left: { x: -50 },
        right: { x: 50 },
        scale: { scale: 0.92 }
    };

    const offset = variants[direction];

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, ...offset }}
            animate={isInView ? { opacity: 1, x: 0, y: 0, scale: 1 } : {}}
            transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    );
}



/* ═══════════════════════════════════════════
   HOMEPAGE — Reasonal.co-inspired
   ═══════════════════════════════════════════ */
export function Homepage({ onGetStarted, onSignIn }: HomepageProps) {
    const [navSolid, setNavSolid] = useState(false);

    useEffect(() => {
        const handler = () => setNavSolid(window.scrollY > 40);
        window.addEventListener('scroll', handler, { passive: true });
        return () => window.removeEventListener('scroll', handler);
    }, []);

    const problems = [
        { icon: AlertTriangle, title: 'Broken Infrastructure', text: 'Damaged furniture, faulty wiring, and leaking pipes go unnoticed for weeks.', bg: 'bg-red-50', iconBg: 'bg-red-100', iconColor: 'text-red-600' },
        { icon: Clock, title: 'Slow Response Times', text: 'Critical issues get buried — no prioritization means nothing gets fixed on time.', bg: 'bg-amber-50', iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
        { icon: EyeOff, title: 'Zero Transparency', text: 'Students never know if complaints land. Trust erodes, voices go silent.', bg: 'bg-violet-50', iconBg: 'bg-violet-100', iconColor: 'text-violet-600' }
    ];

    const steps = [
        { icon: FileText, num: '01', title: 'Report', time: 'Mon–Fri', text: 'Spot something broken? Report it with category, location, and images.', color: '#3b82f6' },
        { icon: ShieldCheck, num: '02', title: 'Verify', time: 'Admin Review', text: 'Admins review & verify every report to ensure accuracy.', color: '#8b5cf6' },
        { icon: Vote, num: '03', title: 'Vote', time: 'Every Saturday', text: 'Students cast one vote for the most critical issue of the week.', color: '#ec4899' },
        { icon: Wrench, num: '04', title: 'Resolve', time: 'Authority Action', text: 'Top-voted issues get escalated with full tracking and transparency.', color: '#10b981' }
    ];

    const features = [
        { icon: Megaphone, title: 'Issue Reporting', text: 'Detailed reports with categories, locations, and image proof', bg: 'bg-blue-100', color: 'text-blue-700' },
        { icon: CalendarCheck, title: 'Weekly Voting', text: 'Democratic weekly prioritization — one student, one vote', bg: 'bg-purple-100', color: 'text-purple-700' },
        { icon: LayoutDashboard, title: 'Admin Dashboard', text: 'Verify, manage, and track all reported campus issues', bg: 'bg-emerald-100', color: 'text-emerald-700' },
        { icon: Activity, title: 'Real-time Tracking', text: 'Live status: Pending → Verified → Ongoing → Completed', bg: 'bg-orange-100', color: 'text-orange-700' },
        { icon: Lock, title: 'Role-Based Access', text: 'Separate workflows for Students, Admins & Administration', bg: 'bg-pink-100', color: 'text-pink-700' },
        { icon: CheckCircle, title: 'Transparent Resolution', text: 'Every step is visible — no more complaints vanishing', bg: 'bg-indigo-100', color: 'text-indigo-700' }
    ];



    return (
        <div className="min-h-screen" style={{ background: '#F8F6F3' }}>

            {/* ══════════ FLOATING PILL NAVBAR ══════════ */}
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-3xl">
                <nav className={`floating-nav flex items-center justify-between px-3 py-2 ${navSolid ? 'shadow-lg' : ''}`}>
                    <div className="flex items-center gap-2 pl-2">
                        <div className="bg-[#1A1A2E] p-1.5 rounded-xl">
                            <GraduationCap className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-archivo font-bold text-[#1A1A2E] text-base">Let'sFix</span>
                    </div>

                    <div className="hidden sm:flex items-center gap-1 text-sm font-medium text-[#1A1A2E]/60">
                        <a href="#about" className="px-3 py-1.5 rounded-full hover:bg-black/5 transition-colors">About</a>
                        <a href="#how-it-works" className="px-3 py-1.5 rounded-full hover:bg-black/5 transition-colors">How It Works</a>
                        <a href="#features" className="px-3 py-1.5 rounded-full hover:bg-black/5 transition-colors">Features</a>
                    </div>

                    <div className="flex items-center gap-2">
                        <button onClick={onSignIn} className="px-4 py-2 text-sm font-semibold text-[#1A1A2E]/70 hover:text-[#1A1A2E] rounded-full hover:bg-black/5 transition-all">
                            Sign In
                        </button>
                        <button onClick={onGetStarted} className="btn-pill-primary !py-2 !px-5 !text-sm">
                            Get Started
                        </button>
                    </div>
                </nav>
            </div>

            {/* ══════════ 1. HERO — Sky Blue ══════════ */}
            <section className="section-block bg-pastel-blue mx-3 sm:mx-6 mt-3" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: '6rem' }}>
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/50 text-[#1A1A2E]/70 text-sm font-semibold mb-8 border border-white/60">
                            <GraduationCap className="w-4 h-4" />
                            {COLLEGE_NAME} Campus Platform
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        className="font-archivo text-[#1A1A2E] font-black leading-[1.05] tracking-tight mb-6"
                        style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}
                    >
                        Like suggestion box,
                        <br />
                        but for{' '}
                        <span className="gradient-text-warm">real change</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.25 }}
                        className="text-[#1A1A2E]/60 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
                    >
                        Report campus issues, vote on priorities every Saturday,
                        and watch your campus actually transform — with full transparency.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <button onClick={onGetStarted} className="btn-pill-primary text-lg !py-4 !px-8">
                            Get Started <ArrowRight className="w-5 h-5" />
                        </button>
                        <a href="#about" className="btn-pill-secondary text-lg !py-4 !px-8">
                            Learn More
                        </a>
                    </motion.div>
                </div>

                <div className="flex justify-center mt-16">
                    <a href="#about" className="scroll-indicator flex flex-col items-center gap-1 text-[#1A1A2E]/30">
                        <span className="text-xs font-semibold tracking-widest uppercase">Scroll</span>
                        <ChevronDown className="w-5 h-5" />
                    </a>
                </div>
            </section>

            {/* ══════════ 2. THE PROBLEM — Peach ══════════ */}
            <section className="section-block bg-pastel-peach mx-3 sm:mx-6 mt-4" id="about">
                <div className="max-w-5xl mx-auto">
                    <Reveal className="text-center mb-14">
                        <span className="font-archivo font-bold text-sm tracking-widest uppercase text-[#1A1A2E]/40 mb-3 block">Why Let'sFix?</span>
                        <h2 className="font-archivo text-[#1A1A2E] font-black text-3xl sm:text-5xl mb-4">
                            Campus issues are invisible
                        </h2>
                        <p className="text-[#1A1A2E]/50 text-lg max-w-xl mx-auto">
                            Every day, students face problems that never reach the right people. Here's why things stay broken.
                        </p>
                    </Reveal>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {problems.map((p, i) => (
                            <Reveal key={p.title} delay={i * 0.12} direction="up">
                                <div className={`pill-card ${p.bg} h-full`}>
                                    <div className={`feature-icon ${p.iconBg} ${p.iconColor} mb-4`}>
                                        <p.icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-archivo font-bold text-[#1A1A2E] text-lg mb-2">{p.title}</h3>
                                    <p className="text-[#1A1A2E]/55 text-sm leading-relaxed">{p.text}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════ 3. HOW IT WORKS — Green ══════════ */}
            <section className="section-block bg-pastel-green mx-3 sm:mx-6 mt-4" id="how-it-works">
                <div className="max-w-4xl mx-auto">
                    <Reveal className="text-center mb-16">
                        <span className="font-archivo font-bold text-sm tracking-widest uppercase text-[#1A1A2E]/40 mb-3 block">How It Works</span>
                        <h2 className="font-archivo text-[#1A1A2E] font-black text-3xl sm:text-5xl mb-4">
                            From complaint to resolution
                        </h2>
                        <p className="text-[#1A1A2E]/50 text-lg max-w-xl mx-auto">
                            A simple 4-step cycle that runs every week — powered by student voices.
                        </p>
                    </Reveal>

                    <div className="space-y-6">
                        {steps.map((step, i) => (
                            <Reveal key={step.title} delay={i * 0.15} direction="left">
                                <div className="pill-card bg-white/50 flex flex-col sm:flex-row items-start gap-5">
                                    <div className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-white font-archivo font-black text-lg"
                                        style={{ backgroundColor: step.color }}>
                                        <step.icon className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="font-archivo font-black text-[#1A1A2E]/20 text-sm">{step.num}</span>
                                            <h3 className="font-archivo font-bold text-[#1A1A2E] text-xl">{step.title}</h3>
                                            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/70 text-[#1A1A2E]/50">{step.time}</span>
                                        </div>
                                        <p className="text-[#1A1A2E]/55 text-sm leading-relaxed">{step.text}</p>
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════ 4. FEATURES — Lavender ══════════ */}
            <section className="section-block bg-pastel-lavender mx-3 sm:mx-6 mt-4" id="features">
                <div className="max-w-5xl mx-auto">
                    <Reveal className="text-center mb-14">
                        <span className="font-archivo font-bold text-sm tracking-widest uppercase text-[#1A1A2E]/40 mb-3 block">Features</span>
                        <h2 className="font-archivo text-[#1A1A2E] font-black text-3xl sm:text-5xl mb-4">
                            Everything you need for campus change
                        </h2>
                        <p className="text-[#1A1A2E]/50 text-lg max-w-xl mx-auto">
                            Built with role-based workflows for students, admins, and administration.
                        </p>
                    </Reveal>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {features.map((f, i) => (
                            <Reveal key={f.title} delay={i * 0.08} direction="scale">
                                <div className="pill-card bg-white/50 h-full">
                                    <div className={`feature-icon ${f.bg} ${f.color} mb-4`}>
                                        <f.icon className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-archivo font-bold text-[#1A1A2E] text-base mb-1.5">{f.title}</h3>
                                    <p className="text-[#1A1A2E]/50 text-sm leading-relaxed">{f.text}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>



            {/* ══════════ 7. FINAL CTA — Charcoal ══════════ */}
            <section className="section-block bg-charcoal mx-3 sm:mx-6 mt-4 text-center" style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="max-w-2xl mx-auto">
                    <Reveal direction="scale">
                        <span className="font-archivo font-bold text-xs tracking-widest uppercase text-white/30 mb-4 block">YES, YOU</span>
                        <h2 className="font-archivo text-white font-black text-3xl sm:text-5xl mb-4">
                            Ready to fix your campus?
                        </h2>
                        <p className="text-white/40 text-lg mb-10 max-w-lg mx-auto">
                            Join thousands of students already making a difference. Report, vote, track — it all starts with you.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button onClick={onGetStarted} className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#1A1A2E] font-bold rounded-full text-lg transition-all hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(255,255,255,0.15)]">
                                Create Account <ArrowRight className="w-5 h-5" />
                            </button>
                            <button onClick={onSignIn} className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white/20 text-white/70 hover:text-white hover:border-white/40 font-semibold rounded-full text-lg transition-all hover:-translate-y-1">
                                Sign In <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ══════════ FOOTER ══════════ */}
            <footer className="py-10 px-6">
                <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="bg-[#1A1A2E] p-1.5 rounded-xl">
                            <GraduationCap className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-archivo font-bold text-[#1A1A2E]">Let'sFix</span>
                        <span className="text-[#1A1A2E]/30 text-sm ml-1">Campus Issue Resolution Platform</span>
                    </div>
                    <p className="text-[#1A1A2E]/30 text-sm">
                        Built with ❤️ for {COLLEGE_NAME} College · © {new Date().getFullYear()}
                    </p>
                </div>
            </footer>
        </div>
    );
}
