import mongoose from "mongoose";

const platformSchema = new mongoose.Schema(
  {
    platform: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    link: { type: String, required: true, trim: true },
    score: { type: Number, required: true }
  },
  { _id: false }
);

const canonicalQuestionSchema = new mongoose.Schema(
  {
    canonicalTitle: { type: String, required: true, trim: true },
    topic: { type: [String], required: true },
    overallMatch: { type: Number, required: true },
    platforms: { type: [platformSchema], required: true }
  },
  { timestamps: true }
);

export const CanonicalQuestion = mongoose.model("CanonicalQuestion", canonicalQuestionSchema);
