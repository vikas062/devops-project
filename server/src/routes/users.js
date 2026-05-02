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

// Refresh Stats
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

    // Update topics if LeetCode data exists
    if (platformsData.leetcode && platformsData.leetcode.topics) {
      // Convert plain object to Map for Mongoose
      user.stats.topics = new Map(Object.entries(platformsData.leetcode.topics));
    }


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

export default router;
