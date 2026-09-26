// Only allow returns inside this app, so a crafted link cannot bounce the
// user to another site.
export function safeReturnPath(value: unknown, fallback = "/wallet"): string {
  if (typeof value !== "string") return fallback;
  return /^\/(wallet|mingle)(\/|\?|$)/.test(value) ? value : fallback;
}
