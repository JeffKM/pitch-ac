import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 인증 리다이렉트에 사용할 사이트 URL 반환.
 * 우선순위: NEXT_PUBLIC_SITE_URL > NEXT_PUBLIC_VERCEL_URL > window.location.origin
 */
export function getSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "http://localhost:3000";
}
