import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateExercise from "./pages/CreateExercise";
import ExerciseList from "./pages/ExerciseList";
import SubmitAnswer from "./pages/SubmitAnswer";
import SubmissionsList from "./pages/SubmissionsList";
import CorrectionsList from "./pages/CorrectionsList";

  

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/create-exercise" element={<CreateExercise />} />
                    <Route path="/exercises" element={<ExerciseList />} />
                    <Route path="/submit-answer" element={<SubmitAnswer />} />
                    <Route path="/submissions" element={<SubmissionsList />} />
                    <Route path="/corrections" element={<CorrectionsList />} />


                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
