'use strict';

// ═══════════════════════════════════
//  CURSOR (desktop only)
// ═══════════════════════════════════
const cur  = document.querySelector('.cursor');
const trail= document.querySelector('.cursor-trail');
let mx=0,my=0,tx=0,ty=0;
const hasTouch = window.matchMedia('(hover: none)').matches;

if(!hasTouch){
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cur.style.left = mx+'px'; cur.style.top = my+'px';
  });

  (function loopTrail(){
    tx += (mx - tx) * 0.11;
    ty += (my - ty) * 0.11;
    trail.style.left = tx+'px'; trail.style.top = ty+'px';
    requestAnimationFrame(loopTrail);
  })();

  document.querySelectorAll('a,button,.stat-box,.proj-card,.skill-card,.tag,.exp-hdr').forEach(el=>{
    el.addEventListener('mouseenter',()=>{ cur.classList.add('big'); trail.classList.add('big'); });
    el.addEventListener('mouseleave',()=>{ cur.classList.remove('big'); trail.classList.remove('big'); });
  });
}


// ═══════════════════════════════════
//  HAMBURGER MENU
// ═══════════════════════════════════
const burger = document.getElementById('hamburger');
const mMenu  = document.getElementById('mobile-menu');

function openMenu(){
  mMenu.style.display = 'flex';
  requestAnimationFrame(()=> mMenu.classList.add('open'));
  burger.classList.add('open');
  burger.setAttribute('aria-label','Close menu');
  document.body.style.overflow = 'hidden';
}
function closeMenu(){
  mMenu.classList.remove('open');
  burger.classList.remove('open');
  burger.setAttribute('aria-label','Open menu');
  document.body.style.overflow = '';
  setTimeout(()=>{ mMenu.style.display = 'none'; }, 350);
}

burger.addEventListener('click',()=>{
  burger.classList.contains('open') ? closeMenu() : openMenu();
});

mMenu.querySelectorAll('a').forEach(a=>{
  a.addEventListener('click',()=>{
    closeMenu();
    const target = document.querySelector(a.getAttribute('href'));
    if(target) setTimeout(()=> target.scrollIntoView({behavior:'smooth'}), 60);
  });
});

// Close on escape key
document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeMenu(); });


// ═══════════════════════════════════
//  PARTICLE CANVAS
// ═══════════════════════════════════
const canvas = document.getElementById('ptx');
const ctx    = canvas.getContext('2d');
let W, H;

function resize(){
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

const COLS = ['rgba(139,92,246,','rgba(163,230,53,','rgba(34,211,238,','rgba(244,114,182,'];

function mkParticle(){
  return {
    x: Math.random()*W, y: Math.random()*H,
    r: Math.random()*1.5+0.4,
    vx:(Math.random()-.5)*.38, vy:(Math.random()-.5)*.38,
    col: COLS[Math.floor(Math.random()*COLS.length)],
    a: Math.random()*.45+.1,
    life:0, max: Math.random()*280+180
  };
}

// Fewer particles on mobile for performance
const count = window.innerWidth < 768 ? 40 : 80;
const pts = Array.from({length:count}, mkParticle);

function drawLines(){
  for(let i=0;i<pts.length;i++){
    for(let j=i+1;j<pts.length;j++){
      const dx=pts[i].x-pts[j].x, dy=pts[i].y-pts[j].y;
      const d=Math.sqrt(dx*dx+dy*dy);
      if(d<130){
        ctx.strokeStyle=`rgba(139,92,246,${(1-d/130)*.1})`;
        ctx.lineWidth=.5;
        ctx.beginPath(); ctx.moveTo(pts[i].x,pts[i].y); ctx.lineTo(pts[j].x,pts[j].y); ctx.stroke();
      }
    }
  }
}

(function loopPts(){
  ctx.clearRect(0,0,W,H);
  drawLines();
  pts.forEach((p)=>{
    p.life++;
    if(p.life>p.max){ Object.assign(p, mkParticle()); p.x=Math.random()*W; p.y=Math.random()*H; }
    p.x+=p.vx; p.y+=p.vy;
    if(p.x<0)p.x=W; if(p.x>W)p.x=0;
    if(p.y<0)p.y=H; if(p.y>H)p.y=0;
    const fade=Math.min(p.life/40,1)*Math.min((p.max-p.life)/40,1);
    ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
    ctx.fillStyle=p.col+(p.a*fade)+')'; ctx.fill();
  });
  requestAnimationFrame(loopPts);
})();


// ═══════════════════════════════════
//  NAV STICKY
// ═══════════════════════════════════
const nav = document.getElementById('nav');
window.addEventListener('scroll', ()=> nav.classList.toggle('stuck', window.scrollY>50), {passive:true});


// ═══════════════════════════════════
//  SMOOTH SCROLL
// ═══════════════════════════════════
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', e=>{
    const t = document.querySelector(a.getAttribute('href'));
    if(t){ e.preventDefault(); t.scrollIntoView({behavior:'smooth'}); }
  });
});


// ═══════════════════════════════════
//  SCROLL REVEAL
// ═══════════════════════════════════
const io = new IntersectionObserver(entries=>{
  entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('visible'); });
},{threshold:.08,rootMargin:'0px 0px -40px 0px'});

document.querySelectorAll('.reveal').forEach(el=>io.observe(el));


// ═══════════════════════════════════
//  ACCORDION
// ═══════════════════════════════════
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


// ═══════════════════════════════════
//  COUNTERS
// ═══════════════════════════════════
function countUp(el, target, dur=1500){
  let t0=null;
  (function step(ts){
    if(!t0) t0=ts;
    const p=Math.min((ts-t0)/dur,1);
    const e=1-Math.pow(1-p,4);
    el.textContent=Math.floor(e*target)+(el.dataset.suffix||'');
    if(p<1) requestAnimationFrame(step);
  })(performance.now());
}

const cio=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      countUp(e.target, parseInt(e.target.dataset.target));
      cio.unobserve(e.target);
    }
  });
},{threshold:.5});
document.querySelectorAll('[data-target]').forEach(el=>cio.observe(el));


// ═══════════════════════════════════
//  ACTIVE NAV
// ═══════════════════════════════════
const secs  = document.querySelectorAll('section[id]');
const links = document.querySelectorAll('.nav-links a, .mobile-menu a');
const sio   = new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      const id='#'+e.target.id;
      links.forEach(a=>a.classList.toggle('active', a.getAttribute('href')===id));
    }
  });
},{threshold:.35});
secs.forEach(s=>sio.observe(s));


// ═══════════════════════════════════
//  MAGNETIC STAT BOXES (desktop only)
// ═══════════════════════════════════
if(!hasTouch){
  document.querySelectorAll('.stat-box').forEach(box=>{
    box.addEventListener('mousemove',e=>{
      const r=box.getBoundingClientRect();
      const dx=(e.clientX-r.left-r.width/2)*.14;
      const dy=(e.clientY-r.top-r.height/2)*.14;
      box.style.transform=`translate(${dx}px,${dy}px) translateY(-6px) scale(1.03)`;
    });
    box.addEventListener('mouseleave',()=>box.style.transform='');
  });

  // ═══════════════════════════════════
  //  3D TILT PROJECT CARDS (desktop only)
  // ═══════════════════════════════════
  document.querySelectorAll('.proj-card').forEach(card=>{
    card.addEventListener('mousemove',e=>{
      const r=card.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-.5;
      const y=(e.clientY-r.top)/r.height-.5;
      card.style.transform=`perspective(900px) rotateY(${x*8}deg) rotateX(${-y*8}deg) translateY(-10px)`;
    });
    card.addEventListener('mouseleave',()=>card.style.transform='');
  });
}


// ═══════════════════════════════════
//  HERO NAME HUE DRIFT
// ═══════════════════════════════════
const fill = document.querySelector('.hero-h1 .fill');
if(fill){
  let h=0;
  setInterval(()=>{ h=(h+0.4)%360; fill.style.filter=`hue-rotate(${h*.12}deg)`; },30);
}

