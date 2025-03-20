const express = require("express");
const jwt = require('jsonwebtoken');
const passport = require("passport");
const session = require("express-session");
require("dotenv").config();
require("./auth"); // Stratégies OAuth2
const bcrypt = require("bcryptjs"); // Importation de bcrypt
const User = require("./models/User"); // Assure-toi que ton modèle User est bien défini
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");
const cors = require("cors");
const path = require("path");

// Initialisation de l'application Express
const app = express();

// Middleware JSON pour les requêtes POST
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration CORS
app.use(cors({
    origin: "http://localhost:5173", // Remplacer par l'URL de ton frontend
    credentials: true,
}));

// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ Connecté à MongoDB"))
    .catch(err => console.error("❌ Erreur de connexion MongoDB :", err));

const conn = mongoose.connection;

// Initialisation de GridFS et Multer
const Grid = require("gridfs-stream");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");

let gfs;
conn.once("open", () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection("uploads");
});

// Configuration du stockage GridFS
const storage = new GridFsStorage({
    url: process.env.MONGO_URI,
    file: (req, file) => {
        return { filename: `${Date.now()}-${file.originalname}`, bucketName: "uploads" };
    },
});
const upload = multer({ storage });

// Exporter `upload` et `gfs` avant d'importer les routes
module.exports = { upload, gfs };

// Importer les routes APRES l'initialisation de `upload`
const exerciseRoutes = require("./routes/exerciseRoutes");
const submissionRoutes = require("./routes/SubmissionRoutes");
const correctionRoutes = require("./routes/correctionRoutes"); // Maintenant défini ici

// Configuration de la session avec MongoStore
app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: { secure: process.env.NODE_ENV === "production" } // Sécurisation en mode production
}));

// Route de connexion pour les enseignants avec vérification du mot de passe sécurisé
// Dans server.js, modifier la route de connexion pour utiliser Passport
// app.post("/api/login/teacher", async (req, res) => {
//     const { email, password } = req.body;

//     try {
//         console.log("Email reçu :", email); // Vérifie l'email reçu
//         const teacher = await User.findOne({ email, role: "teacher" });

//         if (!teacher) {
//             return res.status(404).json({ message: "Enseignant non trouvé" });
//         }

//         // Vérifie le mot de passe avec bcrypt
//         const isMatch = await bcrypt.compare(password, teacher.password);

//         console.log("Mot de passe validé :", isMatch); // Vérifie si le mot de passe correspond

//         if (!isMatch) {
//             return res.status(401).json({ message: "Mot de passe incorrect" });
//         }

//         // Si tout va bien, retourne l'utilisateur enseignant
//         res.json(teacher);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Erreur du serveur" });
//     }
// });

// 🔐 Route de connexion pour enseignants avec JWT
app.post("/api/login/teacher", async (req, res) => {
    const { email, password } = req.body;

    try {
        const teacher = await User.findOne({ email, role: "teacher" });

        if (!teacher) {
            return res.status(404).json({ message: "Enseignant non trouvé" });
        }

        const isMatch = await bcrypt.compare(password, teacher.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Mot de passe incorrect" });
        }

        const token = jwt.sign(
            { id: teacher._id, role: teacher.role },
            process.env.JWT_SECRET || "SECRET_KEY",
            { expiresIn: "1h" }
        );

        res.json({
            success: true,
            user: {
                _id: teacher._id,
                email: teacher.email,
                role: teacher.role,
                name: teacher.name
            },
            token
        });

    } catch (error) {
        console.error("Erreur serveur :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

// Route pour récupérer l'utilisateur avec JWT
app.get("/api/user", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Token manquant" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "SECRET_KEY");
        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(401).json({ message: "Utilisateur non trouvé" });
        }

        res.json(user);
    } catch (error) {
        res.status(401).json({ message: "Token invalide" });
    }
});


// Assurez-vous d'avoir configuré Passport correctement avec:
passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});


// Initialisation de Passport
app.use(passport.initialize());
app.use(passport.session());

// Route de base
app.get("/", (req, res) => {
    res.send("Serveur en ligne !");
});

// Routes d'authentification OAuth2 (Google, GitHub, Microsoft)
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
app.get("/auth/google/callback", passport.authenticate("google", { failureRedirect: "/" }), (req, res) => {
    if (!req.user) {
        return res.status(500).send("Erreur d'authentification Google");
    }
    res.redirect("http://localhost:5173/exercises");
});

app.get("/auth/github", passport.authenticate("github", { scope: ["user:email"] }));
app.get("/auth/github/callback", passport.authenticate("github", { failureRedirect: "/" }), (req, res) => {
    if (!req.user) {
        return res.status(500).send("Erreur d'authentification GitHub");
    }
    res.redirect("http://localhost:5173/exercises");
});

app.get("/auth/microsoft", passport.authenticate("microsoft"));
app.get("/auth/microsoft/callback", passport.authenticate("microsoft", { failureRedirect: "/" }), (req, res) => {
    if (!req.user) {
        return res.status(500).send("Erreur d'authentification Microsoft");
    }
    res.redirect("http://localhost:5173/exercises");
});

// Déconnexion
app.get("/logout", (req, res) => {
    req.logout(() => {});
    res.redirect("/");
});

// Récupération de l'utilisateur connecté
app.get("/api/user", (req, res) => {
    if (req.isAuthenticated()) {
        res.json(req.user);
    } else {
        res.status(401).json({ message: "Non authentifié" });
    }
});

// Routes des exercices, soumissions et corrections
app.use("/api/exercises", exerciseRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/corrections", correctionRoutes);

// Routes pour le dashboard
const dashboardRoutes = require("./routes/dashboardRoutes");
app.use("/api/dashboard", dashboardRoutes);

// Servir les fichiers React en production
app.use(express.static(path.join(__dirname, "../frontend/dist")));

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
});

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});
