const express = require("express");
const { upload, gfs } = require("../server"); // Import correct
const Submission = require("../models/Submission");

const router = express.Router();

// Route pour soumettre un fichier
router.post("/submit", upload.single("file"), async (req, res) => {
    try {
        const newSubmission = new Submission({
            student: req.user._id,
            exercise: req.body.exerciseId,
            fileId: req.file.id, // ID du fichier stocké dans GridFS
        });

        await newSubmission.save();
        res.status(201).json({ message: "Réponse soumise avec succès", submission: newSubmission });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route pour récupérer un fichier depuis GridFS
router.get("/file/:id", async (req, res) => {
    try {
        const file = await gfs.files.findOne({ _id: new mongoose.Types.ObjectId(req.params.id) });
        if (!file) return res.status(404).json({ message: "Fichier non trouvé" });

        const readstream = gfs.createReadStream(file._id);
        readstream.pipe(res);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
