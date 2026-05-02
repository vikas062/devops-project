import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "./ui/card";

gsap.registerPlugin(ScrollTrigger);

// Mock data for the last 7 days
// In a real app, this would come from the backend based on user's solve history
const data = [
    { day: "Mon", solves: 2 },
    { day: "Tue", solves: 4 },
    { day: "Wed", solves: 1 },
    { day: "Thu", solves: 5 },
    { day: "Fri", solves: 3 },
    { day: "Sat", solves: 8 },
    { day: "Sun", solves: 6 },
];

export const ActivityGraph = () => {
    const cardRef = useRef(null);

    useEffect(() => {
        if (!cardRef.current) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(cardRef.current,
                { y: 40, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: cardRef.current,
                        start: "top 85%",
                        toggleActions: "play none none reverse"
                    }
                }
            );
        }, cardRef);

        return () => ctx.revert();
    }, []);

    return (
        <Card ref={cardRef} className="glass-premium mb-8 p-6 lg:p-8 relative overflow-hidden group bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 transition-colors duration-300">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-1000 -z-10"></div>
            <div className="mb-8 pl-2 border-l-2 border-purple-500/50">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white tracking-wide">Weekly Activity</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Consistency and throughput</p>
            </div>

            <div className="h-[250px] w-full hover:scale-[1.01] transition-transform duration-500">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorSolves" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#64748b", fontSize: 13, fontWeight: 500 }}
                            dy={15}
                        />
                        <YAxis hide domain={[0, 'dataMax + 2']} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "rgba(10, 10, 15, 0.9)",
                                borderColor: "rgba(168, 85, 247, 0.3)",
                                borderRadius: "12px",
                                color: "#f8fafc",
                                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(168, 85, 247, 0.2)",
                                backdropFilter: "blur(10px)"
                            }}
                            itemStyle={{ color: "#c084fc", fontWeight: "bold" }}
                            cursor={{ stroke: "rgba(168, 85, 247, 0.2)", strokeWidth: 1, strokeDasharray: "4 4" }}
                        />
                        <Area
                            type="monotone"
                            dataKey="solves"
                            stroke="#a855f7"
                            strokeWidth={4}
                            fillOpacity={1}
                            fill="url(#colorSolves)"
                            activeDot={{ r: 6, fill: "#c084fc", stroke: "#fff", strokeWidth: 2, className: "drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};
