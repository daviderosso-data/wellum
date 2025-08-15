// WorkoutSetup
// This component allows users to set up their workout by selecting a workout sheet and specifying rest time.
// It fetches the user's workout sheets from an API and displays them in a dropdown menu.
// Users can choose a sheet and set the rest time using a slider.
// The component is styled with Tailwind CSS for a modern look and is responsive to different screen sizes.
// It includes buttons to start the workout or go back to the previous screen.
// The component uses React hooks for state management and side effects, ensuring a smooth user experience.


import { useEffect, useRef, useState } from 'react'
import { useApi } from '../lib/utils'

type Sheet = {
  _id: string
  name: string
}

type Props = {
  userId: string
  onStart: (sheetId: string, restTime: number) => void
  onBack?: () => void 
}

const WorkoutSetup = ({ userId, onStart, onBack }: Props) => {
  const api = useApi()
  const apiRef = useRef(api)
  useEffect(() => {
    apiRef.current = api
  }, [api])

  const [sheets, setSheets] = useState<Sheet[]>([])
  const [selectedSheet, setSelectedSheet] = useState('')
  const [restTime, setRestTime] = useState(1)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadSheets = async (signal?: AbortSignal) => {
    if (!userId) {
      setSheets([])
      return
    }
    try {
      setIsLoading(true)
      setError(null)
      if (!signal) throw new Error('AbortSignal is required')
      const data = await apiRef.current.get<Sheet[]>(`/api/sheet/user/${userId}`, { signal })
      setSheets(Array.isArray(data) ? data : [])
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null) {
        if ((err as { name?: string }).name === 'AbortError') return
        const status = (err as { status?: number; response?: { status?: number } }).status || (err as { response?: { status?: number } }).response?.status
        if (status === 401 || status === 403) {
          setError('Non autenticato. Accedi per vedere le tue schede.')
        } else {
          setError('Errore nel caricamento delle schede. Riprova.')
        }
      } else {
        setError('Errore nel caricamento delle schede. Riprova.')
      }
      setSheets([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    loadSheets(controller.signal)
    return () => controller.abort()
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

        <div className="text-left bg-zinc-400 p-4 rounded mb-4">
          <label className="block text-sm font-medium text-zinc-900 mb-1">
            Scegli una delle tue schede
          </label>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-2 text-sm flex items-center justify-between">
              <span>{error}</span>
              <button
                className="ml-2 px-2 py-1 bg-red-200 hover:bg-red-300 rounded text-xs"
                onClick={() => loadSheets()}
              >
                Riprova
              </button>
            </div>
          )}

          <select
            value={selectedSheet}
            onChange={(e) => setSelectedSheet(e.target.value)}
            className="w-full border px-3 py-2 rounded disabled:opacity-60"
            disabled={isLoading || !!error}
          >
            <option value="">{isLoading ? 'Caricamento...' : '-- Seleziona --'}</option>
            {sheets.map((sheet) => (
              <option key={sheet._id} value={sheet._id}>
                {sheet.name}
              </option>
            ))}
          </select>
        </div>

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