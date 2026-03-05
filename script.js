'use strict';

// NAV sticky
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('stuck', scrollY > 50);
}, { passive: true });

// Hamburger
const burger = document.getElementById('hamburger');
const mmenu  = document.getElementById('mmenu');
burger.addEventListener('click', () => {
  const open = burger.classList.toggle('open');
  mmenu.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
});
mmenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    burger.classList.remove('open');
    mmenu.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
  });
});

// Active nav
const navAs = document.querySelectorAll('.nav-links a, #mmenu a');
function updateNav() {
  let cur = '';
  document.querySelectorAll('section[id]').forEach(s => {
    if (s.getBoundingClientRect().top <= window.innerHeight * 0.5) cur = s.id;
  });
  navAs.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));
}
window.addEventListener('scroll', updateNav, { passive: true });
updateNav();

// Accordion
document.querySelectorAll('.exp-hdr').forEach(hdr => {
  hdr.addEventListener('click', () => {
    const card = hdr.closest('.exp-card');
    const was  = card.classList.contains('open');
    document.querySelectorAll('.exp-card').forEach(c => c.classList.remove('open'));
    if (!was) card.classList.add('open');
  });
});
const first = document.querySelector('.exp-card');
if (first) first.classList.add('open');

// Counter
function countUp(el, target, dur) {
  dur = dur || 1200;
  const suffix = el.dataset.suffix || '';
  const start  = performance.now();
  function step(now) {
    const p = Math.min((now - start) / dur, 1);
    el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * target) + suffix;
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
const seen = new Set();
function checkCounters() {
  document.querySelectorAll('[data-target]').forEach(el => {
    if (seen.has(el)) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) {
      seen.add(el);
      countUp(el, parseInt(el.dataset.target));
    }
  });
}
window.addEventListener('scroll', checkCounters, { passive: true });
checkCounters();

// 3D tilt (desktop only)
if (!window.matchMedia('(hover:none)').matches) {
  document.querySelectorAll('.proj-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${x*6}deg) rotateX(${-y*6}deg) translateY(-6px)`;
    }, { passive: true });
    card.addEventListener('mouseleave', () => card.style.transform = '');
  });
}
