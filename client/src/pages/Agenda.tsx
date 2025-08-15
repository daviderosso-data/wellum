import { useEffect, useRef, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useApi } from '../lib/utils';

// Tipi
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

const weekDays = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];

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

  const log = (...args: unknown[]) => console.log('[Agenda]', ...args);

  useEffect(() => {
    isMounted.current = true;
    log('mount -> isLoaded:', isLoaded, 'isSignedIn:', isSignedIn, 'userId:', user?.id);
    return () => {
      log('unmount -> aborting any in-flight requests');
      isMounted.current = false;
      controllerRef.current?.abort('component unmounted');
    };
  }, []);

  useEffect(() => {
    apiRef.current = api;
    log('useApi updated/refreshed');
  }, [api]);

  const fetchData = async () => {
    log('fetchData called. isLoaded:', isLoaded, 'isSignedIn:', isSignedIn, 'userId:', user?.id);

    if (!isLoaded) {
      log('skip fetch: Clerk not loaded yet');
      return;
    }
    if (!isSignedIn || !user?.id) {
      log('skip fetch: user not signed in or missing id');
      setLoading(false);
      setError("Devi effettuare l'accesso per visualizzare i tuoi workout");
      return;
    }

    // Aborta eventuale richiesta precedente
    controllerRef.current?.abort('new fetch requested');
    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      setLoading(true);
      setError(null);
      log('fetch start -> calling endpoints', {
        workouts: `/api/workouts/user/${user.id}`,
        sheets: `/api/sheet/user/${user.id}`
      });

      const [wsRes, ssRes] = await Promise.allSettled([
        apiRef.current.get<Workout[]>(`/api/workouts/user/${user.id}`, { signal: controller.signal }),
        apiRef.current.get<Sheet[]>(`/api/sheet/user/${user.id}`, { signal: controller.signal }),
      ]);

      let workoutsOk = false;
      let sheetsOk = false;

      if (wsRes.status === 'fulfilled') {
        log('workouts OK. count:', wsRes.value.length);
        if (isMounted.current) setWorkouts(wsRes.value);
        workoutsOk = true;
      } else {
        log('workouts FAILED ->', wsRes.reason);
      }

      if (ssRes.status === 'fulfilled') {
        log('sheets OK. count:', ssRes.value.length);
        if (isMounted.current) setSheets(ssRes.value);
        sheetsOk = true;
      } else {
        log('sheets FAILED ->', ssRes.reason);
      }

      if (!workoutsOk && !sheetsOk) {
        log('both requests failed -> setting error');
        if (isMounted.current) setError('Impossibile caricare i dati. Verifica la connessione o l\'autenticazione e riprova.');
      } else if (isMounted.current) {
        setError(null);
      }
    } catch (err) {
      log('fetchData fatal error:', err);
      if (isMounted.current) setError('Errore imprevisto durante il caricamento. Riprova.');
    } finally {
      if (isMounted.current) {
        setLoading(false);
        log('fetch end -> loading=false');
      } else {
        log('fetch end -> skipped setState (unmounted)');
      }
      if (controllerRef.current === controller) {
        controllerRef.current = null;
      }
    }
  };

  useEffect(() => {
    log('effect -> deps changed: isLoaded:', isLoaded, 'isSignedIn:', isSignedIn, 'userId:', user?.id);
    if (!isLoaded) return;
    if (!isSignedIn || !user?.id) {
      setLoading(false);
      setError("Devi effettuare l'accesso per visualizzare i tuoi workout");
      return;
    }
    fetchData();
  }, [isLoaded, isSignedIn, user?.id]);

  const sheetNameMap: Record<string, string> = {};
  sheets.forEach(s => { sheetNameMap[s._id] = s.name; });

  const workoutsByDay: Record<string, Workout[]> = {};
  workouts.forEach(w => {
    const day = new Date(w.completedAt).toISOString().slice(0, 10);
    (workoutsByDay[day] ||= []).push(w);
  });

  const selectedWorkouts = selectedDay ? (workoutsByDay[selectedDay] || []) : [];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const calendarDays: (string | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = new Date(currentYear, currentMonth, d).toISOString().slice(0, 10);
    calendarDays.push(dateStr);
  }

  const prevMonth = () => {
    log('prevMonth');
    setError(null);
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    log('nextMonth');
    setError(null);
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    log('delete -> start', workoutId);
    try {
      setIsDeleting(true);
      await apiRef.current.delete(`/api/workouts/${workoutId}`);
      if (!isMounted.current) return;

      setWorkouts(prev => prev.filter(w => w._id !== workoutId));
      setDeleteSuccess(true);
      log('delete -> success', workoutId);

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
      log('delete -> error', err);
      alert("Errore durante l'eliminazione del workout");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoaded && !isSignedIn) {
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
      {/* Sidebar - Desktop */}
      <div className="fixed top-0 left-0 h-screen w-64 z-10 hidden md:block">
        <Sidebar />
      </div>

      {/* Header - Mobile */}
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

      {/* Titolo pagina */}
      <div>
        <h1 className="ml-25 m-5 text-2xl font-bold text-amber-500 pt-10">Agenda</h1>
      </div>

      {/* Contenuto principale */}
      <div className="flex-1 p-4 md:p-6 md:ml-64">
        {/* Messaggi di errore */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <button
              onClick={() => {
                log('Retry clicked');
                setError(null);
                fetchData();
              }}
              className="ml-4 px-2 py-1 bg-red-200 hover:bg-red-300 rounded text-sm"
            >
              Riprova
            </button>
          </div>
        )}

        {/* Titolo desktop */}
        <h1 className="text-3xl text-amber-500 font-bold mb-6 hidden md:block">Agenda</h1>

        {/* Navigazione calendario */}
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

        {/* Stato: loading / empty / calendario */}
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64">
            <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mb-4"></span>
            <p className="text-amber-500">Caricamento agenda...</p>
          </div>
        ) : workouts.length === 0 ? (
          <div className="bg-amber-100 text-amber-800 rounded-xl p-4 shadow-lg text-center">
            <p className="font-medium">Non hai ancora registrato workout.</p>
            <p className="mt-2">Completa un allenamento per vederlo qui!</p>
          </div>
        ) : (
          <div className="bg-zinc-200 rounded-xl shadow-lg p-2 md:p-4">
            {/* Intestazione giorni */}
            <div className="grid grid-cols-7 gap-1 md:gap-2 mb-1 md:mb-2">
              {weekDays.map(day => (
                <div key={day} className="font-medium text-center text-zinc-900 text-xs md:text-sm">
                  {day}
                </div>
              ))}
            </div>

            {/* Griglia giorni - click sui giorni con workout */}
            <div className="grid grid-cols-7 gap-1 md:gap-2">
              {calendarDays.map((dateStr, idx) => {
                const isToday = dateStr === new Date().toISOString().slice(0, 10);
                const hasWorkout = !!(dateStr && workoutsByDay[dateStr]);
                const dayNumber = dateStr ? Number(dateStr.slice(-2)) : '';

                return (
                  <div
                    key={idx}
                    className={`md:h-16 lg:h-20 border border-amber-500/60 rounded flex flex-col items-center justify-start p-1 transition
                      ${isToday ? 'ring-1 ring-gray-400' : ''}
                      ${hasWorkout ? 'bg-amber-500/40 hover:bg-zinc-100 cursor-pointer' : 'hover:bg-zinc-100 cursor-default'}
                      ${!dateStr ? 'bg-zinc-300/30' : ''}
                    `}
                    onClick={() => {
                      if (!dateStr || !hasWorkout) return;
                      log('day clicked ->', dateStr, 'items:', workoutsByDay[dateStr]?.length);
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

      {/* Menu mobile */}
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

      {/* Modal dettaglio giorno */}
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
                        onClick={() => {
                          log('delete open ->', w._id);
                          setWorkoutToDelete(w._id);
                        }}
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
                onClick={() => {
                  log('close day modal');
                  setSelectedDay(null);
                }}
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal conferma eliminazione */}
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
                    onClick={() => {
                      log('delete cancel');
                      setWorkoutToDelete(null);
                    }}
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