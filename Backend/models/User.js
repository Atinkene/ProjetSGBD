const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    googleId: { type: String, sparse: true },   // Google ID optionnel
    githubId: { type: String, sparse: true },   // GitHub ID optionnel
    microsoftId: { type: String, sparse: true },// Microsoft ID optionnel
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ["student", "teacher"], default: "student" },
    password: { type: String, required: true },

});

module.exports = mongoose.model("User", UserSchema);
