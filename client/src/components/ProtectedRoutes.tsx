// ProtectedRoutes
// This component checks if the user is signed in before allowing access to protected routes.
// If the user is not signed in, they are redirected to the home page.
// It uses Clerk for user authentication and displays a loading state while checking the user's status. 

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