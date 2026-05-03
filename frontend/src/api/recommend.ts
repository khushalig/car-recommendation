import type { UserPreferences, Recommendation } from '../types'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

export async function getRecommendations(prefs: UserPreferences): Promise<Recommendation> {
  const res = await fetch(`${API_BASE}/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prefs),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error ?? `Request failed with status ${res.status}`)
  }

  return data as Recommendation
}
