import { useEffect, useRef, useState } from 'react'
import WorkoutCompleteModal from './workoutCompleteModal'
import { useUser } from "@clerk/clerk-react";
const API_URL = import.meta.env.VITE_URL_SERVER 

type Exercise = {
  exerciseId: string
  serie: number
  repetitions: number
  weight?: number
  notes?: string
}

type ExerciseData = {
  name: string
  description?: string
  imageUrl?: string
}

// Modale per modificare il carico
const WeightModal = ({ isOpen, currentWeight, onSave, onClose }: { 
  isOpen: boolean, 
  currentWeight: number, 
  onSave: (weight: number) => void, 
  onClose: () => void 
}) => {
  const [weight, setWeight] = useState(currentWeight.toString());

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-zinc-800 p-6 rounded-lg w-full max-w-md">
        <h3 className="text-xl font-bold text-amber-500 mb-4">Modifica carico</h3>
        <p className="mb-4 text-white">Inserisci il carico per questa ripetizione:</p>
        
      <input
  type="text"
  inputMode="decimal"
  value={weight}
  onChange={(e) => {
    const value = e.target.value;
    // Accetta solo numeri e un punto decimale
    if (/^\d*\.?\d*$/.test(value)) {
      setWeight(value);
    }
  }}
  className="w-full p-2 mb-4 bg-zinc-700 text-white border border-zinc-600 rounded appearance-none"
  placeholder="0.0"
/>
        
        <div className="flex justify-end gap-2">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-zinc-600 text-white rounded"
          >
            Annulla
          </button>
          <button 
            onClick={() => onSave(Number(weight))}
            className="px-4 py-2 bg-amber-500 text-zinc-900 rounded"
          >
            Salva
          </button>
        </div>
      </div>
    </div>
  );
};

type Props = {
  sheetId: string
  restTime: number
  onFinish?: () => void
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
  
  // Stato per la modale di modifica del carico
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [currentWeight, setCurrentWeight] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const current = exercises[currentIndex]
  const totalReps = current?.repetitions || 0

  // Fetch exercises when component mounts or sheetId changes
  useEffect(() => {
    fetch(`${API_URL}/api/sheet/${sheetId}`)
      .then(res => res.json())
      .then(data => {
        setExercises(data.exercises || []);
        // Imposta il peso iniziale dall'esercizio corrente
        if (data.exercises && data.exercises.length > 0) {
          setCurrentWeight(data.exercises[0].weight || 0);
        }
      })
  }, [sheetId])

  // Fetch exercise data when currentIndex changes
  useEffect(() => {
    const loadExerciseData = async () => {
      const ex = exercises[currentIndex]
      if (ex?.exerciseId) {
        try {
          const res = await fetch(`${API_URL}/api/exercises/${ex.exerciseId}`)
          const data = await res.json()
          setExerciseData(data)
          // Aggiorna il peso corrente quando cambia l'esercizio
          setCurrentWeight(ex.weight || 0)
        } catch {
          setExerciseData(null)
        }
      }
    }
    if (exercises.length > 0) loadExerciseData()
  }, [currentIndex, exercises])

  // Timer logic
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

  // when workout phase changes, reset timer
  useEffect(() => {
    if (phase === 'rest' && timer <= 0 && isRunning) {
      completeRep()
    }
  }, [timer, phase, isRunning])

  // Inizia l'allenamento direttamente senza mostrare la modale
  const startWorkout = () => {
    setTimer(0);
    setIsRunning(true);
    setPhase('workout');
  }

  // Funzione per salvare il peso e basta (senza avviare l'allenamento)
  const saveWeight = (weight: number) => {
    setCurrentWeight(weight);
    setShowWeightModal(false);
    
    // Salva il peso nella scheda
    updateExerciseWeight(weight);
  }

  // Funzione per aggiornare il peso dell'esercizio corrente
  const updateExerciseWeight = async (weight: number) => {
    // Crea una copia degli esercizi per modificarla
    const updatedExercises = [...exercises];
    updatedExercises[currentIndex] = {
      ...updatedExercises[currentIndex],
      weight: weight
    };
    
    setExercises(updatedExercises);
    
    // Salva sul server
    try {
      await fetch(`${API_URL}/api/sheet/${sheetId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercises: updatedExercises
        }),
      });
    } catch (error) {
      console.error("Errore nel salvataggio del peso:", error);
    }
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
      // Non mostrare più automaticamente la modale
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
      // Non mostrare più automaticamente la modale
    } else {
      setIsComplete(true)
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

  // Handle main button click based on current phase
  const handleMainButton = () => {
    if (phase === 'idle') startWorkout()
    else if (phase === 'workout') startRest()
    else if (phase === 'rest') completeRep()
  }

  // Save workout to calendar
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
      <div className="min-h-screen bg-zinc-900 text-white flex flex-col justify-center items-center p-6">
        <h1 className="text-2xl font-bold mb-6">
          Esercizio {currentIndex + 1} di {exercises.length}
        </h1>

        <div className="bg-zinc-600 p-6 rounded max-w-xl w-full mb-6 text-left space-y-4">
          <h2 className="text-3xl text-amber-500 font-bold text-center">
            {exerciseData?.name || 'Caricamento...'}
          </h2>

          {exerciseData?.description && (
            <p className="text-sm text-white">{exerciseData.description}</p>
          )}

          <div className="text-l space-y-1 text-white">
            <p><strong>Ripetizioni totali:</strong> {current?.repetitions}</p>
            <p><strong>Ultimo carico:</strong> {currentWeight} kg</p>
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

          <div className="text-4xl font-mono text-center">
            {phase === 'rest' ? `Recupero: ${formatTime(timer)}` : `Timer: ${formatTime(timer)}`}
          </div>

          <div className="flex flex-col items-center gap-4 mt-4">
            <button
              onClick={handleMainButton}
              className="px-6 py-3 bg-amber-500 text-zinc-900 hover:bg-zinc-400 rounded text-lg"
            >
              {buttonLabel()}
            </button>
            {phase === 'idle' && (
              <button
                onClick={() => setShowWeightModal(true)}
                className="px-4 py-2 bg-zinc-500 text-white rounded text-sm"
              >
                Modifica carico
              </button>
            )}
            <button
              onClick={skipExercise}
              className="text-sm text-zinc-200 hover:underline mt-2"
            >
              Salta esercizio
            </button>
          </div>
        </div>
      </div>

      {/* Modale per modificare il carico */}
      <WeightModal 
        isOpen={showWeightModal}
        currentWeight={currentWeight}
        onSave={saveWeight} // Ora usa saveWeight invece di saveWeightAndStart
        onClose={() => setShowWeightModal(false)}
      />

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