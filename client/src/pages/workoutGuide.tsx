import { useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import WorkoutSetup from '../components/workoutSetup'
import WorkoutRun from '../components/workoutRun'

const WorkoutGuide = () => {
  const { user } = useUser()
  const [step, setStep] = useState<'setup' | 'run'>('setup')
  const [selectedSheetId, setSelectedSheetId] = useState('')
  const [restTime, setRestTime] = useState(1)

  const handleStart = (sheetId: string, rest: number) => {
    setSelectedSheetId(sheetId)
    setRestTime(rest)
    setStep('run')
  }

  return step === 'setup' ? (
    <WorkoutSetup userId={user?.id || ''} onStart={handleStart} />
  ) : (
    <WorkoutRun
  sheetId={selectedSheetId}
  restTime={restTime}
  onFinish={() => {
    setStep('setup') 
  }}
/>
  )
}

export default WorkoutGuide