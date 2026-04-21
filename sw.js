// ── 每次更新 index.html 時，把這個版本號加 1 ──
const VERSION = 'parrot-v2'

const ASSETS = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js',
]

// 安裝：預先快取資源
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(VERSION).then(c =>
      Promise.allSettled(ASSETS.map(url => c.add(url).catch(() => {})))
    ).then(() => self.skipWaiting())
  )
})

// 啟動：刪除舊版快取
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

// Fetch：Network-first，網路有回應就用最新版，失敗才用快取
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
