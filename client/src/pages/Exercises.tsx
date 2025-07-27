import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import ExerciseList from "../components/ExpCards";
import { Link } from "react-router-dom";
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

  // Funzione per renderizzare i pulsanti di paginazione
  const renderPaginationButtons = () => {
    // Su mobile, mostra solo pulsanti avanti/indietro e pagina corrente
    if (window.innerWidth < 640) {
      return (
        <>
          <button
            className="px-3 py-1 bg-amber-500 rounded disabled:opacity-50"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Precedente
          </button>
          <span className="px-3 py-1 bg-zinc-500 text-white rounded">
            {currentPage} di {totalPages}
          </span>
          <button
            className="px-3 py-1 bg-amber-500 rounded disabled:opacity-50"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Successivo
          </button>
        </>
      );
    }

    // Su desktop, mostra tutti i pulsanti numerati
    // Limita il numero di pulsanti visualizzati per schermi più grandi
    const pageButtons = [];
    const maxVisibleButtons = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
    const endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);
    
    // Aggiusta l'intervallo se siamo vicino alla fine
    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }
    
    // Aggiungi pulsante per prima pagina se necessario
    if (startPage > 1) {
      pageButtons.push(
        <button
          key="first"
          className="px-3 py-1 bg-gray-200 rounded"
          onClick={() => setCurrentPage(1)}
        >
          1
        </button>
      );
      if (startPage > 2) {
        pageButtons.push(<span key="ellipsis1" className="px-2">...</span>);
      }
    }
    
    // Aggiungi pulsanti numerati per le pagine visibili
    for (let i = startPage; i <= endPage; i++) {
      pageButtons.push(
        <button
          key={i}
          className={`px-3 py-1 rounded ${currentPage === i ? "bg-zinc-500 text-white" : "bg-gray-200"}`}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </button>
      );
    }
    
    // Aggiungi pulsante per ultima pagina se necessario
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageButtons.push(<span key="ellipsis2" className="px-2">...</span>);
      }
      pageButtons.push(
        <button
          key="last"
          className="px-3 py-1 bg-gray-200 rounded"
          onClick={() => setCurrentPage(totalPages)}
        >
          {totalPages}
        </button>
      );
    }
    
    return (
      <>
        <button
          className="px-3 py-1 bg-amber-500 rounded disabled:opacity-50"
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          Precedente
        </button>
        {pageButtons}
        <button
          className="px-3 py-1 bg-amber-500 rounded disabled:opacity-50"
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
        >
          Successivo
        </button>
      </>
    );
  };

  return (
    <div className="flex min-h-screen bg-zinc-600">
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
        <h1 className="text-xl font-bold text-amber-500 ml-3">Esercizi</h1>
      </div>
      
      
      <div className="flex-1 p-4 md:p-6 md:ml-64 w-full mt-14 md:mt-0">
        <h1 className="text-3xl font-bold text-amber-500 mb-6 hidden md:block">Esercizi</h1>
      
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
        
        {/* Paginazione migliorata */}
        <div className="flex flex-wrap justify-center mt-6 gap-2">
          {renderPaginationButtons()}
        </div>
      </div>
    </div>
  );
}