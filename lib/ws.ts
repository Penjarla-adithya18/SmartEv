type MessageHandler = (payload: any) => void;

const useMocks = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_USE_MOCKS === '1';

export type WSHandle = { close(): void };

export async function connectWebSocket(onMessage?: MessageHandler): Promise<WSHandle> {
  if (typeof window === 'undefined') return { close() {} };
  if (useMocks) {
    const mod = await import('./mock/wsMock');
    return mod.createMockWebSocket(onMessage);
  }

  const WS_URL = process.env.NEXT_PUBLIC_WS_URL || '';
  const ws = new WebSocket(WS_URL);
  ws.onopen = () => console.info('WS connected');
  ws.onmessage = (ev) => {
    try { const payload = JSON.parse(ev.data); onMessage?.(payload); } catch (e) { console.warn('WS parse error', e); }
  };
  ws.onclose = () => console.info('WS closed');
  return { close: () => ws.close() };
}
