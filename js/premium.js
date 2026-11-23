// Couche « premium » (23/11/2026) : bandeaux défilants,
// fond qui vit au scroll (zoom + assombrissement, poussière, rayons).
// Tout se coupe si le visiteur a demandé « réduire les animations ».
(function () {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const G = window.gsap, ST = window.ScrollTrigger;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const VIEW = { jpeg: 'visual', wav: 'audio', plugin: 'plugin' };
  const activeView = () => $('.view-' + VIEW[document.body.dataset.mode || 'jpeg']);

  // (scroll fluide Lenis et curseur maison retirés le 23/11/2026 à la demande de Loïc :
  //  molette et souris normales)

  // ---------- Gros titres 3D : effet gelée au clic ----------
  // écrasé → étiré → tremblement élastique, puis retour au repos (transform-origin en bas)
  const jelly = (el) => {
    if (!G || reduced) return;
    G.killTweensOf(el);
    G.timeline()
      .to(el, { scaleX: 1.13, scaleY: 0.82, skewX: 0, duration: 0.09, ease: 'power2.out' })
      .to(el, { scaleX: 0.9, scaleY: 1.14, duration: 0.11, ease: 'power2.inOut' })
      .to(el, { scaleX: 1, scaleY: 1, duration: 1.2, ease: 'elastic.out(1.15, 0.22)' })
      .fromTo(el, { skewX: 5 }, { skewX: 0, duration: 1.3, ease: 'elastic.out(1, 0.18)' }, 0.09);
  };
  // délégation : l'intro du hero (motion.js) réécrit le <h1> et recrée l'image
  $$('.title3d').forEach((img) => { img.setAttribute('role', 'button'); img.setAttribute('tabindex', '0'); });
  document.addEventListener('click', (e) => { const t = e.target.closest('.title3d'); if (t) jelly(t); });
  document.addEventListener('keydown', (e) => {
    const t = e.target.closest && e.target.closest('.title3d');
    if (t && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); jelly(t); }
  });

  // ---------- 3. Bandeaux défilants ----------
  $$('.marquee').forEach((m, i) => {
    const track = $('.marquee__track', m);
    if (!track) return;
    track.innerHTML += track.innerHTML; // deux copies = boucle sans couture
    if (reduced || !G) return;
    const dir = i % 2 ? 1 : -1;
    const drift = G.fromTo(track, { xPercent: dir < 0 ? 0 : -50 }, { xPercent: dir < 0 ? -50 : 0, duration: 38, ease: 'none', repeat: -1 });
    if (ST) {
      // le scroll accélère le défilement, puis il revient à son rythme
      ST.create({
        trigger: m, start: 'top bottom', end: 'bottom top',
        onUpdate: (self) => {
          const v = Math.min(4, 1 + Math.abs(self.getVelocity()) / 600);
          G.to(drift, { timeScale: v, duration: 0.2, overwrite: true, onComplete: () => G.to(drift, { timeScale: 1, duration: 1.2 }) });
        },
      });
    }
  });

  // ---------- 4. Fond qui vit : zoom + assombrissement au scroll, poussière, rayons ----------
  if (!reduced && G && ST) {
    $$('.hero').forEach((hero) => {
      const bg = $('.hero__bg', hero);
      if (!bg) return;
      const rays = document.createElement('div');
      rays.className = 'hero__rays';
      rays.setAttribute('aria-hidden', 'true');
      bg.appendChild(rays);
      G.fromTo(bg, { scale: 1, filter: 'brightness(1)' }, {
        scale: 1.12, filter: 'brightness(0.42)', ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
      });
    });

    // poussière : un seul canvas, dessiné dans le fond de la partie affichée
    const cv = document.createElement('canvas');
    cv.className = 'dust';
    cv.setAttribute('aria-hidden', 'true');
    const ctx = cv.getContext('2d');
    let W = 0, H = 0, dots = [];
    const resize = () => {
      const r = Math.min(devicePixelRatio || 1, 2);
      W = innerWidth; H = innerHeight;
      cv.width = W * r; cv.height = H * r;
      cv.style.width = W + 'px'; cv.style.height = H + 'px';
      ctx.setTransform(r, 0, 0, r, 0, 0);
      const n = Math.round((W * H) / 22000);
      dots = Array.from({ length: n }, () => ({
        x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.6 + 0.3,
        vx: (Math.random() - 0.5) * 0.12, vy: -(Math.random() * 0.25 + 0.05),
        a: Math.random() * 0.5 + 0.15, red: Math.random() < 0.25,
      }));
    };
    const place = () => {
      const bg = activeView() && $('.hero__bg', activeView());
      if (bg && cv.parentNode !== bg) bg.appendChild(cv);
    };
    resize(); place();
    addEventListener('resize', resize);
    document.addEventListener('v3:modechange', place);
    const tick = () => {
      if (document.hidden) return;
      ctx.clearRect(0, 0, W, H);
      for (const d of dots) {
        d.x += d.vx; d.y += d.vy;
        if (d.y < -4) { d.y = H + 4; d.x = Math.random() * W; }
        if (d.x < -4) d.x = W + 4; else if (d.x > W + 4) d.x = -4;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = d.red ? `rgba(220,40,40,${d.a})` : `rgba(255,244,230,${d.a * 0.8})`;
        ctx.fill();
      }
    };
    G.ticker.add(tick);
  }
})();
