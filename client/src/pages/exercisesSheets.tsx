import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import Sidebar from "../components/Sidebar";
import SheetCard from "../components/sheetCard";
const API_URL = import.meta.env.VITE_URL_SERVER 

type Exercise = {
  _id: string;
  name: string;
  group: string;
  description: string;
  imageUrl: string;
};

type ExerciseItem = {
  exerciseId: string;
  exerciseName?: string;
  serie: number;
  repetitions: number;
  weight?: number;
  notes?: string;
};

type Sheet = {
  _id: string;
  name: string;
  userID: string;
  exercises: ExerciseItem[];
  createdAt: string;
};

export default function ExercisesSheets() {
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newSheetName, setNewSheetName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createdSheet, setCreatedSheet] = useState<Sheet | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sheetToDelete, setSheetToDelete] = useState<Sheet | null>(null);
  
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<ExerciseItem[]>([]);
  
  // Stati per la ricerca esercizi
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [showExerciseDropdown, setShowExerciseDropdown] = useState(false);
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  
  // Stati per i dettagli dell'esercizio
  const [currentSerie, setCurrentSerie] = useState<number>(3);
  const [currentReps, setCurrentReps] = useState<number>(10);
  const [currentWeight, setCurrentWeight] = useState<number | undefined>(undefined);
  const [currentNotes, setCurrentNotes] = useState<string>("");

  const { user } = useUser();

  useEffect(() => {
    if (!user?.id) return;
    fetch(`${API_URL}/api/sheet/user/${user?.id}`)
      .then(res => res.json())
      .then(data => setSheets(data))
      .catch(() => setSheets([]))
      .finally(() => setLoading(false));
  }, [user?.id]);
  
  useEffect(() => {
    if (showModal) {
      fetch(`${API_URL}/api/exercises`)
        .then(res => res.json())
        .then(data => setAvailableExercises(data))
        .catch(err => console.error("Errore caricamento esercizi:", err));
    }
  }, [showModal]);
  
  // Filtra gli esercizi in base alla ricerca
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredExercises([]);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = availableExercises.filter(ex => 
      ex.name.toLowerCase().includes(query) || 
      ex.group.toLowerCase().includes(query)
    );
    
    setFilteredExercises(filtered);
  }, [searchQuery, availableExercises]);

  const handleCreateSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSheetName.trim() || !user?.id) return;
    setCreating(true);
    try {
      const res = await fetch(`${API_URL}/api/sheet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newSheetName,
          userID: user.id,
          exercises: selectedExercises.map(ex => ({
            exerciseId: ex.exerciseId,
            serie: ex.serie,
            repetitions: ex.repetitions,
            weight: ex.weight,
            notes: ex.notes
          })),
        }),
      });
      const data = await res.json();
      setCreatedSheet(data);
      setSheets(prev => [data, ...prev]);
      setShowModal(false);
      setNewSheetName("");
      setSelectedExercises([]);
    } catch (error) {
      console.error("Error creating sheet:", error);
    } finally {
      setCreating(false);
    }
  };

  const handleAddExercise = () => {
    if (!currentExercise) return;
    
    setSelectedExercises(prev => [
      ...prev, 
      {
        exerciseId: currentExercise._id,
        exerciseName: currentExercise.name,
        serie: currentSerie,
        repetitions: currentReps,
        weight: currentWeight,
        notes: currentNotes
      }
    ]);
    
    // Reset form
    setCurrentExercise(null);
    setSearchQuery("");
    setCurrentSerie(3);
    setCurrentReps(10);
    setCurrentWeight(undefined);
    setCurrentNotes("");
  };

  const handleRemoveExercise = (index: number) => {
    setSelectedExercises(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteRequest = (sheet: Sheet) => {
    setSheetToDelete(sheet);
    setShowDeleteModal(true);
  };

  const handleDeleteSheet = async () => {
    if (!sheetToDelete) return;
    try {
      await fetch(`${API_URL}/api/sheet/${sheetToDelete._id}`, { method: "DELETE" });
      setSheets(prev => prev.filter(s => s._id !== sheetToDelete._id));
      setShowDeleteModal(false);
      setSheetToDelete(null);
    } catch {
      alert("Errore durante l'eliminazione della scheda.");
    }
  };

  const selectExercise = (exercise: Exercise) => {
    setCurrentExercise(exercise);
    setSearchQuery(exercise.name);
    setShowExerciseDropdown(false);
  };

  return (
    <div className="flex min-h-screen bg-zinc-600">
      <div className="fixed top-0 left-0 h-screen w-64 z-10">
        <Sidebar />
      </div>
      <div className="flex-1 p-6 md:ml-64">
        <div className="flex justify-between items-center mb-6 mt-20">
          <h1 className="text-3xl text-amber-500 font-bold">Le tue schede</h1>
          <button
            className="px-4 py-2 bg-amber-500 text-zinc-900 rounded hover:bg-amber-600 cursor-pointer font-semibold"
            onClick={() => setShowModal(true)}
          >
            + Crea una nuova scheda
          </button>
        </div>
        {loading ? (
          <p>Caricamento...</p>
        ) : sheets.length === 0 ? (
          <p>Nessuna scheda trovata.</p>
        ) : (
          <div className="space-y-4">
            {sheets.map(sheet => (
              <SheetCard
                key={sheet._id}
                sheet={sheet}
                onDeleteRequest={() => handleDeleteRequest(sheet)}
              />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-zinc-400 rounded shadow-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Crea una nuova scheda</h2>
            <form onSubmit={handleCreateSheet} className="space-y-4">
              <input
                type="text"
                className="w-full p-2 border rounded bg-gray-200"
                placeholder="Nome scheda"
                value={newSheetName}
                onChange={e => setNewSheetName(e.target.value)}
                required
              />
              
              <div className="bg-zinc-300 p-4 rounded-lg">
                <h3 className="font-bold mb-2">Aggiungi esercizi</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block text-sm font-medium mb-1">Esercizio</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded bg-gray-100"
                      placeholder="Cerca esercizio..."
                      value={searchQuery}
                      onChange={e => {
                        setSearchQuery(e.target.value);
                        setShowExerciseDropdown(true);
                        setCurrentExercise(null);
                      }}
                      onFocus={() => setShowExerciseDropdown(true)}
                    />
                    
                    {showExerciseDropdown && filteredExercises.length > 0 && (
                      <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto">
                        <ul className="py-1">
                          {filteredExercises.map(ex => (
                            <li 
                              key={ex._id} 
                              className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                              onClick={() => selectExercise(ex)}
                            >
                              {ex.imageUrl && (
                                <img 
                                  src={ex.imageUrl} 
                                  alt={ex.name} 
                                  className="w-10 h-10 object-cover rounded mr-2" 
                                />
                              )}
                              <div>
                                <div className="font-medium">{ex.name}</div>
                                <div className="text-xs text-gray-500">{ex.group}</div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Serie</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="w-full p-2 border rounded bg-gray-100 appearance-none"
                      value={currentSerie}
                      onChange={e => {
                        const value = e.target.value;
                        if (/^\d*$/.test(value)) {
                          setCurrentSerie(value ? parseInt(value) : 0);
                        }
                      }}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Ripetizioni</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="w-full p-2 border rounded bg-gray-100 appearance-none"
                      value={currentReps}
                      onChange={e => {
                        const value = e.target.value;
                        if (/^\d*$/.test(value)) {
                          setCurrentReps(value ? parseInt(value) : 0);
                        }
                      }}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Peso (kg, opzionale)</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      className="w-full p-2 border rounded bg-gray-100 appearance-none"
                      value={currentWeight === undefined ? '' : currentWeight}
                      onChange={e => {
                        const value = e.target.value;
                        if (/^\d*\.?\d*$/.test(value)) {
                          setCurrentWeight(value ? parseFloat(value) : undefined);
                        }
                      }}
                      placeholder="0"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Note (opzionale)</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded bg-gray-100"
                      value={currentNotes}
                      onChange={e => setCurrentNotes(e.target.value)}
                      placeholder="Note aggiuntive..."
                    />
                  </div>
                </div>
                
                <button
                  type="button"
                  className="mt-4 px-4 py-2 bg-amber-500 text-zinc-900 rounded hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-md "
                  onClick={handleAddExercise}
                  disabled={!currentExercise}
                >
                  Aggiungi all'elenco
                </button>
              </div>
              
              {selectedExercises.length > 0 && (
                <div className="bg-zinc-300 p-4 rounded-lg">
                  <h3 className="font-bold mb-2">Esercizi aggiunti ({selectedExercises.length})</h3>
                  <ul className="space-y-2">
                    {selectedExercises.map((ex, index) => (
                      <li key={index} className="flex justify-between items-center bg-white p-2 rounded">
                        <div>
                          <span className="font-medium">{ex.exerciseName}</span>
                          <span className="text-sm text-gray-600 ml-2">
                            {ex.serie} serie × {ex.repetitions} ripetizioni
                            {ex.weight ? ` (${ex.weight} kg)` : ""}
                            {ex.notes ? ` - ${ex.notes}` : ""}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleRemoveExercise(index)}
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-500 shadow-md cursor-pointer font-semibold"
                  onClick={() => setShowModal(false)}
                  disabled={creating}
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-zinc-900 rounded hover:bg-amber-600 shadow-md cursor-pointer font-semibold"
                  disabled={creating || selectedExercises.length === 0}
                >
                  {creating ? "Creazione..." : "Crea"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {createdSheet && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Scheda creata!</h2>
            <SheetCard sheet={createdSheet} />
            <div className="flex justify-end mt-4">
              <button
                className="px-4 py-2 bg-amber-500 text-zinc-900 rounded hover:bg-amber-600"
                onClick={() => setCreatedSheet(null)}
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && sheetToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-red-600">Elimina scheda</h2>
            <p>Sei sicuro di voler eliminare la scheda <b>{sheetToDelete.name}</b>?</p>
            <div className="flex justify-end gap-2 mt-6">
              <button
                className="px-4 py-2 bg-gray-400 rounded hover:bg-gray-500"
                onClick={() => setShowDeleteModal(false)}
              >
                Annulla
              </button>
              <button
                className="px-4 py-2 bg-amber-500 text-zinc-900 rounded hover:bg-amber-600"
                onClick={handleDeleteSheet}
              >
                Elimina
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}