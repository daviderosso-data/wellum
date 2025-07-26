import { useEffect, useState } from "react";
const API_URL = import.meta.env.VITE_URL_SERVER 

type ExerciseItem = {
  exerciseId: string;
  serie: number;
  repetitions: number;
  weight?: number;
  notes?: string;
};

type ExerciseDetails = {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
  group?: string;
};

type Sheet = {
  _id: string;
  name: string;
  userID: string;
  exercises: ExerciseItem[];
  createdAt: string;
};

type Props = {
  sheet: Sheet;
  onDeleteRequest?: () => void;
};

export default function SheetCard({ sheet, onDeleteRequest }: Props) {
  const [exerciseDetails, setExerciseDetails] = useState<Record<string, ExerciseDetails>>({});
  const [showModal, setShowModal] = useState(false);
  const [allExercises, setAllExercises] = useState<ExerciseDetails[]>([]);
  const [selectedExercise, setSelectedExercise] = useState("");
  const [serie, setSerie] = useState<number>(3);
  const [repetitions, setRepetitions] = useState<number>(10);
  const [weight, setWeight] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editExercises, setEditExercises] = useState<ExerciseItem[]>([]);
  
  // Stati per la ricerca esercizi
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredExercises, setFilteredExercises] = useState<ExerciseDetails[]>([]);
  const [showExerciseDropdown, setShowExerciseDropdown] = useState(false);

  useEffect(() => {
    async function fetchDetails() {
      const details: Record<string, ExerciseDetails> = {};
      await Promise.all(
        sheet.exercises.map(async (ex) => {
          try {
            const res = await fetch(`${API_URL}/api/exercises/${ex.exerciseId}`);
            if (res.ok) {
              const data = await res.json();
              details[ex.exerciseId] = data;
            }
          } catch {
            console.error(`Errore nel caricamento dei dettagli per l'esercizio ${ex.exerciseId}`);
          } 
        })
      );
      setExerciseDetails(details);
    }
    fetchDetails();
  }, [sheet.exercises]);

  useEffect(() => {
    fetch(`${API_URL}/api/exercises`)
      .then(res => res.json())
      .then(data => setAllExercises(data))
      .catch(() => setAllExercises([]));
  }, []);
  
  // Filtra gli esercizi in base alla ricerca
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredExercises([]);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = allExercises.filter(ex => 
      ex.name.toLowerCase().includes(query) || 
      (ex.group && ex.group.toLowerCase().includes(query))
    );
    
    setFilteredExercises(filtered);
  }, [searchQuery, allExercises]);

  const handleAddExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExercise) return;
    const newExercise: ExerciseItem = {
      exerciseId: selectedExercise,
      serie,
      repetitions,
      weight,
      notes,
    };
    await fetch(`${API_URL}/api/sheet/${sheet._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...sheet,
        exercises: [...sheet.exercises, newExercise],
      }),
    });
    setShowModal(false);
    window.location.reload();
  };

  const handleEditAll = () => {
    setEditExercises(sheet.exercises.map(ex => ({ ...ex })));
    setIsEditing(true);
  };

  const handleEditChange = (idx: number, field: keyof ExerciseItem, value: string | number) => {
    setEditExercises(prev =>
      prev.map((ex, i) =>
        i === idx ? { ...ex, [field]: value } : ex
      )
    );
  };
  
  const handleSaveAll = async () => {
    try {
      const res = await fetch(`${API_URL}/api/sheet/${sheet._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...sheet, exercises: editExercises }),
      });
      if (res.ok) {
        setIsEditing(false);
        window.location.reload();
      } else {
        alert("Errore durante il salvataggio. Riprova.");
      }
    } catch (err) {
      console.log("Errore di rete:", err);
      alert("Errore di rete. Riprova.");
    }
  };

  const handleCancelAll = () => {
    setIsEditing(false);
    setEditExercises([]);
  };

  const handleDeleteExercise = (idx: number) => {
    setEditExercises(prev => prev.filter((_, i) => i !== idx));
  };
  
  const selectExercise = (exercise: ExerciseDetails) => {
    setSelectedExercise(exercise._id);
    setSearchQuery(exercise.name);
    setShowExerciseDropdown(false);
  };
  
  // Chiudi il dropdown quando si clicca fuori
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showExerciseDropdown) {
        const target = e.target as HTMLElement;
        if (!target.closest('.search-container')) {
          setShowExerciseDropdown(false);
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showExerciseDropdown]);

  return (
    <div className="bg-zinc-300 rounded shadow p-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold">{sheet.name}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="px-2 py-1 bg-zinc-400 text-xs md:text-base  text-zinc-900 rounded hover:bg-zinc-200 transition font-semibold cursor-pointer"
          >
            + Aggiungi esercizio
          </button>
          {!isEditing ? (
            <button
              onClick={handleEditAll}
              className="px-2 py-1 bg-amber-500 text-xs md:text-base  text-zinc-900 rounded hover:bg-amber-600 transition font-semibold cursor-pointer"
            >
              Modifica
            </button>
          ) : (
            <>
              <button
                onClick={handleSaveAll}
                className="px-3 py-1 bg-green-500 text-zinc-900 rounded hover:bg-green-600 transition font-semibold cursor-pointer"
              >
                Salva
              </button>
              <button
                onClick={handleCancelAll}
                className="px-3 py-1 bg-amber-500 text-zinc-900 rounded hover:bg-amber-600 transition font-semibold cursor-pointer"
              >
                Annulla
              </button>
              {onDeleteRequest && (
                <button
                  onClick={onDeleteRequest}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition font-semibold cursor-pointer"
                >
                  Elimina scheda
                </button>
              )}
            </>
          )}
        </div>
      </div>
      <p className="text-gray-500 text-sm mb-2">
        Creata il {new Date(sheet.createdAt).toLocaleDateString()}
      </p>
      <ul className="mb-2">
        {(isEditing ? editExercises : sheet.exercises).map((ex, idx) => {
          const details = exerciseDetails[ex.exerciseId];
          return (
            <li key={idx} className="border-b last:border-b-0 py-2 flex items-center gap-4">
              {details && details.imageUrl && (
                <img
                  src={details.imageUrl}
                  alt={details.name}
                  className="w-20 h-16 object-cover rounded"
                />
              )}
              <div>
                <div className="font-semibold">{details ? details.name : ex.exerciseId}</div>
                <div className="text-sm text-gray-600">{details?.description}</div>
                <div>
                  <span className="font-semibold">Serie:</span>{" "}
                  {isEditing ? (
                    <input
                      type="text"
                      inputMode="numeric"
                      value={ex.serie}
                      onChange={e => {
                        const value = e.target.value;
                        if (/^\d*$/.test(value)) {
                          handleEditChange(idx, "serie", value ? parseInt(value) : 1);
                        }
                      }}
                      className="border bg-gray-100 rounded w-12 mx-1 p-1 appearance-none"
                    />
                  ) : (
                    ex.serie
                  )}
                  {" | "}
                  <span className="font-semibold">Ripetizioni:</span>{" "}
                  {isEditing ? (
                    <input
                      type="text"
                      inputMode="numeric"
                      value={ex.repetitions}
                      onChange={e => {
                        const value = e.target.value;
                        if (/^\d*$/.test(value)) {
                          handleEditChange(idx, "repetitions", value ? parseInt(value) : 1);
                        }
                      }}
                      className="border bg-gray-100 rounded w-16 mx-1 p-1 appearance-none"
                    />
                  ) : (
                    ex.repetitions
                  )}
                  {" | "}
                  <span className="font-semibold">Peso:</span>{" "}
                  {isEditing ? (
                    <input
                      type="text"
                      inputMode="decimal"
                      value={ex.weight ?? 0}
                      onChange={e => {
                        const value = e.target.value;
                        if (/^\d*\.?\d*$/.test(value)) {
                          handleEditChange(idx, "weight", value ? parseFloat(value) : 0);
                        }
                      }}
                      className="border bg-gray-100 rounded w-16 mx-1 p-1 appearance-none"
                    />
                  ) : (
                    ex.weight ?? 0
                  )}
                  {" Kg  | "}
                  <span className="font-semibold">Note:</span>{" "}
                  {isEditing ? (
                    <input
                      type="text"
                      value={ex.notes ?? ""}
                      onChange={e => handleEditChange(idx, "notes", e.target.value)}
                      className="border bg-gray-100 rounded w-64 mx-1 p-1"
                    />
                  ) : (
                    ex.notes ?? ""
                  )}
                  {isEditing && (
                    <button
                      type="button"
                      className="ml-2 px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      onClick={() => handleDeleteExercise(idx)}
                      title="Elimina esercizio"
                    >
                      Elimina
                    </button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {showModal && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Aggiungi esercizio</h3>
            <form onSubmit={handleAddExercise} className="space-y-3">
              <div className="relative search-container">
                <span className="font-semibold">Esercizio:</span>
                <input
                  type="text"
                  className="w-full p-2 border rounded bg-gray-100"
                  placeholder="Cerca esercizio..."
                  value={searchQuery}
                  onChange={e => {
                    setSearchQuery(e.target.value);
                    setShowExerciseDropdown(true);
                    setSelectedExercise("");
                  }}
                  onFocus={() => setShowExerciseDropdown(true)}
                  required
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
                <span className="font-semibold">Serie:</span>
                <input
                  type="text"
                  inputMode="numeric"
                  className="w-full p-2 border rounded bg-gray-100 appearance-none"
                  placeholder="Serie"
                  value={serie}
                  onChange={e => {
                    const value = e.target.value;
                    if (/^\d*$/.test(value)) {
                      setSerie(value ? parseInt(value) : 0);
                    }
                  }}
                  required
                />
              </div>
              <div>
                <span className="font-semibold">Ripetizioni:</span>
                <input
                  type="text"
                  inputMode="numeric"
                  className="w-full p-2 border rounded bg-gray-100 appearance-none"
                  placeholder="Ripetizioni"
                  value={repetitions}
                  onChange={e => {
                    const value = e.target.value;
                    if (/^\d*$/.test(value)) {
                      setRepetitions(value ? parseInt(value) : 0);
                    }
                  }}
                  required
                />
              </div>
              <div>
                <span className="font-semibold">Peso:</span>
                <input
                  type="text"
                  inputMode="decimal"
                  className="w-full p-2 border rounded bg-gray-100 appearance-none"
                  placeholder="Peso (kg)"
                  value={weight}
                  onChange={e => {
                    const value = e.target.value;
                    if (/^\d*\.?\d*$/.test(value)) {
                      setWeight(value ? parseFloat(value) : 0);
                    }
                  }}
                />
              </div>
              <div>
                <span className="font-semibold">Note:</span>
                <input
                  type="text"
                  className="w-full p-2 border rounded bg-gray-100"
                  placeholder="Note"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-400 rounded hover:bg-gray-500"
                  onClick={() => setShowModal(false)}
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-zinc-900 rounded hover:bg-amber-600"
                  disabled={!selectedExercise}
                >
                  Aggiungi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}