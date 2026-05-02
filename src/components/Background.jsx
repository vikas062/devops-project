export const Background = ({ children }) => (
  <div className="min-h-screen bg-slate-100 dark:bg-navy-900 bg-hero-radial">
    <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.12),transparent_55%),radial-gradient(circle_at_80%_30%,rgba(99,102,241,0.12),transparent_50%)]" />
    <div className="relative z-10">{children}</div>
  </div>
);
