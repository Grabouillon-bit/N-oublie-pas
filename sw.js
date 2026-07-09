// Service worker — cache légère + affichage des notifications persistantes.
const CACHE = "noublie-pas-v1";
const ASSETS = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).catch(() => cached))
  );
});

// La page principale nous demande d'afficher une notification.
self.addEventListener("message", (event) => {
  const data = event.data || {};
  if (data.type === "SHOW_REMINDER") {
    self.registration.showNotification(data.title || "N'oublie pas 🌙", {
      body: data.body || "Un petit rappel : as-tu pris ta pilule ce soir ?",
      icon: "./icon-192.png",
      badge: "./icon-192.png",
      tag: data.tag || "pilule-reminder",
      requireInteraction: true,
      vibrate: [200, 100, 200],
      renotify: true,
      data: { url: "./index.html" }
    });
  }
  if (data.type === "CLOSE_REMINDERS") {
    self.registration.getNotifications({ tag: undefined }).then((notifs) => {
      notifs
        .filter((n) => (n.tag || "").startsWith("pilule-reminder"))
        .forEach((n) => n.close());
    });
  }
});

// Notification Push envoyée depuis le serveur — fonctionne même app fermée,
// y compris sur iPhone (iOS 16.4+, PWA installée sur l'écran d'accueil).
self.addEventListener('push', (event) => {
  let data = { title: "N'oublie pas 🌙", body: 'As-tu pris ta pilule ce soir ?', tag: 'pilule-reminder' };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch (e) {}

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: './icon-192.png',
      badge: './icon-192.png',
      tag: data.tag,
      requireInteraction: true,
      vibrate: [200, 100, 200],
      renotify: true,
      data: { url: './index.html' }
    })
  );
});

// Tentative de rappel en arrière-plan (Chrome/Android uniquement, best-effort).
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "pill-check") {
    event.waitUntil(
      self.registration.showNotification("N'oublie pas 🌙", {
        body: "As-tu pris ta pilule ce soir ?",
        icon: "./icon-192.png",
        tag: "pilule-reminder-sync-" + Date.now(),
        requireInteraction: true,
        vibrate: [200, 100, 200]
      })
    );
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clientsArr) => {
      const client = clientsArr.find((c) => "focus" in c);
      if (client) return client.focus();
      return self.clients.openWindow("./index.html");
    })
  );
});
