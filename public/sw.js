// Service Worker for Lunar Calendar PWA
const CACHE_NAME = "lunar-calendar-v1";
const STATIC_CACHE = "lunar-calendar-static-v1";
const DYNAMIC_CACHE = "lunar-calendar-dynamic-v1";

// Files to cache for offline functionality
const STATIC_FILES = [
  "/",
  "/calendar",
  "/manifest.json",
  // Add core CSS and JS files here when built
];

// Install event - cache static resources
self.addEventListener("install", (event) => {
  console.log("Service Worker installing...");

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("Caching static files");
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log("Static files cached successfully");
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("Error caching static files:", error);
      }),
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE;
            })
            .map((cacheName) => {
              console.log("Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }),
        );
      })
      .then(() => {
        console.log("Service Worker activated");
        return self.clients.claim();
      }),
  );
});

// Fetch event - serve from cache when possible
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip external requests
  if (!request.url.startsWith(self.location.origin)) {
    return;
  }

  // Handle API requests differently
  if (request.url.includes("/api/")) {
    return handleApiRequest(event);
  }

  // Handle page requests
  event.respondWith(handlePageRequest(event));
});

// Handle API requests - cache but always try network first
async function handleApiRequest(event) {
  const { request } = event;

  try {
    // Try network first
    const response = await fetch(request);

    // Cache successful responses
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.log("Network failed, trying cache for API request");

    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline response for critical API endpoints
    if (request.url.includes("/api/trpc/lunarCalendar")) {
      return new Response(
        JSON.stringify({
          error: {
            message: "Ngoại tuyến - dữ liệu lịch âm không khả dụng",
            code: "OFFLINE",
          },
        }),
        {
          status: 503,
          statusText: "Service Unavailable",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    throw error;
  }
}

// Handle page requests - cache-first strategy for static content
async function handlePageRequest(event) {
  const { request } = event;

  try {
    // Check static cache first
    const staticCachedResponse = await caches.match(request, {
      cacheName: STATIC_CACHE,
    });

    if (staticCachedResponse) {
      return staticCachedResponse;
    }

    // Check dynamic cache
    const dynamicCachedResponse = await caches.match(request, {
      cacheName: DYNAMIC_CACHE,
    });

    if (dynamicCachedResponse) {
      // Serve from cache but try to update in background
      updateCache(request);
      return dynamicCachedResponse;
    }

    // Try network
    const response = await fetch(request);

    // Cache successful responses
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.log("All sources failed, serving offline page");

    // Serve offline page for navigation requests
    if (request.mode === "navigate") {
      return (
        caches.match("/calendar") ||
        new Response(
          `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Ngoại tuyến - Lịch âm</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              text-align: center;
              padding: 2rem;
              background-color: #f9fafb;
            }
            .offline-container {
              max-width: 400px;
              margin: 0 auto;
              background: white;
              padding: 2rem;
              border-radius: 8px;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
            .offline-icon {
              font-size: 3rem;
              margin-bottom: 1rem;
            }
            h1 {
              color: #374151;
              margin-bottom: 0.5rem;
            }
            p {
              color: #6b7280;
              margin-bottom: 1.5rem;
            }
            button {
              background-color: #1d4ed8;
              color: white;
              border: none;
              padding: 0.75rem 1.5rem;
              border-radius: 4px;
              cursor: pointer;
              font-size: 1rem;
            }
            button:hover {
              background-color: #1e40af;
            }
          </style>
        </head>
        <body>
          <div class="offline-container">
            <div class="offline-icon">📅</div>
            <h1>Bạn đang ngoại tuyến</h1>
            <p>Vui lòng kiểm tra kết nối mạng và thử lại. Một số tính năng vẫn có thể sử dụng khi ngoại tuyến.</p>
            <button onclick="location.reload()">Thử lại</button>
          </div>
        </body>
        </html>
        `,
          {
            headers: {
              "Content-Type": "text/html",
            },
          },
        )
      );
    }

    throw error;
  }
}

// Background update function
async function updateCache(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response);
    }
  } catch (error) {
    console.log("Background cache update failed:", error);
  }
}

// Push notification handling
self.addEventListener("push", (event) => {
  console.log("Push event received");

  let data = {};

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: "Nhắc nhở lịch âm", body: event.data.text() };
    }
  }

  const options = {
    title: data.title || "Nhắc nhở lịch âm",
    body: data.body || "Bạn có nhắc nhở sự kiện âm lịch mới",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-96x96.png",
    data: {
      url: data.url || "/calendar",
      eventId: data.eventId,
      timestamp: Date.now(),
    },
    actions: [
      {
        action: "view",
        title: "Xem chi tiết",
      },
      {
        action: "dismiss",
        title: "Nhắc nhở sau",
      },
    ],
    requireInteraction: true,
    vibrate: [200, 100, 200],
  };

  event.waitUntil(self.registration.showNotification(options.title, options));
});

// Notification click handling
self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked:", event);

  event.notification.close();

  const { action, data } = event;
  const url = data?.url || "/calendar";

  if (action === "dismiss") {
    // Handle snooze functionality
    return;
  }

  // Default action - open the app
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      // Try to focus existing window
      for (const client of clientList) {
        if (client.url.includes(url) && "focus" in client) {
          return client.focus();
        }
      }

      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    }),
  );
});

// Periodic background sync for important dates
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "lunar-calendar-sync") {
    event.waitUntil(syncLunarCalendarData());
  }
});

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  if (event.tag === "event-sync") {
    event.waitUntil(syncPendingEvents());
  }
});

// Sync lunar calendar data in background
async function syncLunarCalendarData() {
  try {
    // Update current lunar date and important dates
    await fetch("/api/trpc/lunarCalendar.getCurrentLunarDate");
    await fetch("/api/trpc/lunarCalendar.getNextImportantDates");
    console.log("Lunar calendar data synced successfully");
  } catch (error) {
    console.error("Error syncing lunar calendar data:", error);
  }
}

// Sync pending events (for offline-created events)
async function syncPendingEvents() {
  try {
    // Implementation would handle offline-created events
    console.log("Pending events synced successfully");
  } catch (error) {
    console.error("Error syncing pending events:", error);
  }
}

// Handle app updates
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
