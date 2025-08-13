// Footer component with logo and links
// This component displays a footer with a logo and links to "About Us", "Contact Us", and "Privacy Policy".
// It uses Tailwind CSS for styling and is responsive, adapting to different screen sizes.
// The footer is designed to be visually appealing and consistent with the overall theme of the application.

export default function FooterWithLogo() {

  return (
    <div className="w-full bg-zinc-900 p-8 ">
      <div className="flex flex-row flex-wrap items-center justify-center gap-y-6 gap-x-12 bg-zinc-900 text-center md:justify-between">
       <div className="flex">
        <img src="assets/pictures/logoAmberTransp.png" className="h-10"></img> 
        <h1 className="text-2xl font-bold font-display text-amber-500">Wellum</h1>
        </div>
        <ul className="flex flex-wrap items-center gap-y-2 gap-x-8 ">
          <li>
            <a  href="#"
              color="amber-500"
              className="text-amber-500 transition-colors hover:text-white focus:text-amber-800" >
              About Us</a> 
          </li>
                <li>
            <a  href="#"
              color="blue-gray"
              className="text-amber-500 transition-colors hover:text-white focus:text-amber-800" >
              Contact Us</a> 
          </li>
               <li>
            <a  href="#"
              color="blue-gray"
              className="text-amber-500 transition-colors hover:text-white focus:text-amber-800" >
              Privacy Policy</a> 
          </li>
           
        </ul>
      </div>
      <hr className="my-8 border-amber-500/40" />
     
    </div>
  );
}