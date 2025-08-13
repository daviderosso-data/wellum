// VideoModal
// This component displays a modal with a video player for exercise videos.
// It allows users to watch videos in a larger view, enhancing the user experience.
// The modal includes a close button and uses an iframe to embed YouTube videos.
// It is styled with Tailwind CSS for a modern look and is responsive to different screen sizes




import React from 'react';

type VideoModalProps = {
  videoUrl: string;
  onClose: () => void;
};

const VideoModal: React.FC<VideoModalProps> = ({ videoUrl, onClose }) => {
  const extractYouTubeId = (url: string) => {
    const match = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})/
    );
    return match ? match[1] : "";
  };

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.8)] flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg p-4 relative max-w-2xl w-full">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-700 hover:text-red-600 text-2xl font-bold"
        >
          &times;
        </button>
        <div className="aspect-w-16 aspect-h-9 w-full">
          <iframe
            src={`https://www.youtube.com/embed/${extractYouTubeId(videoUrl)}`}
            title="Video esercizio"
            allow="autoplay; encrypted-media"
            allowFullScreen
            className="w-full h-64 md:h-96"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;