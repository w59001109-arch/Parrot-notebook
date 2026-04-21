const CACHE = 'parrot-v1'
const ASSETS = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js',
  'https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;600;700&family=Zen+Kaku+Gothic+New:wght@300;400;700&display=swap'
]

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => {
      // Cache what we can; ignore failures (e.g. Google Fonts in some envs)
      return Promise.allSettled(ASSETS.map(url => c.add(url).catch(() => {})))
    }).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', e => {
  // Cache-first for same-origin; network-first for CDN
  const isSameOrigin = e.request.url.startsWith(self.location.origin)
  if (isSameOrigin) {
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
        const clone = res.clone()
        caches.open(CACHE).then(c => c.put(e.request, clone))
        return res
      }))
    )
  } else {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    )
  }
})
