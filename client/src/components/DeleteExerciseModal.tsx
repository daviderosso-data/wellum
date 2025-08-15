// Modal to delete an exercise
// This component allows users to confirm the deletion of an exercise by entering a security code.
// If the code matches a predefined value, the exercise is deleted from the server.
// It provides feedback on success or failure of the deletion operation and can trigger a callback
// function to refresh the exercise list or redirect the user after deletion.
// The component uses React hooks for state management and side effects, and fetches data from an API endpoint.

import { useState } from 'react';
import { useApi } from '../lib/utils'; 
import { useUser } from '@clerk/clerk-react'; 

const DELETE_CODE = import.meta.env.VITE_DELETE_CODE;

type DeleteExerciseModalProps = {
  exerciseId: string;
  onClose: () => void;
  onDeleted?: () => void;
};

const DeleteExerciseModal = ({ exerciseId, onClose, onDeleted }: DeleteExerciseModalProps) => {
  const [deleteCode, setDeleteCode] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const api = useApi(); 
  const { isSignedIn } = useUser();

  const handleDelete = async () => {
    if (!isSignedIn) {
      setDeleteError("Devi essere autenticato per eliminare un esercizio");
      return;
    }
    
    if (deleteCode !== DELETE_CODE) {
      setDeleteError("Codice non valido!");
      return;
    }
    
    try {
      setIsLoading(true);
      await api.delete(`/api/exercises/${exerciseId}`);
      
      setDeleteError("");
      setDeleteSuccess(true);
      setTimeout(() => {
        if (onDeleted) {
          onDeleted();
        } else {
          window.location.reload(); 
        }
      }, 2000);
    } catch (error) {
      console.error("Errore durante l'eliminazione:", error);
      setDeleteError("Errore durante l'eliminazione. Verifica la tua autenticazione e riprova.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg p-6 max-w-sm w-full text-center">
        <p className="mb-4 text-lg">
          {deleteSuccess 
            ? "Esercizio eliminato con successo!" 
            : "Sei sicuro di voler eliminare questo esercizio?"}
        </p>
        
        {!deleteSuccess && (
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Inserisci il codice di sicurezza
            </label>
            <input
              type="password"
              value={deleteCode}
              onChange={(e) => setDeleteCode(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Codice di sicurezza"
            />
            {deleteError && (
              <p className="text-red-600 text-xs italic mt-1">{deleteError}</p>
            )}
          </div>
        )}
        
        {!deleteSuccess && (
          <div className="flex justify-center gap-4">
            <button
              className={`px-4 py-2 ${isLoading ? 'bg-gray-500' : 'bg-red-600 hover:bg-red-700'} text-white rounded`}
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? 'Eliminazione...' : 'Sì, elimina'}
            </button>
            <button
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Annulla
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeleteExerciseModal;