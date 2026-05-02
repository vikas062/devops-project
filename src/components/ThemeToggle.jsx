import { useRef, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import gsap from "gsap";
import { useTheme } from "../context/ThemeContext";

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    const iconRef = useRef(null);

    useEffect(() => {
        // GSAP Spin & Scale animation on theme change
        gsap.fromTo(
            iconRef.current,
            { rotation: -90, scale: 0.5, opacity: 0 },
            { rotation: 0, scale: 1, opacity: 1, duration: 0.5, ease: "back.out(2)" }
        );
    }, [theme]);

    // Awwwards style satisfying click interaction
    const handleClick = () => {
        gsap.to(iconRef.current, {
            scale: 0.8,
            duration: 0.1,
            yoyo: true,
            repeat: 1,
            onComplete: toggleTheme
        });
    };

    return (
        <button
            onClick={handleClick}
            className="relative p-2 rounded-full border border-black/10 dark:border-white/10 dark:hover:bg-black/5 dark:bg-white/10 hover:bg-black/5 transition-colors group overflow-hidden bg-black/5 dark:bg-white/5 dark:bg-transparent backdrop-blur-md"
            aria-label="Toggle theme"
        >
            <div ref={iconRef} className="relative z-10 text-slate-800 dark:text-slate-200">
                {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </div>

            {/* Subtle hover pulse effect */}
            <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/20 dark:group-hover:bg-purple-500/20 transition-colors duration-300 rounded-full" />
        </button>
    );
}
