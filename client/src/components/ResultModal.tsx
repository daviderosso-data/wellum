// ResultModal
// This component displays a modal with the result of an operation, such as adding or deleting an exercise.
// It shows a success or error message based on the operation's outcome.
// The modal includes a close button and can optionally reset the form or redirect the user after the operation.
// It uses React hooks for state management and is styled with Tailwind CSS for a modern look



import React from "react";

interface ResultModalProps {
  isOpen: boolean;
  isSuccess: boolean;
  message: string;
  onClose: () => void;
  onReset?: () => void;
}

const ResultModal: React.FC<ResultModalProps> = ({ 
  isOpen, 
  isSuccess, 
  message, 
  onClose, 
  onReset 
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-zinc-800 rounded-lg p-6 max-w-md w-full">
        <div className={`text-center mb-4 ${isSuccess ? "text-green-600" : "text-red-600"}`}>
          {isSuccess ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>
        
        <h3 className="text-xl font-bold text-center text-white mb-2">
          {isSuccess ? "Operazione completata" : "Si è verificato un errore"}
        </h3>
        
        <p className="text-center text-white mb-6">{message}</p>
        
        <div className="flex justify-center">
          {isSuccess && onReset ? (
            <button 
              onClick={onReset} 
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Carica un altro esercizio
            </button>
          ) : (
            <button 
              onClick={onClose} 
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Chiudi
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultModal;