// utils
// This file contains utility functions for the application, such as class name merging and other helper functions.
// It uses the `clsx` and `tailwind-merge` libraries to handle class name manipulation.
// The `cn` function merges class names and ensures that Tailwind CSS classes are applied correctly.
// This utility is used throughout the application to maintain consistent styling and avoid class name conflicts.

import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useAuth } from "@clerk/clerk-react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function useApi() {
  const { getToken: clerkGetToken } = useAuth();
  
  const API_URL = import.meta.env.VITE_URL_SERVER || 'http://localhost:3000';
  
  const getToken = async () => {
    return await clerkGetToken();
  };
  
  return {
    
    async get<T = unknown>(endpoint: string, p0: { signal: AbortSignal; }): Promise<T> {
      try {
        const token = await getToken();
        
        const response = await fetch(`${API_URL}${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          signal: p0.signal
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        return await response.json() as T;
      } catch (error) {
        console.error("API request failed:", error);
        throw error;
      }
    },
    
    async post<T = unknown, D = Record<string, unknown>>(endpoint: string, data: D): Promise<T> {
      try {
        const token = await getToken();
        const response = await fetch(`${API_URL}${endpoint}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        return await response.json() as T;
      } catch (error) {
        console.error("API request failed:", error);
        throw error;
      }
    },
    
    async put<T = unknown, D = Record<string, unknown>>(endpoint: string, data: D): Promise<T> {
      try {
        const token = await getToken();
        const response = await fetch(`${API_URL}${endpoint}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        return await response.json() as T;
      } catch (error) {
        console.error("API request failed:", error);
        throw error;
      }
    },
    
    async delete<T = unknown>(endpoint: string): Promise<T> {
      try {
        const token = await getToken();
        const response = await fetch(`${API_URL}${endpoint}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        return await response.json() as T;
      } catch (error) {
        console.error("API request failed:", error);
        throw error;
      }
    },
    
    getToken: async () => {
      return await clerkGetToken();
    },
    
    getBaseUrl: () => API_URL
  };
}