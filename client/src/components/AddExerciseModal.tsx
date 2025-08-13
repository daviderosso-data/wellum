// Modal to add an exercise to a workout sheet
// This component allows users to search and select exercises, specify sets, reps, weight, and notes,
// and submit the exercise to be added to a workout sheet.
// It includes a search feature to filter exercises by name or muscle group, and displays a dropdown
// with matching exercises. The form is reset after submission.
// The component uses React hooks for state management and side effects, and fetches exercise data from
// an API endpoint.

import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_URL_SERVER;

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
  const [allExercises, setAllExercises] = useState<ExerciseDetails[]>([]);
  const [selectedExercise, setSelectedExercise] = useState("");
  const [serie, setSerie] = useState<number>(3);
  const [repetitions, setRepetitions] = useState<number>(10);
  const [weight, setWeight] = useState<number>(0);
  const [notes, setNotes] = useState("");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredExercises, setFilteredExercises] = useState<ExerciseDetails[]>([]);
  const [showExerciseDropdown, setShowExerciseDropdown] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch(`${API_URL}/api/exercises`)
        .then(res => res.json())
        .then(data => setAllExercises(data))
        .catch(() => setAllExercises([]));
    }
  }, [isOpen]);
  
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
        <form onSubmit={handleSubmit} className="space-y-3">
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
              <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg max-h-48 overflow-auto">
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
                          className="w-8 h-8 object-cover rounded mr-2" 
                        />
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
            <span className="font-semibold text-sm">Ripetizioni:</span>
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
            <span className="font-semibold text-sm">Peso (kg):</span>
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
            <span className="font-semibold text-sm">Note:</span>
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
              className="px-3 py-1.5 bg-gray-400 rounded hover:bg-gray-500 text-sm"
              onClick={onClose}
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 bg-amber-500 text-zinc-900 rounded hover:bg-amber-600 text-sm"
              disabled={!selectedExercise}
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