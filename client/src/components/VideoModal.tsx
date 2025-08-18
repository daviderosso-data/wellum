// VideoModal
// This component displays a modal with a video player for exercise videos.
// It allows users to watch videos in a larger view, enhancing the user experience.
// The modal includes a close button and uses an iframe to embed YouTube videos.
// It is styled with Tailwind CSS for a modern look and is responsive to different screen sizes




import React, {useState} from 'react';
type VideoModalProps = {
  videoUrl: string;
  onClose: () => void;
};

const VideoModal: React.FC<VideoModalProps> = ({ videoUrl, onClose }) => {
  const [loading, setLoading] = useState(true);

  const extractYouTubeId = (url: string) => {
    const match = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})/
    );
    return match ? match[1] : "";
  };

  const embedId = extractYouTubeId(videoUrl);

  return (
    <div
      className="fixed inset-0 bg-[rgba(0,0,0,0.8)] flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-label="Riproduzione video esercizio"
    >
      <div className="bg-white rounded shadow-lg p-4 relative max-w-2xl w-full">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-700 hover:text-red-600 text-2xl font-bold"
          aria-label="Chiudi"
        >
          &times;
        </button>

        <div className="relative aspect-w-16 aspect-h-9 w-full">
          {/* Overlay spinner */}
          {loading && (
            <div
              className="absolute inset-0 flex items-center justify-center bg-black/5"
              aria-live="polite"
              aria-busy="true"
            >
              <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
            </div>
          )}

          <iframe
            src={`https://www.youtube.com/embed/${embedId}`}
            title="Video esercizio"
            allow="autoplay; encrypted-media"
            allowFullScreen
            className={`w-full h-64 md:h-96 transition-opacity ${loading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={() => setLoading(false)}
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;