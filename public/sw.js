// Service Worker for Planter app
// Handles overdue plant notifications

const CACHE_NAME = 'planter-sw-v1';

self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(clients.claim());
});

// Handle messages from the main app
self.addEventListener('message', async (event) => {
  const { type, plants } = event.data;
  
  if (type === 'CHECK_OVERDUE') {
    await checkOverduePlants(plants);
  }
});

async function checkOverduePlants(plants) {
  if (!Notification.permission === 'granted') {
    return;
  }
  
  const now = Date.now();
  
  for (const plant of plants) {
    if (plant.priority !== 'high') continue;
    
    const lastWatered = new Date(plant.lastWatered).getTime();
    const intervalMs = plant.wateringIntervalDays * 24 * 60 * 60 * 1000;
    const isOverdue = (now - lastWatered) > intervalMs;
    
    if (isOverdue) {
      const daysOverdue = Math.floor(
        (now - lastWatered - intervalMs) / (24 * 60 * 60 * 1000)
      );
      
      const title = `💧 ${plant.nickname || plant.name} needs water!`;
      const body = daysOverdue === 1 
        ? 'Overdue by 1 day. Tap to log watering.'
        : `Overdue by ${daysOverdue} days. Tap to log watering.`;
      
      // Show notification
      self.registration.showNotification(title, {
        body,
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        tag: `plant-${plant.id}`,
        requireInteraction: true,
        data: {
          plantId: plant.id,
          url: '/v2',
        },
      });
    }
  }
}

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const url = event.notification.data?.url || '/v2';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
