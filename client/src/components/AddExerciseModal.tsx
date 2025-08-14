// Modal to add an exercise to a workout sheet
// This component allows users to search and select exercises, specify sets, reps, weight, and notes,
// and submit the exercise to be added to a workout sheet.
// It includes a search feature to filter exercises by name or muscle group, and displays a dropdown
// with matching exercises. The form is reset after submission.
// The component uses React hooks for state management and side effects, and fetches exercise data from
// an API endpoint.

import { useState, useEffect, useRef } from "react";
import { useApi } from "../lib/utils";

type ExerciseDetails = {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
  group?: string;
};

type ExerciseItem = {
  exerciseId: string;
  serie: number;
  repetitions: number;
  weight?: number;
  notes?: string;
};

type AddExerciseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAddExercise: (exercise: ExerciseItem) => Promise<void>;
};

const AddExerciseModal = ({ isOpen, onClose, onAddExercise }: AddExerciseModalProps) => {
  const api = useApi();

  // Ref stabile all'API per non ritriggerare l'effetto
  const apiRef = useRef(api);
  useEffect(() => {
    apiRef.current = api;
  }, [api]);

  const [allExercises, setAllExercises] = useState<ExerciseDetails[]>([]);
  const [selectedExercise, setSelectedExercise] = useState("");
  const [serie, setSerie] = useState<number>(3);
  const [repetitions, setRepetitions] = useState<number>(10);
  const [weight, setWeight] = useState<number>(0);
  const [notes, setNotes] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredExercises, setFilteredExercises] = useState<ExerciseDetails[]>([]);
  const [showExerciseDropdown, setShowExerciseDropdown] = useState(false);

  // Stato fetch autenticato
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Previene doppio fetch in StrictMode per la stessa apertura
  const didFetchOnOpenRef = useRef(false);

  const log = (...args: unknown[]) => console.log("[AddExerciseModal]", ...args);

  // Carica esercizi autenticato quando la modale si apre
  useEffect(() => {
    if (!isOpen) {
      // reset guard alla chiusura
      didFetchOnOpenRef.current = false;
      return;
    }

    if (didFetchOnOpenRef.current) {
      log("skip fetch: already fetched since open");
      return;
    }
    didFetchOnOpenRef.current = true;

    const controller = new AbortController();

    const run = async () => {
      setIsFetching(true);
      setFetchError(null);
      try {
        log("GET /api/exercises -> start");
        const data = await apiRef.current.get<ExerciseDetails[]>("/api/exercises", { signal: controller.signal });
        log("GET /api/exercises -> ok:", Array.isArray(data) ? data.length : "non-array");
        setAllExercises(Array.isArray(data) ? data : []);
      } catch (err: unknown) {
        if (typeof err === "object" && err !== null && "name" in err && (err as { name?: string }).name === "AbortError") {
          log("GET /api/exercises -> aborted");
          return;
        }
        const status =
          typeof err === "object" && err !== null
            ? ((err as { status?: number; response?: { status?: number } }).status ||
              (err as { response?: { status?: number } }).response?.status)
            : undefined;
        log("GET /api/exercises -> error:", status, err);
        if (status === 401 || status === 403) {
          setFetchError("Non autenticato. Accedi per cercare esercizi.");
        } else {
          setFetchError("Errore nel caricamento degli esercizi. Riprova.");
        }
        setAllExercises([]);
      } finally {
        setIsFetching(false);
      }
    };

    run();
    return () => controller.abort();
  }, [isOpen]);

  // Filtro locale
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredExercises([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    const filtered = allExercises.filter(
      (ex) => ex.name.toLowerCase().includes(q) || (ex.group && ex.group.toLowerCase().includes(q))
    );
    setFilteredExercises(filtered);
  }, [searchQuery, allExercises]);

  // Click fuori per chiudere il dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!showExerciseDropdown) return;
      const target = e.target as HTMLElement;
      if (!target.closest(".search-container")) {
        setShowExerciseDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showExerciseDropdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExercise) return;

    const newExercise: ExerciseItem = {
      exerciseId: selectedExercise,
      serie,
      repetitions,
      weight,
      notes,
    };

    await onAddExercise(newExercise);
    resetForm();
  };

  const selectExercise = (exercise: ExerciseDetails) => {
    setSelectedExercise(exercise._id);
    setSearchQuery(exercise.name);
    setShowExerciseDropdown(false);
  };

  const resetForm = () => {
    setSelectedExercise("");
    setSearchQuery("");
    setSerie(3);
    setRepetitions(10);
    setWeight(0);
    setNotes("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded shadow-lg p-4 md:p-6 max-w-md w-full">
        <h3 className="text-lg font-bold mb-4">Aggiungi esercizio</h3>

        {/* Stato caricamento/errore autenticazione */}
        {isFetching && <div className="text-sm text-gray-600 mb-2">Caricamento esercizi...</div>}
        {fetchError && <div className="text-sm text-red-600 mb-2">{fetchError}</div>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative search-container">
            <span className="font-semibold">Esercizio:</span>
            <input
              type="text"
              className="w-full p-2 border rounded bg-gray-100"
              placeholder="Cerca esercizio..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowExerciseDropdown(true);
                setSelectedExercise("");
              }}
              onFocus={() => setShowExerciseDropdown(true)}
              required
              disabled={!!fetchError}
            />

            {showExerciseDropdown && filteredExercises.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg max-h-48 overflow-auto">
                <ul className="py-1">
                  {filteredExercises.map((ex) => (
                    <li
                      key={ex._id}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                      onClick={() => selectExercise(ex)}
                    >
                      {ex.imageUrl && (
                        <img src={ex.imageUrl} alt={ex.name} className="w-8 h-8 object-cover rounded mr-2" />
                      )}
                      <div>
                        <div className="font-medium text-sm">{ex.name}</div>
                        <div className="text-xs text-gray-500">{ex.group}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div>
            <span className="font-semibold text-sm">Serie:</span>
            <input
              type="text"
              inputMode="numeric"
              className="w-full p-2 border rounded bg-gray-100 appearance-none"
              placeholder="Serie"
              value={serie}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*$/.test(value)) setSerie(value ? parseInt(value) : 0);
              }}
              required
            />
          </div>

          <div>
            <span className="font-semibold text-sm">Ripetizioni:</span>
            <input
              type="text"
              inputMode="numeric"
              className="w-full p-2 border rounded bg-gray-100 appearance-none"
              placeholder="Ripetizioni"
              value={repetitions}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*$/.test(value)) setRepetitions(value ? parseInt(value) : 0);
              }}
              required
            />
          </div>

          <div>
            <span className="font-semibold text-sm">Peso (kg):</span>
            <input
              type="text"
              inputMode="decimal"
              className="w-full p-2 border rounded bg-gray-100 appearance-none"
              placeholder="Peso (kg)"
              value={weight}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*\.?\d*$/.test(value)) setWeight(value ? parseFloat(value) : 0);
              }}
            />
          </div>

          <div>
            <span className="font-semibold text-sm">Note:</span>
            <input
              type="text"
              className="w-full p-2 border rounded bg-gray-100"
              placeholder="Note"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" className="px-3 py-1.5 bg-gray-400 rounded hover:bg-gray-500 text-sm" onClick={onClose}>
              Annulla
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 bg-amber-500 text-zinc-900 rounded hover:bg-amber-600 text-sm"
              disabled={!selectedExercise || !!fetchError}
            >
              Aggiungi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExerciseModal;