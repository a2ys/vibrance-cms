import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Compresses an image file to WebP format with 80% quality.
 * Ensures the longest edge (width or height) does not exceed 1920px.
 */
export const compressImage = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    // If it's not an image, return original
    if (!file.type.startsWith("image/")) {
      resolve(file);
      return;
    }

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = (e) => reject(e);

    img.onload = () => {
      const canvas = document.createElement("canvas");

      // Longest Edge Resizing Logic
      const MAX_DIMENSION = 1920;
      let width = img.width;
      let height = img.height;

      // Check if the image needs resizing
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          // Landscape: Cap Width
          height = Math.round(height * (MAX_DIMENSION / width));
          width = MAX_DIMENSION;
        } else {
          // Portrait: Cap Height
          width = Math.round(width * (MAX_DIMENSION / height));
          height = MAX_DIMENSION;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      // Draw image to canvas
      ctx.drawImage(img, 0, 0, width, height);

      // Export as WebP with 0.8 (80%) quality
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Image compression failed"));
            return;
          }
          // Create new File object with .webp extension
          const newName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
          const newFile = new File([blob], newName, {
            type: "image/webp",
            lastModified: Date.now(),
          });
          resolve(newFile);
        },
        "image/webp",
        0.8,
      );
    };

    reader.readAsDataURL(file);
  });
};
