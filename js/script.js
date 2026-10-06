/* SCROLL: fresh load / refresh -> top; Back button -> restore previous position */
const nav0 = performance.getEntriesByType('navigation')[0];
const isBack = !!(nav0 && nav0.type === 'back_forward');
const SKEY = 'sy:' + location.pathname;
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
const toTop = () => { if (!location.hash) window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); };
const saveScroll = () => sessionStorage.setItem(SKEY, String(window.scrollY));
addEventListener('scroll', () => { clearTimeout(saveScroll.t); saveScroll.t = setTimeout(saveScroll, 120); }, { passive: true });
addEventListener('pagehide', saveScroll);
document.addEventListener('click', e => { if (e.target.closest && e.target.closest('a')) saveScroll(); }, true);
function restoreScroll() {
  const y = parseInt(sessionStorage.getItem(SKEY) || '0', 10);
  [0, 80, 300, 700, 1400].forEach(t => setTimeout(() => window.scrollTo({ top: y, left: 0, behavior: 'instant' }), t));
}
if (isBack) { addEventListener('load', restoreScroll); addEventListener('DOMContentLoaded', restoreScroll); }
else {
  sessionStorage.removeItem(SKEY);
  toTop(); addEventListener('DOMContentLoaded', toTop);
  addEventListener('load', () => { toTop(); setTimeout(toTop, 60); });
}

/* PRELOADER: progress counter, rotating messages, split-curtain exit */
(function () {
  const pl = document.getElementById('preloader');
  if (!pl) return;
  const bar = document.getElementById('plBar'), pct = document.getElementById('plPct'), txt = document.getElementById('plText');
  const msgs = ['Preparing your care\u2026', 'Checking medicine stock\u2026', 'Verifying licensed pharmacists\u2026', 'Packing your wellness essentials\u2026', 'Almost ready\u2026'];
  const MIN = isBack ? 300 : 3000, MAX = isBack ? 1200 : 7000, start = Date.now();
  let done = false, loaded = document.readyState === 'complete', shown = 0;
  addEventListener('load', () => loaded = true);
  const timer = setInterval(() => {
    const t = Math.min(1, (Date.now() - start) / MIN);
    const target = loaded ? t * 100 : Math.min(t * 100, 92);
    shown += (target - shown) * .15 + .3;
    shown = Math.min(shown, target);
    const p = Math.round(shown);
    bar.style.width = p + '%'; pct.textContent = p + '%';
    txt.textContent = msgs[Math.min(msgs.length - 1, Math.floor(p / 21))];
    if ((loaded && p >= 100) || Date.now() - start > MAX) hide();
  }, 40);
  function hide() {
    if (done) return; done = true; clearInterval(timer);
    bar.style.width = '100%'; pct.textContent = '100%';
    setTimeout(() => {
      pl.classList.add('hide');
      document.body.classList.remove('is-loading');
      if (isBack) restoreScroll(); else toTop();
      setTimeout(() => pl.remove(), 1200);
    }, 300);
  }
})();

document.addEventListener('DOMContentLoaded', () => {
  const $ = id => document.getElementById(id);

  /* MOBILE DRAWER */
  const drawer = $('mobileDrawer'), overlay = $('drawerOverlay');
  const openMenu = () => { drawer.classList.add('active'); overlay.classList.add('active'); };
  const closeMenu = () => { drawer.classList.remove('active'); overlay.classList.remove('active'); };
  $('hamburger').addEventListener('click', openMenu);
  $('closeDrawer').addEventListener('click', closeMenu);
  overlay.addEventListener('click', closeMenu);
  document.querySelectorAll('.mobile-nav-link').forEach(l => l.addEventListener('click', closeMenu));

  /* BACK TO TOP + CURSOR GLOW */
  const tt = $('toTop'), ring = $('toTopRing'), glow = $('cursorGlow');
  addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    tt.classList.toggle('show', scrollY > 500);
    ring.style.strokeDashoffset = 132 - 132 * (max > 0 ? scrollY / max : 0);
  }, { passive: true });
  tt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  addEventListener('mousemove', e => { glow.classList.add('on'); glow.style.transform = `translate(${e.clientX}px,${e.clientY}px)`; }, { passive: true });
  document.querySelectorAll('.logo').forEach(l => l.addEventListener('click', e => { e.preventDefault(); closeMenu(); window.scrollTo({ top: 0, behavior: 'smooth' }); }));

  /* TOAST */
  function showToast(msg) {
    const t = $('toast'); t.textContent = msg; t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
  }

  /* CART */
  let cart = [];
  const cartDrawer = $('cartDrawer');
  const toggleCart = () => cartDrawer.classList.toggle('active');
  $('cartBtn').addEventListener('click', toggleCart);
  $('closeCart').addEventListener('click', toggleCart);

  function addToCart(id, title, price, image) {
    const ex = cart.find(i => i.id === id);
    if (ex) ex.qty++; else cart.push({ id, title, price, image, qty: 1 });
    updateCart();
    showToast(title + ' added to cart!');
  }
  function updateCart() {
    const n = cart.reduce((a, i) => a + i.qty, 0);
    const total = cart.reduce((a, i) => a + i.price * i.qty, 0);
    $('cartBadge').textContent = n; $('cartCount').textContent = n;
    $('cartTotalPrice').textContent = '$' + total.toFixed(2);
    $('cartItemsContainer').innerHTML = cart.length ? cart.map(i => `
      <div class="cart-item"><img src="${i.image}" alt="${i.title}">
      <div><h4>${i.title}</h4><p>$${i.price.toFixed(2)} x ${i.qty}</p></div></div>`).join('')
      : '<div class="empty-cart-msg">Your cart is currently empty.</div>';
    if (window.gsap) gsap.fromTo($('cartBadge'), { scale: 1.8 }, { scale: 1, duration: .5, ease: 'back.out(3)' });
  }
  document.querySelectorAll('.add-to-cart-btn').forEach(b => b.addEventListener('click', e => {
    const c = e.target.closest('.product-card');
    addToCart(c.dataset.id, c.dataset.title, parseFloat(c.dataset.price), c.dataset.image);
  }));
  document.querySelectorAll('.add-favorite').forEach(b => b.addEventListener('click', () => {
    const i = b.querySelector('i'); i.classList.toggle('fa-solid'); i.classList.toggle('fa-regular');
    i.style.color = i.classList.contains('fa-solid') ? '#FF8A65' : '';
  }));

  /* QUICK VIEW */
  const qv = $('quickViewModal'); let cur = null;
  const closeQV = () => { qv.classList.remove('active'); document.body.classList.remove('modal-open'); };
  document.querySelectorAll('.quick-view').forEach(b => b.addEventListener('click', e => {
    const c = e.target.closest('.product-card'); const d = c.dataset;
    cur = { id: d.id, title: d.title, price: parseFloat(d.price), image: d.image };
    $('qvImage').src = d.image; $('qvTitle').textContent = d.title;
    $('qvPrice').textContent = '$' + cur.price.toFixed(2); $('qvCategory').textContent = d.category;
    qv.classList.add('active'); document.body.classList.add('modal-open');
    if (window.gsap) gsap.fromTo('.quickview-card', { scale: .9, y: 30 }, { scale: 1, y: 0, duration: .5, ease: 'back.out(1.5)' });
  }));
  $('closeQuickView').addEventListener('click', closeQV);
  qv.addEventListener('click', e => { if (e.target === qv) closeQV(); });
  $('qvAddToCartBtn').addEventListener('click', () => { if (cur) { addToCart(cur.id, cur.title, cur.price, cur.image); closeQV(); } });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeQV(); });

  /* COUNTDOWN (keeps running across reloads) */
  let target = +localStorage.getItem('cnDealEnd');
  if (!target || target < Date.now()) { target = Date.now() + 2 * 864e5; localStorage.setItem('cnDealEnd', target); }
  function tick() {
    const d = Math.max(0, target - Date.now());
    const v = { days: Math.floor(d / 864e5), hours: Math.floor(d % 864e5 / 36e5), minutes: Math.floor(d % 36e5 / 6e4), seconds: Math.floor(d % 6e4 / 1e3) };
    for (const k in v) { const el = $(k); if (el) el.textContent = String(v[k]).padStart(2, '0'); }
  }
  tick(); setInterval(tick, 1000);
});

/* ANIMATIONS (GSAP) */
(function () {
  if (typeof gsap === 'undefined') return;
  if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const q = (s, c = document) => Array.from(c.querySelectorAll(s));
  const hoverCapable = matchMedia('(hover: hover)').matches;
  const isMobile = matchMedia('(max-width: 992px)').matches;

  /* Scroll progress + header shadow */
  const bar = document.createElement('div'); bar.className = 'scroll-progress'; document.body.appendChild(bar);
  const header = document.getElementById('header');
  function onScroll() {
    const max = document.documentElement.scrollHeight - innerHeight;
    gsap.set(bar, { scaleX: max > 0 ? scrollY / max : 0 });
    if (header) header.classList.toggle('scrolled', scrollY > 60);
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* Reveal on scroll (IntersectionObserver so content never stays hidden) */
  function reveal(targets, from, trigger, o) {
    o = o || {};
    const els = typeof targets === 'string' ? q(targets) : targets;
    const trg = typeof trigger === 'string' ? document.querySelector(trigger) : trigger;
    if (!els.length || !trg) return;
    els.forEach(e => e.classList.add('gsap-pending'));
    gsap.set(els, Object.assign({ opacity: 0 }, from));
    let played = false;
    function play() {
      if (played) return; played = true;
      gsap.to(els, { x: 0, y: 0, scale: 1, rotationX: 0, rotationY: 0, opacity: 1, duration: o.duration || .9, stagger: o.stagger || 0, ease: o.ease || 'power3.out',
        onComplete: () => els.forEach(e => { e.classList.remove('gsap-pending'); gsap.set(e, { clearProps: 'opacity,transform' }); }) });
    }
    const io = new IntersectionObserver(en => { if (en.some(e => e.isIntersecting)) { io.disconnect(); play(); } }, { threshold: .12 });
    io.observe(trg);
    setTimeout(() => { if (!played && trg.getBoundingClientRect().top < innerHeight) { io.disconnect(); play(); } }, 2500);
  }

  /* Hero intro after preloader */
  function heroIntro() {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from('.hero .badge', { y: 20, opacity: 0, duration: .6 })
      .from('.hero-title', { y: 50, opacity: 0, duration: .9 }, '-=.3')
      .from('.hero-subtitle', { y: 30, opacity: 0, duration: .7 }, '-=.5')
      .from('.hero-buttons .btn', { y: 20, opacity: 0, stagger: .12, duration: .6, clearProps: 'all' }, '-=.4')
      .from('.hero-stats .stat-item', { y: 20, opacity: 0, stagger: .1, duration: .6 }, '-=.3')
      .from('.hero-img', { clipPath: 'inset(0 100% 0 0 round 24px)', scale: 1.1, duration: 1.2, ease: 'power4.inOut', clearProps: 'clipPath' }, .1)
      .from('.hero-floating-card', { x: -40, opacity: 0, duration: .8, ease: 'back.out(1.6)' }, '-=.4');
    q('.stat-num').forEach(el => {
      const m = el.textContent.match(/(\d+)(.*)/); if (!m) return;
      const o = { v: 0 };
      gsap.to(o, { v: +m[1], duration: 1.8, delay: .8, ease: 'power2.out', onUpdate: () => el.textContent = Math.round(o.v) + m[2] });
    });
    gsap.to('.hero-floating-card', { y: -8, duration: 2.2, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 1.6 });
  }
  if (document.body.classList.contains('is-loading')) {
    const mo = new MutationObserver(() => {
      if (!document.body.classList.contains('is-loading')) { mo.disconnect(); heroIntro(); }
    });
    mo.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  } else heroIntro();

  if (window.ScrollTrigger) {
    gsap.to('.hero .image-wrapper', { yPercent: -6, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.rx-img img', { yPercent: -5, ease: 'none', scrollTrigger: { trigger: '.rx', start: 'top bottom', end: 'bottom top', scrub: true } });
  }

  q('.section-header').forEach(h => reveal(Array.from(h.children), { y: 30 }, h, { stagger: .12, duration: .8 }));
  reveal('.flip-card', { y: 60, rotationY: -60, transformPerspective: 1000 }, '.categories-grid', { stagger: .15 });
  q('.flip-card').forEach(c => c.addEventListener('click', e => {
    if (!hoverCapable && !e.target.closest('a')) c.classList.toggle('is-flipped');
  }));

  reveal('.product-card', { y: 70, rotationX: -75, transformPerspective: 900, transformOrigin: '50% 0%' }, '.products-grid', { stagger: .12 });
  if (hoverCapable) q('.product-card').forEach(card => {
    gsap.set(card, { transformPerspective: 900 });
    const rx = gsap.quickTo(card, 'rotationX', { duration: .4 }), ry = gsap.quickTo(card, 'rotationY', { duration: .4 });
    card.addEventListener('mousemove', e => {
      if (card.classList.contains('gsap-pending')) return;
      const r = card.getBoundingClientRect();
      ry(((e.clientX - r.left) / r.width - .5) * 8); rx((.5 - (e.clientY - r.top) / r.height) * 8);
    });
    card.addEventListener('mouseleave', () => { rx(0); ry(0); });
  });

  reveal('.service-card', { rotationY: 90, transformPerspective: 900, scale: .9 }, '.services-grid', { stagger: .12, ease: 'back.out(1.5)' });
  reveal('.rx-img', isMobile ? { y: 40 } : { x: -60 }, '.rx-wrapper', { duration: 1 });
  reveal('.rx-content > *', { y: 30 }, '.rx-wrapper', { stagger: .12 });
  reveal('.rx-steps li', { x: 40 }, '.rx-steps', { stagger: .18 });
  reveal('.deals-content', isMobile ? { y: 40 } : { x: -60 }, '.deals-wrapper', { duration: 1 });
  reveal('.deals-img-box', isMobile ? { y: 40 } : { x: 60 }, '.deals-wrapper', { duration: 1 });
  reveal('.reviews-grid > *', { y: 60, rotationX: -50, transformPerspective: 900, transformOrigin: '50% 0%' }, '.reviews-grid', { stagger: .15 });
  reveal('.tip', { rotationX: -80, y: 30, transformPerspective: 900, transformOrigin: '50% 0%' }, '.tips-grid', { stagger: .12 });
  reveal('.feature-box', { rotationY: -80, transformPerspective: 900 }, '.features-bar', { stagger: .1, duration: .7 });
  reveal('.cta-inner > *', { y: 40 }, '.cta', { stagger: .15 });
  reveal('.footer-top > *', { y: 30 }, '.footer', { stagger: .12, duration: .8 });

  const score = document.querySelector('.rating-score');
  if (score) {
    const o = { v: 0 };
    new IntersectionObserver((en, io) => {
      if (en[0].isIntersecting) { io.disconnect(); gsap.to(o, { v: 4.9, duration: 1.6, ease: 'power2.out', onUpdate: () => score.firstChild.nodeValue = o.v.toFixed(1) }); }
    }, { threshold: .3 }).observe(score);
  }

  /* Extra effects: floating icons, title underline draw, magnetic buttons, deal image parallax */
  q('.float-ic').forEach((el, i) => gsap.to(el, { y: i % 2 ? 22 : -22, rotation: i % 2 ? 18 : -18, duration: 3 + i * .5, yoyo: true, repeat: -1, ease: 'sine.inOut' }));
  q('.section-title').forEach(t => {
    gsap.set(t, { '--ul': 0 });
    new IntersectionObserver((en, io) => { if (en[0].isIntersecting) { io.disconnect(); gsap.to(t, { '--ul': 1, duration: 1, delay: .3, ease: 'power3.out' }); } }, { threshold: .6 }).observe(t);
  });
  if (hoverCapable) q('.btn-primary, .btn-light, .btn-ghost, .btn-outline').forEach(b => {
    const mx = gsap.quickTo(b, 'x', { duration: .4, ease: 'power3.out' }), my = gsap.quickTo(b, 'y', { duration: .4, ease: 'power3.out' });
    b.addEventListener('mousemove', e => { const r = b.getBoundingClientRect(); mx((e.clientX - r.left - r.width / 2) * .25); my((e.clientY - r.top - r.height / 2) * .35); });
    b.addEventListener('mouseleave', () => { mx(0); my(0); });
  });
  if (window.ScrollTrigger) gsap.to('.deals-img-box img', { yPercent: -6, scale: 1.06, ease: 'none', scrollTrigger: { trigger: '.deals', start: 'top bottom', end: 'bottom top', scrub: true } });
})();

/* Match header/footer colour to the logo's own background colour + image fallbacks */
(function () {
  const root = document.documentElement;
  const logo = new Image();
  logo.onload = () => {
    try {
      const c = document.createElement('canvas'); c.width = c.height = 4;
      const x = c.getContext('2d'); x.drawImage(logo, 0, 0, 4, 4);
      const [r, g, b, a] = x.getImageData(0, 0, 1, 1).data;
      if (a > 200) root.style.setProperty('--header-bg', `rgb(${r},${g},${b})`);
    } catch (e) { /* file:// or cross-origin: keeps default --header-bg from CSS */ }
  };
  logo.src = (document.querySelector('.logo-img') || {}).src || './assets/stackly_logo.webp';
  const ph = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="900" height="700"><rect width="100%" height="100%" fill="#DDF6F0"/><text x="50%" y="50%" font-size="64" text-anchor="middle" fill="#0E9F8E" font-family="sans-serif">+</text></svg>');
  document.addEventListener('error', e => { const t = e.target; if (t.tagName === 'IMG' && !t.classList.contains('logo-img') && !t.dataset.f) { t.dataset.f = 1; t.src = ph; } }, true);
})();