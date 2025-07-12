import { useUser } from '@clerk/clerk-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
const API_URL = import.meta.env.VITE_URL_SERVER 

const SignUpSuccess = () => {
  const { user, isSignedIn } = useUser()
  const navigate = useNavigate()

  useEffect(() => {
    const saveNewUser = async () => {
      if (isSignedIn && user) {
        const userData = {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.primaryEmailAddress?.emailAddress,
          clerkId: user.id,
        }

        try {
          const res = await fetch(`${API_URL}/api/users`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
          })

          const result = await res.json()
          console.log('Utente salvato:', result)

          // Dopo aver salvato → manda in Dashboard
          setTimeout(()=>{navigate('/')}, 3000)
        } catch (err) {
          console.error('Errore salvataggio utente:', err)
        }
      }
    }

    saveNewUser()
  }, [isSignedIn, user, navigate])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Registrazione in corso...</h1>
    </div>
  )
}

export default SignUpSuccess