// Loader
// This component is used to display a loading spinner while the application is fetching data or performing other asynchronous operations.
//// It uses Tailwind CSS for styling and is designed to be responsive.

export default function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-600 p-4">
      <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></span>
    </div>
  );
}