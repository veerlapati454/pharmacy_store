/* SERVICES PAGE EFFECTS */
(function () {
  const q = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* service showcase tabs */
  const tabs = q('.sv-tab'), panels = q('.sv-panel'), stage = document.getElementById('svGrid'), bar = q('.sv-bar')[0];
  let cur = 0, paused = false, timer;
  function show(i, user) {
    cur = i; clearTimeout(timer);
    tabs.forEach((t, k) => t.classList.toggle('active', k === i));
    panels.forEach((p, k) => p.classList.toggle('active', k === i));
    if (window.gsap) {
      const p = panels[i];
      gsap.fromTo(p.querySelector('img'), { scale: 1.2, opacity: 0, rotationY: -12, transformPerspective: 900 }, { scale: 1, opacity: 1, rotationY: 0, duration: .9, ease: 'power3.out', clearProps: 'transform' });
      gsap.from(p.querySelector('.sv-float'), { y: 20, opacity: 0, delay: .5, duration: .5, clearProps: 'all' });
      gsap.from(p.querySelectorAll('.sv-info > *'), { y: 30, opacity: 0, duration: .6, stagger: .09, ease: 'power3.out', clearProps: 'all' });
      gsap.killTweensOf(bar); gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: 7, ease: 'none' });
    }
    schedule();
  }
  function schedule() { clearTimeout(timer); if (!paused) timer = setTimeout(() => show((cur + 1) % panels.length), 7000); }
  tabs.forEach((t, i) => t.addEventListener('click', () => show(i)));
  if (stage) { stage.addEventListener('mouseenter', () => { paused = true; clearTimeout(timer); if (window.gsap) gsap.getTweensOf(bar).forEach(x => x.pause()); });
    stage.addEventListener('mouseleave', () => { paused = false; show(cur); }); }
  schedule();

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
      .from('.sv-hero-btns .btn', { y: 30, scale: .9, opacity: 0, duration: .6, stagger: .12, ease: 'back.out(1.6)', clearProps: 'all' }, '-=.4');
  }
  if (document.body.classList.contains('is-loading')) {
    const mo = new MutationObserver(() => { if (!document.body.classList.contains('is-loading')) { mo.disconnect(); intro(); } });
    mo.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  } else intro();

  /* scroll reveals with 3D flips */
  q('.section-header').forEach((h, i) => { h.id = h.id || 'sh' + i; reveal('#' + h.id + ' > *', { y: 30 }, '#' + h.id, { s: .12, d: .8 }); });
  reveal('.sv-tab', { y: 20, scale: .8 }, '#svTabs', { s: .06, d: .5, e: 'back.out(1.7)' });
  reveal('.sv-stage', { y: 70, rotationX: -25, transformPerspective: 900, transformOrigin: '50% 0%' }, '#svGrid', { d: 1 });
  reveal('.stat', { y: 40, scale: .8 }, '.stats-grid', { s: .12, d: .7 });
  reveal('.split-img', mobile ? { y: 40 } : { x: -70, rotationY: 20, transformPerspective: 900 }, '.split', { d: 1 });
  reveal('.split-txt > *', { y: 30 }, '.split', { s: .12 });
  reveal('.perk', { rotationY: 90, scale: .85, transformPerspective: 900 }, '.perk-grid', { s: .1, d: .7, e: 'back.out(1.4)' });
  reveal('.step', { rotationX: -80, y: 30, transformPerspective: 900, transformOrigin: '50% 0%' }, '.steps', { s: .18, d: .8 });
  reveal('.faq-item', { x: -50 }, '.faq', { s: .12, d: .7 });
  reveal('.cta-inner > *', { y: 40 }, '.cta', { s: .15 });
  reveal('.footer-top > *', { y: 30 }, '.footer', { s: .12, d: .8 });

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