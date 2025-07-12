import { Link } from "react-router-dom";
import { SignedIn, UserButton, SignedOut, useUser } from "@clerk/clerk-react";

export default function Menu () {
    const { user } = useUser();
    return (
        <nav className="w-full z-10 bg-zinc-800 text-white">
             <div className="max-w-screen-xl  mx-auto flex justify-between items-center p-2">
        <h1 className="text-3xl font-bold font-display text-amber-500 curosor-pointer"><Link to="/">Wellum</Link></h1>
             <ul className="flex space-x-3 pr-2 text-xl text-teal-900 text-bold font-body">
            
                <SignedIn>
                     <li>
                         
                  <Link to="/exercisesheet" className="mb-4"><p
                className="px-4 py-2 my-2 mx-2 text-grey-800 text-bold bg-amber-500 rounded-lg shadow-xs shadow-amber-500/50  hover:text-gray-950 hover:shadow-md transition">
                Il mio programma
              </p></Link></li>
       
                

        
         <div className="flex flex-col items-center text-xs mr-4 text-amber-500 mx-2 my-2">
                <UserButton />
                               {user?.firstName} {user?.lastName}
                            </div>
      </SignedIn>
      <SignedOut>
        <li>
        <Link to="/signup" className="mb-4 justify-end"><button
                className="px-4 py-2 bg-zinc-400 text-zinc-950 rounded-lg cursor-pointer">
                SignUp
              </button></Link></li><li>
        <Link to="/login" className="mb-4 justify-end "><button
                className="px-4 py-2 bg-amber-500 text-zinc-950 rounded-lg cursor-pointer">
                Login
              </button></Link></li>
      </SignedOut>
           </ul>
           </div>
        </nav>
        
    ) }
