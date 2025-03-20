import React, { useState, useEffect } from "react"; // Ajout de useEffect
import { FaGoogle, FaGithub, FaMicrosoft } from "react-icons/fa";
import "./Login.css"; 
import { useNavigate } from "react-router-dom"; 

const Login = () => {
    const navigate = useNavigate(); 
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState("");

    useEffect(() => {
        // Vérifie si l'utilisateur est déjà connecté en vérifiant le token dans localStorage
        const token = localStorage.getItem("token");
        if (token) {
            navigate("/dashboard"); // Redirige vers le dashboard si un token est trouvé
        } else {
            // Vérifie le token dans l'URL (si l'utilisateur est redirigé après une connexion)
            const urlParams = new URLSearchParams(window.location.search);
            const tokenFromUrl = urlParams.get("token");

            if (tokenFromUrl) {
                localStorage.setItem("token", tokenFromUrl); // Stocke le token si trouvé dans l'URL
                console.log("Token stocké : ", tokenFromUrl);
                navigate("/dashboard");
            }
        }
    }, [navigate]);

    // Fonction pour la connexion enseignant
    const handleTeacherLogin = async (e) => {
        e.preventDefault();
        setLoginError("");
        
        try {
            const response = await fetch("http://localhost:5000/api/login/teacher", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
                credentials: "include" // Pour gérer les cookies de session
            });
        
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Erreur HTTP : ${response.status}`);
            }
        
            const data = await response.json();
            console.log("Connexion enseignant réussie :", data);
            
            // Stocker les informations de l'utilisateur et le token dans localStorage
            localStorage.setItem("user", JSON.stringify(data.user));
            if (data.token) {
                localStorage.setItem("token", data.token);
                console.log("✅ Token stocké :", data.token);
            } else {
                console.error("❌ Erreur : aucun token reçu !");
            }
            
            // Vérifie si le token a bien été stocké avant de rediriger
            const token = localStorage.getItem("token");
            if (token) {
                navigate("/dashboard");
            } else {
                console.error("❌ Token non trouvé, connexion échouée.");
            }
            
        } catch (error) {
            console.error("Erreur de connexion :", error);
            setLoginError(error.message || "Échec de la connexion");
        }
    };
    

    // Fonction pour les connexions OAuth (Google, GitHub, Microsoft)
    const handleOAuthLogin = (provider) => {
        window.location.href = `http://localhost:5000/auth/${provider}`;
    };

    return (
        <div className="login-container">
            <div className="login-form">
                <h1 className="login-title">Connexion</h1>
                
                {loginError && (
                    <div className="error-message" style={{ color: "red", marginBottom: "1rem" }}>
                        {loginError}
                    </div>
                )}
                
                <div className="login-section">
                    <form className="space-y-4" onSubmit={handleTeacherLogin}>
                        <input 
                            type="email" 
                            placeholder="Email" 
                            className="login-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <input 
                            type="password" 
                            placeholder="Mot de passe" 
                            className="login-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button 
                            type="submit" 
                            className="w-full py-3 rounded-lg shadow-md login-button-teacher"
                        >
                            Connexion Enseignant
                        </button>
                    </form>
                </div>
                
                <div className="login-divider"></div>
                
                <div className="login-section">
                    <p className="mb-4 text-gray-300">Ou connectez-vous avec :</p>
                    <div className="social-buttons">
                        <button 
                            className="flex items-center justify-center w-full py-3 rounded-lg shadow-md login-button-google"
                            onClick={() => handleOAuthLogin("google")}
                        >
                            <FaGoogle className="mr-3 text-xl" /> Connexion avec Google
                        </button>
                        
                        <button 
                            className="flex items-center justify-center w-full py-3 rounded-lg shadow-md login-button-github"
                            onClick={() => handleOAuthLogin("github")}
                        >
                            <FaGithub className="mr-3 text-xl" /> Connexion avec GitHub
                        </button>
                        
                        <button 
                            className="flex items-center justify-center w-full py-3 rounded-lg shadow-md login-button-microsoft"
                            onClick={() => handleOAuthLogin("microsoft")}
                        >
                            <FaMicrosoft className="mr-3 text-xl" /> Connexion avec Microsoft
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
