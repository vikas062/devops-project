import { Link, NavLink } from "react-router-dom";
import { Button } from "./ui/button";
import { ThemeToggle } from "./ThemeToggle";

const navLinkClass = ({ isActive }) =>
  `text-sm font-medium transition ${isActive ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"}`;

export const Navbar = ({ isAuthed, onLogout }) => (
  <header className="sticky top-4 z-50 mx-auto max-w-6xl px-4">
    <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-navy-900/60 backdrop-blur-xl shadow-lg shadow-black/10 transition-all duration-300 hover:border-black/20 dark:border-white/20 hover:shadow-glow/20">
      <div className="flex items-center justify-between px-6 py-3">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-blue-500/50 transition-all duration-300 group-hover:scale-110">
            <span className="text-slate-900 dark:text-white font-bold font-display text-xl">D</span>
          </div>
          <span className="text-xl font-bold font-display text-slate-900 dark:text-white tracking-tight group-hover:text-blue-100 transition-colors">DSA Compass</span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <NavLink to="/" className={navLinkClass}>Home</NavLink>
          <a href="/#about" className="text-sm font-medium transition text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer">About Us</a>
          <NavLink to="/how-to-use" className={navLinkClass}>How to Use</NavLink>
          <NavLink to="/dashboard" className={navLinkClass}>Dashboard</NavLink>
          {isAuthed && <NavLink to="/u/me" className={navLinkClass}>Profile</NavLink>}
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {isAuthed ? (
            <>
              <Button variant="ghost" onClick={onLogout} className="hover:bg-black/5 dark:hover:bg-white/10 data-[state=open]:bg-transparent text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">Logout</Button>
              <Button asChild className="bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/20 border border-blue-400/20">
                <Link to="/dashboard">Launch App</Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild className="bg-slate-900 dark:bg-white text-white dark:text-navy-900 hover:bg-slate-800 dark:hover:bg-blue-50 shadow-lg shadow-black/10 dark:shadow-white/10 transition-all hover:scale-105">
                <Link to="/signup">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  </header>
);
