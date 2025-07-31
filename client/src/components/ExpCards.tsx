// Exercise cards component
// This component displays a list of exercises in card format, allowing users to view details, play videos from youtube link, and delete exercises.
// It uses a modal for video playback and another modal for confirming exercise deletion.
// The component is responsive and adapts to different screen sizes, providing a user-friendly interface for managing exercises.


import { useState } from "react"
import VideoModal from "./VideoModal"
import DeleteExerciseModal from "./DeleteExerciseModal"


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

 
  
  return (
    <>
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
      
      {openVideo && <VideoModal videoUrl={openVideo} onClose={() => setOpenVideo(null)} />}
      
      
      
      {deleteId && (
        <DeleteExerciseModal
          exerciseId={deleteId}
          onClose={() => setDeleteId(null)}
          onDeleted={() => {
          setDeleteId(null);
            window.location.reload();
          }}
        />
      )}
    </>
  )
}

export default ExerciseList