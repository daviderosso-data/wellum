import { useEffect, useState } from 'react'


const API_URL = import.meta.env.VITE_URL_SERVER 

type Sheet = {
  _id: string
  name: string
}

type Props = {
  userId: string
  onStart: (sheetId: string, restTime: number) => void
  onBack?: () => void // callback to go back
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
    <div className="min-h-screen flex flex-col justify-center items-center bg-zinc-900 px-4">
      <div className="bg-zinc-600 p-6 rounded shadow max-w-lg w-full space-y-6 text-center">
        <h1 className="text-2xl text-amber-500 font-bold">Iniziamo!</h1>

        {/* Selezione scheda */}
        <div className="text-left bg-zinc-400 p-4 rounded mb-4">
          <label className="block text-sm font-medium text-zinc-900 mb-1">
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

        {/* Set recovery time */}
        <div className="text-left">
          <label className="block text-sm font-medium text-white mb-1">
            Scegli il tempo di recupero (minuti)
          </label>
          <input
            type="range"
            min={1}
            max={5}
            value={restTime}
            onChange={(e) => setRestTime(parseInt(e.target.value))}
            className="w-full accent-amber-500"
          />
          <div className="text-center text-4xl mt-2 text-amber-500 font-semibold">{restTime} min</div>
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
            className="bg-amber-500 text-zinc-900 px-6 py-2 rounded hover:bg-zinc-400 disabled:opacity-30"
          >
            Inizia allenamento
          </button>
        </div>
      </div>
    </div>
  )
}

export default WorkoutSetup