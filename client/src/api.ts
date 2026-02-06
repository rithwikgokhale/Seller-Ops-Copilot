import type { CopilotOutput } from "./types";

const BASE = "/api";

export async function askCopilot(
  message: string,
  neighborhoodContextEnabled: boolean
): Promise<CopilotOutput> {
  const res = await fetch(`${BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, neighborhoodContextEnabled }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Server error ${res.status}`);
  }

  return res.json();
}
