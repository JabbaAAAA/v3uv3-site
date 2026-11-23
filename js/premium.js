// Couche « premium » (23/11/2026) : scroll fluide, curseur maison, bandeaux défilants,
// fond qui vit au scroll (zoom + assombrissement, poussière, rayons).
// Tout se coupe si le visiteur a demandé « réduire les animations ».
(function () {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer: fine)').matches;
  const G = window.gsap, ST = window.ScrollTrigger;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const VIEW = { jpeg: 'visual', wav: 'audio', plugin: 'plugin' };
  const activeView = () => $('.view-' + VIEW[document.body.dataset.mode || 'jpeg']);

  // ---------- 1. Scroll fluide (Lenis) ----------
  let lenis = null;
  if (!reduced && window.Lenis && G && ST) {
    lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on('scroll', ST.update);
    G.ticker.add((t) => lenis.raf(t * 1000));
    G.ticker.lagSmoothing(0);
    // l'accueil et la visionneuse bloquent le scroll : Lenis s'arrête avec eux
    const sync = () => {
      const locked = document.body.classList.contains('pre-entry') || document.body.style.overflow === 'hidden';
      locked ? lenis.stop() : lenis.start();
    };
    new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ['class', 'style'] });
    sync();
    // changement de partie : on repart du haut, sans animation
    document.addEventListener('v3:modechange', () => lenis.scrollTo(0, { immediate: true, force: true }));
    // liens du menu (#section) : défilement doux
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a || a.getAttribute('href').length < 2) return;
      const target = document.querySelector(a.getAttribute('href'));
      if (!target || !target.offsetParent) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -90, duration: 1.2 });
    });
  }

  // ---------- 2. Curseur maison (souris uniquement) ----------
  if (finePointer && !reduced && G) {
    const cur = document.createElement('div');
    cur.className = 'cur';
    cur.setAttribute('aria-hidden', 'true');
    cur.innerHTML = '<span class="cur__label"></span>';
    document.body.appendChild(cur);
    const label = cur.firstChild;
    const xTo = G.quickTo(cur, 'x', { duration: 0.35, ease: 'power3' });
    const yTo = G.quickTo(cur, 'y', { duration: 0.35, ease: 'power3' });
    addEventListener('pointermove', (e) => { xTo(e.clientX); yTo(e.clientY); cur.classList.add('on'); }, { passive: true });
    document.addEventListener('pointerleave', () => cur.classList.remove('on'));
    document.addEventListener('pointerover', (e) => {
      const el = e.target.closest('.work[data-video], .work[data-img], a, button, [role="button"], input, textarea, label');
      cur.classList.remove('big', 'link');
      if (!el) return;
      if (el.matches('.work[data-video]')) { label.textContent = 'LIRE'; cur.classList.add('big'); }
      else if (el.matches('.work[data-img]')) { label.textContent = 'VOIR'; cur.classList.add('big'); }
      else cur.classList.add('link');
    });
  }

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
