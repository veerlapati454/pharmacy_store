/* OFFERS PAGE EFFECTS */
(function () {
  const q = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* countdown to 3 days from start of today */
  const end = new Date(); end.setHours(0, 0, 0, 0); end.setDate(end.getDate() + 3);
  const pad = n => String(n).padStart(2, '0'), el = id => document.getElementById(id);
  function tick() {
    let d = Math.max(0, end - new Date()), s = Math.floor(d / 1000);
    el('cdD').textContent = pad(Math.floor(s / 86400)); el('cdH').textContent = pad(Math.floor(s % 86400 / 3600));
    el('cdM').textContent = pad(Math.floor(s % 3600 / 60)); el('cdS').textContent = pad(s % 60);
  }
  tick(); setInterval(tick, 1000);

  const toast = el('toast');
  function say(msg) { if (!toast) return; toast.textContent = msg; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2200); }

  /* flip cards: tap to flip, copy code */
  q('.of-card').forEach(c => {
    c.addEventListener('click', e => { if (e.target.closest('.of-code,.of-link')) return; c.classList.toggle('flipped'); });
    c.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); c.classList.toggle('flipped'); } });
  });
  q('.of-code').forEach(b => b.addEventListener('click', () => {
    const code = b.dataset.code;
    (navigator.clipboard ? navigator.clipboard.writeText(code) : Promise.reject()).then(() => say('Code ' + code + ' copied!'), () => say('Code: ' + code));
  }));
  const sub = el('subBtn'); if (sub) sub.addEventListener('click', () => { const i = sub.previousElementSibling; if (i.value.includes('@')) { say('Thanks for subscribing!'); i.value = ''; } else say('Please enter a valid email'); });

  /* FAQ */
  q('.faq-item').forEach(it => it.querySelector('.faq-q').addEventListener('click', () => {
    const open = it.classList.contains('open');
    q('.faq-item.open').forEach(o => { o.classList.remove('open'); if (window.gsap) gsap.to(o.querySelector('.faq-a'), { height: 0, duration: .35 }); });
    if (!open) { it.classList.add('open'); const a = it.querySelector('.faq-a'); if (window.gsap) gsap.to(a, { height: 'auto', duration: .4 }); else a.style.height = 'auto'; }
  }));

  if (typeof gsap === 'undefined' || matchMedia('(prefers-reduced-motion: reduce)').matches) { q('.cnt').forEach(e => e.textContent = e.dataset.to + e.dataset.suf); return; }
  if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  const mobile = matchMedia('(max-width: 992px)').matches;

  function reveal(sel, from, trig, o) {
    o = o || {};
    const els = q(sel), t = document.querySelector(trig || sel);
    if (!els.length || !t) return;
    gsap.set(els, Object.assign({ opacity: 0 }, from));
    let done = false;
    const play = () => { if (done) return; done = true;
      gsap.to(els, { x: 0, y: 0, scale: 1, rotationX: 0, rotationY: 0, opacity: 1, duration: o.d || .9, stagger: o.s || 0, ease: o.e || 'power3.out',
        onComplete: () => els.forEach(e => gsap.set(e, { clearProps: 'opacity,transform' })) }); };
    const io = new IntersectionObserver(en => { if (en.some(x => x.isIntersecting)) { io.disconnect(); play(); } }, { threshold: .12 });
    io.observe(t);
    setTimeout(() => { if (!done && t.getBoundingClientRect().top < innerHeight) { io.disconnect(); play(); } }, 2500);
  }

  function intro() {
    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .from('.crumbs', { y: -20, opacity: 0, duration: .5 })
      .from('.page-hero .badge', { scale: .6, opacity: 0, duration: .5 }, '-=.2')
      .from('.ph-title', { y: 50, opacity: 0, duration: .9 }, '-=.2')
      .from('.ph-sub', { y: 30, opacity: 0, duration: .7 }, '-=.5')
      .from('.cd div', { rotationX: -90, y: 30, opacity: 0, transformPerspective: 700, duration: .7, stagger: .12, ease: 'back.out(1.6)', clearProps: 'all' }, '-=.3');
  }
  if (document.body.classList.contains('is-loading')) {
    const mo = new MutationObserver(() => { if (!document.body.classList.contains('is-loading')) { mo.disconnect(); intro(); } });
    mo.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  } else intro();

  q('.section-header').forEach((h, i) => { h.id = h.id || 'sh' + i; reveal('#' + h.id + ' > *', { y: 30 }, '#' + h.id, { s: .12, d: .8 }); });
  reveal('.of-card', { y: 70, rotationX: -70, transformPerspective: 900, transformOrigin: '50% 0%' }, '#ofGrid', { s: .1 });
  reveal('.split-img', mobile ? { y: 40 } : { x: -70, rotationY: 20, transformPerspective: 900 }, '.split', { d: 1 });
  reveal('.split-txt > *', { y: 30 }, '.split', { s: .12 });
  reveal('.stat', { y: 40, scale: .8 }, '.stats-grid', { s: .12, d: .7 });
  reveal('.bn', { rotationY: 80, scale: .85, transformPerspective: 900 }, '#bnGrid', { s: .15, d: .9, e: 'back.out(1.3)' });
  reveal('.step', { rotationX: -80, y: 30, transformPerspective: 900, transformOrigin: '50% 0%' }, '.steps', { s: .18, d: .8 });
  reveal('.faq-item', { x: -50 }, '.faq', { s: .12, d: .7 });
  reveal('.cta-inner > *', { y: 40 }, '.cta', { s: .15 });
  reveal('.footer-top > *', { y: 30 }, '.footer', { s: .12, d: .8 });

  q('.cnt').forEach(e => {
    const o = { v: 0 };
    new IntersectionObserver((en, io) => { if (en[0].isIntersecting) { io.disconnect();
      gsap.to(o, { v: +e.dataset.to, duration: 2, ease: 'power2.out', onUpdate: () => e.textContent = Math.round(o.v) + e.dataset.suf }); } }, { threshold: .4 }).observe(e);
  });

  if (window.ScrollTrigger) {
    gsap.to('.split-img img', { yPercent: -5, scale: 1.05, ease: 'none', scrollTrigger: { trigger: '.split', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.fromTo('.steps-line', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.steps', start: 'top 80%', end: 'bottom 60%', scrub: true } });
    gsap.to('.page-hero .ph-inner', { yPercent: 8, opacity: .4, ease: 'none', scrollTrigger: { trigger: '.page-hero', start: 'bottom 70%', end: 'bottom top', scrub: true } });
  }
})();