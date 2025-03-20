import React, { useState } from "react";
import axios from "axios";

const CreateExercise = () => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [file, setFile] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        if (file) formData.append("file", file);

        try {
            await axios.post("http://localhost:5000/api/exercises/create", formData, {
                withCredentials: true,
                headers: { "Content-Type": "multipart/form-data" },
            });
            alert("Exercice créé avec succès !");
        } catch (error) {
            alert("Erreur lors de la création de l'exercice.");
        }
    };

    return (
        <div className="p-6 max-w-md mx-auto bg-white shadow-md rounded">
            <h2 className="text-2xl font-bold mb-4">Créer un Exercice</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Titre" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 mb-2 border rounded" />
                <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-2 mb-2 border rounded"></textarea>
                <input type="file" onChange={(e) => setFile(e.target.files[0])} className="w-full mb-2" />
                <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">Créer</button>
            </form>
        </div>
    );
};

export default CreateExercise;
