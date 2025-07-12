import { useEffect, useRef, useState } from 'react'
import WorkoutCompleteModal from './workoutCompleteModal'
import { useUser } from "@clerk/clerk-react";
const API_URL = import.meta.env.VITE_URL_SERVER 

type Exercise = {
  exerciseId: string
  repetitions: number
  weight?: number
  notes?: string
}

type ExerciseData = {
  name: string
  description?: string
  imageUrl?: string
}

type Props = {
  sheetId: string
  restTime: number // in minuti
  onFinish?: () => void // callback quando l'allenamento è completato
}

const WorkoutRunner = ({ sheetId, restTime }: Props) => {
const [totalWorkoutSeconds, setTotalWorkoutSeconds] = useState(0)

  const [isComplete, setIsComplete] = useState(false)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [exerciseData, setExerciseData] = useState<ExerciseData | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentRep, setCurrentRep] = useState(1)
  const [timer, setTimer] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [phase, setPhase] = useState<'idle' | 'workout' | 'rest'>('idle')
    const { user } = useUser();

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const current = exercises[currentIndex]
  const totalReps = current?.repetitions || 0

  // Fetch scheda
  useEffect(() => {
    fetch(`${API_URL}/api/sheet/${sheetId}`)
      .then(res => res.json())
      .then(data => setExercises(data.exercises || []))
  }, [sheetId])

  // Fetch dati esercizio
  useEffect(() => {
    const loadExerciseData = async () => {
      const ex = exercises[currentIndex]
      if (ex?.exerciseId) {
        try {
          const res = await fetch(`${API_URL}/api/exercises/${ex.exerciseId}`)
          const data = await res.json()
          setExerciseData(data)
        } catch {
          setExerciseData(null)
        }
      }
    }
    if (exercises.length > 0) loadExerciseData()
  }, [currentIndex, exercises])

  // Timer effetto
  useEffect(() => {
  if (isRunning) {
    intervalRef.current = setInterval(() => {
      setTimer(t => (phase === 'rest' ? t - 1 : t + 1))
      setTotalWorkoutSeconds(t => t + 1)
    }, 1000)
  } else {
    clearInterval(intervalRef.current!)
  }

  return () => clearInterval(intervalRef.current!)
}, [isRunning, phase])

  // Quando finisce il recupero → incrementa rep o passa a esercizio successivo
  useEffect(() => {
    if (phase === 'rest' && timer <= 0 && isRunning) {
      completeRep()
    }
  }, [timer, phase, isRunning])

  const startWorkout = () => {
    setTimer(0)
    setIsRunning(true)
    setPhase('workout')
  }

  const startRest = () => {
    setTimer(restTime * 60)
    setIsRunning(true)
    setPhase('rest')
  }

  const completeRep = () => {
    setIsRunning(false)
    if (currentRep < totalReps) {
      setCurrentRep(r => r + 1)
      setPhase('idle')
      setTimer(0)
    } else {
      nextExercise()
    }
  }

  const nextExercise = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(i => i + 1)
      setCurrentRep(1)
      setTimer(0)
      setIsRunning(false)
      setPhase('idle')
    } else {
      setIsComplete(true)
      //onFinish?.()//
          console.log('Workout completato!') // <--- AGGIUNGI QUESTO

    }
  }

  const skipExercise = () => {
    nextExercise()
  }

  const formatTime = (sec: number) =>
    `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`

  const buttonLabel = () => {
    if (phase === 'idle') return 'Start'
    if (phase === 'workout') return 'Inizio recupero'
    if (phase === 'rest') return 'Fine ripetizione'
    return 'Continua'
  }

  const handleMainButton = () => {
    if (phase === 'idle') startWorkout()
    else if (phase === 'workout') startRest()
    else if (phase === 'rest') completeRep()
  }
const handleSaveWorkout = async () => {
    if (!user?.id) return;
    await fetch(`${API_URL}/api/workouts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        sheetId,
        totalSeconds: totalWorkoutSeconds,
        exercises,
      }),
    });
    alert("Allenamento salvato nel calendario!");
  };
  if (exercises.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center p-6">
        <h1 className="text-2xl font-bold mb-6">Nessun esercizio trovato</h1>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center p-6">
        <h1 className="text-2xl font-bold mb-6">
          Esercizio {currentIndex + 1} di {exercises.length}
        </h1>

        <div className="bg-gray-800 p-6 rounded max-w-xl w-full mb-6 text-left space-y-4">
          <h2 className="text-2xl font-bold text-center">
            {exerciseData?.name || 'Caricamento...'}
          </h2>

          {exerciseData?.description && (
            <p className="text-sm text-gray-300">{exerciseData.description}</p>
          )}

          <div className="text-sm space-y-1 text-gray-200">
            <p><strong>Ripetizioni totali:</strong> {current?.repetitions}</p>
            {current?.weight !== undefined && (
              <p><strong>Carico consigliato:</strong> {current.weight} kg</p>
            )}
            {current?.notes && (
              <p><strong>Note:</strong> <span className="italic">{current.notes}</span></p>
            )}
          </div>

          {exerciseData?.imageUrl && (
            <img
              src={exerciseData.imageUrl}
              alt={exerciseData.name}
              className="w-full h-64 object-cover rounded"
            />
          )}

          <div className="text-sm text-center">
            Ripetizione corrente: <strong>{currentRep} / {totalReps}</strong>
          </div>

          <div className="text-lg font-mono text-center">
            {phase === 'rest' ? `Recupero: ${formatTime(timer)}` : `Timer: ${formatTime(timer)}`}
          </div>

          <div className="flex flex-col items-center gap-4 mt-4">
            <button
              onClick={handleMainButton}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded text-lg"
            >
              {buttonLabel()}
            </button>
            <button
              onClick={skipExercise}
              className="text-sm text-gray-400 hover:underline mt-2"
            >
              Salta esercizio
            </button>
          </div>
        </div>
      </div>
<WorkoutCompleteModal
        isOpen={isComplete}
        totalSeconds={totalWorkoutSeconds}
        onSave={handleSaveWorkout}
        onClose={() => window.location.href = '/exercisesheet'}
      />
    </>
  )
}

export default WorkoutRunner