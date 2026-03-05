'use strict';

// ─── TOUCH DETECTION ───────────────────────────────
const isTouch = window.matchMedia('(hover: none)').matches;

// ─── CURSOR (desktop only) ──────────────────────────
if (!isTouch) {
  const cur   = document.querySelector('.cursor');
  const trail = document.querySelector('.cursor-trail');
  let mx=0,my=0, tx=0,ty=0, rafCur=null, moving=false, moveTimer=null;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    // Use transform instead of left/top — compositor-only, no layout
    cur.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
    if (!moving) { moving=true; if(!rafCur) rafCur=requestAnimationFrame(loopTrail); }
    clearTimeout(moveTimer);
    moveTimer = setTimeout(()=>{ moving=false; }, 100);
  }, {passive:true});

  function loopTrail() {
    tx += (mx - tx) * 0.11;
    ty += (my - ty) * 0.11;
    trail.style.transform = `translate(${tx}px,${ty}px) translate(-50%,-50%)`;
    rafCur = requestAnimationFrame(loopTrail);
  }
  rafCur = requestAnimationFrame(loopTrail);

  document.querySelectorAll('a,button,.stat-box,.proj-card,.skill-card,.tag,.exp-hdr').forEach(el=>{
    el.addEventListener('mouseenter',()=>{ cur.classList.add('big'); trail.classList.add('big'); });
    el.addEventListener('mouseleave',()=>{ cur.classList.remove('big'); trail.classList.remove('big'); });
  });
}

// ─── HAMBURGER MENU ─────────────────────────────────
const burger = document.getElementById('hamburger');
const mMenu  = document.getElementById('mobile-menu');

function openMenu() {
  mMenu.style.display = 'flex';
  requestAnimationFrame(()=> mMenu.classList.add('open'));
  burger.classList.add('open');
  burger.setAttribute('aria-label','Close menu');
  document.body.style.overflow = 'hidden';
}
function closeMenu() {
  mMenu.classList.remove('open');
  burger.classList.remove('open');
  burger.setAttribute('aria-label','Open menu');
  document.body.style.overflow = '';
  setTimeout(()=>{ mMenu.style.display = 'none'; }, 350);
}
burger.addEventListener('click',()=> burger.classList.contains('open') ? closeMenu() : openMenu());
mMenu.querySelectorAll('a').forEach(a=>{
  a.addEventListener('click',()=>{
    closeMenu();
    const t = document.querySelector(a.getAttribute('href'));
    if(t) setTimeout(()=> t.scrollIntoView({behavior:'smooth'}), 60);
  });
});
document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeMenu(); });

// ─── PARTICLE CANVAS ────────────────────────────────
// Only run particles if not on a low-end device or mobile
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = window.innerWidth < 768;
const canvas = document.getElementById('ptx');

if (!prefersReducedMotion) {
  const ctx = canvas.getContext('2d', { alpha: true });
  let W, H;

  function resizeCanvas() {
    // Use devicePixelRatio for sharp rendering but cap at 1.5 for perf
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx.scale(dpr, dpr);
  }
  resizeCanvas();

  // Debounced resize — avoid thrashing canvas on every pixel
  let resizeTimer;
  window.addEventListener('resize', ()=>{
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resizeCanvas, 200);
  }, {passive:true});

  // Fewer particles on mobile, none on very small screens
  const COUNT = isMobile ? 25 : 55;
  const CONN_DIST = isMobile ? 0 : 120; // disable connections on mobile entirely

  // Pre-build color strings to avoid string concat in hot loop
  const COLS = [
    [139,92,246],  // violet
    [163,230,53],  // lime
    [34,211,238],  // cyan
    [244,114,182], // pink
  ];

  // Flat typed arrays — much faster than array of objects
  const px  = new Float32Array(COUNT);
  const py  = new Float32Array(COUNT);
  const pvx = new Float32Array(COUNT);
  const pvy = new Float32Array(COUNT);
  const pr  = new Float32Array(COUNT);
  const pa  = new Float32Array(COUNT);
  const pc  = new Uint8Array(COUNT);   // color index
  const pli = new Float32Array(COUNT); // life
  const plm = new Float32Array(COUNT); // maxLife

  function initParticle(i) {
    px[i]  = Math.random() * W;
    py[i]  = Math.random() * H;
    pvx[i] = (Math.random() - 0.5) * 0.35;
    pvy[i] = (Math.random() - 0.5) * 0.35;
    pr[i]  = Math.random() * 1.4 + 0.4;
    pa[i]  = Math.random() * 0.4 + 0.1;
    pc[i]  = Math.floor(Math.random() * COLS.length);
    pli[i] = 0;
    plm[i] = Math.random() * 250 + 150;
  }
  for (let i = 0; i < COUNT; i++) initParticle(i);

  // Page visibility — pause animation when tab is hidden
  let visible = true;
  document.addEventListener('visibilitychange', ()=>{ visible = !document.hidden; });

  // Batch lines by grouping all into one path
  function drawConnections() {
    ctx.beginPath();
    for (let i = 0; i < COUNT; i++) {
      for (let j = i + 1; j < COUNT; j++) {
        const dx = px[i]-px[j], dy = py[i]-py[j];
        const d2 = dx*dx + dy*dy;
        if (d2 < CONN_DIST*CONN_DIST) {
          const alpha = (1 - Math.sqrt(d2)/CONN_DIST) * 0.09;
          // Each opacity needs its own stroke — batch same-alpha lines together
          ctx.moveTo(px[i], py[i]);
          ctx.lineTo(px[j], py[j]);
          ctx.strokeStyle = `rgba(139,92,246,${alpha.toFixed(2)})`;
          ctx.stroke();
          ctx.beginPath();
        }
      }
    }
  }

  // Batch particles by color
  function drawParticles() {
    for (let c = 0; c < COLS.length; c++) {
      const [r,g,b] = COLS[c];
      ctx.beginPath();
      for (let i = 0; i < COUNT; i++) {
        if (pc[i] !== c) continue;
        const fade = Math.min(pli[i]/30,1) * Math.min((plm[i]-pli[i])/30,1);
        const alpha = (pa[i] * fade).toFixed(2);
        if (alpha <= 0) continue;
        ctx.moveTo(px[i]+pr[i], py[i]);
        ctx.arc(px[i], py[i], pr[i], 0, 6.2832);
      }
      ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
      ctx.fill();
    }
  }

  let lastFrame = 0;
  const TARGET_FPS = isMobile ? 30 : 60;
  const FRAME_MS   = 1000 / TARGET_FPS;

  function loopParticles(ts) {
    if (!visible) { requestAnimationFrame(loopParticles); return; }

    // Throttle to target FPS
    if (ts - lastFrame < FRAME_MS - 2) { requestAnimationFrame(loopParticles); return; }
    lastFrame = ts;

    ctx.clearRect(0, 0, W, H);

    // Update positions
    for (let i = 0; i < COUNT; i++) {
      pli[i]++;
      if (pli[i] > plm[i]) initParticle(i);
      px[i] += pvx[i]; py[i] += pvy[i];
      if (px[i] < 0) px[i]=W; else if (px[i]>W) px[i]=0;
      if (py[i] < 0) py[i]=H; else if (py[i]>H) py[i]=0;
    }

    if (CONN_DIST > 0) drawConnections();
    drawParticles();

    requestAnimationFrame(loopParticles);
  }
  requestAnimationFrame(loopParticles);
} else {
  // Hide canvas if reduced motion
  canvas.style.display = 'none';
}

// ─── NAV STICKY ─────────────────────────────────────
const nav = document.getElementById('nav');
// Use IntersectionObserver instead of scroll event where possible
// For sticky nav we still need scroll but make it passive
window.addEventListener('scroll', ()=> nav.classList.toggle('stuck', window.scrollY > 50), {passive:true});

// ─── SMOOTH SCROLL ──────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', e=>{
    const t = document.querySelector(a.getAttribute('href'));
    if(t){ e.preventDefault(); t.scrollIntoView({behavior:'smooth'}); }
  });
});

// ─── SCROLL REVEAL ──────────────────────────────────
// Single IntersectionObserver — much better than scroll listeners
const revealIO = new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealIO.unobserve(e.target); // stop watching once revealed
    }
  });
}, {threshold: 0.08, rootMargin: '0px 0px -40px 0px'});
document.querySelectorAll('.reveal').forEach(el=> revealIO.observe(el));

// ─── ACCORDION ──────────────────────────────────────
document.querySelectorAll('.exp-hdr').forEach(hdr=>{
  hdr.addEventListener('click',()=>{
    const card = hdr.closest('.exp-card');
    const was  = card.classList.contains('open');
    document.querySelectorAll('.exp-card').forEach(c=>c.classList.remove('open'));
    if(!was) card.classList.add('open');
  });
});
const fc = document.querySelector('.exp-card');
if(fc) fc.classList.add('open');

// ─── COUNTERS ───────────────────────────────────────
function countUp(el, target, dur=1400) {
  const suffix = el.dataset.suffix || '';
  let t0 = null;
  function step(ts) {
    if (!t0) t0 = ts;
    const p = Math.min((ts-t0)/dur, 1);
    const ease = 1 - Math.pow(1-p, 4);
    el.textContent = Math.floor(ease * target) + suffix;
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
const cntIO = new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      countUp(e.target, parseInt(e.target.dataset.target));
      cntIO.unobserve(e.target);
    }
  });
},{threshold:.5});
document.querySelectorAll('[data-target]').forEach(el=> cntIO.observe(el));

// ─── ACTIVE NAV ─────────────────────────────────────
const navLinks = document.querySelectorAll('.nav-links a, .mobile-menu a');
const navIO = new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      const id = '#'+e.target.id;
      navLinks.forEach(a=> a.classList.toggle('active', a.getAttribute('href')===id));
    }
  });
},{threshold: 0.35});
document.querySelectorAll('section[id]').forEach(s=> navIO.observe(s));

// ─── MAGNETIC + TILT (desktop only) ─────────────────
if (!isTouch) {
  // Stat boxes — magnetic pull
  document.querySelectorAll('.stat-box').forEach(box=>{
    box.addEventListener('mousemove', e=>{
      const r=box.getBoundingClientRect();
      const dx=(e.clientX-r.left-r.width/2)*0.13;
      const dy=(e.clientY-r.top-r.height/2)*0.13;
      box.style.transform=`translate(${dx}px,${dy}px) translateY(-5px) scale(1.03)`;
    },{passive:true});
    box.addEventListener('mouseleave',()=> box.style.transform='');
  });

  // Project cards — 3D tilt
  document.querySelectorAll('.proj-card').forEach(card=>{
    card.addEventListener('mousemove', e=>{
      const r=card.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-.5;
      const y=(e.clientY-r.top)/r.height-.5;
      card.style.transform=`perspective(900px) rotateY(${x*7}deg) rotateX(${-y*7}deg) translateY(-8px)`;
    },{passive:true});
    card.addEventListener('mouseleave',()=> card.style.transform='');
  });
}

// ─── HERO HUE DRIFT (CSS only — moved to CSS animation) ─
// Removed setInterval — now handled by CSS @keyframes hueShift on .fill
