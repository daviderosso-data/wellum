// utils
// This file contains utility functions for the application, such as class name merging and other helper functions.
// It uses the `clsx` and `tailwind-merge` libraries to handle class name manipulation.
// The `cn` function merges class names and ensures that Tailwind CSS classes are applied correctly.
// This utility is used throughout the application to maintain consistent styling and avoid class name conflicts.


import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}