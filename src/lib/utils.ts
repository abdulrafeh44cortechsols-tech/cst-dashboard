import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility function to handle both relative and absolute image URLs
export function getImageUrl(imageUrl: string | null | undefined): string {
  if (!imageUrl) return "/placeholder.svg";

  // If it's already a full URL (http or https), return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    // Still check for localhost to replace with production URL if needed
    if (imageUrl.includes("localhost:8000") && process.env.NEXT_PUBLIC_API_URL) {
      return imageUrl.replace("http://localhost:8000", process.env.NEXT_PUBLIC_API_URL);
    }
    return imageUrl;
  }

  // Handle relative URLs (starting with /)
  if (imageUrl.startsWith('/')) {
    // Remove any leading slashes to prevent double slashes when joining with base URL
    const cleanPath = imageUrl.replace(/^\/+/, '');
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    return `${baseUrl}/${cleanPath}`;
  }

  // For any other case, return as is (though this shouldn't happen with proper API responses)
  return imageUrl;
}
