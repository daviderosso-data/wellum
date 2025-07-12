import { useState } from "react"
import { useNavigate } from "react-router-dom";


type Exercise = {
    _id: string
  name: string
  description: string
  imageUrl: string
  videoUrl?: string
  group: string 
}

type Props = {
  exercises: Exercise[]
}

const ExerciseList = ({ exercises }: Props) => {

  const [openVideo, setOpenVideo] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const navigate = useNavigate();

  function extractYouTubeId(url: string) {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})/
  ); // This regex matches YouTube URLs and captures the video ID

  // The video ID is the first capturing group
  // If the match is successful, return the video ID; otherwise, return an empty string
  return match ? match[1] : "";
}
  return (
    <>
    <ul className="space-y-4 max-w-2xl ">
      {exercises.map((ex) => (
        <li 
          key={ex._id}
          className="relative flex bg-white rounded shadow p-4"
        >
          <button
     onClick={() => setDeleteId(ex._id)}
  className="absolute top-2 right-2 text-red-600 hover:text-red-800 text-xl font-bold"
  title="Elimina esercizio"
  >
    &times;
  </button>
          {ex.imageUrl && (
            <img
              src={ex.imageUrl}
              alt={ex.name}
              className="w-64 h-40 object-cover rounded mr-4"
            />
          )}
          <div className="flex-1 relative">
            <h2 className="text-xl font-bold">{ex.name}</h2>
            <p className="text-lg text-gray-600 mb-2">{ex.description}</p>
            <div className="absolute bottom-1 justify-between">
             <button
    onClick={() => console.log(`Aggiungi ${ex.name} alla scheda`)}
    className="px-3 py-1 bg-indigo-600 m-1 text-white rounded hover:bg-indigo-700 transition font-semibold"
  >
    Aggiungi alla scheda
  </button>
            {ex.videoUrl && (
              <button
      onClick={() => setOpenVideo(ex.videoUrl!)}
      className="px-3 py-1 m-1 bg-red-600 text-white rounded hover:bg-red-700 transition font-semibold"
      title="Guarda video"
    >
      Play video
    </button>
  )}
          
</div>
 
          </div>
        </li>
      ))}
    </ul>
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
  </div>)}
  {deleteId && (
  <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
    <div className="bg-white rounded shadow-lg p-6 max-w-sm w-full text-center">
      <p className="mb-4 text-lg">Sei sicuro di voler eliminare questo esercizio?</p>
      <div className="flex justify-center gap-4">
        <button
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          onClick={async () => {
            await fetch(`http://localhost:3000/api/exercises/${deleteId}`, { method: "DELETE" });
            setDeleteId(null);
            // Aggiorna la lista esercizi dopo l'eliminazione
            // Puoi anche chiamare una funzione prop o ricaricare i dati qui
  navigate("/exercises");
          }}
        >
          Sì, elimina
        </button>
        <button
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          onClick={() => setDeleteId(null)}
        >
          Annulla
        </button>
      </div>
    </div>
  </div>
)}
  </>
)}

export default ExerciseList