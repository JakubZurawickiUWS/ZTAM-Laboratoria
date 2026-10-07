// Zmiana nazwy cache (np. na 'pwa-v2') = nowa wersja aplikacji; stare cache usuwamy w "activate".
const CACHE = 'pwa-v1';
const PLIKI = ['./', 'index.js', 'manifest.json', 'offline.html', 'android.png'];
// 1. Instalacja: zapisujemy pliki szkieletu w cache.
self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PLIKI)));
});
// 2. Aktywacja: usuwamy cache z poprzednich wersji.
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((nazwy) =>
            Promise.all(nazwy.filter((n) => n !== CACHE).map((n) => caches.delete(n)))
        )
    );
});
// 3. Każde żądanie strony przechodzi przez service workera.
self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET') return;
    if (request.mode === 'navigate') {
        // Strony HTML: najpierw sieć (i kopia do cache), bez sieci - cache, a na końcu offline.html.
            event.respondWith(
                fetch(request)
                    .then((odp) => {
                        const kopia = odp.clone();
                        caches.open(CACHE).then((cache) => cache.put(request, kopia));
                        return odp;
                    })
                    .catch(async () => {
                        const zCache = await caches.match(request);
                        if (zCache) return zCache;
                        const offline = await caches.match('offline.html');
                        // Nowa odpowiedź z tą samą treścią - serwer mógł przekierować offline.html -> offline,
 // a przeglądarka nie przyjmie "przekierowanej" odpowiedzi jako strony.
 return new Response(offline.body, { headers: offline.headers });
                    })
            );
        return;
    }
    // Pozostałe pliki (obrazy, skrypty, manifest): najpierw cache, a gdy brak - sieć (i kopia do cache).
    event.respondWith(
        caches.match(request).then(
            (zCache) =>
                zCache ||
                fetch(request).then((odp) => {
                    const kopia = odp.clone();
                    caches.open(CACHE).then((cache) => cache.put(request, kopia));
                    return odp;
                })
        )
    );
});
