import React, { useState, useEffect } from "react";
import axios from "axios";

const ExerciseList = () => {
    const [exercises, setExercises] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:5000/api/exercises")
            .then(response => setExercises(response.data))
            .catch(error => console.error("Erreur:", error));
    }, []);

    return (
        <div className="p-6 max-w-lg mx-auto bg-white shadow-md rounded">
            <h2 className="text-2xl font-bold mb-4">Liste des Exercices</h2>
            <ul>
                {exercises.map(exercise => (
                    <li key={exercise._id} className="p-2 border-b">
                        <h3 className="font-bold">{exercise.title}</h3>
                        <p>{exercise.description}</p>
                        {exercise.fileUrl && <a href={`http://localhost:5000${exercise.fileUrl}`} target="_blank" className="text-blue-500">Voir PDF</a>}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ExerciseList;
