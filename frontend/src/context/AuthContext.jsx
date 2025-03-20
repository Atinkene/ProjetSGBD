import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(undefined); // undefined pour différencier le chargement de null
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get("http://localhost:5000/api/user", { withCredentials: true })
            .then(response => {
                console.log("Utilisateur récupéré:", response.data); // Vérifie les données ici
                setUser(response.data);
            })
            .catch(error => {
                console.error("Erreur lors de la récupération de l'utilisateur:", error);
                setUser(null);
            });
    }, []);
    
    
    const logout = () => {
        axios.get("http://localhost:5000/logout", { withCredentials: true })
            .then(() => {
                setUser(null);  // Supprime l'utilisateur du contexte
                window.location.href = "/"; // Redirige vers la page de connexion
            })
            .catch(error => console.error("Erreur lors de la déconnexion :", error));
    };
    

    return (
        <AuthContext.Provider value={{ user, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
