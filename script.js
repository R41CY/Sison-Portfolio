// ═══════════════════════════════════════════
//  CURSOR
// ═══════════════════════════════════════════
const cursor      = document.querySelector('.cursor');
const cursorTrail = document.querySelector('.cursor-trail');
let mx = 0, my = 0, tx = 0, ty = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursor.style.left = mx - 4 + 'px';
  cursor.style.top  = my - 4 + 'px';
});

(function animTrail() {
  tx += (mx - tx - 20) * 0.10;
  ty += (my - ty - 20) * 0.10;
  cursorTrail.style.left = tx + 'px';
  cursorTrail.style.top  = ty + 'px';
  requestAnimationFrame(animTrail);
})();

document.querySelectorAll('a, button, .exp-header, .stat-box, .proj-card, .tag, .skill-card').forEach(el => {
  el.addEventListener('mouseenter', () => { cursor.classList.add('expand'); cursorTrail.classList.add('expand'); });
  el.addEventListener('mouseleave', () => { cursor.classList.remove('expand'); cursorTrail.classList.remove('expand'); });
});


// ═══════════════════════════════════════════
//  PARTICLE CANVAS
// ═══════════════════════════════════════════
const canvas = document.getElementById('particle-canvas');
const ctx    = canvas.getContext('2d');
let W, H, particles = [];

function resizeCanvas() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const COLORS = ['rgba(139,92,246,', 'rgba(163,230,53,', 'rgba(34,211,238,', 'rgba(244,114,182,'];

function Particle() {
  this.reset = function() {
    this.x  = Math.random() * W;
    this.y  = Math.random() * H;
    this.r  = Math.random() * 1.6 + 0.4;
    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = (Math.random() - 0.5) * 0.4;
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.alpha = Math.random() * 0.5 + 0.1;
    this.life  = 0;
    this.maxLife = Math.random() * 300 + 200;
  };
  this.reset();
}

for (let i = 0; i < 90; i++) particles.push(new Particle());

// Draw connections between close particles
function drawConnections() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        const alpha = (1 - dist / 120) * 0.12;
        ctx.strokeStyle = `rgba(139,92,246,${alpha})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }
}

(function animParticles() {
  ctx.clearRect(0, 0, W, H);
  drawConnections();
  particles.forEach(p => {
    p.life++;
    if (p.life > p.maxLife) p.reset();
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
    if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
    const fade = Math.min(p.life / 40, 1) * Math.min((p.maxLife - p.life) / 40, 1);
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = p.color + (p.alpha * fade) + ')';
    ctx.fill();
  });
  requestAnimationFrame(animParticles);
})();


// ═══════════════════════════════════════════
//  NAV SCROLL
// ═══════════════════════════════════════════
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});


// ═══════════════════════════════════════════
//  SMOOTH SCROLL
// ═══════════════════════════════════════════
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
  });
});


// ═══════════════════════════════════════════
//  SCROLL REVEAL
// ═══════════════════════════════════════════
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));


// ═══════════════════════════════════════════
//  ACCORDION EXPERIENCE
// ═══════════════════════════════════════════
document.querySelectorAll('.exp-header').forEach(h => {
  h.addEventListener('click', () => {
    const card   = h.closest('.exp-card');
    const isOpen = card.classList.contains('open');
    document.querySelectorAll('.exp-card').forEach(c => c.classList.remove('open'));
    if (!isOpen) card.classList.add('open');
  });
});
const first = document.querySelector('.exp-card');
if (first) first.classList.add('open');


// ═══════════════════════════════════════════
//  COUNTER ANIMATION
// ═══════════════════════════════════════════
function countUp(el, target, dur = 1600) {
  let start = null;
  const step = ts => {
    if (!start) start = ts;
    const prog = Math.min((ts - start) / dur, 1);
    const ease = 1 - Math.pow(1 - prog, 4);
    el.textContent = Math.floor(ease * target) + (el.dataset.suffix || '');
    if (prog < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const cntObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      countUp(e.target, parseInt(e.target.dataset.target));
      cntObs.unobserve(e.target);
    }
  });
}, { threshold: 0.6 });

document.querySelectorAll('[data-target]').forEach(el => cntObs.observe(el));


// ═══════════════════════════════════════════
//  ACTIVE NAV LINK
// ═══════════════════════════════════════════
const sections  = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');

const navObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const id = e.target.id;
      navAnchors.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
      });
    }
  });
}, { threshold: 0.45 });

sections.forEach(s => navObs.observe(s));


// ═══════════════════════════════════════════
//  MAGNETIC HOVER on STAT BOXES
// ═══════════════════════════════════════════
document.querySelectorAll('.stat-box').forEach(box => {
  box.addEventListener('mousemove', e => {
    const r  = box.getBoundingClientRect();
    const cx = r.left + r.width  / 2;
    const cy = r.top  + r.height / 2;
    const dx = (e.clientX - cx) * 0.12;
    const dy = (e.clientY - cy) * 0.12;
    box.style.transform = `translate(${dx}px,${dy}px) translateY(-6px) scale(1.02)`;
  });
  box.addEventListener('mouseleave', () => {
    box.style.transform = '';
  });
});


// ═══════════════════════════════════════════
//  TILT ON PROJECT CARDS
// ═══════════════════════════════════════════
document.querySelectorAll('.proj-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r  = card.getBoundingClientRect();
    const x  = (e.clientX - r.left) / r.width  - 0.5;
    const y  = (e.clientY - r.top)  / r.height - 0.5;
    card.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-10px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});


// ═══════════════════════════════════════════
//  HERO TYPING SUBTITLE (subtle shimmer loop)
// ═══════════════════════════════════════════
// Shimmer effect on hero heading gradient text
const outlineText = document.querySelector('.hero-heading .outline-text');
if (outlineText) {
  let angle = 0;
  setInterval(() => {
    angle = (angle + 0.5) % 360;
    // subtle hue drift on fill
    outlineText.querySelector('.fill').style.filter = `hue-rotate(${angle * 0.15}deg)`;
  }, 30);
}
