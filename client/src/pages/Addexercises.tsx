// AddExercise
// This page allows users to add new exercises to the application.
// It includes a form for entering exercise details such as name, description, muscle group, video URL, and image upload.
// The form submission is protected by a security code to prevent unauthorized uploads.
// The page uses React hooks for state management and includes modals for confirming the upload and displaying results.
// The form is styled with Tailwind CSS for a modern and responsive design.
import { useRef, useState, type ChangeEvent } from "react";
import Sidebar from "../components/Sidebar";
import { Link } from "react-router-dom";
import ResultModal from "../components/ResultModal";
import SecurityModal from "../components/SecurityModal";
import { useApi } from "../lib/utils";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const UPLOAD_CODE = String(import.meta.env.VITE_DELETE_CODE ?? "");

const formSchema = z.object({
  name: z.string().min(1, "Nome richiesto"),
  description: z.string().min(1, "Descrizione richiesta"),
  group: z.string().min(1, "Seleziona gruppo muscolare"),
  videoUrl: z.union([z.literal(""), z.string().url("URL non valido")]).optional(),
});
type FormInputs = z.infer<typeof formSchema>;

export default function AddExercise() {
  const api = useApi();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInputs>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", description: "", group: "", videoUrl: "" },
    mode: "onChange",
  });

  const [image, setImage] = useState<File | null>(null);
  const [imageError, setImageError] = useState(false);
  const [borderColor, setBorderColor] = useState("");

  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [securityCode, setSecurityCode] = useState("");
  const [securityError, setSecurityError] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const [showResultModal, setShowResultModal] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [pendingData, setPendingData] = useState<FormInputs | null>(null);

  const onSubmit: SubmitHandler<FormInputs> = (data) => {
    if (!image) {
      setImageError(true);
      setBorderColor("border-red-600 border-2");
      return;
    }
    setImageError(false);
    setSecurityCode("");
    setSecurityError("");
    setPendingData(data);
    setShowSecurityModal(true);
  };

  const handleSecurityConfirm = async () => {
    if (securityCode !== UPLOAD_CODE) {
      setSecurityError("Password scorretta. Riprova.");
      return;
    }
    if (!pendingData || !image) return;

    setShowSecurityModal(false);
    setIsLoading(true);

    const formData = new FormData();
    formData.append("name", pendingData.name);
    formData.append("description", pendingData.description);
    formData.append("group", pendingData.group);
    if (pendingData.videoUrl) formData.append("videoUrl", pendingData.videoUrl);
    formData.append("image", image as File);

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
      resetForm();
    } catch (error: unknown) {
      setIsSuccess(false);
      setMessage(error instanceof Error ? error.message || "Errore nel caricamento. Riprova." : "Errore nel caricamento. Riprova.");
    } finally {
      setIsLoading(false);
      setShowResultModal(true);
    }
  };

  const resetForm = () => {
    reset({ name: "", description: "", group: "", videoUrl: "" });
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setPendingData(null);
    setBorderColor("");
    setImageError(false);
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
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

      <div className="mt-60 md:ml-64 px-5">
        <div className="relative w-full max-w-3xl mx-auto p-6 bg-zinc-200 rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Aggiungi Esercizio</h2>
        <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
          <input
            type="text"
            placeholder="Nome esercizio*"
            className="w-full mb-1 p-2 border rounded"
            {...register("name")}
          />
          {errors.name && <p className="text-xs text-red-600 mb-2">{errors.name.message}</p>}

          <textarea
            placeholder="Descrizione*"
            className="w-full mb-1 p-2 border rounded"
            {...register("description")}
          />
          {errors.description && <p className="text-xs text-red-600 mb-2">{errors.description.message}</p>}

          <select className="w-full mb-1 p-2 border rounded" {...register("group")}>
            <option value="">Seleziona gruppo muscolare *</option>
            <option value="Braccia">Braccia</option>
            <option value="Gambe">Gambe</option>
            <option value="Petto">Petto</option>
            <option value="Spalle">Spalle</option>
            <option value="Schiena">Schiena</option>
            <option value="Polpacci">Polpacci</option>
            <option value="Addominali">Addominali</option>
          </select>
          {errors.group && <p className="text-xs text-red-600 mb-2">{errors.group.message}</p>}

          <input
            type="url"
            placeholder="Video URL Youtube Orizzontale (opzionale)"
            className="w-full mb-1 p-2 border rounded"
            {...register("videoUrl")}
          />
          {errors.videoUrl && <p className="text-xs text-red-600 mb-2">{errors.videoUrl.message}</p>}

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
              className={`${isLoading || isSubmitting ? "bg-gray-500" : "bg-green-600 hover:bg-green-700"} text-white px-4 py-2 rounded shadow-md transition cursor-pointer`}
              disabled={isLoading || isSubmitting}
            >
              {isLoading || isSubmitting ? "Caricamento..." : "Carica esercizio"}
            </button>
          </div>
        </form>
      </div>
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

      {isLoading && (
        <div className="fixed inset-0 z-50">
          <div className="min-h-screen flex items-center justify-center bg-zinc-600 p-4">
            <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></span>
          </div>
        </div>
      )}
    </div>
  );
}