Backend & Mock setup

1) Copy `.env.local.example` to `.env.local` and set real backend/AI/WS URLs as needed.

2) To develop without a backend, enable mock mode by setting `NEXT_PUBLIC_USE_MOCKS=1` in `.env.local`.

3) Files added:
- `lib/api.ts` — typed frontend API client for stations, bookings, recommendations.
- `lib/ws.ts` — WebSocket helper with mock fallback.
- `lib/ai.ts` — AI client wrappers with mock fallback.
- `lib/mock/*` — mock implementations for API and WS.

4) How to use in components:
import { getStations, getStationAvailability, postBooking } from 'lib/api';
import { connectWebSocket } from 'lib/ws';

Call `connectWebSocket()` from client components to receive real-time updates.
