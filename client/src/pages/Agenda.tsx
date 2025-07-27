import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import Sidebar from '../components/Sidebar';
import { Link } from 'react-router-dom';
const API_URL = import.meta.env.VITE_URL_SERVER 

type Exercise = {
  exerciseId: string
  repetitions: number
  weight?: number
  notes?: string
}

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
  "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
];

const weekDays = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];

export default function AgendaPage() {
  // Stati principali
  const { user } = useUser();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Stati per il calendario
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  
  // Stati per l'eliminazione
  const [workoutToDelete, setWorkoutToDelete] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  // Mappa nomi schede per riferimento rapido
  const sheetNameMap: Record<string, string> = {};
  sheets.forEach(s => { sheetNameMap[s._id] = s.name; });

  // Carica i dati quando l'utente è disponibile
  useEffect(() => {
    if (!user?.id) return;
    
    setLoading(true);
    
    // Carica workout
    fetch(`${API_URL}/api/workouts/user/${user.id}`)
      .then(res => res.json())
      .then(data => setWorkouts(data))
      .finally(() => setLoading(false));
    
    // Carica schede
    fetch(`${API_URL}/api/sheet/user/${user.id}`)
      .then(res => res.json())
      .then(data => setSheets(data));
  }, [user?.id]);

  // Mostra loading se l'utente non è ancora disponibile
  if (!user) {
    return <div className="min-h-screen flex items-center justify-center bg-zinc-600 p-4">Loading...</div>;
  }

  // Organizza i workout per giorno
  const workoutsByDay: Record<string, Workout[]> = {};
  workouts.forEach(w => {
    const day = new Date(w.completedAt).toISOString().slice(0, 10);
    if (!workoutsByDay[day]) workoutsByDay[day] = [];
    workoutsByDay[day].push(w);
  });

  // Calcola i giorni del calendario
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const calendarDays: (string | null)[] = [];
  // Aggiungi spazi vuoti per i giorni prima dell'inizio del mese
  for (let i = 0; i < firstDayOfWeek; i++) calendarDays.push(null);
  // Aggiungi i giorni del mese
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = new Date(currentYear, currentMonth, d).toISOString().slice(0, 10);
    calendarDays.push(dateStr);
  }

  // Navigazione tra i mesi
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };
  
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  // Workout selezionati per il giorno corrente
  const selectedWorkouts = selectedDay ? workoutsByDay[selectedDay] || [] : [];
  
  // Gestione eliminazione workout
  const handleDeleteWorkout = async (workoutId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/workouts/${workoutId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // Aggiorna la lista dei workout rimuovendo quello eliminato
        setWorkouts(prevWorkouts => prevWorkouts.filter(w => w._id !== workoutId));
        setDeleteSuccess(true);
        
        // Chiudi automaticamente il modale di conferma dopo 1.5 secondi
        setTimeout(() => {
          setWorkoutToDelete(null);
          setDeleteSuccess(false);
        }, 1500);
      } else {
        alert('Errore durante l\'eliminazione del workout');
      }
    } catch (error) {
      console.error('Errore di rete:', error);
      alert('Errore di rete durante l\'eliminazione');
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-zinc-600">
       {/* Sidebar desktop */}
      <div className="fixed top-0 left-0 h-screen w-64 z-10 hidden md:block">
        <Sidebar />
      </div>
        {/* Header mobile con hamburger menu */}
      <div className="fixed top-0 left-0 right-0 bg-zinc-800 p-3 flex items-center z-20 md:hidden">
          <Sidebar />

          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        
        <Link to="/" className="flex items-center">
          <img src="/assets/pictures/logoAmberTransp.png" className="ml-6 h-8" alt="Wellum logo" />
        </Link>
        <h1 className="text-xl font-bold text-amber-500 ml-3">Agenda</h1>
      </div>
        <div>  <h1 className="ml-25 m-5 text-2xl font-bold text-amber-500">Agenda</h1>
      </div>
      {/* Contenuto principale - layout simile a exercisesSheets */}
      <div className="flex-1 p-4 md:p-6 md:ml-64">
      
        
        {/* Intestazione desktop */}
        <h1 className="text-3xl text-amber-500 font-bold mb-6 hidden md:block">Agenda</h1>
        
        {/* Navigazione mesi */}
        <div className="flex items-center justify-between mb-6 bg-zinc-700 rounded-lg p-2">
          <button 
            onClick={prevMonth} 
            className="px-3 py-1 rounded text-amber-500 cursor-pointer hover:bg-zinc-600"
          >
            &lt;
          </button>
          <span className="font-medium text-amber-500 text-sm md:text-base">
            {monthNames[currentMonth]} {currentYear}
          </span>
          <button 
            onClick={nextMonth} 
            className="px-3 py-1 rounded text-amber-500 cursor-pointer hover:bg-zinc-600"
          >
            &gt;
          </button>
        </div>
        
        {/* Calendario */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></span>
          </div>
        ) : (
          <div className="bg-zinc-200 rounded-xl shadow-lg p-2 md:p-4">
            {/* Giorni della settimana */}
            <div className="grid grid-cols-7 gap-1 md:gap-2 mb-1 md:mb-2">
              {weekDays.map(day => (
                <div key={day} className="font-medium text-center text-zinc-900 text-xs md:text-sm">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Celle del calendario */}
            <div className="grid grid-cols-7 gap-1 md:gap-2">
              {calendarDays.map((dateStr, idx) => {
                const isToday = dateStr === new Date().toISOString().slice(0, 10);
                const hasWorkout = dateStr && workoutsByDay[dateStr];
                const dayNumber = dateStr ? Number(dateStr.slice(-2)) : "";
                
                return (
                  <div
                    key={idx}
                    className={` md:h-16 lg:h-20 border border-amber-500/60 rounded flex flex-col items-center justify-start p-1 cursor-pointer transition
                      ${isToday ? "ring-1 ring-gray-400" : ""}
                      ${hasWorkout ? "bg-amber-500/40 hover:bg-zinc-100" : "hover:bg-zinc-100"}
                      ${!dateStr ? "bg-zinc-300/30" : ""}
                    `}
                    onClick={() => dateStr && hasWorkout && setSelectedDay(dateStr)}
                  >
                    <div className={`font-semibold text-xs md:text-sm ${isToday ? "text-zinc-900" : ""}`}>
                      {dayNumber}
                    </div>
                    {hasWorkout && (
                      <div className="mt-1 text-[10px] md:text-xs text-zinc-900 font-medium text-center">
                        {workoutsByDay[dateStr].length}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Mobile menu sidebar - stile exercisesSheets */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden">
          <div className="w-64 h-full bg-zinc-800">
            <div className="p-4 flex justify-end">
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <Sidebar />
          </div>
        </div>
      )}

      {/* Modale dei workout del giorno - stile exercisesSheets */}
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

      {/* Modale di conferma eliminazione - stile exercisesSheets */}
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
                  >
                    Annulla
                  </button>
                  <button
                    className="px-4 py-2 bg-amber-500 text-zinc-900 rounded hover:bg-amber-600 font-semibold"
                    onClick={() => handleDeleteWorkout(workoutToDelete)}
                  >
                    Elimina
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