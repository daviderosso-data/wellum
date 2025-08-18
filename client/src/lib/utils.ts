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

const isAbortError = (err: unknown): boolean =>
  err instanceof DOMException
    ? err.name === "AbortError"
    : typeof err === "object" &&
      err !== null &&
      "name" in err &&
      (err as { name?: unknown }).name === "AbortError";

class HttpError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

// Helper to extract error messages from various error types
// This function handles different error formats and returns a string message
const getErrorMessage = (err: unknown): string => {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  try {
    return JSON.stringify(err);
  } catch {
    return "Unknown error";
  }
};

// Check if the body is a FormData instance
// This is used to determine how to send the request body in API calls
const isFormDataBody = (body: unknown): body is FormData =>
  typeof FormData !== "undefined" && body instanceof FormData;

// API wrapper
export function useApi() {
  const { getToken: clerkGetToken } = useAuth();
  const API_URL = import.meta.env.VITE_URL_SERVER || "http://localhost:3000";

  // Function to get the authentication token
  // This function retrieves the token from Clerk for authenticated requests
  const getToken = async (): Promise<string | null> => {
    return await clerkGetToken();
  };

// Function to make API requests
// This function handles GET, POST, PUT, and DELETE requests with proper error handling and headers
  const request = async <T>(endpoint: string, init?: RequestInit): Promise<T> => {
    const token = await getToken();
    const url = `${API_URL}${endpoint}`;

// Create headers for the request
    const headers = new Headers((init?.headers as HeadersInit | undefined) ?? undefined);
    if (token) headers.set("Authorization", `Bearer ${token}`);

// If the body is not FormData, set Content-Type to application/json
    const hasBody = typeof init?.body !== "undefined" && init?.body !== null;
    if (hasBody && !isFormDataBody(init?.body) && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    if (!headers.has("Accept")) {
      headers.set("Accept", "application/json, */*;q=0.1");
    }

    try {
      const res = await fetch(url, {
        credentials: "include",
        mode: "cors",
        ...init,
        headers,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new HttpError(text || `HTTP ${res.status}`, res.status);
      }
// If the response is empty, return undefined
      if (res.status === 204) return undefined as T;

      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        return (await res.json()) as T;
      }
// If the response is not JSON, return the text content
      return undefined as T;
    } catch (err) {
      if (isAbortError(err)) {
        throw err;
      }
      console.error("API request failed:", getErrorMessage(err));
      throw err;
    }
  };

  return {
// GET request with optional signal/custom headers
    get: <T>(endpoint: string, init?: RequestInit) =>
      request<T>(endpoint, { ...init, method: "GET" }),

  // POST: accepts JSON or FormData bodies
    post: <T, D = unknown>(endpoint: string, data?: D, init?: RequestInit) =>
      request<T>(endpoint, {
        ...init,
        method: "POST",
        body: isFormDataBody(data) ? data : data !== undefined ? JSON.stringify(data) : undefined,
      }),

// PUT: accepts JSON or FormData bodies
      put: <T, D = unknown>(endpoint: string, data?: D, init?: RequestInit) =>
      request<T>(endpoint, {
        ...init,
        method: "PUT",
        body: isFormDataBody(data) ? data : data !== undefined ? JSON.stringify(data) : undefined,
      }),

      // DELETE request
    delete: <T = void>(endpoint: string, init?: RequestInit) =>
      request<T>(endpoint, { ...init, method: "DELETE" }),

    // Function to get the authentication token
    getToken: async () => await clerkGetToken(),
    getBaseUrl: () => API_URL,
  };
}