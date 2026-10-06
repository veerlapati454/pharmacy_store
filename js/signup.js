// STACKLY PHARMACY - signup.js
// Live input filtering, validation, password strength meter, show/hide, success burst + GSAP.
(function () {
  'use strict';
  var form = document.getElementById('signupForm');
  if (!form) return;

  var LOGIN_PAGE = './login.html';
  var EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;
  var $ = function (id) { return document.getElementById(id); };
  var els = { username: $('username'), fullName: $('fullName'), email: $('email'), phone: $('phone'),
              password: $('password'), confirmPassword: $('confirmPassword'), agreeTerms: $('agreeTerms') };
  var btn = $('signupBtn'), meter = $('meter'), meterText = $('meterText');
  var animate = typeof window.gsap !== 'undefined' && !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

  [].forEach.call(document.querySelectorAll('.cnt'), function (c) { c.textContent = c.dataset.to + c.dataset.suf; });

  /* hints */
  var hints = {};
  [].forEach.call(form.querySelectorAll('.hint'), function (h) { hints[h.getAttribute('data-for')] = { el: h, text: h.textContent }; });
  function wrapOf(el) { return el.closest('.field') || el.closest('.terms-wrap'); }
  function setState(el, msg) {
    var w = wrapOf(el), h = hints[el.id], ok = !msg;
    w.classList.toggle('invalid', !ok);
    w.classList.toggle('valid', ok && el.type !== 'checkbox' && el.value !== '');
    el.setAttribute('aria-invalid', ok ? 'false' : 'true');
    h.el.textContent = ok ? h.text : msg;
    return ok;
  }

  /* rules: return an error message, or '' when valid */
  var rules = {
    username: function () {
      var v = els.username.value.trim();
      if (!v) return 'Please choose a username.';
      return /^[A-Za-z]{2,24}$/.test(v) ? '' : 'Username must be 2\u201324 letters, no numbers or spaces.';
    },
    fullName: function () {
      var v = els.fullName.value.trim();
      if (!v) return 'Please enter your full name.';
      return (/^[A-Za-z]+( [A-Za-z]+)*$/.test(v) && v.replace(/ /g, '').length >= 2) ? '' : 'Use letters only (at least 2).';
    },
    email: function () {
      var v = els.email.value.trim();
      if (!v) return 'Please enter your email address.';
      return EMAIL_RE.test(v) ? '' : 'Please enter a valid email, e.g. name@example.com.';
    },
    phone: function () {
      var v = els.phone.value;
      if (!v) return 'Please enter your mobile number.';
      if (!/^\d{10}$/.test(v)) return 'Mobile number must be exactly 10 digits.';
      return /^[6-9]/.test(v) ? '' : 'Mobile number must start with 6, 7, 8 or 9.';
    },
    password: function () {
      if (!els.password.value) return 'Please create a password.';
      return els.password.value.length >= 6 ? '' : 'Password must be at least 6 characters.';
    },
    confirmPassword: function () {
      if (!els.confirmPassword.value) return 'Please re-enter your password.';
      return els.confirmPassword.value === els.password.value ? '' : 'Passwords do not match.';
    },
    agreeTerms: function () { return els.agreeTerms.checked ? '' : 'You must accept the Terms and Conditions to sign up.'; }
  };
  function check(name) { return setState(els[name], rules[name]()); }

  Object.keys(els).forEach(function (name) {
    var el = els[name];
    el.addEventListener('blur', function () { check(name); });
    el.addEventListener(el.type === 'checkbox' ? 'change' : 'input', function () {
      if (wrapOf(el).classList.contains('invalid')) check(name);
      if (name === 'password' && els.confirmPassword.value) check('confirmPassword');
    });
  });

  /* live filtering */
  function restrict(el, re, tidy) {
    el.addEventListener('input', function () {
      var clean = el.value.replace(re, '');
      if (tidy) clean = tidy(clean);
      if (clean !== el.value) el.value = clean;
    });
  }
  restrict(els.username, /[^A-Za-z]/g);
  restrict(els.fullName, /[^A-Za-z ]/g, function (s) { return s.replace(/^ +/, '').replace(/ {2,}/g, ' '); });
  restrict(els.phone, /\D/g);
  restrict(els.email, /\s/g, function (s) { return s.toLowerCase(); });
  els.fullName.addEventListener('blur', function () {
    els.fullName.value = els.fullName.value.trim().toLowerCase().replace(/\b[a-z]/g, function (c) { return c.toUpperCase(); });
    check('fullName');
  });

  /* show / hide password */
  [].forEach.call(form.querySelectorAll('.eye'), function (eye) {
    eye.addEventListener('click', function () {
      var input = $(eye.getAttribute('data-target')), show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      eye.innerHTML = '<i class="fa-solid ' + (show ? 'fa-eye-slash' : 'fa-eye') + '"></i>';
      eye.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
      input.focus();
    });
  });

  /* strength meter */
  var labels = ['', 'Weak', 'Fair', 'Good', 'Strong'], colors = ['', '#e5484d', '#b9770e', '#4a9d55', '#2fae66'];
  function score(p) {
    var s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 10) s++;
    if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++;
    if (/\d/.test(p) && /[^A-Za-z0-9]/.test(p)) s++;
    return Math.max(1, s);
  }
  els.password.addEventListener('input', function () {
    var s = els.password.value ? score(els.password.value) : 0;
    meter.setAttribute('data-s', s);
    meterText.textContent = labels[s];
    meterText.style.color = colors[s];
  });

  /* pill / cross burst on success */
  function burst() {
    var r = btn.getBoundingClientRect(), icons = ['fa-pills', 'fa-capsules', 'fa-plus', 'fa-heart-pulse'];
    for (var i = 0; i < 12; i++) {
      var n = document.createElement('i');
      n.className = 'burst fa-solid ' + icons[i % icons.length];
      n.style.left = r.left + r.width / 2 + 'px'; n.style.top = r.top + r.height / 2 + 'px';
      document.body.appendChild(n);
      gsap.to(n, { x: (Math.random() - .5) * 320, y: -60 - Math.random() * 180, rotation: (Math.random() - .5) * 160, opacity: 0,
        scale: .6 + Math.random(), duration: 1.1, ease: 'power2.out', onComplete: (function (el) { return function () { el.remove(); }; })(n) });
    }
  }

  /* submit */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var firstBad = null;
    Object.keys(els).forEach(function (name) { if (!check(name) && !firstBad) firstBad = els[name]; });
    if (firstBad) {
      var w = wrapOf(firstBad);
      if (animate) gsap.fromTo(w, { x: -10 }, { x: 0, duration: .7, ease: 'elastic.out(1,.25)', clearProps: 'transform' });
      else { w.classList.remove('shake'); void w.offsetWidth; w.classList.add('shake'); }
      firstBad.focus();
      return;
    }
    btn.disabled = true; btn.classList.add('loading');
    try {
      localStorage.setItem('registeredUser', JSON.stringify({
        username: els.username.value.trim(), fullName: els.fullName.value.trim(),
        email: els.email.value.trim(), phone: els.phone.value }));
    } catch (err) {}
    setTimeout(function () {
      btn.classList.remove('loading'); btn.classList.add('ok');
      if (animate) burst();
      setTimeout(function () { window.location.href = LOGIN_PAGE; }, 1100);
    }, 800);
  });

  /* ================= GSAP ================= */
  if (!animate) return;
  var path = document.getElementById('ecgPath'), len = path.getTotalLength();
  gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });

  var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.from('.lg-logo', { y: -20, opacity: 0, duration: .6 })
    .from('.tag', { y: 20, opacity: 0, duration: .5 }, '-=.3')
    .from('.ln > span', { yPercent: 110, duration: .9, stagger: .15 }, '-=.2')
    .from('.lg-brand p', { y: 20, opacity: 0, duration: .6 }, '-=.5')
    .from('.perks li', { x: -26, opacity: 0, duration: .6, stagger: .12 }, '-=.35')
    .from('.lg-stats > div', { y: 20, opacity: 0, duration: .5, stagger: .1 }, '-=.4')
    .from('.lg-card', { y: 50, opacity: 0, scale: .96, duration: .9, ease: 'power4.out', clearProps: 'transform' }, .2)
    .from('.lg-card > *', { y: 18, opacity: 0, duration: .5, stagger: .07, clearProps: 'transform' }, .5)
    .from('.fl', { scale: 0, opacity: 0, duration: .7, stagger: .1, ease: 'back.out(2)' }, .4)
    .from('.orb', { scale: 0, rotation: -120, opacity: 0, duration: 1.1, ease: 'back.out(1.5)' }, .3);

  [].forEach.call(document.querySelectorAll('.cnt'), function (c) {
    var o = { v: 0 };
    c.textContent = '0' + c.dataset.suf;
    gsap.to(o, { v: +c.dataset.to, duration: 2, delay: 1, ease: 'power2.out', onUpdate: function () { c.textContent = Math.round(o.v) + c.dataset.suf; } });
  });

  gsap.timeline({ repeat: -1, repeatDelay: .3, delay: 1 }).set(path, { strokeDashoffset: len }).to(path, { strokeDashoffset: 0, duration: 2.2, ease: 'none' });
  gsap.to('.orb .ring', { rotation: 360, duration: 18, repeat: -1, ease: 'none' });
  gsap.to('.orb .r2', { rotation: -360, duration: 26, repeat: -1, ease: 'none' });
  gsap.to('.orb > i', { scale: 1.12, duration: .8, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  gsap.utils.toArray('.fl').forEach(function (n, i) {
    gsap.to(n, { y: 'random(-30,30)', x: 'random(-16,16)', rotation: 'random(-25,25)', duration: 'random(3,5)', repeat: -1, yoyo: true, ease: 'sine.inOut', delay: i * .3 });
  });

  var panel = document.getElementById('brandPanel');
  if (window.matchMedia('(hover: hover)').matches) {
    var items = gsap.utils.toArray('.floats .fl');
    panel.addEventListener('mousemove', function (e) {
      var r = panel.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      gsap.to('.orb', { x: x * -30, y: y * -30, duration: .8, ease: 'power2.out', overwrite: 'auto' });
      items.forEach(function (n) { var d = +n.dataset.depth; gsap.to(n, { xPercent: x * d, yPercent: y * d, duration: .8, ease: 'power2.out', overwrite: 'auto' }); });
    });
  }
})();