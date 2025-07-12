import {  Routes, Route } from  'react-router-dom'
import Home from './pages/Home'
import SignUpPage from './pages/Signup'
import SignInPage from './pages/Login'
import SignUpSuccess from './pages/SignupSuccess'
import Exercises from './pages/Exercises'
import ProtectedRoute from './components/ProtectedRoutes'
import AddExercise from './pages/Addexercises'
import ExercisesSheets from './pages/exercisesSheets'
import TimerPage from './pages/timerPage'
import AgendaPage from './pages/Agenda'
import WorkoutGuide from './pages/workoutGuide'

export default function App() {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<SignInPage />} />
        <Route path="/signup-success" element={<SignUpSuccess/>} />
        <Route path="/exercises" element={<ProtectedRoute><Exercises /></ProtectedRoute>}/>
        <Route path="/addexercises" element={<ProtectedRoute><AddExercise /></ProtectedRoute>} />
        <Route path="/exercisesheet" element={<ProtectedRoute><ExercisesSheets /></ProtectedRoute>} />
        <Route path="/timer" element={<ProtectedRoute><TimerPage /></ProtectedRoute>} />
        <Route path="/agenda" element={<ProtectedRoute><AgendaPage /></ProtectedRoute>} />
        <Route path="/workoutguide" element={<ProtectedRoute><WorkoutGuide /></ProtectedRoute>} />


      </Routes>
 
           )
}

