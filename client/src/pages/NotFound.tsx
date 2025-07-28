export default function NotFound() {
  return (
    <div className=" flex flex-col items-center justify-center w-screen h-screen bg-zinc-800 ">
      <h1 className="p-10 text-5xl text-center font-bold text-white mb-4">Non abbiamo trovato la pagina</h1>
      <img src="/assets/pictures/404.png" alt="Pagina non trovata" className="h-70 h-70 mb-6" />
      <p className="text-xl p-10 text-center text-white"> Non mollare, e vai ad allenarti! </p>
      <a
        href="/"
        className=" text-center drop-shadow-xl bg-amber-500 text-zinc-900 px-8 py-3 text-2xl rounded-full font-semibold hover:bg-amber-700 hover:scale-110 hover:-translate-y-1 transition mt-10">
        Torna alla Home
      </a>
    </div>
  );
}