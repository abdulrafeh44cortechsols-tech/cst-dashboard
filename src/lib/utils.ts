import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility function to replace localhost URLs with environment variable
export function getImageUrl(imageUrl: string | null | undefined): string {
  if (!imageUrl) return "/placeholder.svg";
  
  // Replace localhost:8000 with environment variable if it exists
  if (imageUrl.includes("localhost:8000")) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (apiUrl) {
      return imageUrl.replace("http://localhost:8000", apiUrl);
    }
  }
  
  return imageUrl;
}
