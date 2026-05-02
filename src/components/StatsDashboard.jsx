import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Card } from "./ui/card";
import api from "../lib/api";

gsap.registerPlugin(ScrollTrigger);

export const StatsDashboard = ({ user }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);

    const containerRef = useRef(null);
    const cardsRef = useRef([]);
    const barsRef = useRef([]);

    const syncStats = async () => {
        setLoading(true);
        try {
            // we will use the user handle if provided, else the backend will use the token's user id
            const payload = user?.username ? { username: user.username } : {};
            const { data } = await api.post('/stats/sync', payload);
            if (data.success) {
                setStats(data.stats);
            }
        } catch (e) {
            console.error("Failed to sync stats", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchInitialUserStats = async () => {
            if (user?.stats) {
                setStats(user.stats);
                return;
            }
            try {
                const { data } = await api.get('/users/me');
                if (data?.user?.stats) {
                    setStats(data.user.stats);
                }
            } catch (err) {
                console.error("User not found or not logged in");
            }
        };
        fetchInitialUserStats();
    }, [user]);

    // GSAP ANIMATIONS
    useEffect(() => {
        if (!stats || !containerRef.current) return;

        const ctx = gsap.context(() => {
            // 1. Initial smooth staggered entry for the main Stat Cards
            gsap.fromTo(
                cardsRef.current.filter(Boolean),
                { y: 60, opacity: 0, scale: 0.95 },
                {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    duration: 0.8,
                    stagger: 0.15,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: "top 80%",
                        toggleActions: "play none none reverse"
                    }
                }
            );

            // 2. Bar Chart Elastic Bounce Animation for DSA Topics
            if (barsRef.current.length > 0) {
                barsRef.current.forEach((bar, index) => {
                    if (bar) {
                        const originalWidth = bar.dataset.width; // We'll store final inline width here
                        gsap.fromTo(bar,
                            { width: "0%" },
                            {
                                width: originalWidth,
                                duration: 1.5,
                                delay: index * 0.1, // Stagger sequential fills
                                ease: "elastic.out(1, 0.4)",
                                scrollTrigger: {
                                    trigger: bar.closest(".topic-card-trigger"),
                                    start: "top 85%",
                                    toggleActions: "play none none reverse"
                                }
                            }
                        );
                    }
                });
            }
        }, containerRef);

        // Cleanup safely using context instead of killing ALL ScrollTriggers on the page
        return () => ctx.revert();
    }, [stats]);


    if (!stats) {
        return (
            <Card className="bg-[#0a0a0a]/80 backdrop-blur-xl border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-3xl mb-8 p-6 flex flex-col items-center justify-center min-h-[200px] relative overflow-hidden group hover:border-white/10 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                <h3 className="text-xl text-white mb-4 font-medium tracking-tight">Connect Platforms to See Your Unified Stats</h3>
                <button
                    onClick={syncStats}
                    disabled={loading}
                    className="relative px-6 py-2.5 overflow-hidden rounded-xl bg-white text-black font-medium transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]"
                >
                    {loading ? "Aggregating Data..." : "Load Initial Stats"}
                </button>
            </Card>
        );
    }

    // Reset ref arrays on each render to prevent accumulation of stale DOM nodes
    barsRef.current = [];

    return (
        <div ref={containerRef} className="mb-8 relative z-10 w-full">
            <div className="flex justify-end mb-6 relative z-20">
                <button
                    onClick={syncStats}
                    disabled={loading}
                    className="group relative px-5 py-2 overflow-hidden rounded-xl bg-[#1a1a1a] border border-white/10 text-slate-300 font-medium text-sm transition-all hover:bg-[#222] hover:border-white/20 flex items-center gap-2"
                >
                    {loading ? (
                        <span className="w-4 h-4 border-2 border-slate-500 border-t-white rounded-full animate-spin"></span>
                    ) : (
                        <svg className="w-4 h-4 text-slate-400 group-hover:rotate-180 transition-transform duration-500 ease-out" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    )}
                    <span className="relative z-10">{loading ? "Synchronizing..." : "Sync Platforms"}</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                <div className="lg:col-span-1 space-y-6">
                    <Card
                        ref={el => cardsRef.current[0] = el}
                        className="bg-[#0a0a0a]/60 backdrop-blur-xl border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden group min-h-[360px] hover:border-indigo-500/30 transition-all duration-500"
                    >
                        {/* Subtle interactive glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-indigo-500/20 blur-[60px] rounded-full opacity-0 group-hover:opacity-60 transition-all duration-1000 ease-out pointer-events-none"></div>

                        <h3 className="text-sm font-medium tracking-tight text-slate-400 mb-8 z-10 group-hover:text-indigo-300 transition-colors">Total Solved</h3>

                        <div className="relative flex items-center justify-center w-48 h-48 mb-6 group-hover:scale-[1.05] transition-transform duration-700">
                            {/* Premium Rings */}
                            <div className="absolute inset-0 rounded-full border-[2px] border-white/5 group-hover:border-indigo-500/50 transition-colors duration-500"></div>
                            <div className="absolute inset-2 rounded-full border border-dashed border-white/10 group-hover:border-cyan-500/30 group-hover:animate-[spin_20s_linear_infinite] transition-all duration-500"></div>

                            {/* Inner glassy background */}
                            <div className="absolute inset-4 bg-gradient-to-b from-white/[0.05] to-transparent rounded-full backdrop-blur-md shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]"></div>

                            {/* Content Wrapper */}
                            <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
                                <span className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-400 drop-shadow-[0_2px_10px_rgba(255,255,255,0.1)] tracking-tighter">
                                    {stats.totalSolved || 0}
                                </span>
                            </div>
                        </div>

                        <div className="mt-4 text-center z-10 group-hover:-translate-y-1 transition-transform duration-500">
                            <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-indigo-200 tracking-tight">{stats.cScore || 500}</p>
                            <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider group-hover:text-indigo-400/80 transition-colors">Global C-Score</p>
                        </div>
                    </Card>
                </div>

                {/* Right Column: Other Stats */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <Card ref={el => cardsRef.current[1] = el} className="bg-[#0a0a0a]/60 backdrop-blur-xl border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-3xl p-8 relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-500">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                            <h3 className="text-sm font-medium tracking-tight text-slate-400 mb-6 group-hover:text-emerald-300 transition-colors">Difficulty</h3>
                            <div className="space-y-6 relative z-10">
                                {[
                                    { label: 'Easy', value: stats.easy || 0, color: 'bg-emerald-500' },
                                    { label: 'Medium', value: stats.medium || 0, color: 'bg-amber-500' },
                                    { label: 'Hard', value: stats.hard || 0, color: 'bg-rose-500' }
                                ].map(diff => {
                                    const percentage = `${Math.min(100, (diff.value / ((stats.totalSolved || 1))) * 100)}%`;
                                    return (
                                        <div key={diff.label} className="group/diff cursor-default">
                                            <div className="flex justify-between items-center text-sm mb-2">
                                                <span className="text-slate-400 font-medium">{diff.label}</span>
                                                <span className="text-white font-semibold">{diff.value}</span>
                                            </div>
                                            <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden shadow-inner">
                                                <div
                                                    ref={el => barsRef.current.push(el)}
                                                    data-width={percentage}
                                                    className={`${diff.color} h-full rounded-full topic-card-trigger shadow-[0_0_10px_currentColor]`}
                                                    style={{ width: "0%" }}
                                                >
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </Card>

                        {/* Engagement */}
                        <Card ref={el => cardsRef.current[2] = el} className="bg-[#0a0a0a]/60 backdrop-blur-xl border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-3xl p-8 flex flex-col justify-between group hover:border-cyan-500/30 transition-all duration-500 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                            <div className="relative z-10">
                                <h3 className="text-sm font-medium tracking-tight text-slate-400 mb-6 group-hover:text-cyan-300 transition-colors">Engagement</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5 group-hover:border-cyan-500/20 transition-colors backdrop-blur-sm">
                                        <span className="text-sm text-slate-300 font-medium">Active Days</span>
                                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-cyan-200">{stats.activeDays || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5 group-hover:border-indigo-500/20 transition-colors backdrop-blur-sm">
                                        <span className="text-sm text-slate-300 font-medium">Contests Rated</span>
                                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">{stats.contests || 0}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/10 relative z-10 group-hover:-translate-y-1 transition-transform duration-500">
                                <h4 className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-4 group-hover:text-cyan-400/80 transition-colors">Trophy Case</h4>
                                <div className="flex flex-wrap gap-2">
                                    {stats.awards?.slice(0, 3).map((award, i) => (
                                        <span key={i} className="px-3 py-1.5 bg-yellow-500/10 text-yellow-300 text-xs rounded-lg border border-yellow-500/20 flex items-center gap-2 font-medium shadow-[0_0_15px_rgba(234,179,8,0.1)] hover:scale-105 transition-transform cursor-default">
                                            <span className="drop-shadow-[0_0_8px_rgba(234,179,8,0.6)]">🏆</span> {award}
                                        </span>
                                    ))}
                                    {(!stats.awards || stats.awards.length === 0) && (
                                        <span className="text-xs text-slate-500 opacity-60">No awards yet.</span>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* DSA Topics Bar */}
                    <Card ref={el => cardsRef.current[3] = el} className="bg-[#0a0a0a]/60 backdrop-blur-xl border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-3xl p-8 topic-card-trigger hover:border-rose-500/30 transition-all duration-500 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                        <h3 className="text-sm font-medium tracking-tight text-slate-400 mb-6 group-hover:text-rose-300 transition-colors relative z-10">Top Topics</h3>
                        <div className="flex gap-1 h-3 rounded-full w-full mb-8 bg-white/5 overflow-hidden shadow-inner relative z-10">
                            {Object.entries(stats.dsaTopics || {}).map(([topic, count], i) => {
                                const colors = ['bg-indigo-500', 'bg-sky-500', 'bg-emerald-500', 'bg-rose-500', 'bg-amber-500'];
                                const color = colors[i % colors.length];
                                const totalTopicCount = Object.values(stats.dsaTopics || {}).reduce((a, b) => a + b, 0) || 1;
                                const flexBasis = `${(Math.max(1, count) / totalTopicCount) * 100}%`;
                                return (
                                    <div
                                        key={topic}
                                        ref={el => barsRef.current.push(el)}
                                        data-width={flexBasis}
                                        className={`${color} h-full relative shadow-[0_0_10px_currentColor]`}
                                        style={{ width: "0%" }}
                                        title={`${topic}: ${count}`}
                                    >
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex flex-wrap gap-3 relative z-10">
                            {Object.entries(stats.dsaTopics || {}).map(([topic, count], i) => {
                                const textColors = ['text-indigo-400', 'text-sky-400', 'text-emerald-400', 'text-rose-400', 'text-amber-400'];
                                return (
                                    <div key={topic} className="flex items-center gap-2 text-sm px-3 py-1.5 bg-white/5 backdrop-blur-sm rounded-xl border border-white/5 hover:-translate-y-1 transition-transform cursor-pointer hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                                        <span className={`w-2 h-2 rounded-full ${textColors[i % textColors.length].replace('text-', 'bg-')} shadow-[0_0_8px_currentColor]`}></span>
                                        <span className="text-slate-300 font-medium">{topic}</span>
                                        <span className="text-white font-bold ml-1">{count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
