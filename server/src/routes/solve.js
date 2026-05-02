import express from "express";
import { CanonicalQuestion } from "../models/CanonicalQuestion.js";
import { User } from "../models/User.js";
import { UserSolve } from "../models/UserSolve.js";
import { requireAuth } from "../utils/authMiddleware.js";
import { mockStore, useMockStore } from "../utils/mockStore.js";

const router = express.Router();

const platformKeyMap = {
  leetcode: "leetcode",
  gfg: "gfg",
  geeksforgeeks: "gfg",
  codeforces: "codeforces",
  hackerrank: "hackerrank",
  codechef: "codechef",
  spoj: "spoj",
  atcoder: "atcoder"
};

const findUserByHandle = async (platform, handle) => {
  const key = platformKeyMap[platform.toLowerCase()];
  if (!key || !handle) return null;
  if (useMockStore()) {
    return (
      mockStore.users.find(
        (user) => (user.handles?.[key] || "").toLowerCase() === handle.toLowerCase()
      ) || null
    );
  }
  return User.findOne({ [`handles.${key}`]: new RegExp(`^${handle}$`, "i") });
};

const findCanonicalMatch = async ({ platform, questionTitle, problemSlug }) => {
  const platformRegex = new RegExp(`^${platform}$`, "i");
  if (questionTitle) {
    const titleRegex = new RegExp(questionTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    if (useMockStore()) {
      return (
        mockStore.questions.find((q) =>
          q.platforms.some((p) => platformRegex.test(p.platform) && titleRegex.test(p.name))
        ) || null
      );
    }
    const matchByName = await CanonicalQuestion.findOne({
      platforms: { $elemMatch: { platform: platformRegex, name: titleRegex } }
    });
    if (matchByName) return matchByName;
  }
  if (problemSlug) {
    const slugRegex = new RegExp(problemSlug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    if (useMockStore()) {
      return (
        mockStore.questions.find((q) =>
          q.platforms.some((p) => platformRegex.test(p.platform) && slugRegex.test(p.link))
        ) || null
      );
    }
    const matchBySlug = await CanonicalQuestion.findOne({
      platforms: { $elemMatch: { platform: platformRegex, link: slugRegex } }
    });
    if (matchBySlug) return matchBySlug;
  }
  return null;
};

router.post("/", async (req, res) => {
  try {
    const { platform, questionTitle, problemSlug, handle } = req.body;
    console.log("DEBUG: POST /api/solve received:", { platform, questionTitle, problemSlug, handle });

    if (!platform || !questionTitle) {
      console.log("DEBUG: Missing platform or questionTitle");
      return res.status(400).json({ message: "Missing platform or questionTitle" });
    }

    let userId = null;
    const authHeader = req.headers.authorization || "";
    if (authHeader.startsWith("Bearer ")) {
      return await new Promise((resolve, reject) => {
        requireAuth(req, res, async () => {
          try {
            userId = req.user.id;
            await handleSolve(req, res, { platform, questionTitle, problemSlug, userId });
            resolve();
          } catch (e) {
            reject(e);
          }
        });
      });
    }

    if (!handle) {
      console.log("DEBUG: Handle is missing in request");
      return res.status(401).json({ message: "Missing handle to map solve to a user" });
    }
    const user = await findUserByHandle(platform, handle);
    if (!user) {
      console.log(`DEBUG: User not found for handle: ${handle} on platform: ${platform}`);
      return res.status(404).json({ message: `No CodeCanon account linked to LeetCode handle '${handle}'` });
    }
    userId = user._id || user.id;
    return await handleSolve(req, res, { platform, questionTitle, problemSlug, userId });
  } catch (error) {
    return res.status(500).json({ message: "Failed to record solve" });
  }
});

router.post("/manual", requireAuth, async (req, res) => {
  try {
    const { canonicalQuestionId, platform, questionTitle } = req.body;
    if (!canonicalQuestionId || !platform) {
      return res.status(400).json({ message: "Missing canonicalQuestionId or platform" });
    }
    if (useMockStore()) {
      const solve = mockStore.upsertSolve({
        userId: req.user.id,
        canonicalQuestionId,
        platform,
        verified: false,
        source: "manual",
        questionTitle
      });
      return res.json({ solve });
    }
    const solve = await UserSolve.findOneAndUpdate(
      { userId: req.user.id, canonicalQuestionId, platform },
      { userId: req.user.id, canonicalQuestionId, platform, verified: false, source: "manual", questionTitle },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return res.json({ solve });
  } catch (error) {
    return res.status(500).json({ message: "Failed to record manual solve" });
  }
});

const handleSolve = async (req, res, { platform, questionTitle, problemSlug, userId }) => {
  const canonical = await findCanonicalMatch({ platform, questionTitle, problemSlug });
  const canonicalId = canonical ? (canonical._id || canonical.id) : null;

  if (useMockStore()) {
    const solve = mockStore.upsertSolve({
      userId,
      canonicalQuestionId: canonicalId,
      platform,
      verified: true,
      source: "extension",
      questionTitle,
      problemSlug
    });
    return res.json({ solve, canonicalId });
  }

  // Define query based on whether it is canonical or not
  const query = canonicalId
    ? { userId, canonicalQuestionId: canonicalId, platform }
    : { userId, platform, problemSlug: problemSlug || "", questionTitle: questionTitle || "" };

  const solve = await UserSolve.findOneAndUpdate(
    query,
    {
      userId,
      canonicalQuestionId: canonicalId,
      platform,
      verified: true,
      source: "extension",
      questionTitle,
      problemSlug
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return res.json({ solve, canonicalId });
};

export default router;
