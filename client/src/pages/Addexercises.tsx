import { useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import { Link } from "react-router-dom";
const API_URL = import.meta.env.VITE_URL_SERVER 
const UPLOAD_CODE = import.meta.env.VITE_DELETE_CODE

interface ResultModalProps {
  isOpen: boolean;
  isSuccess: boolean;
  message: string;
  onClose: () => void;
  onReset: () => void;
}

function ResultModal({ isOpen, isSuccess, message, onClose, onReset }: ResultModalProps) {
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
          {isSuccess ? (
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
}

// Nuova modale per la verifica del codice di sicurezza
interface SecurityModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  securityCode: string;
  setSecurityCode: (code: string) => void;
  error: string;
}

function SecurityModal({ isOpen, onConfirm, onCancel, securityCode, setSecurityCode, error }: SecurityModalProps) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg p-6 max-w-sm w-full text-center">
        <p className="mb-4 text-lg">Sei sicuro di voler caricare questo esercizio?</p>
        
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
            Conferma caricamento
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
}

export default function AddExercise() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [group, setMuscleGroup] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  
  // Stati per la modale di risultato
  const [showResultModal, setShowResultModal] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState("");
  
  // Stati per la modale di sicurezza
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [securityCode, setSecurityCode] = useState("");
  const [securityError, setSecurityError] = useState("");
  
  // Riferimento all'input file per poterlo resettare
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const resetForm = () => {
    setName("");
    setDescription("");
    setMuscleGroup("");
    setVideoUrl("");
    setImage(null);
    
    // Reset input file
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    
    setShowResultModal(false);
  };

  const validateFormAndShowSecurityModal = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verifica che l'immagine sia stata selezionata
    if (!image) {
      setIsSuccess(false);
      setMessage("Seleziona un'immagine.");
      setShowResultModal(true);
      return;
    }
    
    // Mostra la modale di sicurezza
    setSecurityCode("");
    setSecurityError("");
    setShowSecurityModal(true);
  };

  const handleSecurityConfirm = async () => {
    // Verifica il codice di sicurezza
    if (securityCode !== UPLOAD_CODE) {
      setSecurityError("Password scorretta. Riprova.");
      return;
    }
    
    // Se il codice è corretto, procedi con il caricamento
    setShowSecurityModal(false);
    
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("image", image as File);
    formData.append("group", group);
    formData.append("videoUrl", videoUrl);

    try {
      const res = await fetch(`${API_URL}/api/exercises/upload`, {
        method: "POST",
        body: formData,
      });
      
      if (res.ok) {
        setIsSuccess(true);
        setMessage("Esercizio caricato con successo!");
      } else {
        setIsSuccess(false);
        setMessage("Errore nel caricamento. Riprova.");
      }
    } catch {
      setIsSuccess(false);
      setMessage("Errore di rete. Verifica la connessione.");
    }
    
    setShowResultModal(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-600">   
      {/* Sidebar desktop */}
      <div className="fixed top-0 left-0 h-screen w-64 z-10 hidden md:block">
        <Sidebar />
      </div>
      
      {/* Header mobile con hamburger menu */}
      <div className="fixed top-0 left-0 right-0 bg-zinc-800 p-3 flex items-center z-20 md:hidden">
          <Sidebar />

          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        
        <Link to="/" className="flex items-center">
          <img src="/assets/pictures/logoAmberTransp.png" className="ml-6 h-8" alt="Wellum logo" />
        </Link>
        <h1 className="text-xl font-bold text-amber-500 ml-3">Aggiungi Esercizi</h1>
      </div>
      
      <div className="m-5 p-6 bg-zinc-200 rounded shadow mt-60 p-4 md:ml-70 md:p-6 md:ml-64">
        <h2 className="text-2xl font-bold mb-4">Aggiungi Esercizio</h2>
        <form onSubmit={validateFormAndShowSecurityModal} encType="multipart/form-data">
          <input
            type="text"
            placeholder="Nome esercizio"
            className="w-full mb-3 p-2 border rounded"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <textarea
            placeholder="Descrizione"
            className="w-full mb-3 p-2 border rounded"
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
          />
          <select
            className="w-full mb-3 p-2 border rounded"
            value={group}
            onChange={e => setMuscleGroup(e.target.value)}
            required
          >
            <option value="">Seleziona gruppo muscolare</option>
            <option value="Braccia">Braccia</option>
            <option value="Gambe">Gambe</option>
            <option value="Petto">Petto</option>
            <option value="Spalle">Spalle</option>
            <option value="Schiena">Schiena</option>
            <option value="Polpacci">Polpacci</option>
            <option value="Addominali">Addominali</option>
          </select>
          <input
            type="url"
            placeholder="Video URL Youtube Orizzontale (opzionale)"
            className="w-full mb-3 p-2 border rounded"
            value={videoUrl}
            onChange={e => setVideoUrl(e.target.value)}
          />
          <div className="mb-3">
            <input
              type="file"
              accept="image/*"
              id="file-upload"
              className="hidden" // Nascondi l'input originale
              onChange={e => setImage(e.target.files?.[0] || null)}
              required
              ref={fileInputRef}
            />
            <label 
              htmlFor="file-upload" 
              className="bg-amber-500 text-zinc-900 px-4 py-2 rounded cursor-pointer hover:bg-amber-600 transition shadow-md inline-block"
            >
              {image ? 'Cambia immagine' : 'Seleziona immagine'} {/* Testo personalizzato */}
            </label>
            {image && <span className="ml-2 text-zinc-700">{image.name}</span>}
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 shadow-md transition cursor-pointer"
            >
              Carica esercizio
            </button>
          </div>
        </form>
      </div>
      
      {/* Modale di sicurezza */}
      <SecurityModal 
        isOpen={showSecurityModal}
        onConfirm={handleSecurityConfirm}
        onCancel={() => setShowSecurityModal(false)}
        securityCode={securityCode}
        setSecurityCode={setSecurityCode}
        error={securityError}
      />
      
      {/* Modale per il risultato */}
      <ResultModal 
        isOpen={showResultModal}
        isSuccess={isSuccess}
        message={message}
        onClose={() => setShowResultModal(false)}
        onReset={resetForm}
      />
    </div>
  );
}