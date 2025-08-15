import { Routes, Route } from  'react-router-dom'
import ProtectedRoute from './components/ProtectedRoutes'
import NotFound from './pages/NotFound'
import { lazy } from 'react'

const AgendaPage = lazy(() => import('./pages/Agenda'))
const Exercises = lazy(() => import('./pages/Exercises'))
const ExercisesSheets = lazy(() => import('./pages/exercisesSheets'))
const Addexercise = lazy(() => import('./pages/Addexercises'))
const WorkoutGuide = lazy(() => import('./pages/workoutGuide'))
const SignUpSuccess = lazy(() => import('./pages/SignupSuccess'))
const SignUpPage = lazy(() => import('./pages/Signup'))
const SignInPage = lazy(() => import('./pages/Login'))
const Home = lazy(() => import('./pages/Home'))


export default function App() {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<SignInPage />} />
        <Route path="/signup-success" element={<SignUpSuccess/>} />
        <Route path="/exercises" element={<ProtectedRoute><Exercises /></ProtectedRoute>}/>
        <Route path="/addexercises" element={<ProtectedRoute><Addexercise /></ProtectedRoute>} />
        <Route path="/exercisesheet" element={<ProtectedRoute><ExercisesSheets /></ProtectedRoute>} />
        <Route path="/agenda" element={<ProtectedRoute><AgendaPage /></ProtectedRoute>} />
        <Route path="/workoutguide" element={<ProtectedRoute><WorkoutGuide /></ProtectedRoute>} />
       <Route path="*" element={<NotFound/> } />


      </Routes>
 
           )
}

