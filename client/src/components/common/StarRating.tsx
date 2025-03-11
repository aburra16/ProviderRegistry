import { Star, StarHalf } from "lucide-react";

interface StarRatingProps {
  rating: number;
  size?: "sm" | "md" | "lg";
}

export default function StarRating({ rating, size = "sm" }: StarRatingProps) {
  // Convert rating to array of full and half stars
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  // Determine icon size based on prop
  const iconSize = size === "sm" ? 16 : size === "md" ? 20 : 24;
  const className = `text-yellow-400 ${size === "sm" ? "w-4 h-4" : size === "md" ? "w-5 h-5" : "w-6 h-6"}`;
  
  return (
    <div className="flex">
      {[...Array(5)].map((_, i) => {
        if (i < fullStars) {
          return <Star key={i} className={className} fill="currentColor" />;
        } else if (i === fullStars && hasHalfStar) {
          return <StarHalf key={i} className={className} fill="currentColor" />;
        } else {
          return <Star key={i} className={`${className} text-gray-300`} />;
        }
      })}
    </div>
  );
}
