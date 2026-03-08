'use strict';

(function () {
  const isTouch = window.matchMedia('(hover:none)').matches;

  // ── CUSTOM CURSOR (desktop only) ──────────────────────
  if (!isTouch) {
    const cur = document.querySelector('.cursor');
    const trail = document.querySelector('.cursor-trail');
    let mx = 0, my = 0, tx = 0, ty = 0, rot = 0, speed = 0;

    document.addEventListener('mousemove', e => {
      const dx = e.clientX - mx, dy = e.clientY - my;
      speed = Math.min(Math.sqrt(dx * dx + dy * dy), 60);
      mx = e.clientX; my = e.clientY;
      cur.style.transform = `translate(calc(${mx}px - 50%), calc(${my}px - 50%))`;
      spawnTrailDot(mx, my);
    }, { passive: true });

    (function loopTrail() {
      tx += (mx - tx) * 0.1;
      ty += (my - ty) * 0.1;
      rot += speed * 0.15;
      speed *= 0.92;
      trail.style.transform = `translate(calc(${tx}px - 50%), calc(${ty}px - 50%)) rotate(${rot}deg)`;
      requestAnimationFrame(loopTrail);
    })();

    document.querySelectorAll('a, button, .stat-box, .proj-card, .skill-card, .tag, .cert-row').forEach(el => {
      el.addEventListener('mouseenter', () => { cur.classList.add('big'); trail.classList.add('big'); });
      el.addEventListener('mouseleave', () => { cur.classList.remove('big'); trail.classList.remove('big'); });
    });

    const TRAIL_COLORS = ['#a78bfa', '#a3e635', '#22d3ee', '#f472b6'];
    let lastDot = 0;

    function spawnTrailDot(x, y) {
      const now = Date.now();
      if (now - lastDot < 38) return;
      lastDot = now;

      const el = document.createElement('div');
      const size = Math.random() * 5 + 3;
      const color = TRAIL_COLORS[Math.floor(Math.random() * TRAIL_COLORS.length)];
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 20 + 6;

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
        el.style.transform = `translate(calc(-50% + ${Math.cos(angle) * dist}px), calc(-50% + ${Math.sin(angle) * dist}px)) scale(0)`;
        el.style.opacity = '0';
      });

      setTimeout(() => el.remove(), 520);
    }

    document.addEventListener('click', e => {
      spawnRipple(e.clientX, e.clientY, 'var(--lime)', 8, 8, 0.55, 0);
      spawnRipple(e.clientX, e.clientY, 'var(--v2)', 6, 12, 0.70, 80);
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
        el.style.opacity = '0';
      });
      setTimeout(() => el.remove(), (dur + delay / 1000 + 0.1) * 1000);
    }
  }

  // ── DISABLE RIGHT-CLICK ──────────────────────────────
  document.addEventListener('contextmenu', e => e.preventDefault());

  // ── NAV STICKY ────────────────────────────────────────
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('stuck', scrollY > 50);
  }, { passive: true });

  // ── HAMBURGER ─────────────────────────────────────────
  const burger = document.getElementById('hamburger');
  const mmenu = document.getElementById('mmenu');

  function closeMenu() {
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    mmenu.classList.remove('open');
    document.body.style.overflow = '';
  }

  burger.addEventListener('click', () => {
    const open = burger.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
    mmenu.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  mmenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mmenu.classList.contains('open')) closeMenu();
  });

  // ── SMOOTH SCROLL ─────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
    });
  });

  // ── ACTIVE NAV HIGHLIGHT ──────────────────────────────
  const navAs = document.querySelectorAll('.nav-links a, #mmenu a');

  function updateNav() {
    let current = '';
    document.querySelectorAll('section[id]').forEach(s => {
      if (s.getBoundingClientRect().top <= window.innerHeight * 0.5) current = s.id;
    });
    navAs.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
  }

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  // ── EXPERIENCE ACCORDION ──────────────────────────────
  document.querySelectorAll('.exp-hdr').forEach(hdr => {
    hdr.addEventListener('click', () => {
      const card = hdr.closest('.exp-card');
      const wasOpen = card.classList.contains('open');
      document.querySelectorAll('.exp-card').forEach(c => c.classList.remove('open'));
      if (!wasOpen) card.classList.add('open');
    });
  });

  const firstCard = document.querySelector('.exp-card');
  if (firstCard) firstCard.classList.add('open');

  // ── STAT COUNTERS ─────────────────────────────────────
  function countUp(el, target, dur) {
    dur = dur || 1200;
    const suffix = el.dataset.suffix || '';
    const start = performance.now();

    function step(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(eased * target) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        countUp(el, parseInt(el.dataset.target));
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-target]').forEach(el => counterObserver.observe(el));

  // ── SCROLL REVEAL (IntersectionObserver) ──────────────
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // ── 3D TILT ON PROJECT CARDS (desktop only) ───────────
  if (!isTouch) {
    document.querySelectorAll('.proj-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-6px)`;
      }, { passive: true });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  // ── BACK TO TOP + HIDE FLOATS AT FOOTER ──────────────
  const backToTop = document.getElementById('back-to-top');
  const footer = document.querySelector('footer');

  window.addEventListener('scroll', () => {
    const footerRect = footer.getBoundingClientRect();
    const footerVisible = footerRect.top < window.innerHeight;

    backToTop.classList.toggle('show', scrollY > 600 && !footerVisible);
    musicPanel.classList.toggle('at-footer', footerVisible);
  }, { passive: true });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ── MUSIC PLAYER ──────────────────────────────────────
  const audio = document.getElementById('bg-music');
  const musicBtn = document.getElementById('music-btn');
  const musicPanel = document.getElementById('music-player');

  audio.volume = 0.05;

  function setPlaying(on) {
    musicPanel.classList.toggle('playing', on);
  }

  function playMusic() {
    audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }

  musicBtn.addEventListener('click', e => {
    e.stopPropagation();
    if (audio.paused) {
      playMusic();
    } else {
      audio.pause();
      setPlaying(false);
    }
  });

  let started = false;

  function onFirstInteraction() {
    if (started) return;
    audio.play().then(() => {
      started = true;
      setPlaying(true);
    }).catch(() => { /* browser blocked autoplay, user can click button */ });
  }

  ['click', 'scroll', 'keydown', 'touchstart'].forEach(evt => {
    window.addEventListener(evt, onFirstInteraction, { once: false, passive: true });
  });
})();
