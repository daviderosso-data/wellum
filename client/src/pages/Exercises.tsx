import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import ExerciseList from "../components/ExpCards";
const API_URL = import.meta.env.VITE_URL_SERVER 

type Exercise = {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
  group: string;
  videoUrl?: string;
};

const EXERCISES_PER_PAGE = 6;

export default function Exercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [groupFilter, setGroupFilter] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/exercises`)
      .then(res => res.json())
      .then(setExercises)
      .catch(err => console.error("Errore nel caricamento esercizi:", err));
  }, []);

  const muscleGroups = Array.from(new Set(exercises.map(ex => ex.group).filter(Boolean)));

  const filteredExercises = groupFilter
    ? exercises.filter(ex => ex.group === groupFilter)
    : exercises;

  const totalPages = Math.ceil(filteredExercises.length / EXERCISES_PER_PAGE);
  const paginatedExercises = filteredExercises.slice(
    (currentPage - 1) * EXERCISES_PER_PAGE,
    currentPage * EXERCISES_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [groupFilter]);

  return (
    <div className="flex min-h-screen bg-zinc-600">
      <div className="fixed top-0 left-0 h-screen w-64 z-10">
        <Sidebar />
      </div>
      <div className="flex-1 p-6 ml-64">
        <h1 className="text-3xl font-bold text-amber-500 mb-6">Esercizi</h1>
      
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <select
            className="p-2 border bg-zinc-200 text-zinc-900 rounded border-amber-500 w-full md:w-1/4"
            value={groupFilter}
            onChange={e => setGroupFilter(e.target.value)}
          >
            <option value="">Tutti i gruppi muscolari</option>
            {muscleGroups.map(group => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
        </div>
        <ExerciseList exercises={paginatedExercises} />
        <div className="flex justify-center mt-6 space-x-2">
          <button
            className="px-3 py-1 bg-amber-500 rounded disabled:opacity-50"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Precedente
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`px-3 py-1 rounded ${currentPage === i + 1 ? "bg-zinc-500 text-white" : "bg-gray-200"}`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="px-3 py-1 bg-amber-500 rounded disabled:opacity-50"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Successivo
          </button>
        </div>
      </div>
    </div>
  );
}