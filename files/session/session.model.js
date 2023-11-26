const mongoose = require("mongoose")

const sessionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    tutorId: { type: mongoose.Types.ObjectId, ref: "User" },
    studentId: [{ type: mongoose.Types.ObjectId, ref: "User" }],
    category: {
      type: String,
    },
    description: {
      type: String,
    },
    outcome: {
      type: String,
    },
    duration: {
      type: String,
    },
    link: {
      type: String,
    },
    start: {
      type: Boolean,
      default: false,
    },
    date: {
      type: Date,
    },
    time: {
      type: String,
    },
    charges: {
      type: Number,
    },
    rating: [
      {
        rate: Number,
        recommendTutor: String,
        review: String,
        ratedBy: { type: mongoose.Types.ObjectId, ref: "Users" },
      },
    ],
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
    type: {
      type: String,
      enum: ["recorded", "not-recorded"],
      default: "not-recorded",
    },
  },
  { timestamps: true }
)

const session = mongoose.model("Session", sessionSchema, "session")

module.exports = { Session: session }
