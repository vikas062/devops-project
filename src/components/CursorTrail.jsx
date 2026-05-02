import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export const CursorTrail = () => {
    const cursorRef = useRef(null);

    useEffect(() => {
        // Only run on desktop
        if (window.matchMedia("(max-width: 768px)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            return;
        }

        const cursor = cursorRef.current;

        // GSAP quickTo is extremely performant for things attached to mousemove
        const xToCursor = gsap.quickTo(cursor, "x", { duration: 0.1, ease: "power3" });
        const yToCursor = gsap.quickTo(cursor, "y", { duration: 0.1, ease: "power3" });

        const onMouseMove = (e) => {
            xToCursor(e.clientX);
            yToCursor(e.clientY);
        };

        const onMouseEnterLink = () => {
            gsap.to(cursor, { scale: 3, backgroundColor: "rgba(56, 189, 248, 0.2)", border: "1px solid rgba(56, 189, 248, 0.8)", duration: 0.3 });
        };

        const onMouseLeaveLink = () => {
            gsap.to(cursor, { scale: 1, backgroundColor: "transparent", border: "2px solid rgba(168, 85, 247, 0.8)", duration: 0.3 });
        };

        const onMouseDown = () => {
            gsap.to(cursor, { scale: 0.8, duration: 0.1 });
        };

        const onMouseUp = () => {
            gsap.to(cursor, { scale: 1, duration: 0.1 });
        };

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mousedown", onMouseDown);
        window.addEventListener("mouseup", onMouseUp);

        // Add magnetic hover class listeners globally
        const links = document.querySelectorAll("a, button, .cursor-hover");
        links.forEach((link) => {
            link.addEventListener("mouseenter", onMouseEnterLink);
            link.addEventListener("mouseleave", onMouseLeaveLink);
        });

        // Hide default cursor on body
        document.body.style.cursor = 'none';

        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mousedown", onMouseDown);
            window.removeEventListener("mouseup", onMouseUp);
            links.forEach((link) => {
                link.removeEventListener("mouseenter", onMouseEnterLink);
                link.removeEventListener("mouseleave", onMouseLeaveLink);
            });
            document.body.style.cursor = 'auto';
        };
    }, []);

    return (
        <>
            {/* The primary sharp dot */}
            <div
                ref={cursorRef}
                className="fixed top-0 left-0 w-4 h-4 rounded-full border-2 border-purple-500/80 pointer-events-none z-[9999] mix-blend-screen -ml-2 -mt-2 hidden md:block" // Tailwind overrides
                style={{ willChange: "transform" }}
            />
        </>
    );
};
