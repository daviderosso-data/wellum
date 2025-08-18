// AddExerciseModal
// Modal component for adding exercises to a workout plan
// It allows users to search for exercises, select one, and specify details like series, repetitions
// and weight. The form is validated using Zod and React Hook Form.


import { useEffect, useRef, useState } from "react";
import { useApi } from "../lib/utils";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

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

type FormInputs = z.infer<typeof formSchema>;

const formSchema = z.object({
  exerciseId: z.string().min(1, "Seleziona un esercizio"),
  serie: z.number().int().min(1, "Minimo 1").max(10, "Max 10"),
  repetitions: z.number().int().min(1, "Minimo 1").max(100, "Max 100"),
  weight: z.number().nonnegative("Deve essere >= 0").max(200, "Non esagerare dai").optional(),
  notes: z.string().max(500, "Max 500 caratteri").optional(),
});

export default function AddExerciseModal({ isOpen, onClose, onAddExercise }: AddExerciseModalProps) {
  const api = useApi();

  const apiRef = useRef(api);
  useEffect(() => {
    apiRef.current = api;
  }, [api]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormInputs>({
    resolver: zodResolver(formSchema),
    defaultValues: { exerciseId: "", serie: 3, repetitions: 4, weight: undefined, notes: "" },
    mode: "onChange",
  });

  const [allExercises, setAllExercises] = useState<ExerciseDetails[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredExercises, setFilteredExercises] = useState<ExerciseDetails[]>([]);
  const [showExerciseDropdown, setShowExerciseDropdown] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const didFetchOnOpenRef = useRef(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

 useEffect(() => {
    if (isOpen) {
     setTimeout(() => searchInputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      didFetchOnOpenRef.current = false;
      return;
    }
    if (didFetchOnOpenRef.current) return;
    didFetchOnOpenRef.current = true;

    const controller = new AbortController();
    (async () => {
      setIsFetching(true);
      setFetchError(null);
      try {
        const data = await apiRef.current.get<ExerciseDetails[]>("/api/exercises", { signal: controller.signal });
        setAllExercises(Array.isArray(data) ? data : []);
      } catch (err: unknown) {
        const status =
          typeof err === "object" && err !== null
            ? ((err as { status?: number; response?: { status?: number } }).status ||
              (err as { response?: { status?: number } }).response?.status)
            : undefined;
        setFetchError(status === 401 || status === 403 ? "Non autenticato. Accedi per cercare esercizi." : "Errore nel caricamento degli esercizi. Riprova.");
        setAllExercises([]);
      } finally {
        setIsFetching(false);
      }
    })();

    return () => controller.abort();
  }, [isOpen]);

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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!showExerciseDropdown) return;
      const target = e.target as HTMLElement;
      if (!target.closest(".search-container")) setShowExerciseDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showExerciseDropdown]);

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    await onAddExercise({
      exerciseId: data.exerciseId,
      serie: data.serie,
      repetitions: data.repetitions,
      weight: data.weight,
      notes: data.notes,
    });
    reset({ exerciseId: "", serie: 3, repetitions: 10, weight: undefined, notes: "" });
    setSearchQuery("");
  };

  const selectExercise = (exercise: ExerciseDetails) => {
    setValue("exerciseId", exercise._id, { shouldValidate: true, shouldDirty: true });
    setSearchQuery(exercise.name);
    setShowExerciseDropdown(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded shadow-lg p-4 md:p-6 max-w-md w-full">
        <h3 className="text-lg font-bold mb-4">Aggiungi esercizio</h3>
        
        {/* Show loading state if fetching exercises */}
        {isFetching && (
          <div className="min-h-[32px] flex items-center gap-2 text-gray-600 mb-2">
            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-500"></span>
            <span className="text-sm">Caricamento esercizi...</span>
          </div>
        )}
        {fetchError && <div className="text-sm text-red-600 mb-2">{fetchError}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <input type="hidden" {...register("exerciseId")} />
          {errors.exerciseId && <p className="text-xs text-red-600">{errors.exerciseId.message}</p>}

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
                setValue("exerciseId", "", { shouldValidate: true, shouldDirty: true });
              }}
              onFocus={() => setShowExerciseDropdown(true)}
              required
              disabled={!!fetchError}
            />
            {/* Show dropdown only if there are exercises to display */}
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
              type="number"
              inputMode="numeric"
              className="w-full p-2 border rounded bg-gray-100 appearance-none"
              placeholder="Serie"
              {...register("serie", { valueAsNumber: true })}
            />
            {errors.serie && <p className="text-xs text-red-600">{errors.serie.message}</p>}
          </div>

          <div>
            <span className="font-semibold text-sm">Ripetizioni:</span>
            <input
              type="number"
              inputMode="numeric"
              className="w-full p-2 border rounded bg-gray-100 appearance-none"
              placeholder="Ripetizioni"
              {...register("repetitions", { valueAsNumber: true })}
            />
            {errors.repetitions && <p className="text-xs text-red-600">{errors.repetitions.message}</p>}
          </div>

          <div>
            <span className="font-semibold text-sm">Peso (kg):</span>
            <input
              type="number"
              inputMode="decimal"
              className="w-full p-2 border rounded bg-gray-100 appearance-none"
              placeholder="Peso (kg)"
              {...register("weight", {
                setValueAs: (v) => (v === "" || v === null ? undefined : Number(v)),
              })}
            />
            {errors.weight && <p className="text-xs text-red-600">{errors.weight.message}</p>}
          </div>

          <div>
            <span className="font-semibold text-sm">Note:</span>
            <input
              type="text"
              className="w-full p-2 border rounded bg-gray-100"
              placeholder="Note"
              {...register("notes")}
            />
            {errors.notes && <p className="text-xs text-red-600">{errors.notes.message}</p>}
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="px-3 py-1.5 bg-gray-400 rounded hover:bg-gray-500 text-sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 bg-amber-500 text-zinc-900 rounded hover:bg-amber-600 text-sm"
              disabled={!isValid || !!fetchError || isSubmitting}
            >
              Aggiungi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}