import express from "express";
import { CanonicalQuestion } from "../models/CanonicalQuestion.js";
import { UserSolve } from "../models/UserSolve.js";
import { requireAuth } from "../utils/authMiddleware.js";
import { mockStore, useMockStore } from "../utils/mockStore.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    if (useMockStore()) {
      const questions = mockStore.listQuestions();
      return res.json({ questions });
    }
    const questions = await CanonicalQuestion.find().sort({ canonicalTitle: 1 });
    return res.json({ questions });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load questions" });
  }
});

router.get("/with-solves", requireAuth, async (req, res) => {
  try {
    if (useMockStore()) {
      const questions = mockStore.listQuestions();
      const solves = mockStore.listSolvesByUser(req.user.id);
      return res.json({ questions, solves });
    }
    const questions = await CanonicalQuestion.find().sort({ canonicalTitle: 1 });
    console.log(`User ${req.user.id} fetching dashboard: Found ${questions.length} questions.`);
    const solves = await UserSolve.find({ userId: req.user.id });
    console.log(`User ${req.user.id} has ${solves.length} solves.`);
    return res.json({ questions, solves });
  } catch (error) {
    console.error("Dashboard Load Error:", error);
    return res.status(500).json({ message: "Failed to load dashboard" });
  }
});

export default router;
