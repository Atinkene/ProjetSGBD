import React, { useState, useEffect } from "react";
import axios from "axios";

const SubmissionsList = () => {
    const [submissions, setSubmissions] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:5000/api/submissions")
            .then(response => setSubmissions(response.data))
            .catch(error => console.error("Erreur:", error));
    }, []);

    return (
        <div className="p-6 max-w-lg mx-auto bg-white shadow-md rounded">
            <h2 className="text-2xl font-bold mb-4">Réponses Soumises</h2>
            <ul>
                {submissions.map(sub => (
                    <li key={sub._id} className="p-2 border-b">
                        <p>Exercice : {sub.exercise.title}</p>
                        <p>Étudiant : {sub.student.name}</p>
                        <a href={`http://localhost:5000/api/submissions/file/${sub.fileId}`} className="text-blue-500">Voir PDF</a>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SubmissionsList;
