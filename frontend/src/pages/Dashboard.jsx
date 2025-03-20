import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import "../styles/dashboard.css"; // Import du fichier CSS

const Dashboard = () => {
    const [user, setUser] = useState(null); // Stocke les données utilisateur
    const [stats, setStats] = useState({});
    const [submissions, setSubmissions] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            console.error("❌ Aucun token trouvé, redirection vers login");
            navigate("/login");
            return;
        }

        // Récupération de l'utilisateur
        axios.get("http://localhost:5000/api/user", {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true
        })
        .then(response => {
            console.log("✅ Données utilisateur reçues :", response.data);

            if (response.data.role !== "teacher") {
                console.error("❌ Accès refusé, redirection vers home");
                navigate("/");
                return;
            }

            setUser(response.data); // Stocke l'utilisateur pour éviter un nouvel appel API
            fetchStatsAndSubmissions(token);
        })
        .catch(error => {
            console.error("❌ Erreur lors de la récupération de l'utilisateur :", error);
            navigate("/login");
        });

    }, [navigate]); // Dépendance minimale pour éviter les appels inutiles

    // Chargement des statistiques et soumissions
    const fetchStatsAndSubmissions = async (token) => {
        try {
            const [statsRes, submissionsRes] = await Promise.all([
                axios.get("http://localhost:5000/api/dashboard/stats", {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get("http://localhost:5000/api/dashboard/submissions", {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            setStats(statsRes.data);

            // Vérifie que submissionsRes.data est un tableau
            if (Array.isArray(submissionsRes.data)) {
                setSubmissions(submissionsRes.data);
            } else {
                console.error("❌ Les soumissions ne sont pas sous forme de tableau :", submissionsRes.data);
                setSubmissions([]); // Par défaut, un tableau vide si la réponse n'est pas valide
            }
        } catch (error) {
            console.error("❌ Erreur lors du chargement des données :", error);
            setSubmissions([]); // Assurez-vous de toujours définir submissions à un tableau
        }
    };

    const chartData = {
        labels: ["Soumissions", "Corrections", "Score moyen"],
        datasets: [
            {
                label: "Statistiques",
                data: [stats.totalSubmissions || 0, stats.totalCorrections || 0, stats.averageScore || 0],
                backgroundColor: ["#3498db", "#e74c3c", "#2ecc71"],
            }
        ]
    };

    return (
        <div className="dashboard-container">
            {/* Section des statistiques */}
            <div className="dashboard-stats">
                <h2 className="dashboard-title">Tableau de Bord</h2>
                <Bar data={chartData} />
            </div>

            {/* Section des soumissions */}
            <div className="dashboard-submissions">
                <h3 className="dashboard-title">Liste des Soumissions</h3>
                {submissions.length === 0 ? (
                    <p>Aucune soumission trouvée.</p>
                ) : (
                    submissions.map(sub => (
                        <div key={sub._id} className="submission-item">
                            <p><strong>Exercice :</strong> {sub.exercise.title}</p>
                            <p className="submission-score">
                                <strong>Score :</strong> {sub.correction?.similarityScore?.toFixed(2) || "Non corrigé"}%
                            </p>
                            <p><strong>Feedback :</strong> {sub.correction?.feedback || "En attente de correction"}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Dashboard;
