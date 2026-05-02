import mongoose from "mongoose";

const handlesSchema = new mongoose.Schema(
  {
    leetcode: { type: String, trim: true },
    gfg: { type: String, trim: true },
    codeforces: { type: String, trim: true },
    hackerrank: { type: String, trim: true },
    codechef: { type: String, trim: true },
    spoj: { type: String, trim: true },
    atcoder: { type: String, trim: true },
    hackerearth: { type: String, trim: true },
    github: { type: String, trim: true }
  },
  { _id: false }
);

const statsSchema = new mongoose.Schema({
  grandTotal: { type: Number, default: 0 },
  totalSolved: { type: Number, default: 0 },
  easy: { type: Number, default: 0 },
  medium: { type: Number, default: 0 },
  hard: { type: Number, default: 0 },
  activeDays: { type: Number, default: 0 },
  contests: { type: Number, default: 0 },
  dsaTopics: { type: Object, default: {} },
  contestRatings: { type: Object, default: {} },
  awards: [{ type: String }],
  cScore: { type: Number, default: 0 },
  activityHeatmap: [{ type: Object }], // [{ date: '2025-10-01', count: 5 }]
  lastSynced: { type: Date }
}, { _id: false });

const workSchema = new mongoose.Schema({
  company: { type: String, required: true },
  role: { type: String, required: true },
  dateRange: { type: String }, // e.g. "Jan 2023 - Present"
  description: { type: String }
}, { _id: false });

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  techStack: [{ type: String }],
  link: { type: String },
  image: { type: String }
}, { _id: false });

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: false }, // Optional for OAuth users
    googleId: { type: String, unique: true, sparse: true },
    avatar: { type: String },
    bio: { type: String, maxLength: 200 },
    handles: { type: handlesSchema, default: {} },
    stats: { type: statsSchema, default: {} },
    platformsData: { type: Object, default: {} }, // Stores raw data from fetchers
    devPersona: { type: String, default: "Novice Coder" }, // e.g. "Graph Guardian"
    work: [workSchema],
    projects: [projectSchema]
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
