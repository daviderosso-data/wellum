//Agenda
// This page displays the user's workout agenda, allowing them to view workouts by date and delete them if necessary. 
// It uses a calendar view to show workouts for each day and provides functionality to delete workouts with confirmation.



import { useEffect, useRef, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useApi } from '../lib/utils';

type Exercise = {
  exerciseId: string;
  repetitions: number;
  weight?: number;
  notes?: string;
};

type Workout = {
  _id: string;
  userId: string;
  sheetId: string;
  completedAt: string;
  totalSeconds: number;
  exercises: Exercise[];
};

type Sheet = {
  _id: string;
  name: string;
};

const monthNames = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
];
const weekDays = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

export default function AgendaPage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const api = useApi();

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [workoutToDelete, setWorkoutToDelete] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isMounted = useRef(true);
  const apiRef = useRef(api);
  const controllerRef = useRef<AbortController | null>(null);

  const [errorVisible, setErrorVisible] = useState(false);
  const errorDelayRef = useRef<number | null>(null);

  // Function to start the error delay
  const startErrorDelay = () => {
    setErrorVisible(false);
    if (errorDelayRef.current) clearTimeout(errorDelayRef.current);
    errorDelayRef.current = window.setTimeout(() => setErrorVisible(true), 5000);
  };

  // Function to clear the error delay
  const clearErrorDelay = () => {
    if (errorDelayRef.current) {
      clearTimeout(errorDelayRef.current);
      errorDelayRef.current = null;
    }
    setErrorVisible(false);
  };

  // Function to convert a date to a local YYYY-MM-DD format
  const toLocalYMD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Effect to load workouts and sheets when the component mounts or user changes
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      controllerRef.current?.abort('component unmounted');
      if (errorDelayRef.current) clearTimeout(errorDelayRef.current);
    };
  }, []);

  useEffect(() => {
    apiRef.current = api;
  }, [api]);

  // Function to fetch workouts and sheets from the API
  const fetchData = async () => {
    if (!isLoaded) return;
    if (!isSignedIn || !user?.id) {
      startErrorDelay();
      setLoading(false);
      setError("Devi effettuare l'accesso per visualizzare i tuoi workout");
      return;
    }

    controllerRef.current?.abort('new fetch requested');
    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      startErrorDelay();
      setLoading(true);
      setError(null);

      const [wsRes, ssRes] = await Promise.allSettled([
        apiRef.current.get<Workout[]>(`/api/workouts/user/${user.id}`, { signal: controller.signal }),
        apiRef.current.get<Sheet[]>(`/api/sheet/user/${user.id}`, { signal: controller.signal }),
      ]);

      let workoutsOk = false;
      let sheetsOk = false;

      if (wsRes.status === 'fulfilled') {
        if (isMounted.current) setWorkouts(wsRes.value);
        workoutsOk = true;
      }

      if (ssRes.status === 'fulfilled') {
        if (isMounted.current) setSheets(ssRes.value);
        sheetsOk = true;
      }

      if (!workoutsOk && !sheetsOk) {
        if (isMounted.current) setError("Impossibile caricare i dati. Verifica la connessione o l'autenticazione e riprova.");
      } else if (isMounted.current) {
        setError(null);
        clearErrorDelay();
      }
    } catch (err) {
      console.error('Errore durante il caricamento dei dati:', err);
      if (isMounted.current) setError('Errore imprevisto durante il caricamento. Riprova.');
    } finally {
      if (isMounted.current) setLoading(false);
      if (controllerRef.current === controller) {
        controllerRef.current = null;
      }
    }
  };

  // Initial fetch when the component mounts or when the user state changes
  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn || !user?.id) {
      setLoading(false);
      setError("Devi effettuare l'accesso per visualizzare i tuoi workout");
      return;
    }
    fetchData();
  }, [isLoaded, isSignedIn, user?.id]);

  // Effect to handle the deletion of a workout
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      startErrorDelay();
    } else if (isLoaded && isSignedIn) {
      clearErrorDelay();
    }
  }, [isLoaded, isSignedIn]);

  const sheetNameMap: Record<string, string> = {};
  sheets.forEach(s => { sheetNameMap[s._id] = s.name; });

  // Group workouts by day
  const workoutsByDay: Record<string, Workout[]> = {};
  workouts.forEach(w => {
    const day = toLocalYMD(new Date(w.completedAt));
    (workoutsByDay[day] ||= []).push(w);
  });

  const selectedWorkouts = selectedDay ? (workoutsByDay[selectedDay] || []) : [];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const jsFirstDay = new Date(currentYear, currentMonth, 1).getDay();
  const offset = (jsFirstDay + 6) % 7; // Lunedì-first
  const calendarDays: (string | null)[] = [];
  for (let i = 0; i < offset; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = toLocalYMD(new Date(currentYear, currentMonth, d));
    calendarDays.push(dateStr);
  }

  // Fill the rest of the month with nulls
  const prevMonth = () => {
    setError(null);
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  // Function to go to the next month
  const nextMonth = () => {
    setError(null);
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  // Function to handle the deletion of a workout
  const handleDeleteWorkout = async (workoutId: string) => {
    try {
      setIsDeleting(true);
      await apiRef.current.delete(`/api/workouts/${workoutId}`);
      if (!isMounted.current) return;

      setWorkouts(prev => prev.filter(w => w._id !== workoutId));
      setDeleteSuccess(true);

      setTimeout(() => {
        if (!isMounted.current) return;
        setWorkoutToDelete(null);
        setDeleteSuccess(false);

        if (selectedDay) {
          const remaining = (workoutsByDay[selectedDay]?.length || 0) - 1;
          if (remaining <= 0) setSelectedDay(null);
        }
      }, 1200);
    } catch (err) {
      console.error("Errore durante l'eliminazione del workout:", err);
      alert("Errore durante l'eliminazione del workout");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoaded && !isSignedIn) {
    if (!errorVisible) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-600 p-4">
          <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></span>
        </div>
      );
    }
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-600 p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 max-w-md w-full">
          <p className="font-bold">Accesso richiesto</p>
          <p>Devi effettuare l'accesso per visualizzare i tuoi workout.</p>
          <div className="mt-4">
            <Link to="/login" className="bg-amber-500 text-zinc-900 px-4 py-2 rounded font-semibold">
              Accedi
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-600 p-4">
        <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></span>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-600">
      <div className="fixed top-0 left-0 h-screen w-64 z-10 hidden md:block">
        <Sidebar />
      </div>

      <div className="fixed top-0 left-0 right-0 bg-zinc-800 p-3 flex items-center z-20 md:hidden">
        <Sidebar />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-8 cursor-pointer"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>

        <Link to="/" className="flex items-center">
          <img src="/assets/pictures/logoAmberTransp.png" className="ml-6 h-8" alt="Wellum logo" />
        </Link>
        <h1 className="text-xl font-bold text-amber-500 ml-3">Agenda</h1>
      </div>

      <div>
        <h1 className="ml-25 m-5 text-2xl font-bold text-amber-500 pt-10">Agenda</h1>
      </div>

      <div className="flex-1 p-4 md:p-6 md:ml-64">

{/* Error message display */}
        {errorVisible && error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <button
              onClick={() => {
                setError(null);
                fetchData();
              }}
              className="ml-4 px-2 py-1 bg-red-200 hover:bg-red-300 rounded text-sm"
            >
              Riprova
            </button>
          </div>
        )}

        <h1 className="text-3xl text-amber-500 font-bold mb-6 hidden md:block">Agenda</h1>

        <div className="flex items-center justify-between mb-6 bg-zinc-700 rounded-lg p-2">
          <button onClick={prevMonth} className="px-3 py-1 rounded text-amber-500 cursor-pointer hover:bg-zinc-600">
            &lt;
          </button>
          <span className="font-medium text-amber-500 text-sm md:text-base">
            {monthNames[currentMonth]} {currentYear}
          </span>
          <button onClick={nextMonth} className="px-3 py-1 rounded text-amber-500 cursor-pointer hover:bg-zinc-600">
            &gt;
          </button>
        </div>

{        /* Loading spinner or error message while fetching data */}
        {loading || (error && !errorVisible) ? (
          <div className="flex flex-col justify-center items-center h-64">
            <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mb-4"></span>
            <p className="text-amber-500">Caricamento agenda...</p>
          </div>
        ) : workouts.length === 0 ? (
          <div className="relative rounded-xl overflow-hidden shadow-lg h-120 md:h-80 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-[url('/assets/pictures/calendario.png')] bg-cover bg-center blur-[2px] scale-105"
              aria-hidden="true"
            />
            <div className="absolute inset-0 bg-zinc-700/40" />
            <div className="relative z-10 bg-white/90 rounded-lg p-4 md:p-6 text-center max-w-lg mx-4">
              <h3 className="text-zinc-900 font-semibold mb-2">
                Non hai ancora registrato nessun workout
              </h3>
              <p className="text-zinc-700 mb-4">
                Vai ad allenarti e torna per vederlo a calendario.
              </p>
              <Link
                to="/workoutguide"
                className="inline-block px-4 py-2 bg-amber-500 text-zinc-900 rounded hover:bg-amber-600 font-semibold"
              >
                Crea il tuo primo workout
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-zinc-200 rounded-xl shadow-lg p-2 md:p-4">

            <div className="grid grid-cols-7 gap-1 md:gap-2 mb-1 md:mb-2">
              {weekDays.map((day) => (
                <div key={day} className="font-medium text-center text-zinc-900 text-xs md:text-sm">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 md:gap-2">
              {/* Map through the calendar days and display each day */}
              {calendarDays.map((dateStr, idx) => {
                const isToday = dateStr === toLocalYMD(new Date());
                const hasWorkout = !!(dateStr && workoutsByDay[dateStr]);
                const dayNumber = dateStr ? Number(dateStr.slice(-2)) : '';
                const col = idx % 7;
                const isSunday = col === 6;
                return (
                  <div
                    key={idx}
                    className={`md:h-16 lg:h-20 border border-amber-500/60 rounded flex flex-col items-center justify-start p-1 transition
                      ${isToday ? 'ring-1 ring-gray-400' : ''}
                      ${hasWorkout ? 'bg-amber-500/40 hover:bg-zinc-100 cursor-pointer' : 'hover:bg-zinc-100 cursor-default'}
                      ${!dateStr ? 'bg-zinc-300/30' : isSunday && !hasWorkout ? 'bg-zinc-300/40' : ''}
                    `}
                    onClick={() => {
                      if (!dateStr || !hasWorkout) return;
                      setSelectedDay(dateStr);
                    }}
                  >
                    <div className={`font-semibold text-xs md:text-sm ${isToday ? 'text-zinc-900' : ''}`}>
                      {dayNumber}
                    </div>
                    {hasWorkout && (
                      <div className="mt-1 text-[10px] md:text-xs text-zinc-900 font-medium text-center">
                        {workoutsByDay[dateStr!].length}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden">
          <div className="w-64 h-full bg-zinc-800">
            <div className="p-4 flex justify-end">
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <Sidebar />
          </div>
        </div>
      )}


{        /* Modal to display workouts for the selected day */}
      {selectedDay && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-zinc-600 rounded-xl shadow-lg p-4 md:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto m-4">
            <h2 className="text-xl font-bold text-amber-500 mb-4">
              Workout del {selectedDay.split('-').reverse().join('/')}
            </h2>
            {selectedWorkouts.length === 0 ? (
              <p className="text-white">Nessun workout in questa data.</p>
            ) : (
              <ul className="space-y-3">
                {selectedWorkouts.map(w => (
                  <li key={w._id} className="border-b border-gray-200/30 pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className={`font-semibold ${sheetNameMap[w.sheetId] ? "text-white" : "text-amber-200 italic"}`}>
                          {sheetNameMap[w.sheetId] || "Scheda eliminata"}
                        </div>
                        <div className="text-white text-sm">
                          Durata: <span className="font-semibold">{Math.floor(w.totalSeconds / 60)} min {w.totalSeconds % 60} sec</span>
                        </div>
                        <div className="text-xs text-white">Esercizi: {w.exercises.length}</div>
                      </div>
                      <button
                        onClick={() => setWorkoutToDelete(w._id)}
                        className="text-red-400 hover:text-red-500 text-sm py-1 px-2"
                      >
                        Elimina
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex justify-end mt-6">
              <button
                className="px-4 py-2 bg-amber-500 text-zinc-900 rounded hover:bg-amber-600 font-semibold"
                onClick={() => setSelectedDay(null)}
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}

{        /* Modal for workout deletion confirmation */}
      {workoutToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-md m-4">
            {deleteSuccess ? (
              <div className="text-center">
                <div className="text-green-500 text-3xl mb-4">✓</div>
                <p className="text-zinc-900 mb-2">Workout eliminato con successo!</p>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold text-red-600 mb-4">Elimina workout</h3>
                <p className="text-zinc-900 mb-6">Sei sicuro di voler eliminare questo workout? Questa azione è irreversibile.</p>
                <div className="flex justify-end gap-2">
                  <button
                    className="px-4 py-2 bg-gray-400 rounded hover:bg-gray-500"
                    onClick={() => setWorkoutToDelete(null)}
                    disabled={isDeleting}
                  >
                    Annulla
                  </button>
                  <button
                    className={`px-4 py-2 ${isDeleting ? 'bg-gray-500' : 'bg-amber-500 hover:bg-amber-600'} text-zinc-900 rounded font-semibold`}
                    onClick={() => workoutToDelete && handleDeleteWorkout(workoutToDelete)}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Eliminazione...' : 'Elimina'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}