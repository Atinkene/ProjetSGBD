const mongoose = require("mongoose");

const CorrectionSchema = new mongoose.Schema({
    submission: { type: mongoose.Schema.Types.ObjectId, ref: "Submission", required: true },
    similarityScore: { type: Number, required: true },
    feedback: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Correction", CorrectionSchema);
