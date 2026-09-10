const injected = new Set<string>();

export async function ensureThemeFont(family: string): Promise<void> {
  if (typeof document === "undefined") return;

  if (!injected.has(family)) {
    injected.add(family);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
      family.replace(/ /g, "+"),
    )}:wght@400;700;900&display=swap`;
    document.head.appendChild(link);
  }

  try {
    await Promise.race([
      document.fonts.load(`900 64px "${family}"`),
      new Promise((resolve) => setTimeout(resolve, 2500)),
    ]);
  } catch {
    // Impact / Arial Black / system-ui still render. Never throw.
  }
}
