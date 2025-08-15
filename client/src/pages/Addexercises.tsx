// AddExercise
// This page allows users to add new exercises to the application.
// It includes a form for entering exercise details such as name, description, muscle group, video URL, and image upload.
// The form submission is protected by a security code to prevent unauthorized uploads.
// The page uses React hooks for state management and includes modals for confirming the upload and displaying results.
// The form is styled with Tailwind CSS for a modern and responsive design.

import { useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import { Link } from "react-router-dom";
import ResultModal from "../components/ResultModal";
import SecurityModal from "../components/SecurityModal";
import { useApi } from "../lib/utils"; // wrapper API

const UPLOAD_CODE = import.meta.env.VITE_DELETE_CODE;

export default function AddExercise() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [group, setMuscleGroup] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const [showResultModal, setShowResultModal] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState("");

  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [securityCode, setSecurityCode] = useState("");
  const [securityError, setSecurityError] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [imageError, setImageError] = useState(false);
  const [borderColor, setBorderColor] = useState("");

  const api = useApi();

  const resetForm = () => {
    setName("");
    setDescription("");
    setMuscleGroup("");
    setVideoUrl("");
    setImage(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setShowResultModal(false);
  };

  const validateFormAndShowSecurityModal = (e: React.FormEvent) => {
    e.preventDefault();

    if (!image) {
      setImageError(true);
      setBorderColor("border-red-600 border-2");
      return;
    }
    setImageError(false);

    setSecurityCode("");
    setSecurityError("");
    setShowSecurityModal(true);
  };

  const handleSecurityConfirm = async () => {
    if (securityCode !== UPLOAD_CODE) {
      setSecurityError("Password scorretta. Riprova.");
      return;
    }

    setShowSecurityModal(false);
    setIsLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("image", image as File);
    formData.append("group", group);
    formData.append("videoUrl", videoUrl);

    try {
      const token = await api.getToken();
      const baseUrl = api.getBaseUrl();

      const res = await fetch(`${baseUrl}/api/exercises/upload`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        credentials: "include",
        mode: "cors",
        body: formData,
      });

      if (!res.ok) {
        // prova a leggere un messaggio di errore utile
        let errMsg = `Errore ${res.status}`;
        try {
          const data = await res.json();
          if (data?.error) errMsg = data.error;
        } catch {
          const txt = await res.text().catch(() => "");
          if (txt) errMsg = txt;
        }
        throw new Error(errMsg);
      }

      setIsSuccess(true);
      setMessage("Esercizio caricato con successo!");
    } catch (error: unknown) {
      console.error("Errore caricamento:", error);
      setIsSuccess(false);
      if (error instanceof Error) {
        setMessage(error.message || "Errore nel caricamento. Riprova.");
      } else {
        setMessage("Errore nel caricamento. Riprova.");
      }
    } finally {
      setIsLoading(false);
      setShowResultModal(true);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);
    if (file) {
      setImageError(false);
      setBorderColor("");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-600">
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
        <h1 className="text-xl font-bold text-amber-500 ml-3">Aggiungi Esercizi</h1>
      </div>

      <div className="m-5 p-6 bg-zinc-200 rounded shadow mt-60 p-4 md:ml-70 md:p-6 md:ml-64">
        <h2 className="text-2xl font-bold mb-4">Aggiungi Esercizio</h2>
        <form onSubmit={validateFormAndShowSecurityModal} encType="multipart/form-data">
          <input
            type="text"
            placeholder="Nome esercizio*"
            className="w-full mb-3 p-2 border rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <textarea
            placeholder="Descrizione*"
            className="w-full mb-3 p-2 border rounded"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <select
            className={`w-full mb-3 p-2 border rounded`}
            value={group}
            onChange={(e) => setMuscleGroup(e.target.value)}
            required
          >
            <option value="">Seleziona gruppo muscolare *</option>
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
            onChange={(e) => setVideoUrl(e.target.value)}
          />
          <div className="mb-3">
            <input
              type="file"
              accept="image/*"
              id="file-upload"
              className="hidden"
              onChange={handleImageChange}
              ref={fileInputRef}
            />
            <label
              htmlFor="file-upload"
              className={`${borderColor} bg-amber-500 text-zinc-900 px-4 py-2 rounded cursor-pointer hover:bg-amber-600 transition shadow-md inline-block`}
            >
              {image ? "Cambia immagine" : "Seleziona immagine*"}
            </label>
            {image && <span className="ml-2 text-zinc-700">{image.name}</span>}
            {imageError && <span className="ml-2 text-red-600 text-xl font-bold">*</span>}
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className={`${isLoading ? "bg-gray-500" : "bg-green-600 hover:bg-green-700"} text-white px-4 py-2 rounded shadow-md transition cursor-pointer`}
              disabled={isLoading}
            >
              {isLoading ? "Caricamento..." : "Carica esercizio"}
            </button>
          </div>
        </form>
      </div>

      <SecurityModal
        isOpen={showSecurityModal}
        onConfirm={handleSecurityConfirm}
        onCancel={() => setShowSecurityModal(false)}
        securityCode={securityCode}
        setSecurityCode={setSecurityCode}
        error={securityError}
        title="Sei sicuro di voler caricare questo esercizio?"
      />

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