import { useEffect, useRef, useState } from 'react'

const TimerWithReps = () => {
  const [time, setTime] = useState(0) // in decimi di secondo
  const [running, setRunning] = useState(false)
  const [reps, setReps] = useState(0)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Gestione timer
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTime((prev) => prev + 1)
      }, 100) // decimi di secondo
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [running])

  // Format MM:SS:DS
  const formatTime = (t: number) => {
    const minutes = Math.floor(t / 600)
    const seconds = Math.floor((t % 600) / 10)
    const deci = t % 10
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${deci}`
  }

  const toggleTimer = () => setRunning((prev) => !prev)
  const resetTimer = () => {
    setRunning(false)
    setTime(0)
  }

  const resetReps = () => setReps(0)

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow text-center space-y-6">
      <h2 className="text-2xl font-bold">Timer con Ripetizioni</h2>

      <div className="text-5xl font-mono">{formatTime(time)}</div>

      <div className="flex justify-center gap-4">
        <button
          onClick={toggleTimer}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          {running ? 'Pausa' : 'Avvia'}
        </button>
        <button
          onClick={resetTimer}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Reset Timer
        </button>
      </div>

      <div className="pt-4">
        <div className="text-xl mb-2">
          Ripetizioni: <strong>{reps}</strong>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => setReps((r) => r + 1)}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            +1 Ripetizione
          </button>
          <button
            onClick={resetReps}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Reset Ripetizioni
          </button>
        </div>
      </div>
    </div>
  )
}

export default TimerWithReps