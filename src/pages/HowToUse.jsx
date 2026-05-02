import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Download, Compass, Zap, Layers, BarChart3, Clock, CheckCircle2, ChevronRight, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

const BenefitCard = ({ icon: Icon, title, desc, index }) => {
    const cardRef = useRef(null);

    useEffect(() => {
        const card = cardRef.current;

        // Magnetic hover + Glow tilt
        const handleMouseMove = (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            gsap.to(card, {
                rotationY: x / 15,
                rotationX: -y / 15,
                x: x / 20,
                y: y / 20,
                transformPerspective: 1000,
                ease: 'power2.out',
                duration: 0.5,
                boxShadow: `0 10px 40px -10px rgba(56, 189, 248, 0.4)`,
                borderColor: 'rgba(56, 189, 248, 0.5)'
            });
        };

        const handleMouseLeave = () => {
            gsap.to(card, {
                rotationY: 0,
                rotationX: 0,
                x: 0,
                y: 0,
                ease: 'elastic.out(1, 0.5)',
                duration: 1.2,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                borderColor: 'rgba(255, 255, 255, 0.05)'
            });
        };

        card.addEventListener('mousemove', handleMouseMove);
        card.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            card.removeEventListener('mousemove', handleMouseMove);
            card.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    return (
        <div
            ref={cardRef}
            className={`benefit-card opacity-0 translate-y-10 group relative p-6 md:p-8 rounded-2xl bg-white/80 dark:bg-black/40 border border-slate-200 dark:border-white/5 backdrop-blur-xl transition-colors duration-300 shadow-sm dark:shadow-none`}
            style={{ willChange: 'transform' }}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />
            <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mb-6 text-sky-400 group-hover:scale-110 group-hover:bg-sky-500/20 transition-all duration-300">
                    <Icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3 group-hover:text-sky-600 dark:group-hover:text-sky-300 transition-colors">{title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed group-hover:text-slate-900 dark:group-hover:text-slate-300 transition-colors">{desc}</p>
            </div>
        </div>
    );
};

const StepItem = ({ stepNumber, icon: Icon, title, desc, delay, alignRight }) => {
    return (
        <div className={`step-row flex flex-col ${alignRight ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-8 md:gap-16 w-full opacity-0`}>
            <div className={`w-full md:w-1/2 flex justify-center ${alignRight ? 'md:justify-start' : 'md:justify-end'}`}>
                <div className="relative group">
                    <div className="absolute -inset-4 bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full blur-xl opacity-20 group-hover:opacity-60 transition duration-500 animate-pulse" />
                    <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 flex items-center justify-center shadow-md dark:shadow-2xl overflow-hidden step-icon-bg transition-colors duration-300">
                        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
                        <Icon size={64} className="text-sky-400 step-icon" />
                    </div>
                </div>
            </div>

            <div className={`w-full md:w-1/2 flex flex-col ${alignRight ? 'text-left md:text-right md:items-end' : 'text-left md:items-start'} z-10`}>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-500 dark:text-sky-400 text-sm font-bold tracking-wider mb-4">
                    STEP <span className="font-mono">{stepNumber}</span>
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">{title}</h3>
                <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-md">{desc}</p>
            </div>
        </div>
    );
};

export const HowToUse = () => {
    const containerRef = useRef(null);
    const titleLinesRef = useRef([]);
    const benefitsRef = useRef(null);
    const stepsContainerRef = useRef(null);

    useEffect(() => {
        // Top-level cleanup
        let ctx = gsap.context(() => {

            // 1. Hero Reveal Animation
            const heroTl = gsap.timeline({ defaults: { ease: 'power4.out' } });

            heroTl.fromTo('.hero-badge',
                { y: -20, opacity: 0, scale: 0.9 },
                { y: 0, opacity: 1, scale: 1, duration: 1, delay: 0.2 }
            )
                .fromTo(titleLinesRef.current,
                    { y: 100, opacity: 0, rotate: 5 },
                    { y: 0, opacity: 1, rotate: 0, duration: 1.2, stagger: 0.15 },
                    "-=0.6"
                )
                .fromTo('.hero-desc',
                    { y: 30, opacity: 0 },
                    { y: 0, opacity: 1, duration: 1 },
                    "-=0.8"
                )
                .fromTo('.hero-cta',
                    { y: 30, opacity: 0, scale: 0.9 },
                    { y: 0, opacity: 1, scale: 1, duration: 0.8, stagger: 0.1, clearProps: 'all' },
                    "-=0.6"
                );

            // 2. Parallax Background Orb
            gsap.to('.hero-orb', {
                yPercent: 30,
                ease: 'none',
                scrollTrigger: {
                    trigger: '.hero-section',
                    start: 'top top',
                    end: 'bottom top',
                    scrub: true
                }
            });

            // 3. Benefits Grid Stagger Reveal
            ScrollTrigger.create({
                trigger: benefitsRef.current,
                start: 'top 80%',
                animation: gsap.to('.benefit-card', {
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    stagger: 0.1,
                    ease: 'power3.out'
                })
            });

            // 4. Step-by-Step Scrub Reveal
            const steps = gsap.utils.toArray('.step-row');
            steps.forEach((step, i) => {
                const icon = step.querySelector('.step-icon');
                const bg = step.querySelector('.step-icon-bg');

                const stepTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: step,
                        start: 'top 75%',
                        end: 'center center',
                        scrub: 1,
                    }
                });

                // The entire block fades and slides up
                stepTl.fromTo(step,
                    { opacity: 0, y: 100 },
                    { opacity: 1, y: 0, ease: 'power2.out' }
                );

                // Icon bounce & scale
                gsap.fromTo(bg,
                    { scale: 0.8, rotation: -10 },
                    {
                        scale: 1, rotation: 0, duration: 1, ease: 'back.out(1.7)',
                        scrollTrigger: {
                            trigger: step,
                            start: 'top 85%',
                            toggleActions: "play none none reverse"
                        }
                    }
                );
            });

        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="min-h-screen bg-slate-50 dark:bg-[#0a0a0f] text-slate-800 dark:text-slate-200 overflow-hidden pt-24 pb-32 transition-colors duration-300">

            {/* Absolute Background Orbs */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-sky-600/10 dark:bg-sky-600/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none hero-orb -z-10" />
            <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-indigo-600/5 dark:bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none -z-10" />

            {/* Hero Section */}
            <section className="hero-section relative max-w-6xl mx-auto px-6 pt-16 md:pt-32 pb-24 text-center z-10 flex flex-col items-center">
                <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sky-500 dark:text-sky-400 text-sm font-medium tracking-wide mb-8 shadow-sm dark:shadow-[0_0_20px_rgba(56,189,248,0.1)] transition-colors duration-300">
                    <Compass size={16} />
                    <span>DSA Compass Web + Extension</span>
                </div>

                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 tracking-tight leading-[1.1] mb-8 drop-shadow-sm dark:drop-shadow-none">
                    <div className="overflow-hidden pb-2"><div ref={el => titleLinesRef.current[0] = el}>Redundancy Khatam Karo.</div></div>
                    <div className="overflow-hidden pb-4"><div ref={el => titleLinesRef.current[1] = el} className="bg-clip-text bg-gradient-to-r from-sky-500 to-indigo-500 dark:from-sky-400 dark:to-indigo-400">DSA Master Karo.</div></div>
                </h1>

                <p className="hero-desc text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed mb-12">
                    Stop solving the same patterns blindly. CodeCanon automatically tracks your solves across platforms, filters redundant questions, and builds your ultimate DSA profile.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-6">
                    <Link to="/signup" className="hero-cta group px-8 py-4 rounded-full bg-sky-500 hover:bg-sky-400 text-white font-bold text-lg transition-all duration-300 shadow-[0_0_30px_rgba(56,189,248,0.4)] hover:shadow-[0_0_40px_rgba(56,189,248,0.6)]">
                        Sign Up for Dashboard
                    </Link>
                </div>
            </section>

            {/* Benefits Grid */}
            <section ref={benefitsRef} className="relative max-w-6xl mx-auto px-6 py-24 z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">Why use the Combo?</h2>
                    <div className="w-24 h-1 bg-gradient-to-r from-sky-500 to-indigo-500 mx-auto rounded-full" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <BenefitCard
                        icon={Zap}
                        title="Auto-Sync Solves"
                        desc="Solve on LeetCode, GFG, or Codeforces. The extension catches it instantly. Zero manual entry."
                        index={0}
                    />
                    <BenefitCard
                        icon={Layers}
                        title="Group Redundancy"
                        desc="The dashboard maps your solve to its canonical parent. Don't waste time on clones."
                        index={1}
                    />
                    <BenefitCard
                        icon={BarChart3}
                        title="Real-Time Stats"
                        desc="Live activity heatmaps, topic mastery radar, and difficulty distribution across all platforms."
                        index={2}
                    />
                    <BenefitCard
                        icon={Clock}
                        title="Save Time"
                        desc="Focus purely on learning new patterns instead of maintaining spreadsheets of your solves."
                        index={3}
                    />
                </div>
            </section>

            {/* Step-by-Step Vertical Timeline */}
            <section ref={stepsContainerRef} className="relative max-w-5xl mx-auto px-6 py-32 z-10">
                <div className="text-center mb-24">
                    <h2 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">How It Works</h2>
                    <p className="text-xl text-slate-600 dark:text-slate-400">Three simple steps to supercharge your DSA prep.</p>
                </div>

                {/* Central Line for Desktop */}
                <div className="hidden md:block absolute left-1/2 top-[300px] bottom-[100px] w-px bg-gradient-to-b from-sky-500/0 via-sky-500/50 to-indigo-500/0 -translate-x-1/2" />

                <div className="flex flex-col gap-24 md:gap-32">
                    <div id="install" className="scroll-mt-32 w-full">
                        <StepItem
                            stepNumber="01"
                            icon={Download}
                            title="Install the Extension"
                            desc="Download the unpacked extension from the repository or Chrome Store. Go to chrome://extensions, enable Developer Mode, and click 'Load Unpacked'."
                            delay={0}
                            alignRight={false}
                        />
                    </div>
                    <StepItem
                        stepNumber="02"
                        icon={CheckCircle2}
                        title="Solve on Any Platform"
                        desc="Write code like you normally do on LeetCode, GFG, Codeforces, etc. When you get an 'Accepted' or 'Correct Answer', the extension beams it to the server instantly."
                        delay={0.2}
                        alignRight={true}
                    />
                    <StepItem
                        stepNumber="03"
                        icon={Activity}
                        title="View Your Dashboard"
                        desc="Log in to CodeCanon. Watch your heatmaps light up, your total solve count jump, and visually see which identical questions you can now skip."
                        delay={0.4}
                        alignRight={false}
                    />
                </div>
            </section>

            {/* Final CTA */}
            <section className="relative max-w-4xl mx-auto px-6 pt-24 pb-12 text-center z-10">
                <div className="p-12 md:p-16 rounded-3xl bg-white dark:bg-gradient-to-b dark:from-slate-900 dark:to-black border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-[0_0_50px_rgba(56,189,248,0.1)] overflow-hidden transition-colors duration-300">
                    <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">Ready to upgrade your workflow?</h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto">
                        Join developers who are using CodeCanon to prep smarter, not harder. Tracking is finally automated.
                    </p>
                    <a href="/CodeCanon-Extension.zip" download="CodeCanon-Extension.zip" className="inline-flex items-center justify-center gap-3 px-10 py-5 rounded-full bg-sky-500 text-white font-bold text-xl hover:bg-sky-400 transition-all shadow-[0_0_40px_rgba(56,189,248,0.5)] hover:shadow-[0_0_60px_rgba(56,189,248,0.7)] group">
                        Get the Combo Now
                        <ChevronRight className="group-hover:translate-x-2 transition-transform" />
                    </a>
                </div>
            </section>

        </div>
    );
};

export default HowToUse;
