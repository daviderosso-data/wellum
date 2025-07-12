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
  const [saving, setSaving] = useState(false); // Stato per il caricamento del salvataggio


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
            // Silently ignore fetch errors
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
  setSaving(true);
  try {
    const res = await fetch(`${API_URL}/api/sheet/${sheet._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...sheet, exercises: editExercises }),
    });
    if (res.ok) {
      setIsEditing(false);
      // Attendi 1 secondo per UX, poi ricarica (opzionale)
      setTimeout(() => {
        setSaving(false);
        window.location.reload();
      }, 2000);
    } else {
      // Gestisci errore di salvataggio
      setSaving(false);
      alert("Errore durante il salvataggio. Riprova.");
    }
  } catch (err) {
    setSaving(false);
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
    <div className="bg-zinc-300 rounded shadow p-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold">{sheet.name}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="px-3 py-1 bg-zinc-600 text-white rounded hover:bg-zinc-700 transition font-semibold cursor-pointer"
          >
            + Aggiungi esercizio
          </button>
          {!isEditing ? (
            <button
              onClick={handleEditAll}
              className="px-3 py-1 bg-yellow-500 text-zinc-900 rounded hover:bg-yellow-600 transition font-semibold cursor-pointer"
            >
              Modifica
            </button>
          ) : (
            <>
              <button
                onClick={handleSaveAll}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition font-semibold"
              >
                Salva
              </button>
              <button
                onClick={handleCancelAll}
                className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 transition font-semibold"
              >
                Annulla
              </button>
              {onDeleteRequest && (
                <button
                  onClick={onDeleteRequest}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition font-semibold"
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
                      type="number"
                      value={ex.serie}
                      min={1}
                      onChange={e => handleEditChange(idx, "serie", Number(e.target.value))}
                      className="border rounded w-12 mx-1 p-1"
                    />
                  ) : (
                    ex.serie
                  )}
                  {" | "}
                  <span className="font-semibold">Ripetizioni:</span>{" "}
                  {isEditing ? (
                    <input
                      type="number"
                      value={ex.repetitions}
                      min={1}
                      onChange={e => handleEditChange(idx, "repetitions", Number(e.target.value))}
                      className="border rounded w-16 mx-1 p-1"
                    />
                  ) : (
                    ex.repetitions
                  )}
                  {" | "}
                  <span className="font-semibold">Peso:</span>{" "}
                  {isEditing ? (
                    <input
                      type="number"
                      value={ex.weight ?? 0}
                      min={0}
                      onChange={e => handleEditChange(idx, "weight", Number(e.target.value))}
                      className="border rounded w-16 mx-1 p-1"
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
                      className="border rounded w-64 mx-1 p-1"
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
 {saving && (
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 rounded">
          <svg className="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
        </div>
      )}
      {/* MODALE AGGIUNGI ESERCIZIO */}
      {showModal && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Aggiungi esercizio</h3>
            <form onSubmit={handleAddExercise} className="space-y-3">
              <select
                className="w-full p-2 border rounded"
                value={selectedExercise}
                onChange={e => setSelectedExercise(e.target.value)}
                required
              >
                <option value="">Seleziona esercizio</option>
                {allExercises.map(ex => (
                  <option key={ex._id} value={ex._id}>
                    {ex.name}
                  </option>
                ))}

               
              </select>
              <span className="font-semibold">Serie:</span>{" "}
              <input
                type="number"
                className="w-full p-2 border rounded"
                placeholder="Serie"
                value={serie}
                onChange={e => setSerie(Number(e.target.value))}
                min={1}
                required
              />
              <span className="font-semibold">Ripetizioni:</span>{" "}
              <input
                type="number"
                className="w-full p-2 border rounded"
                placeholder="Ripetizioni"
                value={repetitions}
                onChange={e => setRepetitions(Number(e.target.value))}
                min={1}
                required
              />
              <span className="font-semibold">Peso:</span>{" "}
              <input
                type="number"
                className="w-full p-2 border rounded"
                placeholder="Peso (kg)"
                value={weight}
                onChange={e => setWeight(Number(e.target.value))}
                min={0}
              />
              <span className="font-semibold">Note:</span>{" "}
              <input
                type="text"
                className="w-full p-2 border rounded"
                placeholder="Note"
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  onClick={() => setShowModal(false)}
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
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