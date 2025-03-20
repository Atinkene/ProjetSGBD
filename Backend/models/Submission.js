const mongoose = require("mongoose");
const { upload, gfs } = require("../server");


const SubmissionSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    exercise: { type: mongoose.Schema.Types.ObjectId, ref: "Exercise", required: true },
    fileId: { type: String, required: true }, // ID du fichier stocké dans GridFS
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Submission", SubmissionSchema);
