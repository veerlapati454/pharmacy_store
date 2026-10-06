/* CATEGORIES PAGE EFFECTS */
(function () {
  const q = (s, c = document) => Array.from(c.querySelectorAll(s));
  const items = q('.cat-item'), empty = document.getElementById('catEmpty');
  let filter = 'all', term = '';
  function apply() {
    let shown = [];
    items.forEach(it => {
      const ok = (filter === 'all' || it.dataset.group === filter) && it.dataset.name.toLowerCase().includes(term);
      it.hidden = !ok; if (ok) shown.push(it);
    });
    empty.hidden = shown.length > 0;
    if (window.gsap) gsap.fromTo(shown, { y: 40, rotationY: -50, opacity: 0, transformPerspective: 900 }, { y: 0, rotationY: 0, opacity: 1, duration: .6, stagger: .07, ease: 'power3.out', clearProps: 'transform,opacity' });
  }
  q('.chip').forEach(c => c.addEventListener('click', () => {
    q('.chip').forEach(x => x.classList.remove('active')); c.classList.add('active'); filter = c.dataset.filter; apply();
  }));
  const s = document.getElementById('catSearch');
  if (s) s.addEventListener('input', () => { term = s.value.trim().toLowerCase(); apply(); });

  /* FAQ accordion */
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
    els.forEach(e => e.classList.add('gsap-pending'));
    gsap.set(els, Object.assign({ opacity: 0 }, from));
    let done = false;
    const play = () => { if (done) return; done = true;
      gsap.to(els, { x: 0, y: 0, scale: 1, rotationX: 0, rotationY: 0, opacity: 1, duration: o.d || .9, stagger: o.s || 0, ease: o.e || 'power3.out',
        onComplete: () => els.forEach(e => { e.classList.remove('gsap-pending'); gsap.set(e, { clearProps: 'opacity,transform' }); }) }); };
    const io = new IntersectionObserver(en => { if (en.some(x => x.isIntersecting)) { io.disconnect(); play(); } }, { threshold: .12 });
    io.observe(t);
    setTimeout(() => { if (!done && t.getBoundingClientRect().top < innerHeight) { io.disconnect(); play(); } }, 2500);
  }

  /* hero intro (after preloader) */
  function intro() {
    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .from('.crumbs', { y: -20, opacity: 0, duration: .5 })
      .from('.page-hero .badge', { scale: .6, opacity: 0, duration: .5 }, '-=.2')
      .from('.ph-title', { y: 50, opacity: 0, duration: .9 }, '-=.2')
      .from('.ph-sub', { y: 30, opacity: 0, duration: .7 }, '-=.5')
      .from('.cat-search', { y: 30, scale: .9, opacity: 0, duration: .7, ease: 'back.out(1.6)', clearProps: 'all' }, '-=.4');
  }
  if (document.body.classList.contains('is-loading')) {
    const mo = new MutationObserver(() => { if (!document.body.classList.contains('is-loading')) { mo.disconnect(); intro(); } });
    mo.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  } else intro();

  /* scroll reveals with 3D flips */
  q('.section-header').forEach((h, i) => { h.id = h.id || 'sh' + i; reveal('#' + h.id + ' > *', { y: 30 }, '#' + h.id, { s: .12, d: .8 }); });
  reveal('.chip', { y: 20, scale: .8 }, '#chips', { s: .07, d: .5, e: 'back.out(1.7)' });
  reveal('.cat-item', { y: 70, rotationX: -70, transformPerspective: 900, transformOrigin: '50% 0%' }, '#catGrid', { s: .1 });
  reveal('.concern', { rotationY: 90, scale: .85, transformPerspective: 900 }, '.concern-grid', { s: .08, d: .7, e: 'back.out(1.4)' });
  reveal('.stat', { y: 40, scale: .8 }, '.stats-grid', { s: .12, d: .7 });
  reveal('.split-img', mobile ? { y: 40 } : { x: -70, rotationY: 20, transformPerspective: 900 }, '.split', { d: 1 });
  reveal('.split-txt > *', { y: 30 }, '.split', { s: .12 });
  reveal('.step', { rotationX: -80, y: 30, transformPerspective: 900, transformOrigin: '50% 0%' }, '.steps', { s: .18, d: .8 });
  reveal('.faq-item', { x: -50 }, '.faq', { s: .12, d: .7 });
  reveal('.cta-inner > *', { y: 40 }, '.cta', { s: .15 });
  reveal('.footer-top > *', { y: 30 }, '.footer', { s: .12, d: .8 });

  /* counters */
  q('.cnt').forEach(el => {
    const o = { v: 0 };
    new IntersectionObserver((en, io) => { if (en[0].isIntersecting) { io.disconnect();
      gsap.to(o, { v: +el.dataset.to, duration: 2, ease: 'power2.out', onUpdate: () => el.textContent = Math.round(o.v) + el.dataset.suf }); } }, { threshold: .4 }).observe(el);
  });

  if (window.ScrollTrigger) {
    gsap.to('.split-img img', { yPercent: -5, scale: 1.05, ease: 'none', scrollTrigger: { trigger: '.split', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.fromTo('.steps-line', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.steps', start: 'top 80%', end: 'bottom 60%', scrub: true } });
    gsap.to('.page-hero .ph-inner', { yPercent: 8, opacity: .4, ease: 'none', scrollTrigger: { trigger: '.page-hero', start: 'bottom 70%', end: 'bottom top', scrub: true } });
  }
})();