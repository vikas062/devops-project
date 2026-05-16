import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "../lib/api";
import { ConnectPlatformsModal } from "../components/ConnectPlatformsModal";
import { PlatformLogo } from "../components/PlatformLogo";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ExternalLinkIcon } from "lucide-react";
import { CodolioHeatmap } from "../components/CodolioHeatmap";

gsap.registerPlugin(ScrollTrigger);

const GlassCard = ({ children, className = "", delay = 0 }) => {
    return (
        <div className={`profile-stat-card backdrop-blur-lg bg-white/80 border-slate-200 dark:bg-black/40 border dark:border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-[#a855f7]/40 dark:hover:border-[#a855f7]/40 transition-all duration-300 shadow-sm dark:shadow-none flex flex-col ${className}`}>
            {/* Subtle neon glow on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#a855f7]/5 to-[#06b6d4]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            <div className="relative z-10 flex-1 flex flex-col">{children}</div>
        </div>
    );
};

export const Profile = () => {
    const { username } = useParams();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    const containerRef = useRef(null);

    const isOwnProfile = currentUser && profile && currentUser.username === profile.user?.username;

    // Fetch Auth
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem("cc_token");
                if (token) {
                    const { data } = await api.get("/users/me");
                    setCurrentUser(data.user);
                }
            } catch (e) { }
        };
        checkAuth();
    }, []);

    // Load Profile
    useEffect(() => {
        const loadProfile = async () => {
            try {
                setLoading(true);
                const target = username || (currentUser ? currentUser.username : null);
                if (!target) return;

                const { data } = await api.get(`/users/${target}`);
                setProfile(data);

                // Auto-sync if this is own profile and platformsData is empty
                const hasHandles = data.user?.handles && Object.values(data.user.handles).some(h => h);
                const hasPlatformData = data.user?.platformsData && Object.keys(data.user.platformsData).length > 0;
                const isOwn = currentUser && data.user?.username === currentUser.username;
                if (isOwn && hasHandles && !hasPlatformData) {
                    // Fire-and-forget silent sync to populate stats
                    try {
                        const syncData = await api.post("/users/refresh-stats");
                        setProfile(prev => ({
                            ...prev,
                            user: { ...prev.user, stats: syncData.data.stats, platformsData: syncData.data.platformsData },
                            stats: syncData.data.stats
                        }));
                    } catch (syncErr) {
                        console.warn("Auto-sync failed:", syncErr.message);
                    }
                }
            } catch (err) {
                console.error("Profile load error:", err);
                setError(err.response?.data?.message || err.message || "Failed to load profile");
            } finally {
                setLoading(false);
            }
        };
        if (username || currentUser) loadProfile();
    }, [username, currentUser]);

    // GSAP Minimal Animations
    useEffect(() => {
        if (!loading && profile && containerRef.current) {
            let ctx = gsap.context(() => {
                // Intro Avatar & Name
                gsap.fromTo(".profile-intro",
                    { opacity: 0, scale: 0.95, y: 20 },
                    { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: "power3.out" }
                );

                // Stats Cards Stagger
                gsap.fromTo(".profile-stat-card",
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1, y: 0,
                        duration: 0.8, stagger: 0.12, ease: "power4.out",
                        scrollTrigger: { trigger: ".profile-stat-grid", start: "top 85%" }
                    }
                );

                // Card Hover Hooks
                const cards = document.querySelectorAll('.profile-stat-card, .profile-action-btn');
                cards.forEach(card => {
                    card.addEventListener('mouseenter', () => gsap.to(card, { scale: 1.02, duration: 0.3, ease: "power2.out" }));
                    card.addEventListener('mouseleave', () => gsap.to(card, { scale: 1, duration: 0.3, ease: "power2.out" }));
                });
            }, containerRef);
            return () => ctx.revert();
        }
    }, [loading, profile]);

    const handleUpdate = (updatedUser) => {
        setProfile(prev => ({ ...prev, user: updatedUser }));
    };

    const refreshStats = async (silent = false) => {
        try {
            setIsSyncing(true);
            const { data } = await api.post("/users/refresh-stats");
            setProfile(prev => ({
                ...prev,
                user: { ...prev.user, stats: data.stats, platformsData: data.platformsData },
                stats: data.stats
            }));
            if (!silent) setTimeout(() => alert("Stats synced from all connected platforms!"), 100);
        } catch (err) {
            console.error("Failed to refresh stats", err);
            if (!silent) alert("Failed to sync stats.");
        } finally {
            setIsSyncing(false);
        }
    };

    if (loading && !profile) return <div className="text-center py-20 text-slate-400 bg-[#000] min-h-screen">Loading Profile...</div>;
    if (error) return <div className="text-center py-20 text-rose-400 bg-[#000] min-h-screen">{error}</div>;
    if (!profile) return <div className="text-center py-20 text-slate-400 bg-[#000] min-h-screen">User not found</div>;

    const { user, stats } = profile;
    const platforms = ["LeetCode", "GFG", "Codeforces", "CodeChef", "AtCoder", "HackerRank"];

    const getPlatformUrl = (platform, handle) => {
        switch (platform.toLowerCase()) {
            case 'leetcode': return `https://leetcode.com/u/${handle}`;
            case 'gfg': return `https://auth.geeksforgeeks.org/user/${handle}`;
            case 'codeforces': return `https://codeforces.com/profile/${handle}`;
            case 'codechef': return `https://www.codechef.com/users/${handle}`;
            case 'atcoder': return `https://atcoder.jp/users/${handle}`;
            case 'hackerrank': return `https://www.hackerrank.com/profile/${handle}`;
            case 'github': return `https://github.com/${handle}`;
            default: return "#";
        }
    };

    // Calculate difficulty — prefer aggregated stats, fallback to LeetCode raw data
    const lcEasy = user.stats?.easySolved || user.platformsData?.leetcode?.easy || 0;
    const lcMed = user.stats?.mediumSolved || user.platformsData?.leetcode?.medium || 0;
    const lcHard = user.stats?.hardSolved || user.platformsData?.leetcode?.hard || 0;
    const totDiff = lcEasy + lcMed + lcHard || 1; // Prevent div by zero

    // Real streak & activity from stats
    const maxStreak = user.stats?.maxStreak || 0;
    const currentStreak = user.stats?.currentStreak || 0;
    const totalSolved = stats?.totalSolved || user?.stats?.totalSolved || stats?.grandTotal || user?.stats?.grandTotal || 0;
    const activeDays = stats?.activeDays || user?.stats?.activeDays || 0;

    return (
        <div className="bg-slate-50 dark:bg-[#050508] min-h-screen text-slate-900 dark:text-slate-200 font-sans selection:bg-[#a855f7]/30 transition-colors duration-300" ref={containerRef}>
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-10 lg:py-16 flex flex-col lg:flex-row gap-8 lg:gap-12">

                {/* Left Side: Compact Profile Profile */}
                <div className="w-full lg:w-72 flex-shrink-0 profile-intro lg:sticky lg:top-10 h-max">
                    <div className="backdrop-blur-xl bg-white/80 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-3xl p-8 flex flex-col items-center text-center shadow-sm dark:shadow-[0_0_40px_rgba(0,0,0,0.5)] relative overflow-hidden transition-colors duration-300">
                        {/* Glow Behind Avatar */}
                        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-32 h-32 bg-[#a855f7]/10 dark:bg-[#a855f7]/20 blur-[60px] rounded-full pointer-events-none"></div>

                        {/* Circular Avatar */}
                        <div className="relative mb-6">
                            <div className="h-28 w-28 rounded-full p-[2px] bg-gradient-to-tr from-[#a855f7] via-[#06b6d4] to-transparent">
                                <div className="h-full w-full rounded-full bg-slate-100 dark:bg-[#0a0a0f] overflow-hidden flex items-center justify-center relative z-10">
                                    {user.avatar ?
                                        <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" /> :
                                        <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-slate-800 to-slate-500 dark:from-white dark:to-slate-400">{user.username?.[0]?.toUpperCase()}</span>
                                    }
                                </div>
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-1">{user.name}</h2>
                        <div className="flex items-center gap-2 mb-8">
                            <span className="text-slate-500 dark:text-slate-400 text-sm">@{user.username}</span>
                            <span className="bg-slate-900/5 dark:bg-white/10 text-slate-800 dark:text-white text-[10px] px-2 py-0.5 rounded-full border border-slate-900/10 dark:border-white/10 shadow-sm dark:shadow-[0_0_10px_rgba(255,255,255,0.05)]">PRO</span>
                        </div>

                        {isOwnProfile && (
                            <div className="w-full space-y-3">
                                <button onClick={() => setIsModalOpen(true)} className="profile-action-btn w-full py-2.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-xl transition-colors border border-slate-200 dark:border-white/10">
                                    Edit Profile
                                </button>
                                <button onClick={refreshStats} disabled={isSyncing} className="profile-action-btn w-full py-2.5 bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-gray-200 text-sm font-semibold rounded-xl transition-colors flex justify-center items-center gap-2 shadow-sm dark:shadow-[0_0_15px_rgba(255,255,255,0.2)] disabled:opacity-50">
                                    {isSyncing ? "Syncing..." : "Sync Stats"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Clean Stats Grid */}
                <div className="flex-1 space-y-6 profile-stat-grid">

                    {/* Top Row: Core Numbers */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Total Solved */}
                        <GlassCard className="flex flex-col justify-center items-center text-center pb-8 pt-10">
                            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-6">Total Solved</h3>
                            <div className="relative">
                                {/* Orb Glow */}
                                <div className="absolute inset-0 bg-[#06b6d4]/20 blur-[40px] rounded-full scale-150"></div>
                                <span className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-b from-slate-800 to-slate-500 dark:from-white dark:to-slate-400 drop-shadow-sm dark:drop-shadow-lg tracking-tighter relative z-10 flex flex-col items-center">
                                    {totalSolved}
                                </span>
                            </div>
                            {isSyncing
                                ? <span className="text-xs text-amber-500 font-medium mt-6 animate-pulse">Syncing platforms...</span>
                                : totalSolved > 0
                                    ? <span className="text-xs text-[#06b6d4] font-medium mt-6 bg-[#06b6d4]/10 px-3 py-1 rounded-full border border-[#06b6d4]/20 relative z-10">Across all platforms</span>
                                    : <span className="text-xs text-slate-500 font-medium mt-6">Connect platforms &amp; sync</span>
                            }
                        </GlassCard>

                        {/* Active Days */}
                        <GlassCard className="flex flex-col justify-between">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Consistency</h3>
                                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-100 dark:bg-emerald-400/10 px-2 py-1 rounded border border-emerald-200 dark:border-emerald-400/20">{activeDays} Days</span>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-slate-500 text-xs mb-1">Max Streak</p>
                                    <p className="text-3xl font-bold text-slate-800 dark:text-white">{maxStreak} 🔥</p>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-white/5 h-1.5 rounded-full overflow-hidden">
                                    <div
                                        className="bg-[#06b6d4] h-full shadow-[0_0_10px_#06b6d4] transition-all duration-700"
                                        style={{ width: activeDays > 0 ? `${Math.min(100, (currentStreak / Math.max(maxStreak, 1)) * 100)}%` : '0%' }}
                                    />
                                </div>
                                <p className="text-[10px] text-slate-500">Current streak: <span className="text-[#06b6d4] font-semibold">{currentStreak} days</span></p>
                            </div>
                        </GlassCard>
                    </div>

                    {/* Middle Row: Difficulty & Heatmap */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* Difficulty Bars */}
                        <GlassCard className="flex flex-col h-full">
                            <h3 className="text-sm font-semibold text-slate-800 dark:text-white tracking-tight mb-6">Problem Difficulty</h3>
                            <div className="flex-1 flex flex-col justify-around space-y-2 py-4">
                                {[
                                    { label: 'Easy', value: lcEasy, color: 'bg-[#06b6d4]', shadow: 'shadow-[0_0_10px_#06b6d4]' },
                                    { label: 'Medium', value: lcMed, color: 'bg-[#a855f7]', shadow: 'shadow-[0_0_10px_#a855f7]' },
                                    { label: 'Hard', value: lcHard, color: 'bg-rose-500', shadow: 'shadow-[0_0_10px_#f43f5e]' }
                                ].map(diff => {
                                    const percent = totDiff > 1 ? (diff.value / totDiff) * 100 : 0;
                                    return (
                                        <div key={diff.label} className="w-full">
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-slate-500 dark:text-slate-400 font-medium">{diff.label}</span>
                                                <span className="text-slate-800 dark:text-white font-bold">{diff.value}</span>
                                            </div>
                                            <div className="w-full bg-slate-200 dark:bg-white/5 h-2.5 rounded-full overflow-hidden shadow-inner">
                                                <div className={`${diff.color} h-full rounded-full ${diff.shadow}`} style={{ width: `${percent}%` }}></div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </GlassCard>

                        {/* Connected Accounts & Platform Breakdown */}
                        <GlassCard className="flex flex-col">
                            <h3 className="text-sm font-semibold text-slate-800 dark:text-white tracking-tight mb-6 flex items-center justify-between">
                                Platform Stats
                                <span className="text-[10px] text-slate-500 dark:text-slate-500 uppercase tracking-widest font-medium">Synced</span>
                            </h3>
                            <div className="flex flex-col gap-3 flex-1">
                                {platforms.map(p => {
                                    const pKey = p.toLowerCase();
                                    const handle = user.handles?.[pKey];
                                    const pData = user.platformsData?.[pKey];
                                    const hasData = pData?.totalSolved > 0 || pData?.rating > 0;
                                    const isLinked = !!handle;

                                    if (!isLinked) return null;

                                    return (
                                        <a key={p} href={getPlatformUrl(p, handle)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 flex-wrap sm:flex-nowrap gap-3 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/10 transition-colors group/link shadow-sm dark:shadow-none">
                                            <div className="flex items-center gap-3">
                                                <PlatformLogo platform={p} className="h-6 w-6 opacity-80 group-hover/link:opacity-100 transition-opacity" />
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover/link:text-slate-900 dark:group-hover/link:text-white transition-colors">{p}</span>
                                                    <span className="text-[10px] text-slate-500">{handle}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-5 sm:gap-6 ml-auto">
                                                {hasData && (
                                                    <div className="flex items-center gap-4 sm:gap-5 text-right">
                                                        {pData?.totalSolved > 0 && (
                                                            <div className="flex flex-col justify-center mt-[2px]">
                                                                <span className="text-[10px] text-slate-500 uppercase tracking-widest leading-none mb-1">Solved</span>
                                                                <span className="text-[15px] font-bold text-slate-800 dark:text-white leading-none">{pData.totalSolved}</span>
                                                            </div>
                                                        )}
                                                        {pData?.rating > 0 && (
                                                            <div className="flex flex-col justify-center mt-[2px]">
                                                                <span className="text-[10px] text-slate-500 uppercase tracking-widest leading-none mb-1">Rating</span>
                                                                <span className="text-[15px] font-bold text-indigo-400 leading-none">{pData.rating}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                <div className="text-[10px] tracking-wide text-emerald-400/70 font-medium px-2.5 py-1 border border-emerald-400/10 bg-emerald-500/[0.03] rounded-full flex items-center justify-center">
                                                    Linked
                                                </div>
                                            </div>
                                        </a>
                                    );
                                })}
                            </div>
                            {(!user.handles || Object.keys(user.handles).length === 0) && (
                                <div className="text-sm text-slate-500 flex items-center justify-center h-full">No platforms connected yet.</div>
                            )}
                        </GlassCard>
                    </div>

                    {/* Full Width Bottom: Heatmap */}
                    <GlassCard>
                        <CodolioHeatmap
                            totalSolved={totalSolved}
                            activeDays={activeDays}
                            maxStreak={maxStreak}
                            currentStreak={currentStreak}
                        />
                    </GlassCard>

                </div>
            </div>

            <ConnectPlatformsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                user={user}
                onUpdate={handleUpdate}
                onSync={refreshStats}
            />
        </div>
    );
};
