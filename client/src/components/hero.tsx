// HeroSection
// This component displays a hero section with a video background, a logo, and a title.
// It uses Tailwind CSS for styling and is responsive, adapting to different screen sizes.
// The hero section is designed to be visually appealing and sets the tone for the application.

function HeroSection() {
  return (
    <section className="relative h-[600px] w-screen drop-shadow-xl">

      <video  className="absolute top-0 left-0 w-full h-full object-cover "
        autoPlay
        muted
        loop
        playsInline>
        <source src="/assets/video/videoHero.mp4" type="video/mp4" />
        Il tuo browser non supporta il video.
      </video>
      <div className="relative z-10 flex flex-col items-center justify-center h-full bg-zinc-400/40 space-y-6">
      <div className="flex items-center mb-8">
      <img src="assets/pictures/logoBlackTransp.png" className="h-30 mb-4"></img>
        <h1 className="text-zinc-900 text-6xl md:text-8xl font-bold font-display mb-4">
          Wellum
        </h1>
        </div>
       
        
         <p className="text-3xl font-body text-zinc-900 ">
  Scegli il <span className="text-amber-500 font-bold  ">Benessere</span>.
</p>
       </div>
     
    </section>
  );
}

export default HeroSection;