self.addEventListener("install", e => {
  e.waitUntil(
    caches.open("universo3d-cache").then(cache => {
      return cache.addAll([
        "/",
        "/index.html",
        "/manifest.json",
        "/src/cabine-2.png",
        "/src/somExplosaoBase.mp3",
        "/src/fundo.mp3",
        // Adicione todos os arquivos importantes
      ]);
    })
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
});
