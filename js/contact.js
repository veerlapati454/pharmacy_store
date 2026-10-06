/* CONTACT PAGE: validation + effects */
(function () {
  const q = (s, c = document) => Array.from(c.querySelectorAll(s));
  const $ = id => document.getElementById(id);
  const form = $('contactForm'), ok = $('cfOk');
  const toast = $('toast');
  const say = m => { if (!toast) return; toast.textContent = m; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2400); };

  /* validators return an error string, or '' when valid */
  const rules = {
    name: v => !v.trim() ? 'Please enter your name.' : !/^[A-Za-z]+(?: [A-Za-z]+)*$/.test(v.trim()) ? 'Name can contain letters and spaces only.' : v.trim().length < 3 ? 'Name must be at least 3 letters.' : '',
    email: v => !v.trim() ? 'Please enter your email.' : !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/.test(v.trim()) ? 'Enter a valid email, e.g. you@example.com.' : '',
    phone: v => !v ? 'Please enter your mobile number.' : !/^\d{10}$/.test(v) ? 'Mobile number must be exactly 10 digits.' : !/^[6-9]/.test(v) ? 'Mobile number must start with 6, 7, 8 or 9.' : '',
    subject: v => v ? '' : 'Please select a subject.',
    order: v => !v.trim() || /^[A-Za-z]{2,5}-?\d{3,10}$/.test(v.trim()) ? '' : 'Use a format like STK-10245.',
    pref: v => v ? '' : 'Please choose how we should contact you.',
    message: v => !v.trim() ? 'Please write your message.' : v.trim().length < 10 ? 'Message must be at least 10 characters.' : '',
    consent: () => $('consent').checked ? '' : 'Please tick the box to continue.'
  };
  function check(id, quiet) {
    const box = form.querySelector('[data-f="' + id + '"]'), el = $(id);
    const msg = rules[id](id === 'consent' ? '' : el.value);
    box.classList.toggle('invalid', !!msg);
    box.classList.toggle('valid', !msg && id !== 'consent' && el.value.trim() !== '');
    box.querySelector('.err').textContent = msg;
    return !msg;
  }

  /* input filters: block invalid characters while typing */
  const clean = (id, re, fn) => $(id).addEventListener('input', e => { let v = e.target.value.replace(re, ''); if (fn) v = fn(v); if (v !== e.target.value) e.target.value = v; });
  clean('name', /[^A-Za-z ]/g, v => v.replace(/^ +/, '').replace(/ {2,}/g, ' '));
  clean('phone', /\D/g);
  clean('order', /[^A-Za-z0-9-]/g, v => v.toUpperCase());
  clean('email', /\s/g, v => v.toLowerCase());
  $('message').addEventListener('input', e => { $('count').textContent = e.target.value.length + ' / 500'; });

  Object.keys(rules).forEach(id => {
    const el = $(id), ev = (el.tagName === 'SELECT' || el.type === 'checkbox') ? 'change' : 'input';
    el.addEventListener('blur', () => check(id));
    el.addEventListener(ev, () => { if (el.closest('.fld').classList.contains('invalid') || ev === 'change') check(id); });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const bad = Object.keys(rules).filter(id => !check(id));
    if (bad.length) {
      const first = $(bad[0]); first.focus({ preventScroll: true }); first.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (window.gsap) gsap.fromTo(bad.map(id => form.querySelector('[data-f="' + id + '"]')), { x: -8 }, { x: 0, duration: .5, ease: 'elastic.out(1,.3)', clearProps: 'transform' });
      return say('Please fix the highlighted fields.');
    }
    say('Message sent! Redirecting...');
    setTimeout(() => { window.location.href = './404.html'; }, 700);
  });
  $('again').addEventListener('click', () => { form.reset(); q('.fld', form).forEach(f => { f.classList.remove('valid', 'invalid'); f.querySelector('.err').textContent = ''; }); $('count').textContent = '0 / 500'; ok.hidden = true; form.hidden = false; });

  /* FAQ */
  q('.faq-item').forEach(it => it.querySelector('.faq-q').addEventListener('click', () => {
    const open = it.classList.contains('open');
    q('.faq-item.open').forEach(o => { o.classList.remove('open'); if (window.gsap) gsap.to(o.querySelector('.faq-a'), { height: 0, duration: .35 }); });
    if (!open) { it.classList.add('open'); const a = it.querySelector('.faq-a'); if (window.gsap) gsap.to(a, { height: 'auto', duration: .4 }); else a.style.height = 'auto'; }
  }));

  if (typeof gsap === 'undefined' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
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
      .from('.ph-inner .btn', { y: 30, scale: .9, opacity: 0, duration: .6, ease: 'back.out(1.6)', clearProps: 'all' }, '-=.4');
  }
  if (document.body.classList.contains('is-loading')) {
    const mo = new MutationObserver(() => { if (!document.body.classList.contains('is-loading')) { mo.disconnect(); intro(); } });
    mo.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  } else intro();

  q('.section-header').forEach((h, i) => { h.id = h.id || 'sh' + i; reveal('#' + h.id + ' > *', { y: 30 }, '#' + h.id, { s: .12, d: .8 }); });
  reveal('.ci', { rotationY: 90, scale: .85, transformPerspective: 900 }, '#ciGrid', { s: .12, d: .8, e: 'back.out(1.4)' });
  reveal('.cf-wrap', { y: 70, rotationX: -20, transformPerspective: 900, transformOrigin: '50% 0%' }, '#cfWrap', { d: 1 });
  reveal('.map-box', { y: 60, scale: .92 }, '#mapBox', { d: 1 });
  reveal('.split-img', mobile ? { y: 40 } : { x: -70, rotationY: 20, transformPerspective: 900 }, '.split', { d: 1 });
  reveal('.split-txt > *', { y: 30 }, '.split', { s: .12 });
  reveal('.step', { rotationX: -80, y: 30, transformPerspective: 900, transformOrigin: '50% 0%' }, '.steps', { s: .18, d: .8 });
  reveal('.faq-item', { x: -50 }, '.faq', { s: .12, d: .7 });
  reveal('.cta-inner > *', { y: 40 }, '.cta', { s: .15 });
  reveal('.footer-top > *', { y: 30 }, '.footer', { s: .12, d: .8 });
  if (window.ScrollTrigger) {
    gsap.fromTo('.steps-line', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.steps', start: 'top 80%', end: 'bottom 60%', scrub: true } });
    gsap.to('.page-hero .ph-inner', { yPercent: 8, opacity: .4, ease: 'none', scrollTrigger: { trigger: '.page-hero', start: 'bottom 70%', end: 'bottom top', scrub: true } });
  }
})();