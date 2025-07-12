import { Link, useLocation } from 'react-router-dom'
import { FaHome, FaBars, FaTimes } from 'react-icons/fa'
import { UserButton, useUser } from '@clerk/clerk-react'
import { useState } from 'react'

const Sidebar = () => {
  const location = useLocation()
  const { user } = useUser()
  const [open, setOpen] = useState(false)

  const linkClass = (path: string) =>
    `block px-3 py-2 rounded transition ${
      location.pathname === path
        ? 'bg-amber-500 text-zinc-900 font-semibold'
        : 'text-white hover:bg-amber-500/60 hover:text-zinc-950'
    }`

  return (
    <>
      {/* Hamburger for mobile */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded bg-white shadow"
          aria-label="Apri menu"
        >
          <FaBars size={24} />
        </button>
      </div>

      {/* Sidebar desktop */}
      <div className="hidden md:block w-64 h-screen bg-zinc-800 shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl text-amber-500 font-bold">Wellum</h2>
          <Link to="/" className="text-white hover:text-amber-500">
            <FaHome size={20} />
          </Link>
        </div>
        <nav className="space-y-2">
          <Link to="/exercisesheet" className={linkClass('/exercisesheet')}>
            La mia scheda
          </Link>
          <Link to="/workoutguide" className={linkClass('/workoutguide')}>
            Workout Guidato        
          </Link>
          <Link to="/agenda" className={linkClass('/agenda')}>
            Agenda        
          </Link>
          <Link to="/exercises" className={linkClass('/exercises')}>
            Tutti gli Esercizi
          </Link>
       
          <Link to="/timer" className={linkClass('/timer')}>
            Timer
          </Link>
          <Link to="/addexercises" className={linkClass('/addexercises')}>
            Aggiungi Esercizio
          </Link>
          <span className="absolute justify-between items-center bottom-5 px-3 py-2 rounded text-gray-800">
            <UserButton />
            <span className="text-sm text-amber-500 m-6">
              {user?.firstName} {user?.lastName}
            </span>
          </span>
        </nav>
      </div>

      {/* Sidebar mobile overlay */}
      {open && (
  <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex">
    <div className="w-64 h-full bg-white shadow-md p-6 relative animate-slide-in-left">
      {/* Tasto chiudi in alto a destra */}
      <button
        onClick={() => setOpen(false)}
        className="absolute top-4 right-4 text-gray-600 hover:text-indigo-600"
        aria-label="Chiudi menu"
      >
        <FaTimes size={24} />
      </button>
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Wellum</h2>
        <Link
          to="/"
          className="text-gray-600 hover:text-indigo-600 inline-flex items-center gap-2 mb-4"
          onClick={() => setOpen(false)}
        >
          <FaHome size={20} />
          <span className="text-base">Home</span>
        </Link>
      </div>
      <nav className="space-y-2">
        <Link to="/exercisesheet" className={linkClass('/exercisesheet')} onClick={() => setOpen(false)}>
          La mia scheda
        </Link>
        <Link to="/workoutguide" className={linkClass('/workoutguide')} onClick={() => setOpen(false)}>
          Workout Guidato        
        </Link>
        <Link to="/agenda" className={linkClass('/agenda')} onClick={() => setOpen(false)}>
          Agenda        
        </Link>
        <Link to="/exercises" className={linkClass('/exercises')} onClick={() => setOpen(false)}>
          Tutti gli Esercizi
        </Link>
        <Link to="/dashboard" className={linkClass('/dashboard')} onClick={() => setOpen(false)}>
          Dashboard
        </Link>
        <Link to="/timer" className={linkClass('/timer')} onClick={() => setOpen(false)}>
          Timer
        </Link>
        <Link to="/addexercises" className={linkClass('/addexercises')} onClick={() => setOpen(false)}>
          Aggiungi Esercizio
        </Link>
        <div className="mt-8 flex items-center gap-2">
          <UserButton />
          <span className="text-sm text-gray-600">
            {user?.firstName} {user?.lastName}
          </span>
        </div>
      </nav>
    </div>
    {/* Click outside to close */}
    <div className="flex-1" onClick={() => setOpen(false)} />
  </div>
)}

      {/* Animazione slide-in */}
      <style>
        {`
          @keyframes slide-in-left {
            from { transform: translateX(-100%); }
            to { transform: translateX(0); }
          }
          .animate-slide-in-left {
            animation: slide-in-left 0.2s cubic-bezier(0.4,0,0.2,1);
          }
        `}
      </style>
    </>
  )
}

export default Sidebar