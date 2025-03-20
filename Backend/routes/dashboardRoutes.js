const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { isTeacher } = require("../middlewares/authMiddleware");

const router = express.Router();

// Route de connexion enseignant
router.post("/login/teacher", async (req, res) => {
    const { email, password } = req.body;

    try {
        console.log("📩 Tentative de connexion :", email);

        const user = await User.findOne({ email });

        if (!user) {
            console.error("❌ Utilisateur introuvable");
            return res.status(401).json({ message: "Email ou mot de passe incorrect" });
        }

        if (user.role !== "teacher") {
            console.error("❌ Accès refusé : rôle invalide");
            return res.status(403).json({ message: "Accès réservé aux enseignants" });
        }

        console.log("🔐 Vérification du mot de passe...");
        console.log("📌 Mot de passe fourni :", password);
        console.log("📌 Mot de passe en base :", user.password);

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            console.error("❌ Mot de passe incorrect");
            return res.status(401).json({ message: "Email ou mot de passe incorrect" });
        }

        console.log("✅ Connexion réussie :", user.email);

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || "SECRET_KEY",
            { expiresIn: "1h" }
        );

        res.json({ success: true, user, token });
    } catch (error) {
        console.error("❌ Erreur serveur :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

module.exports = router;
