import { useState } from "react"

const API_URL = import.meta.env.VITE_URL_SERVER 
const DELETE_CODE = import.meta.env.VITE_DELETE_CODE 

type Exercise = {
    _id: string
    name: string
    description: string
    imageUrl: string
    videoUrl?: string
    group: string 
}
const groupColors: Record<string, string> = {
  "Petto": "bg-red-500",
  "Schiena": "bg-blue-500",
  "Gambe": "bg-green-500",
  "Spalle": "bg-yellow-500",
  "Braccia": "bg-purple-500",
  "polpacci": "bg-orange-500",
  "default": "bg-gray-500"
};
type Props = {
  exercises: Exercise[]
}

const ExerciseList = ({ exercises }: Props) => {
  const [openVideo, setOpenVideo] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteCode, setDeleteCode] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteSuccess, setDeleteSuccess] = useState(false); // Nuovo stato per il successo

  function extractYouTubeId(url: string) {
    const match = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})/
    );
    return match ? match[1] : "";
  }
  
  return (
    <>
      {/* Layout a griglia responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto px-4">
        {exercises.map((ex) => (
          <div 
            key={ex._id}
            className="bg-white rounded shadow bg-zinc-200 overflow-hidden flex flex-col h-full"
          >
            <div className="relative">
              {ex.imageUrl && (
                <img
                  src={ex.imageUrl}
                  alt={ex.name}
                  className="w-full h-48 object-cover"
                />
              )}
              
              <button
                onClick={() => setDeleteId(ex._id)}
                className="absolute top-2 right-2 bg-white bg-opacity-70 text-red-600 hover:text-red-800 p-1 rounded-full"
                title="Elimina esercizio"
              >
                &times;
              </button>
            </div>
            
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold">{ex.name}</h2>
                <div className={`${groupColors[ex.group] || groupColors.default} text-white text-xs font-bold px-2 py-1 rounded-md shadow ml-2`}>
                  {ex.group}
                </div>
              </div>
              <p className="text-gray-600 mb-4 flex-1">{ex.description}</p> 
              
              <div className="mt-auto">
                {ex.videoUrl && (
                  <button
                    onClick={() => setOpenVideo(ex.videoUrl!)}
                    className="px-3 py-1 bg-amber-500 text-zinc-900 rounded hover:bg-amber-600 transition font-semibold"
                  >
                    Play video
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Modale video */}
      {openVideo && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.8)] flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-4 relative max-w-2xl w-full">
            <button
              onClick={() => setOpenVideo(null)}
              className="absolute top-2 right-2 text-gray-700 hover:text-red-600 text-2xl font-bold"
            >
              &times;
            </button>
            <div className="aspect-w-16 aspect-h-9 w-full">
              <iframe
                src={`https://www.youtube.com/embed/${extractYouTubeId(openVideo)}`}
                title="Video esercizio"
                allow="autoplay; encrypted-media"
                allowFullScreen
                className="w-full h-64 md:h-96"
              ></iframe>
            </div>
          </div>
        </div>
      )}
      
      {/* Modale eliminazione con codice di sicurezza */}
      {deleteId && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 max-w-sm w-full text-center">
            <p className="mb-4 text-lg">
              {deleteSuccess 
                ? "✅ Esercizio eliminato con successo!" 
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
                  onClick={async () => {
                    if (deleteCode !== DELETE_CODE) {
                      setDeleteError("Codice non valido!");
                      return;
                    }
                    
                    try {
                      const response = await fetch(`${API_URL}/api/exercises/${deleteId}`, { 
                        method: "DELETE" 
                      });
                      
                      if (response.ok) {
                        // Mostra messaggio di successo
                        setDeleteError("");
                        setDeleteSuccess(true);
                        
                        // Dopo 2 secondi, chiudi la modale e ricarica la pagina
                        setTimeout(() => {
                          setDeleteId(null);
                          setDeleteCode("");
                          setDeleteSuccess(false);
                          window.location.reload(); // Usa reload invece di navigate per un refresh completo
                        }, 2000);
                      } else {
                        setDeleteError("Errore durante l'eliminazione. Riprova.");
                      }
                    } catch {
                      setDeleteError("Errore di rete. Riprova.");
                    }
                  }}
                >
                  Sì, elimina
                </button>
                <button
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  onClick={() => {
                    setDeleteId(null);
                    setDeleteCode("");
                    setDeleteError("");
                  }}
                >
                  Annulla
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default ExerciseList