import React from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { PlatformLogo } from "./PlatformLogo";

export const PlatformCard = ({ platform, handle, data, colorClass, user }) => {
    // Helper to get platform URL (simplified version of getPlatformUrl)
    const getUrl = (p, h) => {
        const urls = {
            leetcode: `https://leetcode.com/${h}`,
            codeforces: `https://codeforces.com/profile/${h}`,
            codechef: `https://www.codechef.com/users/${h}`,
            gfg: `https://auth.geeksforgeeks.org/user/${h}/practice`,
            hackerrank: `https://www.hackerrank.com/${h}`,
            atcoder: `https://atcoder.jp/users/${h}`,
            hackerearth: `https://www.hackerearth.com/@${h}`,
            spoj: `https://www.spoj.com/users/${h}/`,
            github: `https://github.com/${h}`
        };
        return urls[p] || "#";
    };

    if (!handle) return null;

    return (
        <a
            href={getUrl(platform, handle)}
            target="_blank"
            rel="noopener noreferrer"
            className="block group h-full"
        >
            <Card className={`glass-effect border-black/5 dark:border-white/5 p-5 transition-all cursor-pointer h-full relative overflow-hidden ${colorClass} hover:border-black/20 dark:border-white/20`}>
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-slate-700 transition-colors">
                            <PlatformLogo platform={platform} className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="font-bold text-slate-900 dark:text-white group-hover:text-amber-400 transition-colors capitalize">{platform}</p>
                            <p className="text-[10px] text-slate-600 dark:text-slate-400">@{handle}</p>
                        </div>
                    </div>
                    {data?.rank && (
                        <Badge className="bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-700 text-[10px]">
                            {data.rank}
                        </Badge>
                    )}
                </div>

                {data ? (
                    <div className="space-y-3">
                        {/* Primary Stat: Rating or Solved */}
                        <div className="flex justify-between items-end">
                            <span className="text-slate-600 dark:text-slate-400 text-xs font-medium">
                                {data.rating ? "Rating" : "Solved"}
                            </span>
                            <span className="text-xl font-bold text-slate-900 dark:text-white">
                                {data.rating || data.totalSolved || 0}
                            </span>
                        </div>

                        {/* Progress Bar (Visual Flair) */}
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden relative">
                            <div
                                className={`h-full ${data.rating ? "bg-gradient-to-r from-blue-500 to-purple-500" : "bg-emerald-500"}`}
                                style={{ width: data.rating ? "70%" : "100%" }} // Dynamic if limits known
                            />
                        </div>

                        {/* Secondary Stats */}
                        <div className="flex justify-between text-[10px] text-slate-500">
                            {data.maxRating && <span>Max: {data.maxRating}</span>}
                            {data.totalSolved && data.rating && <span>Solved: {data.totalSolved}</span>}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-16 text-slate-500 bg-slate-800/30 rounded-lg">
                        <p className="text-xs">No data available</p>
                    </div>
                )}
            </Card>
        </a>
    );
};
