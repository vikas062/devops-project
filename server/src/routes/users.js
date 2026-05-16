import express from "express";
import { User } from "../models/User.js";
import { CanonicalQuestion } from "../models/CanonicalQuestion.js";
import { UserSolve } from "../models/UserSolve.js";
import { requireAuth } from "../utils/authMiddleware.js";
import { mockStore, useMockStore } from "../utils/mockStore.js";
import {
  fetchCodeforcesData,
  fetchLeetCodeData,
  fetchGitHubData,
  fetchCodeChefData,
  fetchGFGData,
  fetchHackerRankData,
  fetchAtCoderData,
  fetchSPOJData,
  fetchHackerEarthData
} from "../services/platformFetcher.js";
import fs from 'fs';

const router = express.Router();

router.get("/me", requireAuth, async (req, res) => {
  try {
    if (useMockStore()) {
      const user = mockStore.findUserById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const total = mockStore.listQuestions().length;
      const solves = mockStore.listSolvesByUser(user.id);
      const solvedCount = solves.length;
      const coverage = total ? Math.round((solvedCount / total) * 100) : 0;
      return res.json({
        user: { id: user.id, name: user.name, username: user.username, email: user.email, handles: user.handles },
        stats: { total, solvedCount, coverage },
        solves
      });
    }
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const total = await CanonicalQuestion.countDocuments();
    const solves = await UserSolve.find({ userId: user._id });
    const solvedCount = solves.length;
    const coverage = total ? Math.round((solvedCount / total) * 100) : 0;
    return res.json({
      user: { id: user._id, name: user.name, username: user.username, email: user.email, handles: user.handles, platformsData: user.platformsData || {}, stats: user.stats },
      stats: { total, solvedCount, coverage },
      solves
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load profile" });
  }
});

// ── DEBUG: Test each platform fetcher individually ──
// GET /api/users/test-sync  →  returns per-platform results + timing
router.get("/test-sync", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { handles } = user;
    const results = {};

    const test = async (name, fn, handle) => {
      if (!handle) { results[name] = { skipped: true, reason: "No handle configured" }; return; }
      const start = Date.now();
      try {
        const data = await fn(handle);
        results[name] = { ok: !!data, handle, ms: Date.now() - start, data };
      } catch (e) {
        results[name] = { ok: false, handle, ms: Date.now() - start, error: e.message };
      }
    };

    await Promise.all([
      test("leetcode", fetchLeetCodeData, handles.leetcode),
      test("codeforces", fetchCodeforcesData, handles.codeforces),
      test("codechef", fetchCodeChefData, handles.codechef),
      test("gfg", fetchGFGData, handles.gfg),
      test("hackerrank", fetchHackerRankData, handles.hackerrank),
      test("atcoder", fetchAtCoderData, handles.atcoder),
      test("spoj", fetchSPOJData, handles.spoj),
      test("github", fetchGitHubData, handles.github),
    ]);

    res.json({ handles, results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post("/refresh-stats", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { handles } = user;

    // Initializing stats
    const updates = {};
    const platformsData = user.platformsData || {};
    let totalActiveDays = 0;
    let combinedTotalSolved = 0;
    let highestMaxRating = 0;

    // Helper to process platform data
    const processPlatform = async (platformKey, fetcher, handle) => {
      if (!handle) return;
      try {
        const data = await fetcher(handle);
        if (data) {
          // Merge with existing data to prevent losing fields if fetch returns partial
          platformsData[platformKey] = { ...(platformsData[platformKey] || {}), ...data };
        } else {
          console.warn(`No data returned for ${platformKey}, keeping existing if any.`);
        }
      } catch (e) {
        console.error(`Error processing ${platformKey}:`, e.message);
        // Do NOT overwrite with null/empty, keep existing data
      }
    };

    // Parallel fetch for valid handles
    await Promise.all([
      processPlatform("codeforces", fetchCodeforcesData, handles.codeforces),
      processPlatform("leetcode", fetchLeetCodeData, handles.leetcode),
      processPlatform("github", fetchGitHubData, handles.github),
      processPlatform("codechef", fetchCodeChefData, handles.codechef),
      processPlatform("gfg", fetchGFGData, handles.gfg),
      processPlatform("hackerrank", fetchHackerRankData, handles.hackerrank),
      processPlatform("atcoder", fetchAtCoderData, handles.atcoder),
      processPlatform("spoj", fetchSPOJData, handles.spoj),
      processPlatform("hackerearth", fetchHackerEarthData, handles.hackerearth)
    ]);

    // Recalculate Grand Total from specific platforms
    combinedTotalSolved = 0;
    highestMaxRating = 0;
    totalActiveDays = 0;

    // Aggregates for difficulty
    let combinedEasy = 0;
    let combinedMedium = 0;
    let combinedHard = 0;

    // Log sync status for debugging/user feedback
    const syncLogs = [];

    Object.keys(platformsData).forEach(p => {
      const pData = platformsData[p];
      if (pData) {
        // Find max rating across all platforms
        let rating = 0;
        if (pData.maxRating) rating = pData.maxRating;
        else if (pData.rating) rating = pData.rating;
        if (rating > highestMaxRating) highestMaxRating = rating;

        // Active Days
        if (pData.activeDays) totalActiveDays = Math.max(totalActiveDays, pData.activeDays);

        // Sum total solved - STRICT check > 0
        const solv = pData.totalSolved || 0;
        if (solv > 0) {
          combinedTotalSolved += solv;
          syncLogs.push(`${p}: ${solv} solved ✓`);
        } else {
          syncLogs.push(`${p}: No activity ✗`);
        }

        // Sum difficulty breakdown (if available)
        if (pData.easy) combinedEasy += pData.easy;
        if (pData.medium) combinedMedium += pData.medium;
        if (pData.hard) combinedHard += pData.hard;
      } else {
        syncLogs.push(`${p}: Failed ✗`);
      }
    });

    console.log("Sync Summary:", syncLogs.join(" | "));

    // Fallback to manual stats if fetch failed or incomplete
    if (combinedTotalSolved === 0 && user.stats.totalSolved > 0) combinedTotalSolved = user.stats.totalSolved;
    if (highestMaxRating === 0 && user.stats.maxRating > 0) highestMaxRating = user.stats.maxRating;

    user.platformsData = platformsData;
    user.stats.grandTotal = combinedTotalSolved;
    user.stats.totalSolved = combinedTotalSolved; // Keep legacy field for now
    user.stats.maxRating = highestMaxRating;
    user.stats.activeDays = totalActiveDays;

    // Aggregate total contests if provided by fetchers
    let combinedContests = 0;
    Object.values(platformsData).forEach(data => {
      if (data && data.contestCount) {
        combinedContests += data.contestCount;
      }
    });
    user.stats.totalContests = combinedContests;

    // Aggregate Badges
    const allBadges = new Set();
    Object.values(platformsData).forEach(data => {
      if (data && data.badges && Array.isArray(data.badges)) {
        data.badges.forEach(b => allBadges.add(b));
      }
    });
    user.stats.badges = Array.from(allBadges);

    // Save difficulty breakdown
    user.stats.easySolved = combinedEasy;
    user.stats.mediumSolved = combinedMedium;
    user.stats.hardSolved = combinedHard;

    // Compute streaks from LeetCode submissionCalendar (most reliable source)
    try {
      const lcRaw = platformsData.leetcode;
      if (lcRaw && lcRaw.activeDays > 0) {
        // Rebuild dates from activityHeatmap if available
        const heatmap = lcRaw.activityHeatmap || [];
        if (heatmap.length > 0) {
          const uniqueDates = [...new Set(heatmap.map(h => h.date))].sort();
          let maxStreak = 0, currentStreak = 0, tempStreak = 1;
          const today = new Date().toISOString().split('T')[0];

          for (let i = 1; i < uniqueDates.length; i++) {
            const prev = new Date(uniqueDates[i - 1]);
            const curr = new Date(uniqueDates[i]);
            const diff = (curr - prev) / 86400000;
            if (diff === 1) {
              tempStreak++;
            } else {
              if (tempStreak > maxStreak) maxStreak = tempStreak;
              tempStreak = 1;
            }
          }
          if (tempStreak > maxStreak) maxStreak = tempStreak;

          // Current streak: count backwards from today
          const sortedDesc = [...uniqueDates].reverse();
          if (sortedDesc[0] === today || sortedDesc[0] === new Date(Date.now() - 86400000).toISOString().split('T')[0]) {
            currentStreak = 1;
            for (let i = 1; i < sortedDesc.length; i++) {
              const prev = new Date(sortedDesc[i - 1]);
              const curr = new Date(sortedDesc[i]);
              const diff = (prev - curr) / 86400000;
              if (diff === 1) currentStreak++;
              else break;
            }
          }

          user.stats.maxStreak = maxStreak;
          user.stats.currentStreak = currentStreak;
        }
      }
    } catch (streakErr) {
      console.warn("Streak computation failed:", streakErr.message);
    }

    // Update topics if LeetCode data exists
    if (platformsData.leetcode && platformsData.leetcode.topics) {
      user.stats.topics = new Map(Object.entries(platformsData.leetcode.topics));
    }

    user.stats.lastSynced = new Date();


    // Recalculate Persona
    if (user.stats.maxRating > 1900) user.devPersona = "Competitive Grandmaster";
    else if (user.stats.totalSolved > 500) user.devPersona = "Algorithm Archmage";
    else if (user.stats.maxRating > 1400) user.devPersona = "Code Crusader";
    else user.devPersona = "Bug Battler";

    user.markModified('platformsData');
    user.markModified('stats');
    await user.save();
    res.json({ message: "Stats updated", stats: user.stats, platformsData });

  } catch (error) {
    console.error("Refresh stats error:", error);
    fs.appendFileSync('error.log', `[${new Date().toISOString()}] Refresh Error: ${error.stack}\n`);
    res.status(500).json({ message: "Failed to refresh stats", error: error.message });
  }
});

// Reset Progress (Dashboard only)
router.post("/reset-progress", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // ONLY clear solves for the dashboard. Do NOT clear profile stats or handles.
    await UserSolve.deleteMany({ userId: req.user.id });

    res.json({ message: "Dashboard reset successfully" });
  } catch (error) {
    console.error("Reset progress error:", error);
    res.status(500).json({ message: "Failed to reset dashboard", error: error.message });
  }
});

// Reset Profile (Handles, Bio, Projects, etc. - Does NOT delete Dashboard Solves)
router.post("/reset-everything", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 1. Wipe handles, bio, work, projects
    user.handles = { leetcode: "", gfg: "", codeforces: "", codechef: "", atcoder: "", hackerrank: "", hackerearth: "", spoj: "", github: "" };
    user.bio = "";
    user.work = [];
    user.projects = [];

    // 2. Wipe stats and platformsData (Platform stats)
    user.platformsData = {};
    user.stats = {
      totalSolved: 0,
      easySolved: 0,
      mediumSolved: 0,
      hardSolved: 0,
      activeDays: 0,
      currentStreak: 0,
      maxStreak: 0
    };

    user.markModified('platformsData');
    user.markModified('stats');
    await user.save();

    res.json({ message: "Profile completely reset", user });
  } catch (error) {
    console.error("Reset profile error:", error);
    res.status(500).json({ message: "Failed to reset profile", error: error.message });
  }
});

// Update Profile (Handles)
router.put("/profile", requireAuth, async (req, res) => {
  try {
    const { handles } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update handles
    if (handles) {
      user.handles = { ...user.handles, ...handles };
    }

    // Update Profile Details
    if (req.body.bio !== undefined) user.bio = req.body.bio;
    if (req.body.work) user.work = req.body.work;
    if (req.body.projects) user.projects = req.body.projects;
    if (req.body.name) user.name = req.body.name; // Allow name update

    await user.save();
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/:username", async (req, res) => {
  try {
    if (useMockStore()) {
      const user = mockStore.findUserByUsername(req.params.username);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const total = mockStore.listQuestions().length;
      const solves = mockStore.listSolvesByUser(user.id);
      const solvedCount = solves.length;
      const coverage = total ? Math.round((solvedCount / total) * 100) : 0;
      return res.json({
        user: { id: user.id, name: user.name, username: user.username, handles: user.handles },
        stats: { total, solvedCount, coverage },
        solves
      });
    }
    const user = await User.findOne({ username: req.params.username.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const total = await CanonicalQuestion.countDocuments();
    const solves = await UserSolve.find({ userId: user._id });
    const solvedCount = solves.length;
    const coverage = total ? Math.round((solvedCount / total) * 100) : 0;
    return res.json({
      user: { id: user._id, name: user.name, username: user.username, handles: user.handles, platformsData: user.platformsData || {}, stats: user.stats },
      stats: { total, solvedCount, coverage },
      solves
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load public profile" });
  }
});

export default router;
