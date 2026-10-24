export const AI_BASE = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_AI_URL
  ? process.env.NEXT_PUBLIC_AI_URL
  : '';

async function fetchJson<T>(url: string, opts?: RequestInit) {
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error(`AI API error ${res.status} ${res.statusText}`);
  return (await res.json()) as T;
}

const useMocks = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_USE_MOCKS === '1';

export async function getDemandForecast(stationId: string) {
  if (useMocks) return (await import('./mock/apiMock')).getDemandForecast(stationId);
  return fetchJson(`${AI_BASE}/forecast/station/${stationId}`);
}

export async function getWaitingTimePrediction(stationId: string) {
  if (useMocks) return (await import('./mock/apiMock')).getWaitingTimePrediction(stationId);
  return fetchJson(`${AI_BASE}/waiting/station/${stationId}`);
}

export async function getRecommendation(lat: number, lng: number) {
  if (useMocks) return (await import('./mock/apiMock')).getRecommendations(lat, lng);
  const params = new URLSearchParams({ lat: String(lat), lng: String(lng) });
  return fetchJson(`${AI_BASE}/recommend?${params.toString()}`);
}
