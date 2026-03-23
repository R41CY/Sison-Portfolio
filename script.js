'use strict';

(function () {
  const isTouch = window.matchMedia('(hover:none)').matches;

  // ── PARTICLE CANVAS (hero background) ─────────────────
  (function initParticles() {
    const canvas = document.getElementById('particles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, particles = [], mouseX = -9999, mouseY = -9999;

    function resize() {
      const hero = canvas.parentElement;
      W = canvas.width = hero.offsetWidth;
      H = canvas.height = hero.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const COUNT = isTouch ? 40 : 80;
    const COLORS = ['rgba(139,92,246,.5)', 'rgba(163,230,53,.4)', 'rgba(34,211,238,.4)', 'rgba(244,114,182,.35)'];

    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        r: Math.random() * 2 + 1,
        color: COLORS[Math.floor(Math.random() * COLORS.length)]
      });
    }

    if (!isTouch) {
      const hero = canvas.parentElement;
      hero.addEventListener('mousemove', e => {
        const r = hero.getBoundingClientRect();
        mouseX = e.clientX - r.left;
        mouseY = e.clientY - r.top;
      }, { passive: true });
      hero.addEventListener('mouseleave', () => { mouseX = -9999; mouseY = -9999; }, { passive: true });
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        // mouse repulsion
        const dx = p.x - mouseX, dy = p.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120 && dist > 0) {
          const force = (120 - dist) / 120 * 0.8;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }
        p.vx *= 0.98; p.vy *= 0.98;
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        // connect nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const ddx = p.x - q.x, ddy = p.y - q.y;
          const d = Math.sqrt(ddx * ddx + ddy * ddy);
          if (d < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(139,92,246,${0.12 * (1 - d / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    }
    draw();
  })();

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

    // ── MAGNETIC BUTTONS (desktop only) ──────────────────
    document.querySelectorAll('.btn-v, .btn-o').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = (e.clientX - cx) * 0.25;
        const dy = (e.clientY - cy) * 0.25;
        btn.style.transform = `translate(${dx}px, ${dy}px)`;
      }, { passive: true });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });

    // ── GLOW ORB (desktop only) ──────────────────────────
    const orb = document.createElement('div');
    orb.className = 'glow-orb';
    document.body.appendChild(orb);

    document.addEventListener('mousemove', e => {
      orb.style.left = e.clientX + 'px';
      orb.style.top = e.clientY + 'px';
      orb.classList.add('visible');
    }, { passive: true });
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

  // ── STAGGERED FEATURE REVEAL ──────────────────────────
  const featureObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const features = entry.target.querySelectorAll('.pf');
        features.forEach((pf, i) => {
          setTimeout(() => pf.classList.add('pf-visible'), i * 100);
        });
        featureObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.proj-card').forEach(card => featureObserver.observe(card));

  // ── 3D TILT ON PROJECT + SKILL CARDS (desktop only) ───
  if (!isTouch) {
    document.querySelectorAll('.proj-card, .skill-card').forEach(card => {
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

  // ── TEXT SCRAMBLE ON SECTION HEADINGS ──────────────────
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%&*01234';

  function scrambleText(el) {
    const original = el.textContent;
    const len = original.length;
    let iteration = 0;

    const interval = setInterval(() => {
      el.textContent = original
        .split('')
        .map((ch, i) => {
          if (ch === ' ' || ch === '\n') return ch;
          if (i < iteration) return original[i];
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        })
        .join('');
      iteration += 1;
      if (iteration > len) {
        el.textContent = original;
        clearInterval(interval);
      }
    }, 28);
  }

  const headingObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Only scramble the text nodes, leave .g span alone
        const h = entry.target;
        const gSpan = h.querySelector('.g');
        const textBefore = h.childNodes[0];
        if (textBefore && textBefore.nodeType === 3 && gSpan) {
          const origText = textBefore.textContent;
          const origG = gSpan.textContent;
          let iter = 0;
          const totalLen = origText.length + origG.length;
          const interval = setInterval(() => {
            textBefore.textContent = origText.split('').map((ch, i) => {
              if (ch === ' ') return ch;
              return i < iter ? origText[i] : CHARS[Math.floor(Math.random() * CHARS.length)];
            }).join('');
            gSpan.textContent = origG.split('').map((ch, i) => {
              const gi = origText.length + i;
              if (ch === ' ') return ch;
              return gi < iter ? origG[i] : CHARS[Math.floor(Math.random() * CHARS.length)];
            }).join('');
            iter++;
            if (iter > totalLen) {
              textBefore.textContent = origText;
              gSpan.textContent = origG;
              clearInterval(interval);
            }
          }, 30);
        }
        headingObserver.unobserve(h);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.sec-h').forEach(h => headingObserver.observe(h));

  // ── TYPEWRITER EFFECT ON HERO SUBTITLE ────────────────
  (function typewriter() {
    const heroSub = document.querySelector('.hero-sub');
    if (!heroSub) return;
    const strong = heroSub.querySelector('strong');
    if (!strong) return;
    const fullText = strong.textContent;
    strong.textContent = '';
    const cursor = document.createElement('span');
    cursor.className = 'typewriter-cursor';
    strong.appendChild(cursor);

    let i = 0;
    function type() {
      if (i < fullText.length) {
        strong.insertBefore(document.createTextNode(fullText[i]), cursor);
        i++;
        setTimeout(type, 45 + Math.random() * 35);
      } else {
        setTimeout(() => cursor.remove(), 2000);
      }
    }
    setTimeout(type, 800);
  })();

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
