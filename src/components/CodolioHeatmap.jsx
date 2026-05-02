
import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Simple custom implementation to avoid library crashes
export const CodolioHeatmap = ({ totalSolved, activeDays, maxStreak, currentStreak }) => {

    // Generate mock data for the last 365 days
    const [data, setData] = useState([]);
    const containerRef = useRef(null);
    const cellsRef = useRef([]);

    useEffect(() => {
        const newData = [];
        const end = new Date();
        const start = new Date();
        start.setFullYear(end.getFullYear() - 1);

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split("T")[0];
            const count = Math.random() > 0.7 ? Math.floor(Math.random() * 10) : 0;
            // Level: 0-4
            let level = 0;
            if (count > 0) level = 1;
            if (count > 3) level = 2;
            if (count > 6) level = 3;
            if (count > 9) level = 4;

            newData.push({ date: dateStr, count, level });
        }
        setData(newData);
    }, []);

    useEffect(() => {
        if (data.length === 0 || !containerRef.current) return;

        // Give React a tick to render the cells
        const ctx = gsap.context(() => {
            gsap.fromTo(".heatmap-cell",
                { opacity: 0, scale: 0 },
                {
                    opacity: 1,
                    scale: 1,
                    duration: 0.3,
                    stagger: {
                        amount: 1.5,
                        from: "start" // or "random", "center"
                    },
                    ease: "back.out(1.5)",
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: "top 85%",
                        toggleActions: "play none none reverse"
                    }
                }
            );
        }, containerRef);

        return () => ctx.revert(); // Cleanup and kill scroll triggers for this context
    }, [data]);

    const getColor = (level) => {
        switch (level) {
            case 1: return "bg-emerald-300 dark:bg-emerald-900/40 dark:shadow-[0_0_8px_rgba(6,78,59,0.3)]";
            case 2: return "bg-emerald-400 dark:bg-emerald-700/60 dark:shadow-[0_0_12px_rgba(4,120,87,0.4)]";
            case 3: return "bg-emerald-500 shadow-sm dark:shadow-[0_0_15px_rgba(16,185,129,0.6)]";
            case 4: return "bg-emerald-600 dark:bg-emerald-400 shadow-sm dark:shadow-[0_0_20px_rgba(52,211,153,0.8)]";
            default: return "bg-slate-200 dark:bg-white/[0.03]"; // Level 0
        }
    };

    return (
        <div ref={containerRef} className="flex flex-col justify-between h-full w-full relative z-10 group/heatmap">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-medium tracking-tight text-slate-500 dark:text-slate-400 group-hover/heatmap:text-emerald-500 dark:group-hover/heatmap:text-emerald-300 transition-colors">Submissions <span className="text-slate-800 dark:text-white ml-2 drop-shadow-sm dark:drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{totalSolved}</span></h3>
                <div className="flex gap-4 items-center text-xs text-slate-500">
                    <span>Max Streak <span className="text-slate-800 dark:text-white font-semibold drop-shadow-sm dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">{maxStreak || 0}</span></span>
                    <span>Current Streak <span className="text-slate-800 dark:text-white font-semibold drop-shadow-sm dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">{currentStreak || 0}</span></span>
                    <select className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 rounded-lg px-3 py-1.5 outline-none text-xs backdrop-blur-md hover:bg-slate-200 dark:hover:bg-white/10 transition-colors cursor-pointer shadow-sm dark:shadow-none">
                        <option>Current Year</option>
                        <option>Last Year</option>
                    </select>
                </div>
            </div>

            <div className="w-full flex-1 flex flex-col justify-center py-4">
                <div className="w-full grid grid-rows-7 grid-flow-col gap-[3px] md:gap-1 lg:gap-[5px]">
                    {data.map((item, i) => (
                        <div
                            key={i}
                            className={`heatmap-cell w-full aspect-square rounded-[2px] sm:rounded-[3px] ${getColor(item.level)} transition-all duration-300 hover:scale-125 hover:z-10 hover:shadow-[0_0_12px_currentColor] cursor-pointer`}
                            title={`${item.count} submissions on ${item.date}`}
                        />
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 mt-4 justify-end font-medium">
                <span>Less</span>
                <div className="w-[10px] h-[10px] bg-slate-200 dark:bg-white/[0.03] rounded-[2px]" />
                <div className="w-[10px] h-[10px] bg-emerald-300 dark:bg-emerald-900/40 rounded-[2px]" />
                <div className="w-[10px] h-[10px] bg-emerald-400 dark:bg-emerald-700/60 rounded-[2px]" />
                <div className="w-[10px] h-[10px] bg-emerald-500 dark:bg-emerald-500 rounded-[2px] shadow-sm dark:shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                <div className="w-[10px] h-[10px] bg-emerald-600 dark:bg-emerald-400 rounded-[2px] shadow-sm dark:shadow-[0_0_15px_rgba(52,211,153,0.7)]" />
                <span>More</span>
            </div>
        </div>
    );
};
