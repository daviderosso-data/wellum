import { SignIn } from '@clerk/clerk-react'
import Menu from '../components/Menu'
import Footer from '../components/Footer'

export default function SignInPage() {
  return (
    <>
    <Menu />
    <div className="min-h-screen flex items-center justify-center bg-zinc-600">
      <div className="rounded-xl shadow-lg">
        <SignIn />
      </div>
    </div>
    <Footer />
    </>
  )
}