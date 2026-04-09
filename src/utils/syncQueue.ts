export type SyncOperationType = 'create' | 'update' | 'delete';

export interface SyncOperation {
  id: string;
  type: SyncOperationType;
  plantId: string;
  payload?: unknown;
  createdAt: string;
  retryCount: number;
  lastError?: string;
}

const SYNC_QUEUE_KEY = 'PLANT_SYNC_QUEUE_V1';
const MAX_RETRIES = 5;

const isBrowser = typeof window !== 'undefined';

function safeReadQueue(): SyncOperation[] {
  if (!isBrowser) return [];

  try {
    const raw = window.localStorage.getItem(SYNC_QUEUE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item): item is SyncOperation => {
      return Boolean(item?.id && item?.type && item?.plantId && item?.createdAt);
    });
  } catch {
    return [];
  }
}

function writeQueue(queue: SyncOperation[]): void {
  if (!isBrowser) return;
  window.localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
}

export function getSyncQueue(): SyncOperation[] {
  return safeReadQueue();
}

export function addToSyncQueue(operation: Omit<SyncOperation, 'id' | 'createdAt' | 'retryCount'>): SyncOperation[] {
  const queue = safeReadQueue();
  const newOperation: SyncOperation = {
    ...operation,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    retryCount: 0,
  };

  const nextQueue = [...queue, newOperation];
  writeQueue(nextQueue);
  return nextQueue;
}

export function removeFromSyncQueue(operationId: string): SyncOperation[] {
  const queue = safeReadQueue();
  const nextQueue = queue.filter((item) => item.id !== operationId);
  writeQueue(nextQueue);
  return nextQueue;
}

export function markSyncFailure(operationId: string, errorMessage: string): SyncOperation[] {
  const queue = safeReadQueue();
  const nextQueue = queue
    .map((item) => {
      if (item.id !== operationId) return item;
      return {
        ...item,
        retryCount: item.retryCount + 1,
        lastError: errorMessage,
      };
    })
    .filter((item) => item.retryCount <= MAX_RETRIES);

  writeQueue(nextQueue);
  return nextQueue;
}

export function clearSyncQueue(): void {
  if (!isBrowser) return;
  window.localStorage.removeItem(SYNC_QUEUE_KEY);
}
