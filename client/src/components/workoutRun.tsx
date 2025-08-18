//  WorkoutRunner
// This component manages the workout session, including starting exercises, tracking time, and handling rest periods.
// It fetches exercise data from an API and allows users to modify weights for each exercise.
// The component uses React hooks for state management and side effects, and it provides a user-friendly interface with Tailwind CSS styling.
// It also includes a modal for confirming the completion of the workout and saving it to the user's calendar.
// The workout can be paused, resumed, and navigated through exercises

import { useEffect, useRef, useState } from 'react';
import WorkoutCompleteModal from './workoutCompleteModal';
import { useUser } from '@clerk/clerk-react';
import { useApi } from '../lib/utils';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

type Exercise = {
  exerciseId: string;
  serie: number;
  repetitions: number;
  weight?: number;
  notes?: string;
};

type ExerciseData = {
  name: string;
  description?: string;
  imageUrl?: string;
};

type Props = {
  sheetId: string;
  restTime: number; 
  onFinish?: () => void;
};

const weightSchema = z.object({
  weight: z.number().min(0, 'Inserisci un peso >= 0').max(1000, 'Peso troppo alto'),
});
type WeightForm = z.infer<typeof weightSchema>;

const WeightModal = ({
  isOpen,
  currentWeight,
  onSave,
  onClose,
}: {
  isOpen: boolean;
  currentWeight: number;
  onSave: (weight: number) => void;
  onClose: () => void;
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<WeightForm>({
    resolver: zodResolver(weightSchema),
    defaultValues: { weight: currentWeight },
    mode: 'onChange',
  });

  useEffect(() => {
    if (isOpen) reset({ weight: currentWeight });
  }, [isOpen, currentWeight, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-zinc-800 p-6 rounded-lg w-full max-w-md">
        <h3 className="text-xl font-bold text-amber-500 mb-4">Modifica carico</h3>
        <p className="mb-4 text-white">Inserisci il carico per questa ripetizione:</p>

        <form
          onSubmit={handleSubmit(({ weight }) => onSave(weight))}
          className="space-y-4"
        >
          <div>
            <input
              type="number"
              step="0.1"
              inputMode="decimal"
              className="w-full p-2 bg-zinc-700 text-white border border-zinc-600 rounded appearance-none"
              placeholder="0.0"
              {...register('weight', { valueAsNumber: true })}
            />
            {errors.weight && (
              <p className="text-red-400 text-xs mt-1">{errors.weight.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-zinc-600 text-white rounded"
              disabled={isSubmitting}
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 text-zinc-900 rounded disabled:opacity-60"
              disabled={!isValid || isSubmitting}
            >
              Salva
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


const WorkoutRunner = ({ sheetId, restTime }: Props) => {
  const [totalWorkoutSeconds, setTotalWorkoutSeconds] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [exerciseData, setExerciseData] = useState<ExerciseData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentRep, setCurrentRep] = useState(1);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'workout' | 'rest'>('idle');
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [currentWeight, setCurrentWeight] = useState(0);
  const [loadingSheet, setLoadingSheet] = useState(true);
  const { user } = useUser();
  const api = useApi();
  const apiRef = useRef(api);
  const intervalRef = useRef<number | null>(null);
  const current = exercises[currentIndex];
  const totalReps = current?.repetitions || 0;

  // The authedFetch function is used to make authenticated requests to the API
  // It retrieves the token from the apiRef and includes it in the request headers
  const authedFetch = async (path: string, init?: RequestInit) => {
    const token = await apiRef.current.getToken();
    const baseUrl = apiRef.current.getBaseUrl();
    const headers = new Headers(init?.headers as HeadersInit | undefined);
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return fetch(`${baseUrl}${path}`, {
      ...init,
      headers,
      credentials: 'include',
      mode: 'cors',
    });
  };

  // Start the workout phase and reset the timer
  const isAbortError = (err: unknown): boolean =>
  err instanceof DOMException
    ? err.name === 'AbortError'
    : !!err && typeof err === 'object' && 'name' in err && (err as { name?: string }).name === 'AbortError';

  useEffect(() => {
    apiRef.current = api;
  }, [api]);


  // Fetch the workout sheet data when the component mounts
  // This uses the authedFetch function to make authenticated requests to the API
  // It sets the exercises state with the fetched data and handles loading and error states
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      setLoadingSheet(true);
      try {
        const res = await authedFetch(`/api/sheet/${sheetId}`, { signal: controller.signal });
        if (!res.ok) throw new Error(`GET sheet ${res.status}`);
        const data = await res.json();
        const exs: Exercise[] = Array.isArray(data?.exercises) ? data.exercises : [];
        setExercises(exs);
        if (exs.length > 0) setCurrentWeight(exs[0].weight || 0);
      } catch (e) {
        if (!isAbortError(e)) {
         console.error('Errore caricamento scheda:', e);
      }
      } finally {
        setLoadingSheet(false);
      }
    })();
    return () => controller.abort();
  }, [sheetId]);


  // Fetch exercise data when the current index changes
  // This ensures that the exercise data is always up-to-date with the current exercise being displayed
  // It uses the authedFetch function to make authenticated requests to the API
  useEffect(() => {
    if (!exercises.length) {
      setExerciseData(null);
      return;
    }
    const ex = exercises[currentIndex];
    if (!ex?.exerciseId) {
      setExerciseData(null);
      return;
    }
    const controller = new AbortController();
    setExerciseData(null);
    (async () => {
      try {
        const res = await authedFetch(`/api/exercises/${ex.exerciseId}`, { signal: controller.signal });
        if (!res.ok) throw new Error(`GET exercise ${res.status}`);
        const data = (await res.json()) as ExerciseData;
        setExerciseData(data);
        setCurrentWeight(ex.weight || 0);
      } catch (e) {
      if (!isAbortError(e)) {
          console.error('Errore caricamento esercizio:', e);
          setExerciseData(null);
        }
      }
      })();
    return () => controller.abort();
  }, [exercises, currentIndex]);


  // Handle the timer and intervals for workout and rest phases
  // This uses setInterval to update the timer every second and manages the workout phases
  // It also handles the completion of rest periods and transitions to the next exercise
  // The timer is reset when the workout starts or when the phase changes
  // The component uses useEffect to manage the intervals and cleanup on unmount
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setTimer((t) => (phase === 'rest' ? t - 1 : t + 1));
        setTotalWorkoutSeconds((t) => t + 1);
      }, 1000);
    } else if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, phase]);

  // Handle the completion of rest periods and transitions to the next exercise
  // This checks if the timer has reached zero during a rest phase and completes the current repetition
  // It also handles the transition to the next exercise or marks the workout as complete if all exercises are done
  // The component uses useEffect to manage the completion logic based on the timer
  useEffect(() => {
    if (phase === 'rest' && timer <= 0 && isRunning) {
      completeRep();
    }
  }, [timer, phase, isRunning]);

  // Start the workout phase and reset the timer
  // This sets the timer to zero, marks the workout as running, and changes the phase
  const startWorkout = () => {
    setTimer(0);
    setIsRunning(true);
    setPhase('workout');
  };

  // Save the current weight and close the weight modal
  // This updates the current weight state and calls the updateExerciseWeight function to save the weight
  // It also closes the weight modal
  const saveWeight = (weight: number) => {
    setCurrentWeight(weight);
    setShowWeightModal(false);
    updateExerciseWeight(weight);
  };

  // Update the weight for the current exercise
  // This updates the exercises state with the new weight for the current exercise
  // It also sends a PUT request to the API to save the updated exercises
  const updateExerciseWeight = async (weight: number) => {
    const updatedExercises = [...exercises];
    updatedExercises[currentIndex] = { ...updatedExercises[currentIndex], weight };
    setExercises(updatedExercises);
    try {
      const res = await authedFetch(`/api/sheet/${sheetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exercises: updatedExercises }),
      });
      if (!res.ok) console.error('Errore salvataggio peso:', res.status);
    } catch (error) {
      console.error('Errore nel salvataggio del peso:', error);
    }
  };



// Start the rest phase and set the timer for the rest period
// This sets the timer to the specified rest time in seconds, marks the workout as running,
  const startRest = () => {
    setTimer(restTime * 60);
    setIsRunning(true);
    setPhase('rest');
  };

  // Complete the current repetition and reset the timer
  // This increments the current repetition count and resets the timer to zero
  const completeRep = () => {
    setIsRunning(false);
    if (currentRep < totalReps) {
      setCurrentRep((r) => r + 1);
      setPhase('idle');
      setTimer(0);
    } else {
      nextExercise();
    }
  };

  // Navigate to the next exercise or mark the workout as complete
  // This checks if there are more exercises to complete and updates the current index and repetition count
  const nextExercise = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex((i) => i + 1);
      setCurrentRep(1);
      setTimer(0);
      setIsRunning(false);
      setPhase('idle');
    } else {
      setIsComplete(true);
    }
  };

  // Skip the current exercise and move to the next one
  // This sets the workout as not running, clears the interval if it exists, and navigates to the next exercise
  // It also resets the timer to zero
  const skipExercise = () => {
    setIsRunning(false);
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    nextExercise();
  };

  // Format the time in minutes and seconds for display
  const formatTime = (sec: number) =>
    `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;

  // Determine the label for the main button based on the current phase
  const buttonLabel = () => {
    if (phase === 'idle') return 'Start';
    if (phase === 'workout') return 'Inizio recupero';
    if (phase === 'rest') return 'Fine ripetizione';
    return 'Continua';
  };

  // Handle the main button click based on the current phase
  // This starts the workout if in idle phase, starts rest if in workout phase, or completes the repetition if in rest phase
  // It uses the handleMainButton function to determine the action to take
  const handleMainButton = () => {
    if (phase === 'idle') startWorkout();
    else if (phase === 'workout') startRest();
    else if (phase === 'rest') completeRep();
  };


  // Handle saving the workout to the calendar
  // This checks if the user is authenticated and sends a POST request to save the workout data
  // It includes the user ID, sheet ID, total workout seconds, and exercises in the request body
  const handleSaveWorkout = async () => {
    // Ensure the user is authenticated before saving the workout
    if (!user?.id) return;
    try {
      const res = await authedFetch(`/api/workouts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          sheetId,
          totalSeconds: totalWorkoutSeconds,
          exercises,
        }),
      });
      if (!res.ok) {
        alert("Errore nel salvataggio dell'allenamento.");
        return;
      }
      alert('Allenamento salvato nel calendario!');
      window.location.href = '/exercisesheet';
    } catch (e) {
      console.error('Errore salvataggio workout:', e);
      alert('Errore di rete nel salvataggio.');
    }
  };
// If the sheet is loading, display a loading spinner
  if (loadingSheet) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white flex flex-col justify-center items-center p-6">
        <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></span>
        <p className="mt-3 text-amber-500">Caricamento scheda...</p>
      </div>
    );
  }
// If there are no exercises, display a message
  if (exercises.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white flex flex-col justify-center items-center p-6">
        <h1 className="text-2xl font-bold mb-6">Nessun esercizio trovato</h1>
      </div>
    );
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
            <p>
              <strong>Ripetizioni totali:</strong> {current?.repetitions}
            </p>
            <p>
              <strong>Ultimo carico:</strong> {currentWeight} kg
            </p>
            {current?.notes && (
              <p>
                <strong>Note:</strong> <span className="italic">{current.notes}</span>
              </p>
            )}
          </div>

          {exerciseData?.imageUrl && (
            <img
              src={exerciseData.imageUrl}
              alt={exerciseData.name}
              className="w-full h-48 object-cover rounded"
            />
          )}

          <div className="text-sm text-center">
            Ripetizione corrente: <strong>{currentRep} / {totalReps}</strong>
          </div>

          <div className="text-4xl font-mono text-center">
            {phase === 'rest' ? `Recupero: ${formatTime(timer)}` : `Timer: ${formatTime(timer)}`}
          </div>

          <div className="flex items-center gap-4 mt-4">
            <button
              onClick={skipExercise}
              className="text-xs text-zinc-200 hover:underline mt-2"
            >
              Salta esercizio
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
              onClick={handleMainButton}
              className="px-6 py-3 bg-amber-500 shadow-md text-zinc-900 hover:bg-amber-400 rounded text-xl font-semibold transition"
            >
              {buttonLabel()}
            </button>
          </div>
        </div>
      </div>
{      /* Modal for entering weight */}
      <WeightModal
        isOpen={showWeightModal}
        currentWeight={currentWeight}
        onSave={saveWeight}
        onClose={() => setShowWeightModal(false)}
      />
{      /* Modal for completing the workout */}
      <WorkoutCompleteModal
        isOpen={isComplete}
        totalSeconds={totalWorkoutSeconds}
        onSave={handleSaveWorkout}
        onClose={() => (window.location.href = '/exercisesheet')}
      />
    </>
  );
};

export default WorkoutRunner;