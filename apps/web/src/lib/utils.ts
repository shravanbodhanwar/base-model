import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getErrorMessage(err: unknown, fallback: string = 'An unexpected error occurred'): string {
  if (!err) return fallback;
  if (typeof err === 'string') return err;
  const anyErr = err as any;
  const data = anyErr?.response?.data;
  if (typeof data === 'string') return data;
  if (typeof data?.error === 'string') return data.error;
  if (typeof data?.error?.message === 'string') return data.error.message;
  if (typeof data?.message === 'string') return data.message;
  if (typeof anyErr?.message === 'string') return anyErr.message;
  return fallback;
}
