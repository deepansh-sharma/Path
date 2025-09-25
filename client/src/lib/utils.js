import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names with Tailwind CSS optimization
 * @param {...string} inputs - Class names to combine
 * @returns {string} - Optimized class string
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}