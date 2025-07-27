import { useUser } from '@clerk/clerk-react'
import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({ children }: {children: React.ReactNode}) => {
  const { isSignedIn, isLoaded } = useUser()

  if (!isLoaded) {
    return <div>Loading...</div>
  }

  if (!isSignedIn) {
    return <Navigate to="/" />
  }

  return <>{children}</>
}

export default ProtectedRoute