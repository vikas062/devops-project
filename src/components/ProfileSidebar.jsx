import { PlatformLogo } from "./PlatformLogo";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";

export const ProfileSidebar = ({ user, isOwnProfile, onEdit, onSync, isSyncing }) => {
    const platforms = ["LeetCode", "CodeChef", "Codeforces", "AtCoder", "HackerRank", "GFG", "SPOJ", "HackerEarth"];

    const getPlatformUrl = (platform, handle) => {
        if (!handle) return "#";
        switch (platform.toLowerCase()) {
            case 'leetcode': return `https://leetcode.com/u/${handle}`;
            case 'codechef': return `https://www.codechef.com/users/${handle}`;
            case 'codeforces': return `https://codeforces.com/profile/${handle}`;
            case 'atcoder': return `https://atcoder.jp/users/${handle}`;
            case 'hackerrank': return `https://www.hackerrank.com/profile/${handle}`;
            case 'gfg': return `https://auth.geeksforgeeks.org/user/${handle}/practice`;
            case 'spoj': return `https://www.spoj.com/users/${handle}`;
            case 'hackerearth': return `https://www.hackerearth.com/@${handle}`;
            case 'github': return `https://github.com/${handle}`;
            default: return '#';
        }
    };

    return (
        <div className="space-y-6">
            {/* User Card */}
            <Card className="bg-[#0a0a0a]/60 backdrop-blur-xl border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-3xl p-8 flex flex-col items-center text-center relative overflow-hidden transition-all duration-500 hover:border-white/10 group">
                {/* Subtle top glow */}
                <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>

                <div className="relative mb-6 group/avatar">
                    <div className="relative h-28 w-28 rounded-full p-[3px] bg-slate-800 transition-all duration-500 hover:scale-105">
                        {/* Rotating gradient ring */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-500 opacity-50 group-hover/avatar:opacity-100 group-hover/avatar:animate-[spin_4s_linear_infinite] transition-opacity duration-500"></div>

                        <div className="absolute inset-[3px] rounded-full bg-[#0a0a0a] overflow-hidden flex items-center justify-center z-10 shadow-inner">
                            {user.avatar ?
                                <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" /> :
                                <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-400">{user.username?.[0]?.toUpperCase()}</span>
                            }
                        </div>
                    </div>
                </div>

                <h2 className="text-xl font-bold text-white tracking-tight mb-1 relative z-10">{user.name}</h2>
                <div className="flex items-center gap-2 mb-6 relative z-10">
                    <span className="text-slate-400 text-sm font-medium">@{user.username}</span>
                    <Badge variant="secondary" className="bg-white/10 backdrop-blur-md text-white text-[10px] h-4 px-1.5 border border-white/10 shadow-[0_0_10px_rgba(255,255,255,0.05)]">
                        PRO
                    </Badge>
                </div>

                <div className="w-full flex justify-center gap-4 mb-8">
                    <a href={`mailto:${user.email || ""}`} className="text-slate-500 hover:text-white transition-colors"><MailIcon className="h-4 w-4" /></a>
                    <a href={user.linkedin || "#"} className="text-slate-500 hover:text-white transition-colors"><LinkedinIcon className="h-4 w-4" /></a>
                </div>

                {isOwnProfile && (
                    <div className="w-full space-y-3 relative z-10">
                        <button onClick={onEdit} className="w-full py-2.5 bg-white/5 hover:bg-white/10 backdrop-blur-md text-slate-300 hover:text-white text-sm font-medium rounded-xl transition-all border border-white/10 shadow-inner">
                            Edit Profile
                        </button>
                        <button onClick={onSync} disabled={isSyncing} className="w-full py-2.5 bg-white hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed text-black text-sm font-medium rounded-xl transition-all flex justify-center items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:scale-[1.02] active:scale-95">
                            {isSyncing ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-slate-400 border-t-black rounded-full animate-spin" />
                                    Synchronizing...
                                </>
                            ) : "Sync Stats"}
                        </button>
                    </div>
                )}
            </Card>

            {/* Problem Solving Stats List */}
            <Card className="bg-[#0a0a0a]/60 backdrop-blur-xl border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-3xl overflow-hidden hover:border-white/10 transition-all duration-500 group">
                <div className="px-6 py-4 bg-white/[0.02] border-b border-white/5 flex justify-between items-center group-hover:bg-white/[0.04] transition-colors">
                    <h3 className="text-sm font-medium text-slate-300 tracking-tight">Connected Accounts</h3>
                </div>
                <div className="p-3 space-y-1">
                    {platforms.map(p => {
                        const pKey = p.toLowerCase();
                        const handle = user.handles?.[pKey];
                        const stats = user.platformsData?.[pKey];
                        const hasSolved = stats?.totalSolved > 0;
                        const isLinked = !!handle;
                        const profileUrl = isLinked ? getPlatformUrl(p, handle) : "#";

                        const Content = (
                            <div className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl cursor-pointer hover:shadow-[0_0_15px_rgba(255,255,255,0.03)] transition-all duration-300 w-full">
                                <div className="flex items-center gap-3">
                                    <PlatformLogo platform={p} className={`h-5 w-5 transition-opacity ${isLinked ? "opacity-90 group-hover:opacity-100" : "opacity-30 group-hover:opacity-60"}`} />
                                    <span className={`text-sm ${isLinked ? "text-slate-300 group-hover:text-white font-medium" : "text-slate-600"}`}>{p}</span>
                                </div>
                                {isLinked && (
                                    <div className="flex items-center gap-3">
                                        {hasSolved ? (
                                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                                        ) : (
                                            <div className="h-1.5 w-1.5 rounded-full bg-slate-600" title="Linked (No stats fetched)"></div>
                                        )}
                                        <ExternalLinkIcon className="h-3.5 w-3.5 text-slate-600 hover:text-white transition-colors" />
                                    </div>
                                )}
                            </div>
                        );

                        return isLinked ? (
                            <a key={p} href={profileUrl} target="_blank" rel="noopener noreferrer" className="block">
                                {Content}
                            </a>
                        ) : (
                            <div key={p} className="opacity-50 pointer-events-none grayscale">{Content}</div>
                        );
                    })}
                </div>
            </Card>

            {/* Development Stats */}
            <Card className="bg-[#0a0a0a]/60 backdrop-blur-xl border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-3xl overflow-hidden hover:border-white/10 transition-all duration-500 group">
                <div className="px-6 py-4 bg-white/[0.02] border-b border-white/5 flex justify-between items-center group-hover:bg-white/[0.04] transition-colors">
                    <h3 className="text-sm font-medium text-slate-300 tracking-tight">Development Apps</h3>
                </div>
                <div className="p-3">
                    {(() => {
                        const handle = user.handles?.github;
                        const hasData = !!handle;
                        const profileUrl = hasData ? getPlatformUrl('github', handle) : "#";

                        const Inner = (
                            <div className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl cursor-pointer hover:shadow-[0_0_15px_rgba(255,255,255,0.03)] transition-all duration-300 w-full">
                                <div className="flex items-center gap-3">
                                    <PlatformLogo platform="github" className="h-5 w-5 opacity-90 group-hover:opacity-100" />
                                    <span className="text-sm text-slate-300 font-medium group-hover:text-white">GitHub</span>
                                </div>
                                {hasData && (
                                    <div className="flex items-center gap-3">
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                                        <ExternalLinkIcon className="h-3.5 w-3.5 text-slate-600 hover:text-white transition-colors" />
                                    </div>
                                )}
                            </div>
                        );

                        return hasData ? (
                            <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="block">
                                {Inner}
                            </a>
                        ) : Inner;
                    })()}
                </div>
            </Card>

            {/* Leaderboard Mock */}
            <Card className="bg-[#0a0a0a]/60 backdrop-blur-xl border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-3xl p-6 relative overflow-hidden transition-all duration-500 hover:border-indigo-500/30 group">
                {/* Subtle interactive glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                <h3 className="text-sm font-medium tracking-tight text-slate-400 mb-4 group-hover:text-indigo-300 transition-colors relative z-10">Global Rank</h3>
                <div className="flex justify-between items-end mb-6 relative z-10">
                    <div>
                        <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-indigo-200 tracking-tighter drop-shadow-[0_0_15px_rgba(99,102,241,0.2)]">47</h2>
                        <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider group-hover:text-indigo-400/80 transition-colors">Based on C-Score</p>
                    </div>
                </div>
                <div className="mt-2 relative z-10">
                    <button className="w-full py-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 hover:text-indigo-200 font-medium text-sm rounded-xl transition-all border border-indigo-500/20 hover:border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                        View Leaderboard
                    </button>
                </div>
            </Card>

        </div>
    );
};

const MailIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
)
const LinkedinIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
)

const ExternalLinkIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
)
