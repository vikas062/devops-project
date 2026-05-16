// ─────────────────────────────────────────────────────────
// server/src/index.js — Express Server Entry Point
//
// Responsibilities:
//   • CORS configuration (dev + production origins)
//   • Middleware setup (passport, json parser, morgan)
//   • API route registration
//   • Database connection
//   • Global error handling
// ─────────────────────────────────────────────────────────

import "express-async-errors";
import "dotenv/config";
import express  from "express";
import cors     from "cors";
import morgan   from "morgan";

import { connectDb }     from "./config/db.js";
import passport          from "./config/passport.js";
import authRoutes        from "./routes/auth.js";
import questionRoutes    from "./routes/questions.js";
import solveRoutes       from "./routes/solve.js";
import userRoutes        from "./routes/users.js";
import statsRoutes       from "./routes/stats.js";
import { useMockStore }  from "./utils/mockStore.js";

const app  = express();
const PORT = process.env.PORT || 5000;

// ─────────────────────────────────────────────────────────
// CORS — Allow dev, production Vercel, and Chrome extension
// ─────────────────────────────────────────────────────────
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      process.env.CLIENT_ORIGIN,
    ];

    const isAllowed =
      !origin ||                               // curl / server-to-server
      origin.startsWith("chrome-extension://") || // Chrome extension
      origin.includes("vercel.app") ||         // Any Vercel deployment
      allowedOrigins.includes(origin);         // Explicit whitelist

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: Origin '${origin}' not allowed`));
    }
  },
  credentials: true,
};

// ─────────────────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────────────────
app.use(passport.initialize());
app.use(cors(corsOptions));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

// ─────────────────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth",      authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/solve",     solveRoutes);
app.use("/api/users",     userRoutes);
app.use("/api/stats",     statsRoutes);

// ─────────────────────────────────────────────────────────
// Global error handler
// ─────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("[Server Error]", err.message || err);
  res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
});

// ─────────────────────────────────────────────────────────
// Start server
// ─────────────────────────────────────────────────────────
const start = async () => {
  try {
    if (useMockStore()) {
      console.log("⚠️  Running with in-memory mock store (no MongoDB).");
    } else {
      await connectDb();
      console.log("✅ Connected to MongoDB.");
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

start();

// ─────────────────────────────────────────────────────────
// Process-level error safety net
// ─────────────────────────────────────────────────────────
process.on("uncaughtException",  (err) => { console.error("💥 Uncaught Exception:",    err); process.exit(1); });
process.on("unhandledRejection", (err) => { console.error("💥 Unhandled Rejection:",   err); process.exit(1); });
