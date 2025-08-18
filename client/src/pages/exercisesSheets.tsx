// ExercisesSheets
// This page allows users to create and manage their workout sheets, including adding exercises, setting series and repetitions, and saving the sheets for future reference.
// It includes a sidebar for navigation and a modal for creating new sheets.
// The page fetches available exercises from an API and allows users to select them for their sheets.

import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useApi } from "../lib/utils";
import Sidebar from "../components/Sidebar";
import SheetCard from "../components/sheetCard";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

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

const sheetNameSchema = z.object({
  name: z.string().min(1, "Nome richiesto"),
});

const exerciseEntrySchema = z.object({
  exerciseId: z.string().min(1, "Seleziona un esercizio"),
  serie: z.coerce.number().int().min(1, "Min 1").max(100, "Max 100"),
  repetitions: z.coerce.number().int().min(1, "Min 1").max(1000, "Max 1000"),
  weight: z
    .union([z.coerce.number().nonnegative(">= 0"), z.nan()])
    .optional()
    .transform((v) => (v === undefined || Number.isNaN(v) ? undefined : v)),
  notes: z.string().max(300, "Max 300 caratteri").optional(),
});

type SheetNameInputs = z.infer<typeof sheetNameSchema>;
type ExerciseEntryInputs = z.infer<typeof exerciseEntrySchema>;

export default function ExercisesSheets() {
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createdSheet, setCreatedSheet] = useState<Sheet | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sheetToDelete, setSheetToDelete] = useState<Sheet | null>(null);

  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<ExerciseItem[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [showExerciseDropdown, setShowExerciseDropdown] = useState(false);
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);

  const { user, isLoaded, isSignedIn } = useUser();
  const api = useApi();


  // Load user's sheets when the component mounts or user changes
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user?.id) return;
    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const data = await api.get<Sheet[]>(`/api/sheet/user/${user.id}`, { signal: controller.signal });
        setSheets(Array.isArray(data) ? data : []);
      } catch (error: unknown) {
        const isAbort =
          typeof error === "object" &&
          error !== null &&
          "name" in error &&
          (error as { name?: string }).name === "AbortError";
        if (!isAbort) {
          console.error("Errore caricamento schede:", error);
          setSheets([]);
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [user?.id, isLoaded, isSignedIn]);


  // Load available exercises when the modal is opened and user is signed in    
  useEffect(() => {
    if (!showModal || !isSignedIn) return;
    const controller = new AbortController();
    (async () => {
      try {
        const data = await api.get<Exercise[]>("/api/exercises", { signal: controller.signal });
        setAvailableExercises(Array.isArray(data) ? data : []);
      } catch (error: unknown) {
        const isAbort =
          typeof error === "object" &&
          error !== null &&
          "name" in error &&
          (error as { name?: string }).name === "AbortError";
        if (!isAbort) {
          console.error("Errore caricamento esercizi:", error);
        }
      }
    })();
    return () => controller.abort();
  }, [showModal, isSignedIn]);

  // Filter exercises based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredExercises([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    setFilteredExercises(
      availableExercises.filter(
        (ex) => ex.name.toLowerCase().includes(q) || ex.group.toLowerCase().includes(q)
      )
    );
  }, [searchQuery, availableExercises]);

  // Form handling for sheet creation
  const {
    register: registerSheet,
    handleSubmit: handleSubmitSheet,
    reset: resetSheet,
    formState: { errors: sheetErrors, isSubmitting: isSheetSubmitting, isValid: isSheetValid },
  } = useForm<SheetNameInputs>({
    resolver: zodResolver(sheetNameSchema),
    defaultValues: { name: "" },
    mode: "onChange",
  });

  // Form handling for exercise entries
  const {
    register: registerExercise,
    handleSubmit: handleSubmitExercise,
    reset: resetExercise,
    setValue: setExerciseValue,
    formState: { errors: exerciseErrors },
  } = useForm<z.input<typeof exerciseEntrySchema>, unknown, ExerciseEntryInputs>({
    resolver: zodResolver(exerciseEntrySchema),
    defaultValues: { exerciseId: "", serie: 3, repetitions: 10, weight: undefined, notes: "" },
    mode: "onChange",
  });

  // Function to handle adding an exercise to the selected list
  const onAddExercise = handleSubmitExercise((values) => {
    if (!currentExercise) return;
    setSelectedExercises((prev) => [
      ...prev,
      {
        exerciseId: values.exerciseId,
        exerciseName: currentExercise.name,
        serie: values.serie,
        repetitions: values.repetitions,
        weight: values.weight,
        notes: values.notes,
      },
    ]);
    resetExercise({ exerciseId: "", serie: 3, repetitions: 10, weight: undefined, notes: "" });
    setCurrentExercise(null);
    setSearchQuery("");
  });

  // Function to handle creating a new sheet
  const handleCreateSheet = async ({ name }: SheetNameInputs) => {
    if (!user?.id || !isSignedIn || selectedExercises.length === 0) return;
    setCreating(true);
    try {
      const data = await api.post<
        Sheet,
        { name: string; userID: string; exercises: Omit<ExerciseItem, "exerciseName">[] }
      >("/api/sheet", {
        name,
        userID: user.id,
        exercises: selectedExercises.map(({ exerciseId, serie, repetitions, weight, notes }) => ({
          exerciseId,
          serie,
          repetitions,
          weight,
          notes,
        })),
      });
      setCreatedSheet(data);
      setSheets((prev) => [data, ...prev]);
      setShowModal(false);
      resetSheet({ name: "" });
      resetExercise({ exerciseId: "", serie: 3, repetitions: 10, weight: undefined, notes: "" });
      setSelectedExercises([]);
      setSearchQuery("");
      setCurrentExercise(null);
    } catch (error) {
      console.error("Error creating sheet:", error);
      alert("Errore durante la creazione della scheda.");
    } finally {
      setCreating(false);
    }
  };

  // Function to handle removing an exercise from the selected list
  const handleRemoveExercise = (index: number) => {
    setSelectedExercises((prev) => prev.filter((_, i) => i !== index));
  };
// Function to handle deleting a sheet
  const handleDeleteRequest = (sheet: Sheet) => {
    setSheetToDelete(sheet);
    setShowDeleteModal(true);
  };
  // Function to handle the actual deletion of a sheet
  const handleDeleteSheet = async () => {
    if (!sheetToDelete || !isSignedIn) return;
    try {
      await api.delete(`/api/sheet/${sheetToDelete._id}`);
      setSheets((prev) => prev.filter((s) => s._id !== sheetToDelete._id));
      setShowDeleteModal(false);
      setSheetToDelete(null);
    } catch (error) {
      console.error("Errore durante l'eliminazione:", error);
      alert("Errore durante l'eliminazione della scheda.");
    }
  };

  // Function to select an exercise from the dropdown
  const selectExercise = (exercise: Exercise) => {
    setCurrentExercise(exercise);
    setSearchQuery(exercise.name);
    setExerciseValue("exerciseId", exercise._id, { shouldValidate: true, shouldDirty: true });
    setShowExerciseDropdown(false);
  };

  return (
    <div className="flex min-h-screen bg-zinc-600">
      <div className="fixed top-0 left-0 h-screen w-64 z-10 hidden md:block">
        <Sidebar />
      </div>

      <div className="fixed top-0 left-0 right-0 bg-zinc-800 p-3 flex items-center z-20 md:hidden">
        <Sidebar />
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <Link to="/" className="flex items-center">
          <img src="/assets/pictures/logoAmberTransp.png" className="ml-6 h-8" alt="Wellum logo" />
        </Link>
        <h1 className="text-xl font-bold text-amber-500 ml-3">Schede</h1>
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

{/* Loading spinner or error message while fetching data */}
        {!isSignedIn && isLoaded ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            Devi effettuare l'accesso per visualizzare le tue schede.
            <div className="mt-2">
              <Link to="/login" className="bg-amber-500 text-zinc-900 px-4 py-2 rounded font-semibold">
                Accedi
              </Link>
            </div>
          </div>
        ) : loading ? (
          <div className="min-h-screen flex items-center justify-center bg-zinc-600 p-4">
            <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></span>
          </div>
        ) : sheets.length === 0 ? (
          <div className="flex flex-col items-center justify-center bg-zinc-200 rounded-xl p-8 mt-6 text-center">
            <img src="/assets/pictures/brain-run.png" alt="Nessuna scheda" className="w-56 h-56 object-contain mb-4 opacity-90" />
            <h2 className="text-xl font-semibold text-zinc-900 mb-2">Non hai ancora creato una scheda</h2>
            <p className="text-zinc-700 mb-4">Crea la tua prima scheda di allenamento per iniziare.</p>
            <button
              className="px-4 py-2 bg-amber-500 text-zinc-900 rounded hover:bg-amber-600 cursor-pointer font-semibold shadow"
              onClick={() => setShowModal(true)}
            >
              + Crea una nuova scheda
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {sheets.map((sheet) => (
              <SheetCard key={sheet._id} sheet={sheet} onDeleteRequest={() => handleDeleteRequest(sheet)} />
            ))}
          </div>
        )}
      </div>

{/* Modal for creating a new sheet */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="relative bg-zinc-400 rounded shadow-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {creating && (
              <div className="absolute inset-0 z-10">
                <div className="min-h-screen flex items-center justify-center bg-zinc-600/70 p-4">
                  <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></span>
                </div>
              </div>
            )}

            <h2 className="text-xl font-bold mb-4">Crea una nuova scheda</h2>

            <form onSubmit={handleSubmitSheet(handleCreateSheet)} className="space-y-4">
              <input
                type="text"
                className="w-full p-2 border rounded bg-gray-200"
                placeholder="Nome scheda"
                {...registerSheet("name")}
                disabled={creating}
              />
              {sheetErrors.name && <p className="text-sm text-red-600">{sheetErrors.name.message}</p>}

              <div className="bg-zinc-300 p-4 rounded-lg">
                <h3 className="font-bold mb-2">Aggiungi esercizi</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative search-container">
                    <label className="block text-sm font-medium mb-1">Esercizio</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded bg-gray-100"
                      placeholder="Cerca esercizio..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowExerciseDropdown(true);
                        setCurrentExercise(null);
                        setExerciseValue("exerciseId", "", { shouldValidate: true, shouldDirty: true });
                      }}
                      onFocus={() => setShowExerciseDropdown(true)}
                      disabled={creating}
                    />

                    {/* Display dropdown with filtered exercises */}
                    <input type="hidden" {...registerExercise("exerciseId")} />
                    {exerciseErrors.exerciseId && <p className="text-xs text-red-600">{exerciseErrors.exerciseId.message}</p>}

                    {showExerciseDropdown && filteredExercises.length > 0 && (
                      <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto">
                        <ul className="py-1">
                          {filteredExercises.map((ex) => (
                            <li
                              key={ex._id}
                              className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                              onClick={() => selectExercise(ex)}
                            >
                              {ex.imageUrl && (
                                <img src={ex.imageUrl} alt={ex.name} className="w-10 h-10 object-cover rounded mr-2" />
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
                      type="number"
                      inputMode="numeric"
                      className="w-full p-2 border rounded bg-gray-100 appearance-none"
                      {...registerExercise("serie")}
                      disabled={creating}
                    />
                    {exerciseErrors.serie && <p className="text-xs text-red-600">{exerciseErrors.serie.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Ripetizioni</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      className="w-full p-2 border rounded bg-gray-100 appearance-none"
                      {...registerExercise("repetitions")}
                      disabled={creating}
                    />
                    {exerciseErrors.repetitions && <p className="text-xs text-red-600">{exerciseErrors.repetitions.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Peso (kg, opzionale)</label>
                    <input
                      type="number"
                      inputMode="decimal"
                      className="w-full p-2 border rounded bg-gray-100 appearance-none"
                      placeholder="0"
                      step="0.1"
                      {...registerExercise("weight")}
                      disabled={creating}
                    />
                    {exerciseErrors.weight && <p className="text-xs text-red-600">{exerciseErrors.weight.message}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Note (opzionale)</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded bg-gray-100"
                      placeholder="Note aggiuntive..."
                      {...registerExercise("notes")}
                      disabled={creating}
                    />
                    {exerciseErrors.notes && <p className="text-xs text-red-600">{exerciseErrors.notes.message}</p>}
                  </div>
                </div>

                <button
                  type="button"
                  className="mt-4 px-4 py-2 bg-amber-500 text-zinc-900 rounded hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                  onClick={onAddExercise}
                  disabled={!currentExercise || creating}
                >
                  Aggiungi all'elenco
                </button>
              </div>
{/* Display selected exercises */}
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
                          disabled={creating}
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
                  disabled={creating || isSheetSubmitting}
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-zinc-900 rounded hover:bg-amber-600 shadow-md cursor-pointer font-semibold"
                  disabled={creating || isSheetSubmitting || selectedExercises.length === 0 || !isSheetValid}
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
              <button className="px-4 py-2 bg-gray-400 rounded hover:bg-gray-500" onClick={() => setShowDeleteModal(false)}>
                Annulla
              </button>
              <button className="px-4 py-2 bg-amber-500 text-zinc-900 rounded hover:bg-amber-600" onClick={handleDeleteSheet}>
                Elimina
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}