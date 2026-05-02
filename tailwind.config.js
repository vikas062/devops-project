/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          900: "#070B18",
          850: "#0A1022",
          800: "#0D142B",
          700: "#121B38"
        },
        glass: "rgba(255,255,255,0.08)",
        "glass-border": "rgba(255,255,255,0.18)",
        accent: "#38BDF8",
        accent2: "#22D3EE",
        success: "#34D399",
        warning: "#F59E0B"
      },
      boxShadow: {
        glow: "0 0 30px rgba(56,189,248,0.25)",
        lift: "0 18px 40px rgba(7,11,24,0.55)"
      },
      backgroundImage: {
        "hero-radial": "radial-gradient(1200px 600px at 10% 10%, rgba(56,189,248,0.15), transparent 60%), radial-gradient(900px 500px at 90% 20%, rgba(99,102,241,0.18), transparent 55%)",
        "card-glow": "radial-gradient(circle at top, rgba(56,189,248,0.15), transparent 60%)"
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" }
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.3s ease-out",
        "accordion-up": "accordion-up 0.3s ease-out"
      },
      fontFamily: {
        display: ["Space Grotesk", "ui-sans-serif", "system-ui"],
        sans: ["Manrope", "ui-sans-serif", "system-ui"]
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem"
      }
    }
  },
  plugins: []
};
