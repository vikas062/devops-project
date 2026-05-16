// ─────────────────────────────────────────────────────────
// App.jsx — Root Application Component
// Sets up routing, authentication state, and global layout
// ─────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

// Layout components
import { Navbar }         from "./components/Navbar";
import { Footer }         from "./components/Footer";
import { Background }     from "./components/Background";
import { CursorTrail }    from "./components/CursorTrail";
import { PageTransition } from "./components/PageTransition";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Pages
import { Landing }     from "./pages/Landing";
import { Signup }      from "./pages/Signup";
import { Login }       from "./pages/Login";
import { Dashboard }   from "./pages/Dashboard";
import { Profile }     from "./pages/Profile";
import { HowToUse }    from "./pages/HowToUse";
import AuthCallback    from "./pages/AuthCallback";

// Utilities
import { useSmoothScroll } from "./components/gsapSetup";
import { ThemeProvider }   from "./context/ThemeContext";
import api                 from "./lib/api";

// Add smooth theme transitions globally
if (typeof document !== "undefined") {
  document.documentElement.classList.add("transition-colors", "duration-500");
  document.body.classList.add("transition-colors", "duration-500");
}

// ─────────────────────────────────────────────────────────
// Animated page routing with framer-motion transitions
// ─────────────────────────────────────────────────────────
const AnimatedRoutes = ({ onAuth }) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>

        {/* Public routes */}
        <Route path="/"            element={<PageTransition><Landing /></PageTransition>} />
        <Route path="/login"       element={<PageTransition><Login onAuth={onAuth} /></PageTransition>} />
        <Route path="/signup"      element={<PageTransition><Signup onAuth={onAuth} /></PageTransition>} />
        <Route path="/how-to-use"  element={<PageTransition><HowToUse /></PageTransition>} />
        <Route path="/demo"        element={<PageTransition><Dashboard isDemo={true} /></PageTransition>} />
        <Route path="/u/:username" element={<PageTransition><Profile /></PageTransition>} />

        {/* OAuth callback — no transition needed */}
        <Route path="/auth-callback" element={<AuthCallback />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <PageTransition><Dashboard /></PageTransition>
            </ProtectedRoute>
          }
        />

      </Routes>
    </AnimatePresence>
  );
};

// ─────────────────────────────────────────────────────────
// Root App component
// ─────────────────────────────────────────────────────────
const App = () => {
  useSmoothScroll();
  const [user, setUser] = useState(null);

  // Restore session from stored JWT on mount
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem("cc_token");
      if (!token) return;

      try {
        const { data } = await api.get("/users/me");
        setUser(data.user);
      } catch (err) {
        // Only clear token on auth errors (401/403), not network errors
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("cc_token");
          setUser(null);
        }
      }
    };

    restoreSession();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("cc_token");
    setUser(null);
  };

  const isAuthed = !!user || !!localStorage.getItem("cc_token");

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Background>
          <CursorTrail />
          <Navbar isAuthed={isAuthed} onLogout={handleLogout} />
          <AnimatedRoutes onAuth={setUser} />
          <Footer />
        </Background>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
