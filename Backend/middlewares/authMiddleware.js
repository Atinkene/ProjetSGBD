const jwt = require("jsonwebtoken");

const isTeacher = (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1]; // Vérifie si le token est présent

    if (!token) {
        return res.status(401).json({ message: "Token manquant. Veuillez vous authentifier." });
    }

    jwt.verify(token, process.env.JWT_SECRET || "SECRET_KEY", (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Token invalide. Accès refusé." });
        }

        if (decoded.role !== "teacher") {
            return res.status(403).json({ message: "Accès réservé aux enseignants." });
        }

        req.user = decoded; // Attache l'utilisateur décodé à req.user
        next(); // Passe au middleware suivant ou à la route
    });
};
