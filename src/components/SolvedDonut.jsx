import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card } from "./ui/card";

gsap.registerPlugin(ScrollTrigger);

export const SolvedDonut = ({ title, data, total }) => {
    // data format: [{ name: "Easy", value: 100, color: "#4ade80" }, ...]
    const cardRef = useRef(null);
    const chartRef = useRef(null);

    useEffect(() => {
        if (!cardRef.current || !chartRef.current) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(chartRef.current,
                { scale: 0, rotation: -180, opacity: 0, filter: "blur(10px)" },
                {
                    scale: 1,
                    rotation: 0,
                    opacity: 1,
                    filter: "blur(0px)",
                    duration: 1.8,
                    ease: "elastic.out(1, 0.4)",
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
        <Card ref={cardRef} className="bg-[#111] border-white/5 rounded-3xl p-6 flex flex-col items-center justify-between hover:border-white/10 transition-colors duration-300">
            <div ref={chartRef} className="relative h-32 w-32 flex-shrink-0 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            innerRadius={35}
                            outerRadius={45}
                            paddingAngle={3}
                            dataKey="value"
                            stroke="none"
                            isAnimationActive={true} // Recharts native animation also plays
                            animationBegin={200}
                            animationDuration={800}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ backgroundColor: '#111', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px', padding: '8px' }}
                            itemStyle={{ color: '#fff' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-lg font-bold text-white">{total}</span>
                </div>
            </div>

            <div className="w-full space-y-2">
                <div className="flex justify-center items-center mb-4">
                    <h4 className="text-sm text-slate-400 font-medium tracking-tight">{title}</h4>
                </div>

                <div className="space-y-2">
                    {data.map((d) => (
                        <div key={d.name} className="flex justify-between items-center text-sm group bg-[#1a1a1a] rounded-xl px-3 py-2 border border-white/5">
                            <span className="text-slate-400 flex items-center gap-2 group-hover:text-white transition-colors">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></span>
                                {d.name}
                            </span>
                            <span className="text-white font-semibold">{d.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
};
