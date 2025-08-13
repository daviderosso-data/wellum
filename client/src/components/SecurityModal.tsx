// SecurityModal
// This component displays a modal for confirming actions that require security verification.(termporary solution)
// It prompts the user to enter a security code before proceeding with the action.
// The modal includes a title, an input field for the security code, and buttons for confirming or canceling the action.
// It uses React hooks for state management and is styled with Tailwind CSS for a modern look.


import React from "react";

interface SecurityModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  securityCode: string;
  setSecurityCode: (code: string) => void;
  error: string;
  title?: string;
}

const SecurityModal: React.FC<SecurityModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  securityCode,
  setSecurityCode,
  error,
  title = "Sei sicuro di voler procedere?"
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg p-6 max-w-sm w-full text-center">
        <p className="mb-4 text-lg">{title}</p>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Inserisci il codice di sicurezza
          </label>
          <input
            type="password"
            value={securityCode}
            onChange={(e) => setSecurityCode(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Codice di sicurezza"
          />
          {error && (
            <p className="text-red-600 text-xs italic mt-1">{error}</p>
          )}
        </div>
        
        <div className="flex justify-center gap-4">
          <button
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            onClick={onConfirm}
          >
            Conferma
          </button>
          <button
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            onClick={onCancel}
          >
            Annulla
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecurityModal;