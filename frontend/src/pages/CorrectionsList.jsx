import React, { useState, useEffect } from "react";
import axios from "axios";

const CorrectionsList = () => {
    const [corrections, setCorrections] = useState([]);


    useEffect(() => {
        axios.get("http://localhost:5000/api/corrections")
            .then(response => {
                console.log("Corrections récupérées :", response.data); // 🔍 Vérifier les données
                setCorrections(response.data);
            })
            .catch(error => console.error("Erreur:", error));
    }, []);
    

    const handleDownload = (correctionId) => {
        window.open(`http://localhost:5000/api/corrections/download/${correctionId}`, "_blank");
    };

    return (
        <div className="p-6 max-w-lg mx-auto bg-white shadow-md rounded">
            <h2 className="text-2xl font-bold mb-4">Corrections</h2>
            <ul>
                {corrections.map(correction => (
                    <li key={correction._id} className="p-2 border-b">
                        <p>Score : {correction.similarityScore.toFixed(2)}%</p>
                        <p>Feedback : {correction.feedback}</p>
                        <button 
                            onClick={() => handleDownload(correction._id)} 
                            className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
                        >
                            Télécharger le PDF
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CorrectionsList;
