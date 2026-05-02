import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const AboutVideoCarousel = () => {
    const containerRef = useRef(null);

    // Subtle GSAP Parallax Effect on the whole container instead of wild CSS scaling
    useEffect(() => {
        let ctx = gsap.context(() => {
            gsap.to(".video-bg-layer", {
                yPercent: 10,
                ease: "none",
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 1.5 // Buttery smooth scrub
                }
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="absolute inset-0 w-full h-full z-0 overflow-hidden bg-black pointer-events-none">

            <div className="video-bg-layer absolute inset-[-10%] w-[120%] h-[120%]">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover opacity-50"
                    onError={(e) => console.error("AboutVideoCarousel Error:", e)}
                >
                    <source src="/videos/dark-leetcode-autotype.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </div>

            {/* Overlays to make text readable, but NOT pitch black */}

            {/* Simple flat dark overlay for text readability without any circular gradients */}
            <div className="absolute inset-0 bg-slate-100 dark:bg-black/40"></div>


            {/* 3. Grid for dev aesthetic */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:3rem_3rem]"></div>
        </div>
    );
};
