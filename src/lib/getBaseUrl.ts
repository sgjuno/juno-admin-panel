export function getBaseUrl() {
  if (typeof window !== 'undefined') return '';
  if (process.env.NEXT_PUBLIC_VERCEL_URL) return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;

  // Check if a custom port is being used (Next.js sets this)
  const port = process.env.PORT || '3001';
  return `http://localhost:${port}`;
} 