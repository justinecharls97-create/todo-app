const cacheName = "todo-cache-v1";
const files = [
    "/",
    "/index.html",
    "/style.css",
    "/script.js",
    "/manifest.json"
];

self.addEventListener("install", e => {
    e.waitUntil(caches.open(cacheName).then(c => c.addAll(files)));
});

self.addEventListener("fetch", e => {
    e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});
