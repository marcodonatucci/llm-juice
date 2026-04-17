/**
 * Canonical site origin for metadata, Open Graph, and sitemaps.
 * Set `NEXT_PUBLIC_SITE_URL` in production (e.g. https://llm-juice.vercel.app).
 * On Vercel, `VERCEL_URL` is used as a fallback when the public URL is unset.
 */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, "").replace(/\/$/, "")}`;

  return "http://localhost:3000";
}
