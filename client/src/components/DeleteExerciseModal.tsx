import { useState } from 'react';

const API_URL = import.meta.env.VITE_URL_SERVER;
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

  const handleDelete = async () => {
    if (deleteCode !== DELETE_CODE) {
      setDeleteError("Codice non valido!");
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/api/exercises/${exerciseId}`, { 
        method: "DELETE" 
      });
      
      if (response.ok) {
        setDeleteError("");
        setDeleteSuccess(true);
        setTimeout(() => {
          if (onDeleted) {
            onDeleted();
          } else {
            window.location.reload(); 
          }
        }, 2000);
      } else {
        setDeleteError("Errore durante l'eliminazione. Riprova.");
      }
    } catch {
      setDeleteError("Errore di rete. Riprova.");
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
            ? " Esercizio eliminato con successo!" 
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
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              onClick={handleDelete}
            >
              Sì, elimina
            </button>
            <button
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              onClick={handleCancel}
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