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

type Props = {
  sheetId: string;
  restTime: number; // minuti
  onFinish?: () => void;
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
  useEffect(() => {
    apiRef.current = api;
  }, [api]);

  const intervalRef = useRef<number | null>(null);

  const current = exercises[currentIndex];
  const totalReps = current?.repetitions || 0;

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
        if (e && typeof e === 'object' && 'name' in e && (e as { name?: string }).name === 'AbortError') {
          // ignore
        } else {
          console.error('Errore caricamento scheda:', e);
        }
      } finally {
        setLoadingSheet(false);
      }
    })();
    return () => controller.abort();
  }, [sheetId]);

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
    (async () => {
      try {
        const res = await authedFetch(`/api/exercises/${ex.exerciseId}`, { signal: controller.signal });
        if (!res.ok) throw new Error(`GET exercise ${res.status}`);
        const data = (await res.json()) as ExerciseData;
        setExerciseData(data);
        setCurrentWeight(ex.weight || 0);
      } catch (e) {
        if (e && typeof e === 'object' && 'name' in e && (e as { name?: string }).name === 'AbortError') {
          // ignore
        } else {
          console.error('Errore caricamento esercizio:', e);
          setExerciseData(null);
        }
      }
    })();
    return () => controller.abort();
  }, [currentIndex, exercises]);

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

  useEffect(() => {
    if (phase === 'rest' && timer <= 0 && isRunning) {
      completeRep();
    }
  }, [timer, phase, isRunning]);

  const startWorkout = () => {
    setTimer(0);
    setIsRunning(true);
    setPhase('workout');
  };

  const saveWeight = (weight: number) => {
    setCurrentWeight(weight);
    setShowWeightModal(false);
    updateExerciseWeight(weight);
  };

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

  const startRest = () => {
    setTimer(restTime * 60);
    setIsRunning(true);
    setPhase('rest');
  };

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

  const skipExercise = () => {
    setIsRunning(false);
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    nextExercise();
  };

  const formatTime = (sec: number) =>
    `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;

  const buttonLabel = () => {
    if (phase === 'idle') return 'Start';
    if (phase === 'workout') return 'Inizio recupero';
    if (phase === 'rest') return 'Fine ripetizione';
    return 'Continua';
  };

  const handleMainButton = () => {
    if (phase === 'idle') startWorkout();
    else if (phase === 'workout') startRest();
    else if (phase === 'rest') completeRep();
  };

  const handleSaveWorkout = async () => {
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

  if (loadingSheet) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white flex flex-col justify-center items-center p-6">
        <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></span>
        <p className="mt-3 text-amber-500">Caricamento scheda...</p>
      </div>
    );
  }

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

      <WeightModal
        isOpen={showWeightModal}
        currentWeight={currentWeight}
        onSave={saveWeight}
        onClose={() => setShowWeightModal(false)}
      />

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