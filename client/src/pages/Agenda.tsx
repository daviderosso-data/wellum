import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import Sidebar from '../components/Sidebar';
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

export default function AgendaPage() {
  // Stati principali
  const { user } = useUser();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [loading, setLoading] = useState(true);

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
    <div className="min-h-screen flex bg-zinc-600">
      {/* Sidebar */}
      <div className="fixed top-0 left-0 h-screen w-64 z-10">
        <Sidebar />
      </div>
      
      {/* Contenuto principale */}
      <div className="flex-1 ml-64 p-8">
        <h1 className="text-3xl font-bold text-amber-500 mb-6">Agenda</h1>
        
        {/* Navigazione mesi */}
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={prevMonth} 
            className="px-3 py-1 rounded text-amber-500 cursor-pointer hover:bg-zinc-400"
          >
            &lt;
          </button>
          <span className="font-medium text-amber-500 text-base">
            {monthNames[currentMonth]} {currentYear}
          </span>
          <button 
            onClick={nextMonth} 
            className="px-3 py-1 rounded text-amber-500 cursor-pointer hover:bg-zinc-400"
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
          <div className="grid grid-cols-7 gap-2 bg-zinc-200 rounded-xl shadow p-4">
            {/* Giorni della settimana */}
            {["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"].map(day => (
              <div key={day} className="font-medium text-center text-zinc-900 pb-2">{day}</div>
            ))}
            
            {/* Celle del calendario */}
            {calendarDays.map((dateStr, idx) => {
              const isToday = dateStr === new Date().toISOString().slice(0, 10);
              const hasWorkout = dateStr && workoutsByDay[dateStr];
              return (
                <div
                  key={idx}
                  className={`h-20 border border-amber-500/60 rounded flex flex-col items-center justify-start p-1 cursor-pointer transition
                    ${isToday ? "ring-1 ring-gray-400" : ""}
                    ${hasWorkout ? "bg-amber-500/40 hover:bg-zinc-100" : "hover:bg-zinc-100"}
                  `}
                  onClick={() => dateStr && hasWorkout && setSelectedDay(dateStr)}
                >
                  <div className={`font-semibold text-base ${isToday ? "text-zinc-900" : ""}`}>
                    {dateStr ? Number(dateStr.slice(-2)) : ""}
                  </div>
                  {hasWorkout && (
                    <div className="mt-1 text-xs text-zinc-900 font-medium">
                      {workoutsByDay[dateStr].length} workout
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modale dei workout del giorno */}
      {selectedDay && (
        <div className="fixed inset-0 bg-zinc-900 bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-zinc-600 rounded-xl shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl text-amber-500 font-bold mb-4">
              Workout del {selectedDay.split('-').reverse().join('/')}
            </h2>
            {selectedWorkouts.length === 0 ? (
              <p className="text-white">Nessun workout in questa data.</p>
            ) : (
              <ul className="space-y-3">
                {selectedWorkouts.map(w => (
                  <li key={w._id} className="border-b border-gray-200 pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className={`font-semibold ${sheetNameMap[w.sheetId] ? "text-white" : "text-amber-200 italic"} text-base`}>
                          {sheetNameMap[w.sheetId] || "Scheda eliminata"}
                        </div>
                        <div className="text-white">
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
                className="px-4 py-2 bg-amber-500 text-zinc-800 cursor-pointer rounded hover:bg-zinc-200"
                onClick={() => setSelectedDay(null)}
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale di conferma eliminazione */}
      {workoutToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-zinc-700 rounded-lg p-6 max-w-sm w-full">
            {deleteSuccess ? (
              <div className="text-center">
                <div className="text-green-500 text-4xl mb-4">✓</div>
                <p className="text-white mb-2">Workout eliminato con successo!</p>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold text-amber-500 mb-4">Conferma eliminazione</h3>
                <p className="text-white mb-6">Sei sicuro di voler eliminare questo workout? Questa azione è irreversibile.</p>
                <div className="flex justify-end gap-3">
                  <button
                    className="px-4 py-2 bg-zinc-500 text-white rounded hover:bg-zinc-600"
                    onClick={() => setWorkoutToDelete(null)}
                  >
                    Annulla
                  </button>
                  <button
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
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