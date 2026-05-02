console.log("App.jsx is evaluating!");
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { Background } from "./components/Background";
import { PageTransition } from "./components/PageTransition";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Landing } from "./pages/Landing";
import { Signup } from "./pages/Signup";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Profile } from "./pages/Profile";
import { HowToUse } from "./pages/HowToUse";
import AuthCallback from "./pages/AuthCallback";
import { useSmoothScroll } from "./components/gsapSetup";
import { ThemeProvider } from "./context/ThemeContext";

// Force global Tailwind transition variables smoothly
if (typeof document !== 'undefined') {
  document.documentElement.classList.add("transition-colors", "duration-500");
  document.body.classList.add("transition-colors", "duration-500");
}

const AnimatedRoutes = ({ onAuth }) => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition>
              <Landing />
            </PageTransition>
          }
        />
        <Route
          path="/signup"
          element={
            <PageTransition>
              <Signup onAuth={onAuth} />
            </PageTransition>
          }
        />
        <Route
          path="/login"
          element={
            <PageTransition>
              <Login onAuth={onAuth} />
            </PageTransition>
          }
        />
        <Route
          path="/auth-callback"
          element={
            <AuthCallback />
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <PageTransition>
                <Dashboard />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/u/:username"
          element={
            <PageTransition>
              <Profile />
            </PageTransition>
          }
        />
        <Route
          path="/demo"
          element={
            <PageTransition>
              <Dashboard isDemo={true} />
            </PageTransition>
          }
        />
        <Route
          path="/how-to-use"
          element={
            <PageTransition>
              <HowToUse />
            </PageTransition>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

import { CursorTrail } from "./components/CursorTrail";

const App = () => {
  useSmoothScroll(); // Initialize premium smooth scrolling globally
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("cc_token");
      console.log("[App] Loading user. Token exists?", !!token);

      if (!token) {
        setUser(null);
        return;
      }
      try {
        const { data } = await import("./lib/api").then(m => m.default.get("/users/me"));
        console.log("[App] User loaded:", data.user.username);
        setUser(data.user);
      } catch (err) {
        console.error("Failed to restore session", err);
        console.log("[App] Error status:", err.response?.status);

        // Only clear token if it's an auth error (401/403)
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          console.log("[App] Auth error, clearing token.");
          localStorage.removeItem("cc_token");
          setUser(null);
        } else {
          console.log("[App] Non-auth error, keeping token.");
        }
      }
    };
    loadUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("cc_token");
    setUser(null);
  };

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Background>
          <CursorTrail />
          <Navbar isAuthed={!!user || !!localStorage.getItem("cc_token")} onLogout={handleLogout} />
          <AnimatedRoutes onAuth={setUser} />
          <Footer />
        </Background>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
