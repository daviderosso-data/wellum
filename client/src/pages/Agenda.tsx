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
  const { user } = useUser();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const sheetNameMap: Record<string, string> = {};
  sheets.forEach(s => { sheetNameMap[s._id] = s.name; });

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    fetch(`${API_URL}/api/workouts/user/${user.id}`)
      .then(res => res.json())
      .then(data => setWorkouts(data))
      .finally(() => setLoading(false));
    fetch(`${API_URL}/api/sheet/user/${user.id}`)
      .then(res => res.json())
      .then(data => setSheets(data));
  }, [user?.id]);

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">Loading...</div>;
  }

  const workoutsByDay: Record<string, Workout[]> = {};
  workouts.forEach(w => {
    const day = new Date(w.completedAt).toISOString().slice(0, 10);
    if (!workoutsByDay[day]) workoutsByDay[day] = [];
    workoutsByDay[day].push(w);
  });

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const calendarDays: (string | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = new Date(currentYear, currentMonth, d).toISOString().slice(0, 10);
    calendarDays.push(dateStr);
  }

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

  const selectedWorkouts = selectedDay ? workoutsByDay[selectedDay] || [] : [];

  return (
    <div className="min-h-screen flex bg-gray-50">
      <div className="fixed top-0 left-0 h-screen w-64 z-10">
        <Sidebar />
      </div>
      <div className="flex-1 ml-64 p-8">
        <h1 className="text-2xl font-bold mb-6">Agenda allenamenti</h1>
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="px-3 py-1 rounded bg-white border border-gray-300 hover:bg-gray-100">&lt;</button>
          <span className="font-medium text-base">
            {monthNames[currentMonth]} {currentYear}
          </span>
          <button onClick={nextMonth} className="px-3 py-1 rounded bg-white border border-gray-300 hover:bg-gray-100">&gt;</button>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></span>
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-2 bg-white rounded-xl shadow p-4">
            {["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"].map(day => (
              <div key={day} className="font-medium text-center text-gray-600 pb-2">{day}</div>
            ))}
            {calendarDays.map((dateStr, idx) => {
              const isToday = dateStr === new Date().toISOString().slice(0, 10);
              const hasWorkout = dateStr && workoutsByDay[dateStr];
              return (
                <div
                  key={idx}
                  className={`h-20 border border-gray-200 rounded flex flex-col items-center justify-start p-1 cursor-pointer transition
                    ${isToday ? "ring-1 ring-gray-400" : ""}
                    ${hasWorkout ? "bg-gray-100 hover:bg-gray-200" : "hover:bg-gray-50"}
                  `}
                  onClick={() => dateStr && hasWorkout && setSelectedDay(dateStr)}
                >
                  <div className={`font-semibold text-base ${isToday ? "text-gray-800" : ""}`}>
                    {dateStr ? Number(dateStr.slice(-2)) : ""}
                  </div>
                  {hasWorkout && (
                    <div className="mt-1 text-xs text-gray-700 font-medium">
                      {workoutsByDay[dateStr].length} workout
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* MODALE WORKOUT DEL GIORNO */}
        {selectedDay && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md border border-gray-200">
              <h2 className="text-xl font-bold mb-4">
                Workout del {selectedDay.split('-').reverse().join('/')}
              </h2>
              {selectedWorkouts.length === 0 ? (
                <p className="text-gray-500">Nessun workout in questa data.</p>
              ) : (
                <ul className="space-y-3">
                  {selectedWorkouts.map(w => (
                    <li key={w._id} className="border-b border-gray-200 pb-3">
                      <div className="font-semibold text-base">
                        {sheetNameMap[w.sheetId] || "Scheda"}
                      </div>
                      <div className="text-gray-700">
                        Durata: <span className="font-semibold">{Math.floor(w.totalSeconds / 60)} min {w.totalSeconds % 60} sec</span>
                      </div>
                      <div className="text-xs text-gray-500">Esercizi: {w.exercises.length}</div>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex justify-end mt-6">
                <button
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                  onClick={() => setSelectedDay(null)}
                >
                  Chiudi
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}