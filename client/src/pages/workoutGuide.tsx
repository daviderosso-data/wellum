//WorkoutGuide
// this file is part of the client-side workout guide feature
// It allows users to set up and run a guided workout based on their exercise sheets.
// The component fetches the user's workout sheets and allows them to select one for their workout.

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