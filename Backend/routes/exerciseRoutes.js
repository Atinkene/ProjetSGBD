const express = require("express");
const multer = require("multer");
const Exercise = require("../models/Exercise");
const router = express.Router();

// Configuration de l'upload avec Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Route pour créer un exercice
router.post("/create", upload.single("file"), async (req, res) => {
    try {
        const { title, description } = req.body;
        const newExercise = new Exercise({
            title,
            description,
            fileUrl: req.file ? `/uploads/${req.file.filename}` : null,
            createdBy: req.user._id,
        });

        await newExercise.save();
        res.status(201).json(newExercise);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route pour récupérer tous les exercices
router.get("/", async (req, res) => {
    try {
        const exercises = await Exercise.find().populate("createdBy", "name");
        res.json(exercises);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
