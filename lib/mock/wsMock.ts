import type { WSHandle } from '../ws';

export function createMockWebSocket(onMessage?: (payload:any)=>void): WSHandle {
  const id = setInterval(()=>{
    const payload = { type: 'charger_update', data: { chargerId: 'c1', status: Math.random()>0.5 ? 'available' : 'charging', timestamp: Date.now() } };
    onMessage?.(payload);
  }, 4000);
  return { close: () => clearInterval(id) };
}
