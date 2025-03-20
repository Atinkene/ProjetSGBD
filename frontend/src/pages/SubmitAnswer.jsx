import React, { useState, useEffect } from "react";
import axios from "axios";

const SubmitAnswer = () => {
    const [exercises, setExercises] = useState([]);
    const [selectedExercise, setSelectedExercise] = useState("");
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState("");

    useEffect(() => {
        axios.get("http://localhost:5000/api/exercises")
            .then(response => setExercises(response.data))
            .catch(error => console.error("Erreur:", error));
    }, []);

    const handleFileChange = (e) => {
        console.log("Fichier sélectionné:", e.target.files[0]);  // Debug
        setFile(e.target.files[0]); // Met à jour l'état du fichier sélectionné
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log("Exercice sélectionné:", selectedExercise);  // Debug
        console.log("Fichier sélectionné:", file);  // Debug

        if (!file || !selectedExercise) {
            setMessage("Veuillez sélectionner un exercice et un fichier !");
            return;
        }

        const formData = new FormData();
        formData.append("exerciseId", selectedExercise);
        formData.append("file", file);

        try {
            const response = await axios.post("http://localhost:5000/api/submissions/submit", formData, {
                withCredentials: true,
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (response.status === 201) {
                setMessage("✅ Réponse soumise avec succès !");
            }
        } catch (error) {
            setMessage("❌ Erreur lors de la soumission.");
        }
    };

    return (
        <div className="p-6 max-w-md mx-auto bg-white shadow-md rounded">
            <h2 className="text-2xl font-bold mb-4">Soumettre une Réponse</h2>

            {message && <p className="mb-2 text-red-500">{message}</p>}

            <form onSubmit={handleSubmit}>
                <select
                    className="w-full p-2 mb-2 border rounded"
                    value={selectedExercise}
                    onChange={(e) => setSelectedExercise(e.target.value)}
                >
                    <option value="">Sélectionnez un exercice</option>
                    {exercises.map(ex => (
                        <option key={ex._id} value={ex._id}>{ex.title}</option>
                    ))}
                </select>

                <input 
                    type="file" 
                    onChange={handleFileChange} 
                    className="w-full mb-2 border p-2"
                />

                <button 
                    type="submit" 
                    className="w-full bg-green-500 text-white p-2 rounded"
                >
                    Soumettre
                </button>
            </form>
        </div>
    );
};

export default SubmitAnswer;
