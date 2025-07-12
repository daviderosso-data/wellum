import { useState } from "react";
import Sidebar from "../components/Sidebar";
const API_URL = import.meta.env.VITE_URL_SERVER 


export default function AddExercise() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [group, setMuscleGroup] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) {
      setMessage("Seleziona un'immagine.");
      return;
    }
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("image", image);
    formData.append("group", group);
    formData.append("videoUrl", videoUrl);
    
console.log("Form data:", {
      name,
      description,
      group,
      videoUrl,
      image: image.name,
    });

    try {
      const res = await fetch(`${API_URL}/api/exercises/upload`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setMessage("Esercizio caricato con successo!");
        setName("");
        setDescription("");
        setMuscleGroup("");
        setVideoUrl("");
        setImage(null);
      } else {
        setMessage("Errore nel caricamento.");
      }
    } catch {
      setMessage("Errore di rete.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">   
        <div className="fixed top-0 left-0 h-screen w-64 z-10">
          <Sidebar />
        </div>
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Aggiungi Esercizio</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
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
</select>
<input
  type="url"
  placeholder="Video URL (opzionale)"
  className="w-full mb-3 p-2 border rounded"
  value={videoUrl}
  onChange={e => setVideoUrl(e.target.value)}
/>
        <input
          type="file"
          accept="image/*"
          className="mb-3"
          onChange={e => setImage(e.target.files?.[0] || null)}
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Carica esercizio
        </button>
      </form>
      {message && <p className="mt-4">{message}</p>}
    </div>
    </div>
  );
}