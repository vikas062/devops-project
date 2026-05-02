import express from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { signToken } from "../utils/jwt.js";
import { mockStore, useMockStore } from "../utils/mockStore.js";
import passport from "../config/passport.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    if (useMockStore()) {
      const existing =
        mockStore.findUserByEmail(email) || mockStore.findUserByUsername(username);
      if (existing) {
        return res.status(409).json({ message: "Email or username already in use" });
      }
      const user = await mockStore.createUser({ name, username, email, password });
      const token = signToken({ _id: user.id, email: user.email, username: user.username });
      return res.status(201).json({
        token,
        user: { id: user.id, name: user.name, username: user.username, email: user.email }
      });
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const existingUsername = await User.findOne({ username: username.toLowerCase() });
    if (existingUsername) {
      return res.status(409).json({ message: "Username already taken" });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      passwordHash,
    });
    const token = signToken(user);
    return res.status(201).json({ token, user: { id: user._id, name: user.name, username: user.username, email: user.email, handles: user.handles || {} } });
  } catch (error) {
    return res.status(500).json({ message: "Signup failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Missing credentials" });
    }

    // Admin check
    if ((email === "admin@example.com" || email === "admin") && password === "admin123") {
      const adminUser = {
        _id: "admin-id",
        name: "Admin User",
        username: "admin",
        email: "admin@example.com",
        handles: {}
      };
      const token = signToken(adminUser);
      return res.json({
        token,
        user: {
          id: adminUser._id,
          name: adminUser.name,
          username: adminUser.username,
          email: adminUser.email,
          handles: adminUser.handles
        }
      });
    }

    if (useMockStore()) {
      const user =
        mockStore.findUserByEmail(email) ||
        mockStore.findUserByUsername(email); // Here 'email' variable can be username too
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const match = await mockStore.validatePassword(user, password);
      if (!match) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const token = signToken({ _id: user.id, email: user.email, username: user.username });
      return res.json({
        token,
        user: { id: user.id, name: user.name, username: user.username, email: user.email, handles: user.handles || {} }
      });
    }

    // Real DB check: find by email OR username
    const user = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: email.toLowerCase() }
      ]
    });

    if (!user) {
      console.log("Login failed: User not found", email);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if user has a password (might be OAuth-only)
    if (!user.passwordHash) {
      console.log("Login failed: User has no password (maybe OAuth user?)", email);
      return res.status(401).json({ message: "Invalid credentials. Try logging in with Google." });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      console.log("Login failed: Password mismatch", email);
      return res.status(401).json({ message: "Invalid credentials" });
    }
    console.log("Login successful:", user.username);
    const token = signToken(user);
    return res.json({ token, user: { id: user._id, name: user.name, username: user.username, email: user.email, handles: user.handles || {} } });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Login failed" });
  }
});

// GET /api/auth/check-username?username=...
router.get("/check-username", async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    if (useMockStore()) {
      const existing = mockStore.findUserByUsername(username);
      return res.json({ available: !existing });
    }

    const existing = await User.findOne({ username: username.toLowerCase() });
    return res.json({ available: !existing });
  } catch (error) {
    console.error("Check username error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});



// GET /api/auth/google
// Triggers the Google OAuth flow
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// GET /api/auth/google/callback
// Handle the callback from Google
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_ORIGIN}/login`,
    session: false // We use JWT, so no session
  }),
  (req, res) => {
    // Successful authentication, generate JWT
    const user = req.user;
    const token = signToken(user);

    // Redirect to frontend with token
    res.redirect(`${process.env.CLIENT_ORIGIN}/auth-callback?token=${token}`);
  }
);

export default router;
