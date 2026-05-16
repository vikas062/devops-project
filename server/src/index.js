import "express-async-errors";
import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { connectDb } from "./config/db.js";
import passport from "./config/passport.js";
import authRoutes from "./routes/auth.js";
import questionRoutes from "./routes/questions.js";
import solveRoutes from "./routes/solve.js";
import userRoutes from "./routes/users.js";
import statsRoutes from "./routes/stats.js";
import { useMockStore } from "./utils/mockStore.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(passport.initialize());
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      process.env.CLIENT_ORIGIN
    ];
    // Allow extensions or undefined origins (like curl), or specific allowed origins, or any Vercel deployment
    if (!origin || origin.startsWith("chrome-extension://") || origin.includes("vercel.app") || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/solve", solveRoutes);
app.use("/api/users", userRoutes);
app.use("/api/stats", statsRoutes);

app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

const start = async () => {
  try {
    if (!useMockStore()) {
      await connectDb();
      console.log("Running with Real MongoDB.");
    } else {
      console.log("Running with mock in-memory store (no MongoDB).");
    }
    app.listen(PORT, () => {
      console.log(`Server running on ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

start();

// Global Error Handling
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...", err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! 💥 Shutting down...", err);
  process.exit(1);
});
