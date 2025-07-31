// FeaturesSection.tsx
// This component displays a section with features of the application.
// Made From Aceternity Template https://ui.aceternity.com/components/feature-sections
// It includes a grid layout with feature cards, each containing a title, description, and a skeleton for future content.
// The section is styled with Tailwind CSS and includes a globe animation in the background.
// The component is responsive and adapts to different screen sizes, providing a user-friendly interface.




import React from "react";
import { cn } from "../lib/utils";
import createGlobe from "cobe";
import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { IconBrandYoutubeFilled } from "@tabler/icons-react";
 
 
export default function FeaturesSection() {
  const features = [
    {
      title: "Tieni traccia dei tuoi allenamenti",
      description:
        "Ttieni traccia dei tuoi allenamenti e dei tuoi progressi con il nostro strumento di monitoraggio.",
      skeleton: <SkeletonOne />,
      className:
        "col-span-1 lg:col-span-4 border-b lg:border-r border-amber-500/40",
    },
    {
      title: "Scopri nuovi esercizi",
      description:
        "con la nostra libreria di esercizi, puoi scoprire nuovi esercizi e migliorare le tue prestazioni.",
      skeleton: <SkeletonTwo />,
      className: "border-b col-span-1 lg:col-span-2 border-amber-500/40",
    },
    {
      title: "Online video tutorial",
      description:
        "Ogni esercizio ha un video tutorial che ti guida passo dopo passo.",
      skeleton: <SkeletonThree />,
      className:
        "col-span-1 lg:col-span-3 lg:border-r border-amber-500/40 ",
    },
    {
      title: "Sempre Connesso",
      description:
        "Con la nostra piattaforma, puoi accedere ai tuoi allenamenti ovunque e in qualsiasi momento.",
      skeleton: <SkeletonFour />,
      className: "col-span-1 lg:col-span-3 border-b lg:border-none border-amber-500/40",
    },
  ];
  return (
    <div className=" w-screen z-20 py-10 lg:py-40 mx-auto bg-zinc-800 ">
      <div className="px-8">
        <h4 className="text-3xl lg:text-5xl lg:leading-tight max-w-5xl mx-auto text-center tracking-tight font-medium text-amber-500">
Un unica piattaforma per i tuoi allenamenti        </h4>
 
        <p className="text-sm lg:text-base  max-w-2xl  my-4 mx-auto text-neutral-300 text-center font-normal ">
        Tieni traccia dei tuoi allenamenti, guarda i video tutorial, salva le tue schede.
        </p>
      </div>
 
      <div className="relative ">
        <div className="grid grid-cols-1 lg:grid-cols-6 mt-12 xl:border rounded-md m-10 border-amber-500/40">
          {features.map((feature) => (
            <FeatureCard key={feature.title} className={feature.className}>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
              <div className=" h-full w-full">{feature.skeleton}</div>
            </FeatureCard>
          ))}
        </div>
      </div>
    </div>
    
  );
}
 
const FeatureCard = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn(`p-4 sm:p-8 relative overflow-hidden`, className)}>
      {children}
    </div>
  );
};
 
const FeatureTitle = ({ children }: { children?: React.ReactNode }) => {
  return (
    <p className=" max-w-5xl mx-auto text-left tracking-tight text-amber-500 dark:text-white text-xl md:text-2xl md:leading-snug">
      {children}
    </p>
  );
};
 
const FeatureDescription = ({ children }: { children?: React.ReactNode }) => {
  return (
    <p
      className={cn(
        "text-sm md:text-base  max-w-4xl text-left mx-auto",
        "text-neutral-300 text-center font-normal ",
        "text-left max-w-sm mx-0 md:text-sm my-2"
      )}
    >
      {children}
    </p>
  );
};
 
export const SkeletonOne = () => {
  return (
    <div className="relative flex py-8 px-2 gap-10 h-full ">
      <div className="w-full  p-5  mx-auto bg-neutral-100  shadow-2xl group h-full">
        <div className="flex flex-1 w-full h-full flex-col space-y-2  ">
          {/* TODO */}
          <img
            src="/assets/pictures/tracking.jpg"
            alt="header"
            width={800}
            height={800}
            className="h-full w-full aspect-square object-cover object-left-top rounded-sm"
          />
        </div>
      </div>
 
      <div className="absolute bottom-0 z-40 inset-x-0 h-60 bg-gradient-to-t from-zinc-800 via-transparent  to-transparent w-full pointer-events-none" />
      <div className="absolute top-0 z-40 inset-x-0 h-60 bg-gradient-to-b from-zinc-800  via-transparent to-transparent w-full pointer-events-none" />
    </div>
  );
};
 
export const SkeletonThree = () => {
  return (
    <a
      href="https://www.youtube.com/watch?v=Ye0kX9YzjMM"
      target="__blank"
      className="relative flex gap-10 mt-10  h-full group/image"
    >
      <div className="w-full  mx-auto bg-transparent  group h-full">
        <div className="flex flex-1 w-full h-full flex-col space-y-2  relative">
          <IconBrandYoutubeFilled className="h-20 w-20 absolute z-10 inset-0 text-red-500 m-auto " />
          <img
            src="/assets/pictures/video.jpg"
            alt="header"
            width={800}
            height={800}
            className="h-full w-full aspect-square object-cover object-center rounded-sm blur-none group-hover/image:blur-sm transition-all duration-200"
          />
        </div>
      </div>
    </a>
  );
};
 
export const SkeletonTwo = () => {
  const images = [
  
    "/assets/pictures/panca_inclinata.jpg",
    "/assets/pictures/military-press.jpg",
    "/assets/pictures/lat-machine.jpg",

  ];
   const images2 = [
    "/assets/pictures/squat-bilanciere.jpg",
    "/assets/pictures/squat_bilanciere.jpg",
    "/assets/pictures/panca_piana.jpg"
 
  ];
     const images3 = [
    "/assets/pictures/plank.jpg",
    "/assets/pictures/panca_piana.jpg",
    "/assets/pictures/curl_con_manubri.jpg"
 
  ];
 
 
  const imageVariants = {
    whileHover: {
      scale: 1.5,
      rotate: 0,
      zIndex: 100,
    },
    whileTap: {
      scale: 1.5,
      rotate: 0,
      zIndex: 100,
    },
  };
  return (
    <div className="relative flex flex-col items-start gap-12 h-full overflow-hidden  lg:mt-20 ">
      {/* TODO */}
      <div className="flex flex-row ">
        {images.map((image, idx) => (
          <motion.div
            variants={imageVariants}
            key={"images-first" + idx}
            style={{
              rotate: Math.random() * 20 - 10,
            }}
            whileHover="whileHover"
            whileTap="whileTap"
            className="rounded-xl -mr-1 md:-ml-5 mt-4 p-1 bg-white border border-neutral-100 shrink-0 overflow-hidden"
          >
            <img
              src={image}
              alt="pictures of exercises"
              width="500"
              height="500"
              className="rounded-lg h-20 w-20 md:h-40 md:w-40 object-cover shrink-0"
            />
          </motion.div>
        ))}
      </div>
      <div className="flex flex-row">
        {images2.map((image, idx) => (
          <motion.div
            key={"images-second" + idx}
            style={{
              rotate: Math.random() * 20 - 10,
            }}
            variants={imageVariants}
            whileHover="whileHover"
            whileTap="whileTap"
            className="rounded-xl  -mr-1 md:-ml-5 mt-4 p-1 bg-white border border-neutral-100 shrink-0 overflow-hidden"
          >
            <img
              src={image}
              alt="exercises images"
              width="500"
              height="500"
              className="rounded-lg h-20 w-20 md:h-40 md:w-40 object-cover shrink-0"
            />
          </motion.div>
        ))}
      </div>
      <div className="flex flex-row">
        {images3.map((image, idx) => (
          <motion.div
            key={"images-third" + idx}
            style={{
              rotate: Math.random() * 20 - 10,
            }}
            variants={imageVariants}
            whileHover="whileHover"
            whileTap="whileTap"
            className="rounded-xl -mr-1 md:-ml-5 mt-4 p-1 bg-white border border-neutral-100 shrink-0 overflow-hidden"
          >
            <img
              src={image}
              alt="exercises images"
              width="500"
              height="500"
              className="rounded-lg h-20 w-20 md:h-40 md:w-40 object-cover shrink-0"
            />
          </motion.div>
        ))}
      </div>
 
      <div className="absolute left-0 z-[100] inset-y-0 w-20 bg-gradient-to-r from-zinc-800  to-transparent  h-full pointer-events-none" />
      <div className="absolute right-0 z-[100] inset-y-0 w-20 bg-gradient-to-l from-zinc-800  to-transparent h-full pointer-events-none" />
    </div>
  );
};
 
export const SkeletonFour = () => {
  return (
    <div className="h-60 md:h-60  flex flex-col items-center relative bg-transparent  mt-30">
      <Globe className="absolute -right-10 md:-right-10 -bottom-80 md:-bottom-72" />
    </div>
  );
};
 
export const Globe = ({ className }: { className?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
 
  useEffect(() => {
    let phi = 0;
 
    if (!canvasRef.current) return;
 
    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: 600 * 2,
      height: 600 * 2,
      phi: 0,
      theta: 0,
      dark: 1,
      diffuse: 0.8,
      mapSamples: 10000,
      mapBrightness: 6,
      baseColor: [0.3, 0.3, 0.3],
      markerColor: [0.8, 0.5, 0.1],
      glowColor: [0.8, 0.5, 0.0],
      markers: [
        // longitude latitude
        { location: [41.90278, 12.49636], size: 0.1 },
        { location: [40.7128, -74.006], size: 0.1 },
      ],
      onRender: (state) => {
        // Called on every animation frame.
        // `state` will be an empty object, return updated params.
        state.phi = phi;
        phi += 0.01;
      },
    });
 
    return () => {
      globe.destroy();
    };
  }, []);
 
  return (
    <canvas
      ref={canvasRef}
      style={{ width: 600, height: 600, maxWidth: "100%", aspectRatio: 1 }}
      className={className}
    />
  );
};