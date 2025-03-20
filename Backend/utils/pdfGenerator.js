const PDFDocument = require("pdfkit");
const fs = require("fs");

function generateCorrectionPDF(correction, filePath) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream);

        // Ajouter du contenu au PDF
        doc.fontSize(18).text("Correction de l'exercice", { align: "center" });
        doc.moveDown();
        doc.fontSize(14).text(`Score : ${correction.similarityScore.toFixed(2)}%`);
        doc.moveDown();
        doc.fontSize(12).text(`Feedback : ${correction.feedback}`);
        doc.moveDown();
        doc.fontSize(10).text(`Date : ${new Date().toLocaleString()}`, { align: "right" });

        doc.end();
        writeStream.on("finish", () => resolve(filePath));
        writeStream.on("error", (err) => reject(err));
    });
}

module.exports = generateCorrectionPDF;
