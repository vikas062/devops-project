import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../lib/api";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";

export const Login = ({ onAuth }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Bridge: send token to Chrome extension after login
  const bridgeTokenToExtension = (token, user) => {
    try {
      // Method 1: postMessage picked up by extension content script
      window.postMessage({ type: "CC_SET_TOKEN", token, username: user?.username }, "*");
      // Method 2: direct runtime message (only works if extension is installed and page is allowlisted)
      if (window.__CC_EXT_ID__) {
        chrome.runtime.sendMessage(window.__CC_EXT_ID__, { type: "SET_TOKEN", token });
      }
    } catch (e) {}
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", form);
      localStorage.setItem("cc_token", data.token);
      bridgeTokenToExtension(data.token, data.user);
      onAuth?.(data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-6 py-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="glass-hover gradient-border">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Welcome back</h2>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">Login to continue tracking verified solves.</p>
          <form onSubmit={submit} className="mt-8 grid gap-4">
            <input
              className="h-11 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-4 text-sm text-slate-900 dark:text-white"
              placeholder="Email or Username"
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
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-black/10 dark:border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-[#0b101b] px-2 text-slate-600 dark:text-slate-400">Or continue with email/username</span>
              </div>
            </div>

            <Button type="submit" size="lg" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </Button>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              New here? <Link className="text-slate-900 dark:text-white" to="/signup">Create an account</Link>
            </p>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};
