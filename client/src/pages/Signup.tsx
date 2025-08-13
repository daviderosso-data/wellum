// SignUp
// This page renders the sign-up form using Clerk's SignUp component.
// It includes a menu and footer for navigation and layout consistency. 

import { SignUp } from '@clerk/clerk-react'

import Menu from '../components/Menu'
import Footer from '../components/Footer'

export default function SignUpPage() {
  return (
    <>
    <Menu />
    <div className="min-h-screen flex items-center justify-center bg-zinc-600">
      <div className="rounded-xl shadow-lg">
  <SignUp signInUrl='/login' forceRedirectUrl={"/signup-success"} /> 
  </div>
    </div>
    <Footer />
    </>)
}



