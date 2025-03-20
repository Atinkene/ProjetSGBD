const express = require("express");
const mongoose = require("mongoose");
const { gfs } = require("../server");
const Submission = require("../models/Submission");
const Correction = require("../models/Correction");
const extractTextFromPDF = require("../utils/pdfParser");
const generateCorrectionPDF = require("../utils/pdfGenerator");


const router = express.Router();

// Fonction de comparaison simple (peut être améliorée avec NLP)
function compareText(studentText, modelText) {
    const words1 = studentText.split(/\s+/);
    const words2 = modelText.split(/\s+/);
    const commonWords = words1.filter(word => words2.includes(word));
    return (commonWords.length / Math.max(words1.length, words2.length)) * 100;
}

// Route pour corriger une soumission
router.post("/correct/:submissionId", async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.submissionId).populate("exercise");
        if (!submission) return res.status(404).json({ message: "Soumission introuvable" });

        // Récupérer le fichier PDF depuis GridFS
        const fileId = submission.fileId;
        const file = await gfs.files.findOne({ _id: new mongoose.Types.ObjectId(fileId) });
        if (!file) return res.status(404).json({ message: "Fichier non trouvé" });

        // Sauvegarde temporaire et extraction du texte
        const filePath = `./temp/${file.filename}`;
        const writeStream = require("fs").createWriteStream(filePath);
        gfs.createReadStream(file._id).pipe(writeStream);
        
        writeStream.on("finish", async () => {
            const studentText = await extractTextFromPDF(filePath);
            const modelText = "Contenu de la solution modèle"; // À remplacer par la solution de référence

            const similarityScore = compareText(studentText, modelText);
            const feedback = similarityScore > 80 ? "Bonne réponse !" : "Besoin d'amélioration.";

            // Sauvegarde de la correction
            const correction = new Correction({
                submission: submission._id,
                similarityScore,
                feedback,
            });

            await correction.save();
            res.status(201).json({ message: "Correction effectuée", correction });
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



// Route pour générer un PDF d'une correction
router.get("/download/:correctionId", async (req, res) => {
    try {
        const correction = await Correction.findById(req.params.correctionId);
        if (!correction) return res.status(404).json({ message: "Correction introuvable" });

        const filePath = `./temp/correction-${correction._id}.pdf`;
        await generateCorrectionPDF(correction, filePath);

        res.download(filePath, `Correction-${correction._id}.pdf`, (err) => {
            if (err) console.error("Erreur de téléchargement :", err);
            fs.unlinkSync(filePath); // Supprime le fichier après téléchargement
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



router.get("/", async (req, res) => {
    try {
        const corrections = await Correction.find().populate("submission");
        res.json(corrections);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;

