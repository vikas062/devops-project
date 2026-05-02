import { useEffect, useRef } from "react";
import gsap from "gsap";

export const VideoBackground = () => {
    const containerRef = useRef(null);
    const overlayRef = useRef(null);

    useEffect(() => {
        let ctx = gsap.context(() => {
            // Subtle fade-in of the background on mount
            gsap.fromTo(containerRef.current,
                { opacity: 0 },
                { opacity: 0.25, duration: 2, ease: "power2.inOut" } // Kept opacity low for subtle vibe
            );

            // Parallax effect on the background based on mouse movement (optional subtle touch)
            const handleMouseMove = (e) => {
                const x = (e.clientX / window.innerWidth - 0.5) * 20; // max move 20px
                const y = (e.clientY / window.innerHeight - 0.5) * 20;
                gsap.to(overlayRef.current, {
                    x: x,
                    y: y,
                    duration: 1,
                    ease: "power2.out"
                });
            };

            window.addEventListener("mousemove", handleMouseMove);
            return () => window.removeEventListener("mousemove", handleMouseMove);

        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="absolute inset-0 z-0 overflow-hidden pointer-events-none mix-blend-screen opacity-0">
            {/* We use abstract code-like/network patterns. Instead of a heavy video file, an animated CSS/SVG abstract gradient or a lightweight looping abstract video is best. 
                 Since we don't have a specific local video file, we'll use a sophisticated CSS animated mesh that mimics an abstract tech video loop, providing the same cinematic feel without the bandwidth cost or lag.
             */}
            <div ref={overlayRef} className="absolute inset-[-5%] w-[110%] h-[110%]">
                {/* Subtle moving grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)]"></div>
            </div>

            {/* Extremely dark overlay to ensure text readability */}
            <div className="absolute inset-0 bg-navy-950/80"></div>
        </div>
    );
};
