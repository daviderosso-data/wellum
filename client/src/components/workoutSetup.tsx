import { useEffect, useState } from 'react'


const API_URL = import.meta.env.VITE_URL_SERVER 

type Sheet = {
  _id: string
  name: string
}

type Props = {
  userId: string
  onStart: (sheetId: string, restTime: number) => void
  onBack?: () => void // aggiunta opzionale per callback "torna indietro"
}

const WorkoutSetup = ({ userId, onStart, onBack }: Props) => {
  const [sheets, setSheets] = useState<Sheet[]>([])
  const [selectedSheet, setSelectedSheet] = useState('')
  const [restTime, setRestTime] = useState(1)

  useEffect(() => {
    if (!userId) return
    fetch(`${API_URL}/api/sheet/user/${userId}`)
      .then((res) => res.json())
      .then((data) => setSheets(data))
  }, [userId])

  const handleStart = () => {
    if (selectedSheet && restTime > 0) {
      onStart(selectedSheet, restTime)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 px-4">
      <div className="bg-white p-6 rounded shadow max-w-lg w-full space-y-6 text-center">
        <h1 className="text-2xl font-bold">Iniziamo!</h1>

        {/* Selezione scheda */}
        <div className="text-left">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Scegli una delle tue schede
          </label>
          <select
            value={selectedSheet}
            onChange={(e) => setSelectedSheet(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">-- Seleziona --</option>
            {sheets.map((sheet) => (
              <option key={sheet._id} value={sheet._id}>
                {sheet.name}
              </option>
            ))}
          </select>
        </div>

        {/* Selezione tempo di recupero */}
        <div className="text-left">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Scegli il tempo di recupero (minuti)
          </label>
          <input
            type="range"
            min={1}
            max={5}
            value={restTime}
            onChange={(e) => setRestTime(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="text-center mt-2 font-semibold">{restTime} minuto(i)</div>
        </div>

        <div className="flex justify-between items-center gap-4">
          <button
            onClick={onBack ? onBack : () => window.history.back()}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
            type="button"
          >
            Torna indietro
          </button>
          <button
            onClick={handleStart}
            disabled={!selectedSheet}
            className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            Inizia allenamento
          </button>
        </div>
      </div>
    </div>
  )
}

export default WorkoutSetup