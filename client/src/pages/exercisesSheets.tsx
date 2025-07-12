import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import Sidebar from "../components/Sidebar";
import SheetCard from "../components/sheetCard";

type ExerciseItem = {
  exerciseId: string;
  serie: number;
  repetitions: number;
  weight?: number;
  notes?: string;
};

type Sheet = {
  _id: string;
  name: string;
  userID: string;
  exercises: ExerciseItem[];
  createdAt: string;
};

export default function ExercisesSheets() {
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newSheetName, setNewSheetName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createdSheet, setCreatedSheet] = useState<Sheet | null>(null);

  // Stato per la modale di eliminazione
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sheetToDelete, setSheetToDelete] = useState<Sheet | null>(null);

  const { user } = useUser();

  useEffect(() => {
    if (!user?.id) return;
    fetch(`http://localhost:3000/api/sheet/user/${user?.id}`)
      .then(res => res.json())
      .then(data => setSheets(data))
      .catch(() => setSheets([]))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const handleCreateSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSheetName.trim() || !user?.id) return;
    setCreating(true);
    try {
      const res = await fetch("http://localhost:3000/api/sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newSheetName,
          userID: user.id,
          exercises: [],
        }),
      });
      const data = await res.json();
      setCreatedSheet(data);
      setSheets(prev => [data, ...prev]);
      setShowModal(false);
      setNewSheetName("");
    } catch {
      // gestisci errore
    } finally {
      setCreating(false);
    }
  };

  // Funzione per aprire la modale di eliminazione
  const handleDeleteRequest = (sheet: Sheet) => {
    setSheetToDelete(sheet);
    setShowDeleteModal(true);
  };

  // Funzione per eliminare la scheda
  const handleDeleteSheet = async () => {
    if (!sheetToDelete) return;
    try {
      await fetch(`http://localhost:3000/api/sheet/${sheetToDelete._id}`, { method: "DELETE" });
      setSheets(prev => prev.filter(s => s._id !== sheetToDelete._id));
      setShowDeleteModal(false);
      setSheetToDelete(null);
    } catch {
      alert("Errore durante l'eliminazione della scheda.");
    }
  };

    return (
    <div className="flex min-h-screen bg-zinc-400 ">
      {/* Sidebar: visibile solo su desktop */}
      <div className="fixed top-0 left-0 h-screen w-64 z-10 ">
        <Sidebar />
      </div>
      <div className="flex-1 p-6 md:ml-64">
        <div className="flex justify-between items-center mb-6 mt-15">
          <h1 className="text-3xl text-zinc-950 font-bold">Le tue schede</h1>
          <button
            className="px-4 py-2 bg-amber-500 text-zinc-900 rounded hover:bg-zinc-400 cursor-pointer font-semibold"
            onClick={() => setShowModal(true)}
          >
            + Crea una nuova scheda
          </button>
        </div>
        {loading ? (
          <p>Caricamento...</p>
        ) : sheets.length === 0 ? (
          <p>Nessuna scheda trovata.</p>
        ) : (
          <div className="space-y-4">
            {sheets.map(sheet => (
              <SheetCard
                key={sheet._id}
                sheet={sheet}
                onDeleteRequest={() => handleDeleteRequest(sheet)}
              />
            ))}
          </div>
        )}
      </div>

      {/* MODALE CREAZIONE SCHEDA */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-zinc-400 rounded shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Crea una nuova scheda</h2>
            <form onSubmit={handleCreateSheet} className="space-y-4">
              <input
                type="text"
                className="w-full p-2 border rounded"
                placeholder="Nome scheda"
                value={newSheetName}
                onChange={e => setNewSheetName(e.target.value)}
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  onClick={() => setShowModal(false)}
                  disabled={creating}
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  disabled={creating}
                >
                  {creating ? "Creazione..." : "Crea"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE SCHEDA CREATA */}
      {createdSheet && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Scheda creata!</h2>
            <SheetCard sheet={createdSheet} />
            <div className="flex justify-end mt-4">
              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                onClick={() => setCreatedSheet(null)}
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE ELIMINAZIONE SCHEDA */}
      {showDeleteModal && sheetToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-red-600">Elimina scheda</h2>
            <p>Sei sicuro di voler eliminare la scheda <b>{sheetToDelete.name}</b>?</p>
            <div className="flex justify-end gap-2 mt-6">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => setShowDeleteModal(false)}
              >
                Annulla
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={handleDeleteSheet}
              >
                Elimina
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}