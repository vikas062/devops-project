import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../lib/api";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";



export const Signup = ({ onAuth }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",

  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null); // null = not checked, true = available, false = taken
  const [checkingUsername, setCheckingUsername] = useState(false);



  const checkUsername = async (username) => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      return;
    }
    setCheckingUsername(true);
    try {
      const { data } = await api.get(`/auth/check-username?username=${username}`);
      setUsernameAvailable(data.available);
    } catch (err) {
      console.error("Failed to check username", err);
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleUsernameChange = (e) => {
    const val = e.target.value;
    setForm({ ...form, username: val });
    // Debounce or just check on every change for now (simple)
    // For better UX, use a debounce hook, but direct call is fine for low traffic
    if (val.length >= 3) {
      checkUsername(val);
    } else {
      setUsernameAvailable(null);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    if (usernameAvailable === false) {
      setError("Username is already taken");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/signup", form);
      localStorage.setItem("cc_token", data.token);
      onAuth?.(data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="glass-hover gradient-border">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Create your DSA Compass profile</h2>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">Join our community of developers.</p>
          <form onSubmit={submit} className="mt-8 grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <input
                className="h-11 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-4 text-sm text-slate-900 dark:text-white"
                placeholder="Full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <div className="relative">
                <input
                  className={`h-11 w-full rounded-xl border bg-black/5 dark:bg-white/5 px-4 text-sm text-slate-900 dark:text-white ${usernameAvailable === false
                    ? "border-rose-500 focus:border-rose-500"
                    : usernameAvailable === true
                      ? "border-emerald-500 focus:border-emerald-500"
                      : "border-black/10 dark:border-white/10"
                    }`}
                  placeholder="Username"
                  value={form.username}
                  onChange={handleUsernameChange}
                />
                {checkingUsername && (
                  <div className="absolute right-3 top-3">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 dark:border-white/20 border-t-white"></div>
                  </div>
                )}
                {usernameAvailable === false && (
                  <p className="mt-1 text-xs text-rose-400">Username taken</p>
                )}
                {usernameAvailable === true && (
                  <p className="mt-1 text-xs text-emerald-400">Username available</p>
                )}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <input
                className="h-11 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-4 text-sm text-slate-900 dark:text-white"
                placeholder="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <input
                className="h-11 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-4 text-sm text-slate-900 dark:text-white"
                placeholder="Password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            {error && <p className="text-sm text-rose-300">{error}</p>}

            <Button
              type="button"
              variant="outline"
              className="w-full border-black/20 dark:border-white/20 hover:bg-black/5 dark:bg-white/10"
              onClick={() => {
                const isProd = import.meta.env.PROD;
                const backendUrl = import.meta.env.VITE_API_URL || (isProd ? "https://dsa-compass-server.onrender.com/api" : "/api");
                const authUrl = backendUrl.startsWith('http') 
                  ? `${backendUrl}/auth/google`
                  : `${window.location.origin}${backendUrl}/auth/google`;
                window.location.href = authUrl;
              }}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign up with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-black/10 dark:border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-[#0b101b] px-2 text-slate-600 dark:text-slate-400">Or sign up with email</span>
              </div>
            </div>
            <Button type="submit" size="lg" disabled={loading || usernameAvailable === false}>
              {loading ? "Creating..." : "Create account"}
            </Button>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Already have an account? <Link className="text-slate-900 dark:text-white" to="/login">Log in</Link>
            </p>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};
