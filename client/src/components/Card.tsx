import { cn } from "../lib/utils";

type CardProps = {
  title: string;
  description: string;
  imageUrl: string;
  author?: string;
  authorImg?: string;
  readTime?: string;
};

export default function Card({ title, description, imageUrl }: CardProps) {
  return (
    <div className="max-w-xs w-full group/card">
      <div
        className={cn(
          "cursor-pointer overflow-hidden relative card h-96 rounded-md shadow-xl max-w-sm mx-auto flex flex-col justify-between p-4 bg-cover"
        )}
        style={{ backgroundImage: `url(${imageUrl})` }}
      >
        <div className="absolute w-full h-full top-0 left-0 transition duration-300 group-hover/card:bg-black opacity-60"></div>
        <div className="text content">
          <h1 className="font-bold text-xl md:text-2xl text-gray-50 relative z-10">
            {title}
          </h1>
          <p className="font-normal text-sm text-gray-50 relative z-10 my-4">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}