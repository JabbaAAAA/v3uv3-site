// Easter egg « La goutte » (24/11/2026) : dans la partie .WAV, une goutte de sang se détache du gros titre
// de temps en temps et tombe. L'attraper = 2 h de rec offertes : grand écran gagnant dans la DA du site,
// puis le gagnant laisse son prénom + un contact et l'e-mail part tout seul vers V3UV3@proton.me (FormSubmit).
// Tout est dans ce fichier (styles compris) : le retirer de index.html suffit à couper le jeu.
(function () {
  'use strict';
  const MAIL = 'V3UV3@proton.me';
  // FormSubmit : le tout premier envoi déclenche un e-mail d'activation à cliquer dans Proton.
  const ENDPOINT = 'https://formsubmit.co/ajax/' + MAIL;
  const KEY = 'v3uv3-goutte';
  const FIRST = [8000, 13000], NEXT = [22000, 34000]; // délai avant la 1re goutte, puis entre deux gouttes (ms)

  const T = {
    fr: { drop: 'Une goutte de sang', bravo: 'Bravo !', caught: 'Tu as attrapé la goutte.', prize: '2 h de rec offertes', where: 'au studio V3UV3.WAV, à Reims', ask: 'Laisse ton prénom et un moyen de te joindre : on te recontacte pour caler ta session.', name: 'Ton prénom', contact: 'Ton e-mail ou ton numéro', send: 'Je réclame ma session', sending: 'Envoi…', sent: "C'est envoyé ! On te recontacte très vite.", err: "L'envoi n'est pas passé. Écris-nous avec ton code :", missing: 'Indique ton prénom et un moyen de te joindre.', rules: 'Une session par personne, sur rendez-vous. Garde ton code.', close: 'Fermer' },
    en: { drop: 'A drop of blood', bravo: 'Bravo!', caught: 'You caught the drop.', prize: '2 hours of free recording', where: 'at the V3UV3.WAV studio in Reims, France', ask: "Leave your first name and a way to reach you: we'll get back to you to book your session.", name: 'Your first name', contact: 'Your email or phone number', send: 'Claim my session', sending: 'Sending…', sent: "Sent! We'll get back to you very soon.", err: "It didn't go through. Email us with your code:", missing: 'Please give your first name and a way to reach you.', rules: 'One session per person, by appointment. Keep your code.', close: 'Close' },
    'es-ES': { drop: 'Una gota de sangre', bravo: '¡Bravo!', caught: 'Has atrapado la gota.', prize: '2 h de grabación gratis', where: 'en el estudio V3UV3.WAV, en Reims (Francia)', ask: 'Déjanos tu nombre y cómo contactarte: te escribimos para fijar tu sesión.', name: 'Tu nombre', contact: 'Tu email o tu teléfono', send: 'Reclamar mi sesión', sending: 'Enviando…', sent: '¡Enviado! Te contactamos muy pronto.', err: 'No se ha enviado. Escríbenos con tu código:', missing: 'Indica tu nombre y cómo contactarte.', rules: 'Una sesión por persona, con cita previa. Guarda tu código.', close: 'Cerrar' },
    'es-419': { drop: 'Una gota de sangre', bravo: '¡Bravo!', caught: 'Atrapaste la gota.', prize: '2 h de grabación gratis', where: 'en el estudio V3UV3.WAV, en Reims (Francia)', ask: 'Déjanos tu nombre y cómo contactarte: te escribimos para agendar tu sesión.', name: 'Tu nombre', contact: 'Tu email o tu teléfono', send: 'Reclamar mi sesión', sending: 'Enviando…', sent: '¡Listo! Te contactamos muy pronto.', err: 'No se pudo enviar. Escríbenos con tu código:', missing: 'Indica tu nombre y cómo contactarte.', rules: 'Una sesión por persona, con cita previa. Guarda tu código.', close: 'Cerrar' },
    ru: { drop: 'Капля крови', bravo: 'Браво!', caught: 'Ты поймал каплю.', prize: '2 часа записи в подарок', where: 'в студии V3UV3.WAV в Реймсе (Франция)', ask: 'Оставь имя и контакт: мы свяжемся, чтобы назначить сессию.', name: 'Твоё имя', contact: 'Email или телефон', send: 'Забрать сессию', sending: 'Отправка…', sent: 'Отправлено! Скоро свяжемся.', err: 'Не отправилось. Напиши нам и укажи код:', missing: 'Укажи имя и способ связи.', rules: 'Одна сессия на человека, по записи. Сохрани код.', close: 'Закрыть' },
    ja: { drop: '血のしずく', bravo: 'おめでとう！', caught: 'しずくをキャッチした。', prize: 'レコーディング2時間 無料', where: 'ランス（フランス）のスタジオ V3UV3.WAV にて', ask: '名前と連絡先を残してね。セッションの日程を決めるために連絡します。', name: '名前', contact: 'メールまたは電話番号', send: 'セッションを受け取る', sending: '送信中…', sent: '送信しました！すぐに連絡します。', err: '送信できませんでした。コードを添えてメールしてください：', missing: '名前と連絡先を入力してね。', rules: 'お一人様1回、予約制。コードを保存してね。', close: '閉じる' },
    ko: { drop: '핏방울', bravo: '축하해!', caught: '핏방울을 잡았어.', prize: '녹음 2시간 무료', where: '프랑스 랭스의 V3UV3.WAV 스튜디오에서', ask: '이름과 연락처를 남겨 줘. 세션 일정을 잡으려고 연락할게.', name: '이름', contact: '이메일 또는 전화번호', send: '세션 받기', sending: '보내는 중…', sent: '보냈어! 곧 연락할게.', err: '전송에 실패했어. 코드와 함께 메일을 보내 줘:', missing: '이름과 연락처를 입력해 줘.', rules: '1인 1회, 예약제. 코드를 저장해 둬.', close: '닫기' },
    zh: { drop: '一滴血', bravo: '恭喜！', caught: '你接住了那滴血。', prize: '免费录音 2 小时', where: '地点：法国兰斯 V3UV3.WAV 录音室', ask: '留下你的名字和联系方式，我们会联系你安排录音。', name: '你的名字', contact: '邮箱或电话', send: '领取我的录音', sending: '发送中…', sent: '已发送！我们会尽快联系你。', err: '发送失败。请附上你的代码发邮件给我们：', missing: '请填写名字和联系方式。', rules: '每人限一次，需预约。请保存你的代码。', close: '关闭' }
  };
  const t = () => T[document.body.dataset.lang] || T.fr;
  const rand = ([a, b]) => a + Math.random() * (b - a);
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch (e) { return null; } };
  const save = (v) => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { /* navigation privée : tant pis */ } };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const css = document.createElement('style');
  css.textContent = `
  .goutte{position:absolute;z-index:6;width:56px;height:64px;padding:0;border:0;background:none;cursor:pointer;transform-origin:50% 0;-webkit-tap-highlight-color:transparent}
  .goutte svg{display:block;width:18px;height:26px;margin:0 auto;filter:drop-shadow(0 4px 6px rgba(0,0,0,.65))}
  .goutte:focus-visible{outline:2px solid #E5322D;outline-offset:2px;border-radius:50%}
  .goutte-win{position:fixed;inset:0;z-index:9600;display:flex;align-items:center;justify-content:center;background:#000;color:#f3efe9;overflow-y:auto;padding:78px 6vw 48px}
  .goutte-win>video{position:fixed;inset:0;width:100%;height:100%;object-fit:cover;object-position:67% 50%;opacity:.5;pointer-events:none}
  .goutte-win__flash{position:fixed;inset:0;background:radial-gradient(circle at 50% 45%,rgba(229,50,45,.85),rgba(120,0,0,.6) 45%,transparent 75%);pointer-events:none}
  .goutte-win__rec{position:fixed;top:20px;left:22px;display:flex;align-items:center;gap:10px;font-family:"V3UV3 Hand",sans-serif;font-size:1.15rem;letter-spacing:.08em;color:#E5322D}
  .goutte-win__rec i{width:12px;height:12px;border-radius:50%;background:#E5322D;box-shadow:0 0 12px #E5322D;animation:gBlink 1s steps(2) infinite}
  @keyframes gBlink{50%{opacity:0}}
  .goutte-win__x{position:fixed;top:12px;right:14px;width:46px;height:46px;border:1px solid rgba(243,239,233,.25);border-radius:50%;background:rgba(0,0,0,.4);color:#f3efe9;font-size:1.5rem;line-height:1;cursor:pointer}
  .goutte-win__in{position:relative;width:100%;max-width:760px}
  .goutte-win h2{margin:0;font-family:"V3UV3 Hand",sans-serif;font-weight:400;text-transform:uppercase;font-size:clamp(3.4rem,13vw,9rem);line-height:1;color:#E5322D;text-shadow:0 0 40px rgba(229,50,45,.45);transform-origin:50% 90%}
  .g-caught,.g-prize{font-family:"V3UV3 Hand",sans-serif;text-transform:uppercase;letter-spacing:.04em}
  .g-caught{font-size:clamp(1.2rem,3.4vw,2rem);margin-top:6px}
  .g-prize{font-size:clamp(2.1rem,7.4vw,4.8rem);line-height:1.12;margin:22px 0 4px;color:#fff}
  .g-where{color:rgba(243,239,233,.72);font-size:1rem}
  .g-code{display:inline-block;margin:20px 0 22px;font-family:"V3UV3 Hand",sans-serif;font-size:1.5rem;letter-spacing:.14em;background:#E5322D;color:#fff;padding:6px 18px;border-radius:999px;transform:rotate(-3deg)}
  .g-ask{max-width:520px;color:rgba(243,239,233,.85);margin-bottom:14px}
  .g-form{display:grid;gap:10px;max-width:460px}
  .g-form input{background:rgba(255,255,255,.07);border:1px solid rgba(243,239,233,.2);border-radius:12px;padding:13px 14px;color:#f3efe9;font:inherit;font-size:16px}
  .g-form input:focus{outline:none;border-color:#E5322D}
  .g-form button{background:#E5322D;color:#fff;border:0;border-radius:999px;padding:14px 22px;font-family:"V3UV3 Hand",sans-serif;text-transform:uppercase;letter-spacing:.06em;font-size:1.2rem;cursor:pointer}
  .g-form button:disabled{opacity:.6;cursor:wait}
  .g-msg{min-height:1.4em;margin-top:6px;font-size:.95rem}
  .g-msg a{color:#E5322D}
  .g-rules{margin-top:16px;font-size:.8rem;color:rgba(243,239,233,.55)}`;
  document.head.appendChild(css);

  // ---------- la goutte ----------
  const hero = document.getElementById('top-a');
  if (!hero) return;
  // l'intro du hero (motion.js) recrée l'image du titre : on la recherche à chaque fois
  const title = () => hero.querySelector('.title3d');
  let nextAt = Date.now() + rand(FIRST), falling = false, winEl = null;

  const canDrop = () => document.body.dataset.mode === 'wav' && !document.getElementById('landing') &&
    !document.hidden && !winEl && hero.getBoundingClientRect().bottom > innerHeight * 0.55 && title() && title().getBoundingClientRect().width > 0;

  function drop() {
    falling = true;
    const hr = hero.getBoundingClientRect(), tr = title().getBoundingClientRect();
    const x = tr.left - hr.left + tr.width * (0.12 + Math.random() * 0.76);
    const y = tr.top - hr.top + tr.height * 0.72;
    const floor = Math.min(hr.bottom, innerHeight) - hr.top - 70;
    const d = Math.max(120, floor - y);
    const g = document.createElement('button');
    g.type = 'button'; g.className = 'goutte'; g.setAttribute('aria-label', t().drop);
    g.style.left = (x - 28) + 'px'; g.style.top = y + 'px';
    g.innerHTML = '<svg viewBox="0 0 20 28" aria-hidden="true"><defs><linearGradient id="gG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff4a3d"/><stop offset=".55" stop-color="#c3140f"/><stop offset="1" stop-color="#5c0303"/></linearGradient></defs><path d="M10 0C10 0 0 13 0 18.5a10 10 0 0 0 20 0C20 13 10 0 10 0Z" fill="url(#gG)"/><ellipse cx="6.4" cy="17" rx="2.1" ry="3.6" fill="#fff" opacity=".55"/></svg>';
    hero.appendChild(g);
    const end = () => { g.remove(); falling = false; nextAt = Date.now() + rand(NEXT); };
    // pend sous le titre, se détache, tombe en accélérant, s'écrase en flaque qui s'efface
    const a = g.animate([
      { transform: 'translateY(0) scale(.25,.1)', offset: 0 },
      { transform: 'translateY(0) scale(1,1)', offset: 0.3, easing: 'cubic-bezier(.55,0,1,.45)' },
      { transform: `translateY(${d}px) scale(.85,1.25)`, offset: 0.82, easing: 'ease-out' },
      { transform: `translateY(${d + 8}px) scale(2.4,.2)`, opacity: 0.9, offset: 0.88 },
      { transform: `translateY(${d + 8}px) scale(2.6,.18)`, opacity: 0, offset: 1 }
    ], { duration: 3600, fill: 'forwards' });
    a.onfinish = end;
    g.addEventListener('pointerdown', (e) => {
      e.preventDefault(); a.pause();
      g.animate([{ transform: getComputedStyle(g).transform, opacity: 1 }, { transform: getComputedStyle(g).transform + ' scale(2.2)', opacity: 0 }], { duration: 220, fill: 'forwards' }).onfinish = end;
      win();
    }, { once: true });
    g.addEventListener('click', () => { if (falling && !winEl) win(); }); // clavier (Entrée / Espace)
  }
  setInterval(() => { if (!falling && Date.now() >= nextAt && canDrop()) drop(); }, 1000);

  // ---------- l'écran gagnant ----------
  function win() {
    if (winEl) return;
    let st = load();
    if (!st) { st = { code: 'REC-' + Math.random().toString(36).slice(2, 6).toUpperCase(), sent: false }; save(st); }
    const L = t(), code = st.code;
    winEl = document.createElement('div');
    winEl.className = 'goutte-win';
    winEl.setAttribute('role', 'dialog'); winEl.setAttribute('aria-modal', 'true'); winEl.setAttribute('aria-label', L.bravo + ' ' + L.prize);
    winEl.tabIndex = -1;
    winEl.innerHTML = `
      <video src="videos/goutte-baton.mp4" autoplay muted loop playsinline aria-hidden="true"></video>
      <div class="goutte-win__flash" aria-hidden="true"></div>
      <div class="goutte-win__rec" aria-hidden="true"><i></i>REC <span class="g-time">00:00:00</span></div>
      <button class="goutte-win__x" type="button" aria-label="${esc(L.close)}">×</button>
      <div class="goutte-win__in">
        <h2>${esc(L.bravo)}</h2>
        <div class="g-caught">${esc(L.caught)}</div>
        <div class="g-prize">${esc(L.prize)}</div>
        <div class="g-where">${esc(L.where)}</div>
        <div class="g-code">${code}</div>
        <p class="g-ask">${esc(L.ask)}</p>
        <form class="g-form" novalidate>
          <input name="prenom" autocomplete="given-name" placeholder="${esc(L.name)}" aria-label="${esc(L.name)}">
          <input name="contact" autocomplete="email" placeholder="${esc(L.contact)}" aria-label="${esc(L.contact)}">
          <button type="submit">${esc(L.send)}</button>
          <div class="g-msg" aria-live="polite"></div>
        </form>
        <div class="g-rules">${esc(L.rules)}</div>
      </div>`;
    document.body.appendChild(winEl);
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    winEl.focus();

    // entrée : flash rouge, titre en gelée, compteur REC qui file jusqu'à 2 h
    winEl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 250 });
    winEl.querySelector('.goutte-win__flash').animate([{ opacity: 1 }, { opacity: 0 }], { duration: 1100, fill: 'forwards' });
    winEl.querySelector('h2').animate([
      { transform: 'scale(.3,.3)' }, { transform: 'scale(1.18,.8)', offset: 0.3 }, { transform: 'scale(.9,1.12)', offset: 0.5 },
      { transform: 'scale(1.04,.97)', offset: 0.7 }, { transform: 'scale(1,1)' }
    ], { duration: 900, easing: 'ease-out' });
    const time = winEl.querySelector('.g-time'), t0 = performance.now();
    const two = (n) => String(n).padStart(2, '0');
    (function tick(now) {
      const p = Math.min(1, (now - t0) / 2600), s = Math.round(7200 * (1 - Math.pow(1 - p, 3)));
      time.textContent = `${two(Math.floor(s / 3600))}:${two(Math.floor(s / 60) % 60)}:${two(s % 60)}`;
      if (p < 1 && winEl) requestAnimationFrame(tick);
    })(t0);
    const v = winEl.querySelector('video'); v.muted = true; v.play().catch(() => {});

    const close = () => {
      if (!winEl) return;
      winEl.remove(); winEl = null;
      document.documentElement.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
    };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    winEl.querySelector('.goutte-win__x').addEventListener('click', close);

    const form = winEl.querySelector('.g-form'), msg = winEl.querySelector('.g-msg'), btn = form.querySelector('button');
    const mailto = (prenom, contact) => 'mailto:' + MAIL + '?subject=' + encodeURIComponent('Goutte attrapée : ' + code) +
      '&body=' + encodeURIComponent('Code : ' + code + '\nPrénom : ' + prenom + '\nContact : ' + contact + '\n');
    if (st.sent) { msg.textContent = L.sent; btn.disabled = true; }
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const prenom = form.prenom.value.trim().slice(0, 80), contact = form.contact.value.trim().slice(0, 120);
      if (!prenom || contact.length < 5) { msg.textContent = L.missing; return; }
      btn.disabled = true; btn.textContent = L.sending; msg.textContent = '';
      const data = {
        _subject: 'Goutte attrapée : ' + code + ' (2 h de rec offertes)', _template: 'table', _captcha: 'false',
        Code: code, 'Prénom': prenom, Contact: contact,
        'Gagné le': new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }), Langue: document.body.dataset.lang || 'fr'
      };
      if (contact.includes('@')) data._replyto = contact;
      try {
        const r = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) });
        const j = await r.json().catch(() => ({}));
        if (!r.ok || String(j.success) === 'false') throw new Error(j.message || r.status);
        st.sent = true; save(st);
        btn.textContent = L.send; msg.textContent = L.sent;
      } catch (err) {
        // repli : l'e-mail tout prêt dans la messagerie du gagnant, pour ne jamais perdre une réclamation
        btn.disabled = false; btn.textContent = L.send;
        msg.innerHTML = esc(L.err) + ' <a href="' + mailto(prenom, contact) + '">' + MAIL + '</a>';
      }
    });
  }
})();
