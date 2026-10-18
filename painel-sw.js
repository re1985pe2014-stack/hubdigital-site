/* Painel Anti-Fatura: funciona offline depois da primeira visita.
   Ao publicar uma versão nova, troque o número em VERSAO. */
const VERSAO = 'hd-anti-fatura-v2-2';
const PAGINA = 'painel-7k2m9q.html';
const ARQUIVOS = [PAGINA, 'painel.webmanifest', 'painel-icon-192.png', 'painel-icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSAO).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSAO).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  const nome = url.pathname.split('/').pop();
  if (!ARQUIVOS.includes(nome)) return;           // só mexe nos arquivos do painel
  if (nome === PAGINA) {
    e.respondWith(fetch(req).then(r => { const cp = r.clone(); caches.open(VERSAO).then(c => c.put(PAGINA, cp)); return r; })
      .catch(() => caches.match(PAGINA)));
  } else {
    e.respondWith(caches.match(nome).then(hit => hit || fetch(req)));
  }
});
