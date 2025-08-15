import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import './index.css'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import PageLoader from './components/Loader'
import { Suspense } from 'react'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
const SIGN_IN_FORCE_REDIRECT_URL = import.meta.env.VITE_CLERK_SIGN_IN_FORCE_REDIRECT_URL
if (!PUBLISHABLE_KEY) {
  throw new Error('VITE_CLERK_PUBLISHABLE_KEY is not defined. Please set it in your .env file.');
}

createRoot(document.getElementById('root')!).render(
   <StrictMode>
    <BrowserRouter>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} signInForceRedirectUrl={SIGN_IN_FORCE_REDIRECT_URL}>
       <Suspense fallback={<PageLoader />}>
      <App />
    </Suspense>
      </ClerkProvider>
    </BrowserRouter>
  </StrictMode>
)