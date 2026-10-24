import type { Station, Charger, Booking } from '../api';

const sampleStations: Station[] = [
  { id: 's1', name: 'GreenCharge Hub', latitude: 12.9716, longitude: 77.5946, address: 'MG Road', rating: 4.6 },
  { id: 's2', name: 'BlueCharge Station', latitude: 12.9750, longitude: 77.5900, address: 'Brigade Rd', rating: 4.2 },
];

const sampleChargers: Charger[] = [
  { id: 'c1', stationId: 's1', chargerType: 'DC Fast', powerKw: 50, status: 'available' },
  { id: 'c2', stationId: 's1', chargerType: 'AC Type 2', powerKw: 7, status: 'charging' },
];

export async function getStations(): Promise<Station[]> { return sampleStations; }
export async function getStationById(id: string): Promise<Station> { return sampleStations.find(s=>s.id===id) || sampleStations[0]; }
export async function getStationAvailability(id: string): Promise<{ chargers: Charger[] }>{ return { chargers: sampleChargers.filter(c=>c.stationId===id || c.stationId==='s1') }; }
export async function getNearbyStations(lat:number,lng:number,radius:number){ return sampleStations; }

export async function postBooking(payload: Partial<Booking>): Promise<Booking> {
  const booking: Booking = { id: 'B'+Math.floor(Math.random()*100000), stationId: payload.stationId||'s1', chargerId: payload.chargerId||'c1', name: payload.name||'Guest', phone: payload.phone, vehicleNumber: payload.vehicleNumber, startTime: payload.startTime||new Date().toISOString(), endTime: payload.endTime, otp: '0000' };
  return booking;
}

export async function getBooking(id: string): Promise<Booking> { return { id, stationId: 's1', chargerId: 'c1', name: 'Guest', startTime: new Date().toISOString(), otp: '0000' }; }

export async function getRecommendations(lat:number,lng:number){ return { best: sampleStations[0], score: 92 }; }

export async function getDemandForecast(stationId: string){ return { predictedDemand: 42, peak: '18:00-20:00' }; }

export async function getWaitingTimePrediction(stationId: string){ return { predictedWaitMinutes: 8, confidence: 0.9 }; }
