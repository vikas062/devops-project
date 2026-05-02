import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Card } from "./ui/card";

gsap.registerPlugin(ScrollTrigger);

export const TopicRadar = ({ questions, solves, data: providedData }) => {
    const cardRef = useRef(null);

    useEffect(() => {
        if (!cardRef.current) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(cardRef.current,
                { scale: 0.9, opacity: 0 },
                {
                    scale: 1,
                    opacity: 1,
                    duration: 0.8,
                    ease: "back.out(1.2)",
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

    // If pre-calculated data is provided, use it
    if (providedData) {
        // Normalize keys if needed, assuming providedData is [{topic, value}]
        // The chart expects 'subject' and 'A' (value)
        const chartData = providedData.map(d => ({
            subject: d.topic,
            A: d.value,
            fullMark: 100
        }));

        if (chartData.length === 0) {
            return (
                <Card ref={cardRef} className="glass-premium p-6 h-[400px] flex items-center justify-center bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 transition-colors duration-300">
                    <p className="text-slate-500 dark:text-slate-400 font-medium tracking-wide">No topic data available yet.</p>
                </Card>
            );
        }

        return (
            <Card ref={cardRef} className="glass-premium p-6 group overflow-hidden relative bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 transition-colors duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-50">
                    <div className="h-32 w-32 bg-emerald-500/10 rounded-full blur-[40px] group-hover:bg-emerald-400/20 transition-colors duration-1000"></div>
                </div>
                <div className="mb-6 z-10 relative">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white tracking-wide">Skill Matrix</h3>
                    <p className="text-sm font-medium tracking-widest text-slate-500 dark:text-slate-400 uppercase mt-1">Your strength by topic</p>
                </div>
                <div className="h-[300px] w-full group-hover:scale-105 transition-transform duration-700 relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
                            <PolarGrid stroke="#1e293b" strokeDasharray="3 3" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 13, fontWeight: 600 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar
                                name="Skill Level"
                                dataKey="A"
                                stroke="#10b981"
                                strokeWidth={2}
                                fill="#10b981"
                                fillOpacity={0.4}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "rgba(10, 10, 15, 0.9)",
                                    borderColor: "rgba(16, 185, 129, 0.3)",
                                    color: "#f8fafc",
                                    borderRadius: "12px",
                                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(16, 185, 129, 0.15)",
                                    backdropFilter: "blur(10px)"
                                }}
                                itemStyle={{ color: "#34d399", fontWeight: "bold" }}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        );
    }

    // Existing logic for questions/solves inputs
    const topicData = {};

    // Initialize topic counts
    if (questions) {
        questions.forEach(q => {
            q.topic.forEach(t => {
                if (!topicData[t]) {
                    topicData[t] = { subject: t, total: 0, solved: 0, fullMark: 100 };
                }
                topicData[t].total += 1;
            });
        });
    }

    // Calculate solved counts
    if (solves && questions) {
        const solvedIds = new Set(solves.map(s => s.canonicalQuestionId));
        questions.forEach(q => {
            if (solvedIds.has(q._id)) {
                q.topic.forEach(t => {
                    if (topicData[t]) {
                        topicData[t].solved += 1;
                    }
                });
            }
        });
    }

    // Transform to array and calculate percentage
    const data = Object.values(topicData).map(item => ({
        ...item,
        A: Math.round((item.solved / item.total) * 100) // Percentage solved
    })).filter(item => item.total > 0).slice(0, 6); // Limit to top 6 topics for cleaner UI if many exist

    // If no data, show placeholder or empty state
    if (data.length === 0) {
        return (
            <Card ref={cardRef} className="glass-premium p-6 h-[400px] flex items-center justify-center bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 transition-colors duration-300">
                <p className="text-slate-500 dark:text-slate-400 font-medium tracking-wide">Solve questions to see your skill radar!</p>
            </Card>
        );
    }

    return (
        <Card ref={cardRef} className="glass-premium p-6 h-full flex flex-col relative overflow-hidden group bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 transition-colors duration-300">
            <div className="absolute top-0 right-0 p-4 opacity-50">
                <div className="h-32 w-32 bg-emerald-500/10 rounded-full blur-[40px] group-hover:bg-emerald-400/20 transition-colors duration-1000 -z-10"></div>
            </div>
            <div className="mb-6 z-10 relative">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white tracking-wide">Skill Matrix</h3>
                <p className="text-sm tracking-widest text-slate-500 dark:text-slate-400 uppercase font-medium mt-1">Top Problem Topics</p>
            </div>
            <div className="flex-1 w-full min-h-[300px] group-hover:scale-105 transition-transform duration-700 relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
                        <defs>
                            <linearGradient id="radarFill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <PolarGrid stroke="#1e293b" strokeDasharray="3 3" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 13, fontWeight: 600 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar
                            name="Skill Level"
                            dataKey="A"
                            stroke="#34d399"
                            strokeWidth={3}
                            fill="url(#radarFill)"
                            fillOpacity={0.6}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "rgba(10, 10, 15, 0.9)",
                                borderColor: "rgba(16, 185, 129, 0.3)",
                                color: "#f8fafc",
                                borderRadius: "12px",
                                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(16, 185, 129, 0.15)",
                                backdropFilter: "blur(10px)"
                            }}
                            itemStyle={{ color: "#34d399", fontWeight: "bold" }}
                            formatter={(value) => [`${value}%`, "Proficiency"]}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};
