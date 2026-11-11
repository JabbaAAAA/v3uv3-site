// Chorégraphie de scroll avancée (GSAP + ScrollTrigger), en plus du système
// .reveal déjà en place dans index.html (fondu/scale/cascade, inchangé).
// Coupé net si GSAP est hors-ligne ou si prefers-reduced-motion est actif —
// même garde que le reste du site (voir DESIGN.md, section "Mouvement").
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const GSAP_OK = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE_HOVER = matchMedia('(hover: hover) and (pointer: fine)').matches;

if (GSAP_OK && !REDUCED) {
    gsap.registerPlugin(ScrollTrigger);

    const MODE_SCOPE = { jpeg: '.view-visual', wav: '.view-audio', plugin: '.view-plugin' };
    const initedScopes = new Set();

    // ---------- découpe de texte en lignes masquées (équivalent maison de SplitText) ----------
    // découpe sur les <br> déjà posés par l'auteur (pas de mesure de largeur :
    // robuste au responsive, pas besoin de recalcul au resize)
    function splitLines(el) {
        if (el.dataset.split) return [...el.querySelectorAll('.lline')];
        const parts = el.innerHTML.split(/<br\s*\/?>/i);
        el.innerHTML = parts.map(p => `<span class="lmask"><span class="lline">${p}</span></span>`).join('');
        el.dataset.split = '1';
        return [...el.querySelectorAll('.lline')];
    }

    // le masque (.lmask{overflow:hidden}) ne sert qu'à cacher la ligne avant/pendant
    // qu'elle glisse en place ; une fois posée, il faut le relâcher sinon il rogne tout
    // ce qui dépasse la boîte de texte — en particulier le glow (text-shadow) du hero
    function releaseMasks(lines) {
        lines.forEach(l => { const m = l.parentElement; if (m) m.style.overflow = 'visible'; });
    }

    function revealHeading(el, { from = 'bottom', scrollTrigger = true } = {}) {
        const lines = splitLines(el);
        if (!lines.length) return;
        const x = from === 'left' ? -56 : from === 'right' ? 56 : 0;
        gsap.set(lines, { yPercent: from === 'bottom' ? 100 : 0, x, opacity: from === 'bottom' ? 1 : 0 });
        const vars = { yPercent: 0, x: 0, opacity: 1, duration: .9, ease: 'power3.out', stagger: .08, clearProps: 'transform', onComplete: () => releaseMasks(lines) };
        if (scrollTrigger) vars.scrollTrigger = { trigger: el.closest('section') || el, start: 'top 78%', toggleActions: 'play none none none' };
        gsap.to(lines, vars);
    }

    // ---------- reveal image : clip-path directionnel + léger zoom-settle ----------
    const CLIPS = {
        bottom: ['inset(100% 0% 0% 0%)', 'inset(0% 0% 0% 0%)'],
        top: ['inset(0% 0% 100% 0%)', 'inset(0% 0% 0% 0%)'],
        left: ['inset(0% 100% 0% 0%)', 'inset(0% 0% 0% 0%)'],
        right: ['inset(0% 0% 0% 100%)', 'inset(0% 0% 0% 0%)']
    };
    function revealImage(img, dir) {
        const [from, to] = CLIPS[dir];
        // clip-path seul (jamais transform/scale ici) : .work__media img a déjà un hover
        // CSS scale(1.04) et une parallaxe objectPosition — toucher transform casserait les deux
        gsap.fromTo(img, { clipPath: from }, {
            clipPath: to, duration: 1, ease: 'power3.out',
            scrollTrigger: { trigger: img.closest('.work, .plug, section') || img, start: 'top 85%', toggleActions: 'play none none none' }
        });
    }

    // ---------- micro-interactions : tilt de carte + boutons magnétiques ----------
    // ces deux fonctions pilotent `transform` en inline (via GSAP) : ça écrase en
    // permanence le retour visuel au clic existant (`:active{transform:scale(.96)}`,
    // DESIGN.md) dès le premier mousemove, une règle de spécificité CSS (inline bat
    // toujours la feuille de style). On le réintègre donc ici plutôt que de compter
    // sur le CSS pour ces éléments précis (bug corrigé le 2026-10-24).
    function pressFeedback(el) {
        el.addEventListener('mousedown', () => gsap.to(el, { scale: .96, duration: .12, ease: 'power2.out' }));
        el.addEventListener('mouseup', () => gsap.to(el, { scale: 1, duration: .12, ease: 'power2.out' }));
    }
    function cardTilt(el, { lift = -4, max = 7 } = {}) {
        if (!FINE_HOVER) return;
        gsap.set(el, { transformPerspective: 900 });
        const qx = gsap.quickTo(el, 'rotationY', { duration: .4, ease: 'power3.out' });
        const qy = gsap.quickTo(el, 'rotationX', { duration: .4, ease: 'power3.out' });
        const qz = gsap.quickTo(el, 'y', { duration: .4, ease: 'power3.out' });
        el.addEventListener('mousemove', e => {
            const r = el.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
            qx(px * max); qy(py * -max); qz(lift);
        });
        el.addEventListener('mouseleave', () => { qx(0); qy(0); qz(0); });
        pressFeedback(el);
    }
    function magnetic(el, strength = 12) {
        if (!FINE_HOVER) return;
        const qx = gsap.quickTo(el, 'x', { duration: .3, ease: 'power3.out' });
        const qy = gsap.quickTo(el, 'y', { duration: .3, ease: 'power3.out' });
        el.addEventListener('mousemove', e => {
            const r = el.getBoundingClientRect();
            qx((e.clientX - r.left - r.width / 2) / r.width * strength);
            qy((e.clientY - r.top - r.height / 2) / r.height * strength);
        });
        el.addEventListener('mouseleave', () => { qx(0); qy(0); });
        pressFeedback(el);
    }
    $$('.work, .price, .svc').forEach(el => cardTilt(el));
    $$('.cform button, .price .cta, .landing__btn').forEach(el => magnetic(el, 10));

    // ---------- parallaxe de profondeur sur le fond fixe du hero ----------
    // le fond reste position:fixed (choix documenté, DESIGN.md) : on ajoute juste une
    // dérive verticale bornée pendant que le hero défile sous lui, via --spy (même
    // technique que la bascule souris existante : objet JS + setProperty manuel, pour
    // ne jamais toucher à l'inline transform CSS déjà piloté par --prx/--pry/--ptx/--pty)
    $$('.hero').forEach(hero => {
        const media = hero.querySelector('.hero__bg img, .hero__bg video');
        if (!media) return;
        const state = { v: -34 };
        gsap.to(state, {
            v: 34, ease: 'none', onUpdate: () => media.style.setProperty('--spy', state.v.toFixed(1) + 'px'),
            scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true }
        });
    });

    // ---------- intro du hero actif : texte en cascade + reveal du fond ----------
    // déclenché par événement (pas par ScrollTrigger) car le hero est visible dès le
    // chargement, avant tout scroll — voir le dispatch 'v3:modechange' dans index.html
    const HERO_SEL = { jpeg: '#top', wav: '#top-a', plugin: '#top-p' };
    function playHeroIntro(mode) {
        const hero = $(HERO_SEL[mode]);
        if (!hero || hero.dataset.introPlayed) return;
        hero.dataset.introPlayed = '1';
        const h1 = hero.querySelector('h1'), badge = hero.querySelector('.badge'), roles = hero.querySelector('.roles'),
            lead = hero.querySelector('.lead'), scrolldown = hero.querySelector('.scrolldown'),
            bg = hero.querySelector('.hero__bg img, .hero__bg video');
        const lines = h1 ? splitLines(h1) : [];
        gsap.set(lines, { yPercent: 100 });
        gsap.set([badge, roles, lead, scrolldown].filter(Boolean), { opacity: 0, y: 16 });
        gsap.timeline()
            .to(badge, { opacity: 1, y: 0, duration: .5, ease: 'power2.out' }, 0)
            .to(lines, { yPercent: 0, duration: .9, ease: 'power3.out', stagger: .07, clearProps: 'transform', onComplete: () => releaseMasks(lines) }, .08)
            .to(roles, { opacity: 1, y: 0, duration: .5, ease: 'power2.out' }, .45)
            .to(lead, { opacity: 1, y: 0, duration: .5, ease: 'power2.out' }, .55)
            .to(scrolldown, { opacity: 1, y: 0, duration: .5, ease: 'power2.out' }, .68);
        if (bg) gsap.fromTo(bg, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'power3.out' });
    }
    // anti-doublon : setMode() et le clic du bouton d'accueil peuvent tous deux
    // émettre l'événement pour le même mode à quelques ms d'écart
    let lastHeroMode = null, lastHeroTime = 0;
    document.addEventListener('v3:modechange', e => {
        const mode = e.detail.mode, now = performance.now();
        if (mode === lastHeroMode && now - lastHeroTime < 150) return;
        lastHeroMode = mode; lastHeroTime = now;
        playHeroIntro(mode);
        initScopeMotion(mode);
    });

    // ---------- galerie horizontale pilotée par le scroll vertical (.v-works) ----------
    function initWorksGallery() {
        const section = $('#v-works'), track = section && section.querySelector('.works-grid');
        if (!section || !track) return;
        ScrollTrigger.matchMedia({
            '(min-width: 861px)': () => {
                gsap.set(track, { display: 'flex', flexWrap: 'nowrap', width: 'max-content' });
                gsap.set([...track.children], { flex: 'none', width: 'min(74vw,640px)' });
                const dist = () => Math.max(0, track.scrollWidth - window.innerWidth + 80);
                const tween = gsap.to(track, {
                    x: () => -dist(), ease: 'none',
                    scrollTrigger: { trigger: section, start: 'top top', end: () => '+=' + dist(), scrub: 1, pin: true, anticipatePin: 1, invalidateOnRefresh: true }
                });
                return () => { tween.scrollTrigger && tween.scrollTrigger.kill(); tween.kill(); };
            }
        });
    }

    // ---------- section épinglée : cascade de cartes (identité distincte .WAV / .PLUGIN) ----------
    function initCardCascade(sectionSel, mode) {
        const section = $(sectionSel);
        const cards = section && [...section.querySelectorAll('.svc')];
        if (!section || !cards || !cards.length) return;
        ScrollTrigger.matchMedia({
            '(min-width: 861px)': () => {
                let bars = null;
                if (mode === 'wav') {
                    // barres décoratives façon égaliseur — purement visuel, non branché sur
                    // un vrai signal audio (ne jamais les présenter comme un visualiseur réel)
                    bars = document.createElement('div');
                    bars.className = 'wavebars';
                    bars.setAttribute('aria-hidden', 'true');
                    for (let i = 0; i < 14; i++) bars.appendChild(document.createElement('span'));
                    section.prepend(bars);
                    const spans = [...bars.children];
                    gsap.to({ p: 0 }, {
                        p: 1, ease: 'none',
                        onUpdate() { const p = this.targets()[0].p; spans.forEach((s, i) => { s.style.height = (16 + Math.abs(Math.sin(p * Math.PI * 2 + i * .5)) * 40).toFixed(0) + 'px'; }); },
                        scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true }
                    });
                }
                gsap.set(cards, {
                    opacity: 0, y: 60, scale: mode === 'plugin' ? .82 : 1,
                    rotate: mode === 'plugin' ? (i => (i % 2 === 0 ? -6 : 6)) : 0
                });
                const tl = gsap.timeline({
                    scrollTrigger: { trigger: section, start: 'top top', end: '+=90%', scrub: 1, pin: true, anticipatePin: 1 }
                });
                cards.forEach((c, i) => tl.to(c, { opacity: 1, y: 0, scale: 1, rotate: 0, duration: .5, ease: mode === 'plugin' ? 'back.out(1.2)' : 'power2.out' }, i * .3));
                return () => { bars && bars.remove(); gsap.set(cards, { clearProps: 'all' }); tl.scrollTrigger && tl.scrollTrigger.kill(); tl.kill(); };
            }
        });
    }

    // ---------- init par univers, au moment où il devient visible (jamais avant : un
    // ScrollTrigger mesuré pendant que sa section est display:none donnerait une
    // position fausse — même piège déjà documenté pour l'IntersectionObserver des
    // .reveal, voir DESIGN.md "Mouvement") ----------
    function initScopeMotion(mode) {
        if (initedScopes.has(mode)) { ScrollTrigger.refresh(); return; }
        initedScopes.add(mode);
        const root = $(MODE_SCOPE[mode]);
        if (!root) return;
        // le h1 du hero n'est PAS traité ici : playHeroIntro() s'en occupe déjà en
        // entier (lignes + badge + roles + lead + fond), un doublon ici ferait tourner
        // deux animations concurrentes sur les mêmes lignes (bug corrigé le 2026-10-24)
        let dir = 0;
        root.querySelectorAll('.about-grid h2, .sec-head h2').forEach(h => { revealHeading(h, { from: dir % 2 === 0 ? 'left' : 'right' }); dir++; });
        root.querySelectorAll('.contact h2').forEach(h => revealHeading(h, { from: 'bottom' }));
        root.querySelectorAll('.work__media img').forEach((img, i) => revealImage(img, ['bottom', 'left', 'right', 'top'][i % 4]));
        if (mode === 'jpeg') initWorksGallery();
        if (mode === 'wav') initCardCascade('#a-services', 'wav');
        if (mode === 'plugin') initCardCascade('#p-info', 'plugin');
        ScrollTrigger.refresh();
    }

    initScopeMotion(document.body.dataset.mode || 'jpeg');
}
