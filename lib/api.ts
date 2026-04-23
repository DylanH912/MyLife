const FALLBACK_API_URL = "http://140.104.38.113:8000";

export const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL ?? FALLBACK_API_URL
).replace(/\/+$/, "");
