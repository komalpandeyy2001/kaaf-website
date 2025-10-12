import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "../firebase";

/**
 * Fetches the download URL for an image from Firebase Storage
 * @param imagePath - The path to the image in Firebase Storage (e.g., "images/pickleball-one.jpg")
 * @returns Promise<string> - The download URL for the image
 */
export const getImageURL = async (imagePath: string): Promise<string> => {
  try {
    // Create a reference to the image in Firebase Storage
    const imageRef = ref(storage, imagePath);
    
    // Get the download URL
    const url = await getDownloadURL(imageRef);
    
    return url;
  } catch (error) {
    console.error("Error fetching image URL:", error);
    throw new Error(`Failed to fetch image URL for path: ${imagePath}`);
  }
};

/**
 * Validates and fixes common issues with Firebase Storage URLs
 * @param imageUrl - The URL to validate and fix
 * @returns string - The validated or fixed URL
 */
export const validateAndFixImageUrl = (imageUrl: string): string => {
  // Check if it's a Firebase Storage URL
  if (imageUrl.includes("firebasestorage.googleapis.com")) {
    // Fix for complex double extension issues (e.g., .png0.95026716722585.jpg)
    const urlParts = imageUrl.split('/');
    const lastPart = urlParts[urlParts.length - 1];
    
    // Handle complex patterns like .png0.95026716722585.jpg
    const complexPatternMatch = lastPart.match(/^([^?]*)(\.[a-zA-Z0-9]+)(\d+\.\d+)(\.[a-zA-Z]+)(\?.*)?$/);
    if (complexPatternMatch && complexPatternMatch[2] && complexPatternMatch[4]) {
      // Keep only the base filename and the last extension
      const correctedLastPart = complexPatternMatch[1] + complexPatternMatch[4] + (complexPatternMatch[5] || '');
      urlParts[urlParts.length - 1] = correctedLastPart;
      return urlParts.join('/');
    }
    
    // Fix for simple double extension issue (e.g., .png.jpg)
    const doubleExtMatch = lastPart.match(/^([^?]*)(\.[^.]+)(\.[^.]+)(\?.*)?$/);
    if (doubleExtMatch && doubleExtMatch[2] && doubleExtMatch[3]) {
      // Keep only the last extension
      const correctedLastPart = doubleExtMatch[1] + doubleExtMatch[3] + (doubleExtMatch[4] || '');
      urlParts[urlParts.length - 1] = correctedLastPart;
      return urlParts.join('/');
    }
  }
  
  return imageUrl;
};
