import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        // 1. Check localStorage first
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) {
            return savedTheme;
        }
        // 2. Check system preference (default dark for this site)
        if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
            // Allow system light mode if they prefer it, otherwise force dark
            return "dark"; // Defaulting to dark as per requirements
        }
        return "dark";
    });

    useEffect(() => {
        const root = window.document.documentElement;
        const body = window.document.body;

        root.classList.remove("light", "dark");
        root.classList.add(theme);

        body.classList.remove("light", "dark");
        body.classList.add(theme);

        localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
