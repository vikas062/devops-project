import mongoose from "mongoose";

const userSolveSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    canonicalQuestionId: { type: mongoose.Schema.Types.ObjectId, ref: "CanonicalQuestion" }, // Optional for non-NeetCode problems
    platform: { type: String, required: true, trim: true },
    status: { type: String, enum: ["solved"], default: "solved" },
    verified: { type: Boolean, default: false },
    source: { type: String, enum: ["extension", "manual"], default: "manual" },
    questionTitle: { type: String, trim: true },
    problemSlug: { type: String, trim: true }
  },
  { timestamps: true }
);

// Enforce uniqueness when canonical ID is present
userSolveSchema.index(
  { userId: 1, canonicalQuestionId: 1, platform: 1 },
  { unique: true, partialFilterExpression: { canonicalQuestionId: { $exists: true, $ne: null } } }
);

// Enforce uniqueness by slug/title for non-canonical solves
userSolveSchema.index(
  { userId: 1, platform: 1, problemSlug: 1, questionTitle: 1 },
  { unique: true, partialFilterExpression: { canonicalQuestionId: null } }
);

export const UserSolve = mongoose.model("UserSolve", userSolveSchema);
