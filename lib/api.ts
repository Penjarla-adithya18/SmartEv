export const API_BASE = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL
  ? process.env.NEXT_PUBLIC_API_URL
  : '';

export type Charger = {
  id: string;
  stationId: string;
  chargerType: string;
  powerKw: number;
  status: 'available' | 'charging' | 'offline' | 'reserved';
};

export type Station = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  rating?: number;
};

export type Booking = {
  id: string;
  stationId: string;
  chargerId: string;
  name: string;
  phone?: string;
  vehicleNumber?: string;
  startTime: string;
  endTime?: string;
  otp?: string;
};

async function fetchJson<T>(url: string, opts?: RequestInit) {
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error(`API error ${res.status} ${res.statusText}`);
  return (await res.json()) as T;
}

const useMocks = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_USE_MOCKS === '1';

export async function getStations(): Promise<Station[]> {
  if (useMocks) return (await import('./mock/apiMock')).getStations();
  return fetchJson<Station[]>(`${API_BASE}/api/stations`);
}

export async function getStationById(id: string): Promise<Station> {
  if (useMocks) return (await import('./mock/apiMock')).getStationById(id);
  return fetchJson<Station>(`${API_BASE}/api/stations/${id}`);
}

export async function getStationAvailability(id: string): Promise<{ chargers: Charger[] }>{
  if (useMocks) return (await import('./mock/apiMock')).getStationAvailability(id);
  return fetchJson<{ chargers: Charger[] }>(`${API_BASE}/api/stations/${id}/availability`);
}

export async function getNearbyStations(lat: number, lng: number, radiusMeters = 5000): Promise<Station[]> {
  if (useMocks) return (await import('./mock/apiMock')).getNearbyStations(lat, lng, radiusMeters);
  const params = new URLSearchParams({ lat: String(lat), lng: String(lng), radius: String(radiusMeters) });
  return fetchJson<Station[]>(`${API_BASE}/api/stations/nearby?${params.toString()}`);
}

export async function postBooking(payload: Partial<Booking>): Promise<Booking> {
  if (useMocks) return (await import('./mock/apiMock')).postBooking(payload);
  return fetchJson<Booking>(`${API_BASE}/api/bookings`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
}

export async function getBooking(id: string): Promise<Booking> {
  if (useMocks) return (await import('./mock/apiMock')).getBooking(id);
  return fetchJson<Booking>(`${API_BASE}/api/bookings/${id}`);
}

export async function getRecommendations(lat: number, lng: number): Promise<any> {
  if (useMocks) return (await import('./mock/apiMock')).getRecommendations(lat, lng);
  const params = new URLSearchParams({ lat: String(lat), lng: String(lng) });
  return fetchJson<any>(`${API_BASE}/api/stations/recommendations?${params.toString()}`);
}
