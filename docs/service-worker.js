const CACHE = "grades-v3"; // bump this to force refresh
const ASSETS = [
  "/smart-grades-hub-yaniv-raz/",
  "/smart-grades-hub-yaniv-raz/index.html",
  "/smart-grades-hub-yaniv-raz/assets/styles.css",
  "/smart-grades-hub-yaniv-raz/assets/app.js",
  "/smart-grades-hub-yaniv-raz/manifest.webmanifest"
];
self.addEventListener("install", e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
});
self.addEventListener("activate", e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
  );
});
self.addEventListener("fetch", e=>{
  e.respondWith(
    caches.match(e.request).then(r=> r || fetch(e.request))
  );
});
