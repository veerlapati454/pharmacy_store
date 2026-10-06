/* MEDICINES PAGE EFFECTS */
(function () {
  const q = (s, c = document) => Array.from(c.querySelectorAll(s));
  const grid = document.getElementById('prodGrid'), empty = document.getElementById('prodEmpty');
  const cards = q('.product-card', grid);
  let filter = 'all', term = '', sort = 'pop';
  function apply(animate) {
    const shown = [];
    cards.sort((a, b) => sort === 'low' ? a.dataset.price - b.dataset.price : sort === 'high' ? b.dataset.price - a.dataset.price : b.dataset.pop - a.dataset.pop);
    cards.forEach(c => {
      grid.appendChild(c);
      const ok = (filter === 'all' || c.dataset.group === filter) && c.dataset.title.toLowerCase().includes(term);
      c.hidden = !ok; if (ok) shown.push(c);
    });
    empty.hidden = shown.length > 0;
    if (animate && window.gsap) gsap.fromTo(shown, { y: 40, rotationX: -60, opacity: 0, transformPerspective: 900, transformOrigin: '50% 0%' }, { y: 0, rotationX: 0, opacity: 1, duration: .6, stagger: .07, ease: 'power3.out', clearProps: 'transform,opacity' });
  }
  q('.chip').forEach(c => c.addEventListener('click', () => { q('.chip').forEach(x => x.classList.remove('active')); c.classList.add('active'); filter = c.dataset.filter; apply(true); }));
  document.getElementById('prodSearch').addEventListener('input', e => { term = e.target.value.trim().toLowerCase(); apply(true); });
  document.getElementById('sortSel').addEventListener('change', e => { sort = e.target.value; apply(true); });

  /* FAQ accordion */
  q('.faq-item').forEach(it => it.querySelector('.faq-q').addEventListener('click', () => {
    const open = it.classList.contains('open');
    q('.faq-item.open').forEach(o => { o.classList.remove('open'); if (window.gsap) gsap.to(o.querySelector('.faq-a'), { height: 0, duration: .35 }); });
    if (!open) { it.classList.add('open'); const a = it.querySelector('.faq-a'); if (window.gsap) gsap.to(a, { height: 'auto', duration: .4 }); else a.style.height = 'auto'; }
  }));

  /* COUNTERS (independent of GSAP; real number shown by default) */
  (function counters() {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    q('.cnt').forEach(el => {
      const to = +el.dataset.to, suf = el.dataset.suf || '';
      el.textContent = to + suf;
      if (reduce || !('IntersectionObserver' in window)) return;
      let started = false;
      const run = () => {
        if (started) return; started = true;
        const t0 = performance.now(), dur = 2000;
        (function tick(now) {
          const p = Math.min((now - t0) / dur, 1);
          el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))) + suf;
          if (p < 1) requestAnimationFrame(tick);
        })(t0);
      };
      new IntersectionObserver((en, io) => {
        if (en[0].isIntersecting) { io.disconnect(); run(); }
      }, { threshold: 0.2 }).observe(el);
    });
  })();

  if (typeof gsap === 'undefined' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
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

  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .from('.crumbs', { y: -20, opacity: 0, duration: .5 })
    .from('.page-hero .badge', { scale: .6, opacity: 0, duration: .5 }, '-=.2')
    .from('.ph-title', { y: 50, opacity: 0, duration: .9 }, '-=.2')
    .from('.ph-sub', { y: 30, opacity: 0, duration: .7 }, '-=.5')
    .from('.cat-search', { y: 30, scale: .9, opacity: 0, duration: .7, ease: 'back.out(1.6)', clearProps: 'all' }, '-=.4');

  q('.section-header').forEach((h, i) => { h.id = h.id || 'sh' + i; reveal('#' + h.id + ' > *', { y: 30 }, '#' + h.id, { s: .12, d: .8 }); });
  reveal('.chip', { y: 20, scale: .8 }, '#chips', { s: .07, d: .5, e: 'back.out(1.7)' });
  reveal('.sort-bar', { y: 20 }, '.sort-bar', { d: .6 });
  reveal('#prodGrid .product-card', { y: 70, rotationX: -75, transformPerspective: 900, transformOrigin: '50% 0%' }, '#prodGrid', { s: .1 });
  reveal('.split-img', mobile ? { y: 40 } : { x: -70, rotationY: 20, transformPerspective: 900 }, '.split', { d: 1 });
  reveal('.split-txt > *', { y: 30 }, '.split', { s: .12 });
  reveal('.brand-row', { x: 80 }, '.brand-rows', { s: .2, d: 1 });
  reveal('.brand-stats .stat', { y: 40, rotationX: -70, transformPerspective: 900 }, '.brand-stats', { s: .12, d: .8 });
  reveal('.deals-content', mobile ? { y: 40 } : { x: -60 }, '.deals-wrapper', { d: 1 });
  reveal('.deals-img-box', mobile ? { y: 40 } : { x: 60 }, '.deals-wrapper', { d: 1 });
  reveal('.reviews-grid > *', { y: 60, rotationX: -50, transformPerspective: 900, transformOrigin: '50% 0%' }, '.reviews-grid', { s: .15 });
  reveal('.faq-item', { x: -50 }, '.faq', { s: .12, d: .7 });
  reveal('.cta-inner > *', { y: 40 }, '.cta', { s: .15 });
  reveal('.footer-top > *', { y: 30 }, '.footer', { s: .12, d: .8 });

  if (window.ScrollTrigger) {
    gsap.to('.split-img img', { yPercent: -5, scale: 1.05, ease: 'none', scrollTrigger: { trigger: '.split', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.to('.deals-img-box img', { yPercent: -6, scale: 1.06, ease: 'none', scrollTrigger: { trigger: '.deals', start: 'top bottom', end: 'bottom top', scrub: true } });
  }
})();