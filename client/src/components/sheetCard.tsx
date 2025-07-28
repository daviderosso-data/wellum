import { useEffect, useState } from "react";
import AddExerciseModal from "./AddExerciseModal";

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
  const [isEditing, setIsEditing] = useState(false);
  const [editExercises, setEditExercises] = useState<ExerciseItem[]>([]);

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

  const handleAddExercise = async (newExercise: ExerciseItem) => {
    try {
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
    } catch (error) {
      console.error("Errore durante l'aggiunta dell'esercizio:", error);
      alert("Si è verificato un errore. Riprova.");
    }
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
  
  return (
    <div className="bg-zinc-300 rounded shadow p-4 overflow-hidden">
      <div className="flex flex-col mb-2">
        <h2 className="text-xl font-bold break-words">{sheet.name}</h2>
        <p className="text-gray-500 text-sm mb-2">
          Creata il {new Date(sheet.createdAt).toLocaleDateString()}
        </p>
        
        <div className="flex flex-wrap gap-2">
          {!isEditing && (
            <button
              onClick={() => setShowModal(true)}
              className="px-2 py-1 bg-zinc-400 text-xs md:text-base text-zinc-900 rounded hover:bg-zinc-200 transition font-semibold cursor-pointer"
            >
              + Aggiungi esercizio
            </button>
          )}
          
          {!isEditing ? (
            <button
              onClick={handleEditAll}
              className="px-2 py-1 bg-amber-500 text-xs md:text-base text-zinc-900 rounded hover:bg-amber-600 transition font-semibold cursor-pointer"
            >
              Modifica
            </button>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleSaveAll}
                className="px-2 py-1 bg-green-500 text-xs md:text-base text-zinc-900 rounded hover:bg-green-600 transition font-semibold cursor-pointer"
              >
                Salva
              </button>
              <button
                onClick={handleCancelAll}
                className="px-2 py-1 bg-amber-500 text-xs md:text-base text-zinc-900 rounded hover:bg-amber-600 transition font-semibold cursor-pointer"
              >
                Annulla
              </button>
              {onDeleteRequest && (
                <button
                  onClick={onDeleteRequest}
                  className="px-2 py-1 bg-red-600 text-xs md:text-base text-white rounded hover:bg-red-700 transition font-semibold cursor-pointer"
                >
                  Elimina scheda
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      
      <ul className="mb-2">
        {(isEditing ? editExercises : sheet.exercises).map((ex, idx) => {
          const details = exerciseDetails[ex.exerciseId];
          const isExerciseDeleted = !details;

          return (
            <li key={idx} className="border-b last:border-b-0 py-2">
              <div className="flex gap-3">
               {isExerciseDeleted ? (
                  <img
                    src="/assets/pictures/404.png"
                    alt="Esercizio non disponibile"
                    className={`w-20 h-16 object-cover rounded ${isEditing ? 'hidden md:block' : ''}`}
                  />
                ) : (
                  details.imageUrl && (
                    <img
                      src={details.imageUrl}
                      alt={details.name}
                      className={`w-20 h-16 object-cover rounded ${isEditing ? 'hidden md:block' : ''}`}
                    />
                  )
                )}
                
                <div className="min-w-0 flex-1">
                  {isExerciseDeleted ? (
                    <div className="text-red-600 font-semibold">Esercizio eliminato dal Database</div>
                  ) : (
                    <>
                      <div className="font-semibold text-sm break-words">{details ? details.name : ex.exerciseId}</div>
                      <div className="text-xs text-gray-600 break-words mb-2">{details?.description}</div>
                    </>
                  )}
                  
                  {isEditing ? (
                    <div className="grid grid-cols-1 gap-2">
                      <div>
                        <label className="text-xs font-medium block">Serie:</label>
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
                          className="w-full border bg-gray-100 rounded p-1 text-xs appearance-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium block">Ripetizioni:</label>
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
                          className="w-full border bg-gray-100 rounded p-1 text-xs appearance-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium block">Peso (kg):</label>
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
                          className="w-full border bg-gray-100 rounded p-1 text-xs appearance-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium block">Note:</label>
                        <input
                          type="text"
                          value={ex.notes ?? ""}
                          onChange={e => handleEditChange(idx, "notes", e.target.value)}
                          className="w-full border bg-gray-100 rounded p-1 text-xs"
                        />
                      </div>
                      <div className="mt-3">
                        <button
                          type="button"
                          className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                          onClick={() => handleDeleteExercise(idx)}
                          title="Elimina esercizio"
                        >
                          Elimina esercizio
                        </button>
                      </div>
                    </div>
                  ) : (
                      isExerciseDeleted ? (null) :(<div className="text-xs mt-1 break-words">
                      <span className="font-semibold">Serie:</span> {ex.serie} | <span className="font-semibold">Ripetizioni:</span> {ex.repetitions} | <span className="font-semibold">Peso:</span> {ex.weight ?? 0} Kg
                      {ex.notes && (
                        <> | <span className="font-semibold">Note:</span> {ex.notes}</>
                      )}
                    </div>) 
                  )}
                
                  
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <AddExerciseModal 
        isOpen={showModal && !isEditing}
        onClose={() => setShowModal(false)}
        onAddExercise={handleAddExercise}
      />
    </div>
  );
}