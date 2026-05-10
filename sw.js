const VERSION = 'parrot-v3'
const OLD = ['parrot-v1', 'parrot-v2']

const ASSETS = [
  '/Parrot-notebook/',
  '/Parrot-notebook/index.html',
  '/Parrot-notebook/manifest.json',
  '/Parrot-notebook/icon-192.png',
  '/Parrot-notebook/icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js',
]

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(VERSION).then(c =>
      Promise.allSettled(ASSETS.map(url => c.add(url).catch(() => {})))
    ).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => OLD.includes(k)).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone()
        caches.open(VERSION).then(c => c.put(e.request, clone))
        return res
      })
      .catch(() => caches.match(e.request))
  )
})
