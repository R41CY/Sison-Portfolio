'use strict';

// ── CURSOR + TRAIL + RIPPLE (desktop only) ────────────
const isTouch = window.matchMedia('(hover:none)').matches;

if (!isTouch) {
  const cur   = document.querySelector('.cursor');
  const trail = document.querySelector('.cursor-trail');
  let mx = 0, my = 0, tx = 0, ty = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cur.style.transform = `translate(calc(${mx}px - 50%), calc(${my}px - 50%))`;
    spawnTrailDot(mx, my);
  }, { passive: true });

  (function loopTrail() {
    tx += (mx - tx) * 0.12;
    ty += (my - ty) * 0.12;
    trail.style.transform = `translate(calc(${tx}px - 50%), calc(${ty}px - 50%))`;
    requestAnimationFrame(loopTrail);
  })();

  // Expand cursor on interactive elements
  document.querySelectorAll('a, button, .stat-box, .proj-card, .skill-card, .tag').forEach(el => {
    el.addEventListener('mouseenter', () => { cur.classList.add('big'); trail.classList.add('big'); });
    el.addEventListener('mouseleave', () => { cur.classList.remove('big'); trail.classList.remove('big'); });
  });

  // Trail dots — tiny glowing particles that follow the cursor
  const TRAIL_COLORS = ['#a78bfa', '#a3e635', '#22d3ee', '#f472b6'];
  let lastDot = 0;

  function spawnTrailDot(x, y) {
    const now = Date.now();
    if (now - lastDot < 38) return; // ~26 dots/sec max
    lastDot = now;

    const el    = document.createElement('div');
    const size  = Math.random() * 5 + 3;
    const color = TRAIL_COLORS[Math.floor(Math.random() * TRAIL_COLORS.length)];
    const angle = Math.random() * Math.PI * 2;
    const dist  = Math.random() * 20 + 6;

    el.style.cssText = `
      position:fixed;pointer-events:none;z-index:9990;
      width:${size}px;height:${size}px;border-radius:50%;
      background:${color};box-shadow:0 0 ${size * 2}px ${color};
      left:${x}px;top:${y}px;
      transform:translate(-50%,-50%);
      opacity:0.8;
      transition:transform 0.5s ease,opacity 0.5s ease;
    `;
    document.body.appendChild(el);

    requestAnimationFrame(() => {
      el.style.transform = `translate(calc(-50% + ${Math.cos(angle)*dist}px), calc(-50% + ${Math.sin(angle)*dist}px)) scale(0)`;
      el.style.opacity = '0';
    });

    setTimeout(() => el.remove(), 520);
  }

  // Click ripple — two expanding rings on every click
  document.addEventListener('click', e => {
    spawnRipple(e.clientX, e.clientY, 'var(--lime)',  8,  8,  0.55,  0);
    spawnRipple(e.clientX, e.clientY, 'var(--v2)',    6, 12,  0.70,  80);
  });

  function spawnRipple(x, y, color, size, scale, dur, delay) {
    const el = document.createElement('div');
    el.style.cssText = `
      position:fixed;pointer-events:none;z-index:9989;
      width:${size}px;height:${size}px;border-radius:50%;
      border:1.5px solid ${color};
      left:${x}px;top:${y}px;
      transform:translate(-50%,-50%) scale(1);
      opacity:1;
      transition:transform ${dur}s ${delay}ms cubic-bezier(0,.5,.5,1),
                 opacity   ${dur}s ${delay}ms ease;
    `;
    document.body.appendChild(el);
    requestAnimationFrame(() => {
      el.style.transform = `translate(-50%,-50%) scale(${scale})`;
      el.style.opacity   = '0';
    });
    setTimeout(() => el.remove(), (dur + delay/1000 + 0.1) * 1000);
  }
}


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
