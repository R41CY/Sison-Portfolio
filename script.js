'use strict';

(function () {
  var isTouch = window.matchMedia('(hover:none)').matches;

  /* Particle system */
  (function () {
    var canvas = document.getElementById('particles');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W, H, dots = [], mx = -9999, my = -9999;

    function resize() {
      var hero = canvas.parentElement;
      W = canvas.width = hero.offsetWidth;
      H = canvas.height = hero.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    var COUNT = isTouch ? 40 : 80;
    var COLORS = ['rgba(139,92,246,.5)', 'rgba(163,230,53,.4)', 'rgba(34,211,238,.4)', 'rgba(244,114,182,.35)'];

    for (var i = 0; i < COUNT; i++) {
      dots.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5,
        r: Math.random() * 2 + 1,
        color: COLORS[Math.floor(Math.random() * COLORS.length)]
      });
    }

    if (!isTouch) {
      var hero = canvas.parentElement;
      hero.addEventListener('mousemove', function (e) {
        var r = hero.getBoundingClientRect();
        mx = e.clientX - r.left;
        my = e.clientY - r.top;
      }, { passive: true });
      hero.addEventListener('mouseleave', function () { mx = -9999; my = -9999; }, { passive: true });
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < dots.length; i++) {
        var p = dots[i];
        var dx = p.x - mx, dy = p.y - my;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120 && dist > 0) {
          var force = (120 - dist) / 120 * 0.8;
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

        for (var j = i + 1; j < dots.length; j++) {
          var q = dots[j];
          var ddx = p.x - q.x, ddy = p.y - q.y;
          var d = Math.sqrt(ddx * ddx + ddy * ddy);
          if (d < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = 'rgba(139,92,246,' + (0.12 * (1 - d / 120)) + ')';
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    }
    draw();
  })();

  /* Custom cursor */
  if (!isTouch) {
    var cur = document.querySelector('.cursor');
    var trail = document.querySelector('.cursor-trail');
    var mx = 0, my = 0, tx = 0, ty = 0, rot = 0, speed = 0;

    document.addEventListener('mousemove', function (e) {
      var dx = e.clientX - mx, dy = e.clientY - my;
      speed = Math.min(Math.sqrt(dx * dx + dy * dy), 60);
      mx = e.clientX; my = e.clientY;
      cur.style.transform = 'translate(calc(' + mx + 'px - 50%), calc(' + my + 'px - 50%))';
      spawnTrailDot(mx, my);
    }, { passive: true });

    (function loopTrail() {
      tx += (mx - tx) * 0.1;
      ty += (my - ty) * 0.1;
      rot += speed * 0.15;
      speed *= 0.92;
      trail.style.transform = 'translate(calc(' + tx + 'px - 50%), calc(' + ty + 'px - 50%)) rotate(' + rot + 'deg)';
      requestAnimationFrame(loopTrail);
    })();

    document.querySelectorAll('a, button, .stat-box, .proj-card, .skill-card, .tag, .cert-row').forEach(function (el) {
      el.addEventListener('mouseenter', function () { cur.classList.add('big'); trail.classList.add('big'); });
      el.addEventListener('mouseleave', function () { cur.classList.remove('big'); trail.classList.remove('big'); });
    });

    var TRAIL_COLORS = ['#a78bfa', '#a3e635', '#22d3ee', '#f472b6'];
    var lastDot = 0;

    function spawnTrailDot(x, y) {
      var now = Date.now();
      if (now - lastDot < 38) return;
      lastDot = now;
      var el = document.createElement('div');
      var size = Math.random() * 5 + 3;
      var color = TRAIL_COLORS[Math.floor(Math.random() * TRAIL_COLORS.length)];
      var angle = Math.random() * Math.PI * 2;
      var dist = Math.random() * 20 + 6;
      el.style.cssText = 'position:fixed;pointer-events:none;z-index:9990;width:' + size + 'px;height:' + size + 'px;border-radius:50%;background:' + color + ';box-shadow:0 0 ' + (size * 2) + 'px ' + color + ';left:' + x + 'px;top:' + y + 'px;transform:translate(-50%,-50%);opacity:0.8;transition:transform .5s ease,opacity .5s ease;';
      document.body.appendChild(el);
      requestAnimationFrame(function () {
        el.style.transform = 'translate(calc(-50% + ' + (Math.cos(angle) * dist) + 'px), calc(-50% + ' + (Math.sin(angle) * dist) + 'px)) scale(0)';
        el.style.opacity = '0';
      });
      setTimeout(function () { el.remove(); }, 520);
    }

    document.addEventListener('click', function (e) {
      spawnRipple(e.clientX, e.clientY, 'var(--lime)', 8, 8, 0.55, 0);
      spawnRipple(e.clientX, e.clientY, 'var(--v2)', 6, 12, 0.70, 80);
    });

    function spawnRipple(x, y, color, size, scale, dur, delay) {
      var el = document.createElement('div');
      el.style.cssText = 'position:fixed;pointer-events:none;z-index:9989;width:' + size + 'px;height:' + size + 'px;border-radius:50%;border:1.5px solid ' + color + ';left:' + x + 'px;top:' + y + 'px;transform:translate(-50%,-50%) scale(1);opacity:1;transition:transform ' + dur + 's ' + delay + 'ms cubic-bezier(0,.5,.5,1),opacity ' + dur + 's ' + delay + 'ms ease;';
      document.body.appendChild(el);
      requestAnimationFrame(function () {
        el.style.transform = 'translate(-50%,-50%) scale(' + scale + ')';
        el.style.opacity = '0';
      });
      setTimeout(function () { el.remove(); }, (dur + delay / 1000 + 0.1) * 1000);
    }

    /* Magnetic buttons */
    document.querySelectorAll('.btn-v, .btn-o').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var cx = r.left + r.width / 2;
        var cy = r.top + r.height / 2;
        btn.style.transform = 'translate(' + ((e.clientX - cx) * 0.25) + 'px, ' + ((e.clientY - cy) * 0.25) + 'px)';
      }, { passive: true });
      btn.addEventListener('mouseleave', function () { btn.style.transform = ''; });
    });

    /* Glow orb */
    var orb = document.createElement('div');
    orb.className = 'glow-orb';
    document.body.appendChild(orb);
    document.addEventListener('mousemove', function (e) {
      orb.style.left = e.clientX + 'px';
      orb.style.top = e.clientY + 'px';
      orb.classList.add('visible');
    }, { passive: true });
  }

  /* Prevent right-click */
  document.addEventListener('contextmenu', function (e) { e.preventDefault(); });

  /* Nav scroll state */
  var nav = document.getElementById('nav');
  window.addEventListener('scroll', function () {
    nav.classList.toggle('stuck', scrollY > 50);
  }, { passive: true });

  /* Mobile menu */
  var burger = document.getElementById('hamburger');
  var mmenu = document.getElementById('mmenu');

  function closeMenu() {
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    mmenu.classList.remove('open');
    document.body.style.overflow = '';
  }

  burger.addEventListener('click', function () {
    var open = burger.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
    mmenu.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  mmenu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mmenu.classList.contains('open')) closeMenu();
  });

  /* Smooth scroll */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var target = document.querySelector(a.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
    });
  });

  /* Active nav highlight */
  var navAs = document.querySelectorAll('.nav-links a, #mmenu a');
  function updateNav() {
    var current = '';
    document.querySelectorAll('section[id]').forEach(function (s) {
      if (s.getBoundingClientRect().top <= window.innerHeight * 0.5) current = s.id;
    });
    navAs.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + current); });
  }
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  /* Experience accordion */
  document.querySelectorAll('.exp-hdr').forEach(function (hdr) {
    hdr.addEventListener('click', function () {
      var card = hdr.closest('.exp-card');
      var wasOpen = card.classList.contains('open');
      document.querySelectorAll('.exp-card').forEach(function (c) { c.classList.remove('open'); });
      if (!wasOpen) card.classList.add('open');
    });
  });
  var firstCard = document.querySelector('.exp-card');
  if (firstCard) firstCard.classList.add('open');

  /* Stat counters */
  function countUp(el, target, dur) {
    dur = dur || 1200;
    var suffix = el.dataset.suffix || '';
    var start = performance.now();
    function step(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(eased * target) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var counterObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        countUp(entry.target, parseInt(entry.target.dataset.target));
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-target]').forEach(function (el) { counterObserver.observe(el); });

  /* Scroll reveal */
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(function (el) { revealObserver.observe(el); });

  /* Staggered project feature reveal */
  var featureObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.pf').forEach(function (pf, i) {
          setTimeout(function () { pf.classList.add('pf-visible'); }, i * 100);
        });
        featureObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  document.querySelectorAll('.proj-card').forEach(function (card) { featureObserver.observe(card); });

  /* 3D tilt on cards */
  if (!isTouch) {
    document.querySelectorAll('.proj-card, .skill-card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = 'perspective(800px) rotateY(' + (x * 6) + 'deg) rotateX(' + (-y * 6) + 'deg) translateY(-6px)';
      }, { passive: true });
      card.addEventListener('mouseleave', function () { card.style.transform = ''; });
    });
  }

  /* Text scramble on section headings */
  var CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%&*01234';
  var headingObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var h = entry.target;
      var gSpan = h.querySelector('.g');
      var textNode = h.childNodes[0];
      if (textNode && textNode.nodeType === 3 && gSpan) {
        var origText = textNode.textContent;
        var origG = gSpan.textContent;
        var iter = 0;
        var total = origText.length + origG.length;
        var interval = setInterval(function () {
          textNode.textContent = origText.split('').map(function (ch, i) {
            if (ch === ' ') return ch;
            return i < iter ? origText[i] : CHARS[Math.floor(Math.random() * CHARS.length)];
          }).join('');
          gSpan.textContent = origG.split('').map(function (ch, i) {
            if (ch === ' ') return ch;
            return (origText.length + i) < iter ? origG[i] : CHARS[Math.floor(Math.random() * CHARS.length)];
          }).join('');
          iter++;
          if (iter > total) {
            textNode.textContent = origText;
            gSpan.textContent = origG;
            clearInterval(interval);
          }
        }, 30);
      }
      headingObserver.unobserve(h);
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.sec-h').forEach(function (h) { headingObserver.observe(h); });

  /* Typewriter on hero subtitle */
  (function () {
    var heroSub = document.querySelector('.hero-sub');
    if (!heroSub) return;
    var strong = heroSub.querySelector('strong');
    if (!strong) return;
    var fullText = strong.textContent;
    strong.textContent = '';
    var cursor = document.createElement('span');
    cursor.className = 'typewriter-cursor';
    strong.appendChild(cursor);
    var i = 0;
    function type() {
      if (i < fullText.length) {
        strong.insertBefore(document.createTextNode(fullText[i]), cursor);
        i++;
        setTimeout(type, 45 + Math.random() * 35);
      } else {
        setTimeout(function () { cursor.remove(); }, 2000);
      }
    }
    setTimeout(type, 800);
  })();

  /* Scroll-linked floats */
  var backToTop = document.getElementById('back-to-top');
  var footer = document.querySelector('footer');
  var musicPanel = document.getElementById('music-player');

  window.addEventListener('scroll', function () {
    var footerRect = footer.getBoundingClientRect();
    var footerVisible = footerRect.top < window.innerHeight;
    backToTop.classList.toggle('show', scrollY > 600 && !footerVisible);
    musicPanel.classList.toggle('at-footer', footerVisible);
  }, { passive: true });

  backToTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* Music player */
  var audio = document.getElementById('bg-music');
  var musicBtn = document.getElementById('music-btn');
  audio.volume = 0.05;

  function setPlaying(on) { musicPanel.classList.toggle('playing', on); }
  function playMusic() { audio.play().then(function () { setPlaying(true); }).catch(function () { setPlaying(false); }); }

  musicBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    if (audio.paused) { playMusic(); } else { audio.pause(); setPlaying(false); }
  });

  var started = false;
  function onFirstInteraction() {
    if (started) return;
    audio.play().then(function () { started = true; setPlaying(true); }).catch(function () {});
  }
  ['click', 'scroll', 'keydown', 'touchstart'].forEach(function (evt) {
    window.addEventListener(evt, onFirstInteraction, { once: false, passive: true });
  });

  // Maze game — recursive backtracking, smooth animation
  var mazeCanvas = document.getElementById('maze-canvas');
  var mazeCtx = mazeCanvas ? mazeCanvas.getContext('2d') : null;
  var moveCountEl = document.getElementById('move-count');
  var timerEl = document.getElementById('maze-timer');
  var winOverlay = document.getElementById('maze-win');
  var winMovesEl = document.getElementById('win-moves');
  var winTimeEl = document.getElementById('win-time');

  var COLS = 10, ROWS = 10, CELL;
  var grid = [], visited = {};
  var player = { x: 0, y: 0, dx: 0, dy: 0, renderX: 0, renderY: 0, facing: 'right' };
  var moves = 0, timerID = null, elapsed = 0, gameActive = false;
  var animFrame = null, animating = false, gameTime = 0;
  var confettiTimeout = null;

  function initMazeSize() {
    var maxW = Math.min(window.innerWidth - 40, 480);
    CELL = Math.floor(maxW / COLS);
    if (CELL < 28) CELL = 28;
    if (CELL > 48) CELL = 48;
    mazeCanvas.width = COLS * CELL;
    mazeCanvas.height = ROWS * CELL;
  }

  function generateMaze() {
    grid = [];
    for (var r = 0; r < ROWS; r++) {
      grid[r] = [];
      for (var c = 0; c < COLS; c++) {
        grid[r][c] = { top: true, right: true, bottom: true, left: true, visited: false };
      }
    }
    var stack = [], current = { r: 0, c: 0 };
    grid[0][0].visited = true;
    stack.push(current);
    while (stack.length > 0) {
      var neighbours = [], cr = current.r, cc = current.c;
      if (cr > 0 && !grid[cr-1][cc].visited) neighbours.push({ r: cr-1, c: cc, wall: 'top' });
      if (cc < COLS-1 && !grid[cr][cc+1].visited) neighbours.push({ r: cr, c: cc+1, wall: 'right' });
      if (cr < ROWS-1 && !grid[cr+1][cc].visited) neighbours.push({ r: cr+1, c: cc, wall: 'bottom' });
      if (cc > 0 && !grid[cr][cc-1].visited) neighbours.push({ r: cr, c: cc-1, wall: 'left' });
      if (neighbours.length > 0) {
        var next = neighbours[Math.floor(Math.random() * neighbours.length)];
        if (next.wall === 'top')    { grid[cr][cc].top = false; grid[next.r][next.c].bottom = false; }
        if (next.wall === 'right')  { grid[cr][cc].right = false; grid[next.r][next.c].left = false; }
        if (next.wall === 'bottom') { grid[cr][cc].bottom = false; grid[next.r][next.c].top = false; }
        if (next.wall === 'left')   { grid[cr][cc].left = false; grid[next.r][next.c].right = false; }
        grid[next.r][next.c].visited = true;
        stack.push(current);
        current = next;
      } else {
        current = stack.pop();
      }
    }
  }

  function drawMaze(timestamp) {
    if (!mazeCtx) return;
    gameTime = timestamp || 0;
    var ctx = mazeCtx;
    var W = mazeCanvas.width, H = mazeCanvas.height;
    ctx.clearRect(0, 0, W, H);

    // Dark background
    ctx.fillStyle = '#080614';
    ctx.fillRect(0, 0, W, H);

    // Subtle grid dots
    ctx.fillStyle = 'rgba(139,92,246,.06)';
    for (var r = 0; r <= ROWS; r++) {
      for (var c = 0; c <= COLS; c++) {
        ctx.beginPath();
        ctx.arc(c * CELL, r * CELL, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Visited cells trail
    for (var key in visited) {
      var parts = key.split(',');
      var vc = parseInt(parts[0]), vr = parseInt(parts[1]);
      ctx.fillStyle = 'rgba(139,92,246,.06)';
      ctx.fillRect(vc * CELL + 2, vr * CELL + 2, CELL - 4, CELL - 4);
    }

    // Radial light around player
    var px = player.renderX * CELL + CELL / 2;
    var py = player.renderY * CELL + CELL / 2;
    var lightRadius = CELL * 3.5;
    var grad = ctx.createRadialGradient(px, py, 0, px, py, lightRadius);
    grad.addColorStop(0, 'rgba(139,92,246,.12)');
    grad.addColorStop(0.5, 'rgba(139,92,246,.04)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Walls
    ctx.lineCap = 'round';
    ctx.lineWidth = 2.5;
    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        var x = c * CELL, y = r * CELL;
        var cell = grid[r][c];
        // Walls closer to player are brighter
        var d = Math.sqrt(Math.pow(c - player.renderX, 2) + Math.pow(r - player.renderY, 2));
        var brightness = Math.max(0.15, Math.min(0.7, 1 - d / 8));
        ctx.strokeStyle = 'rgba(139,92,246,' + brightness + ')';

        if (cell.top)    { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + CELL, y); ctx.stroke(); }
        if (cell.right)  { ctx.beginPath(); ctx.moveTo(x + CELL, y); ctx.lineTo(x + CELL, y + CELL); ctx.stroke(); }
        if (cell.bottom) { ctx.beginPath(); ctx.moveTo(x, y + CELL); ctx.lineTo(x + CELL, y + CELL); ctx.stroke(); }
        if (cell.left)   { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + CELL); ctx.stroke(); }
      }
    }

    // Exit portal — animated pulsing ring
    var ex = (COLS - 1) * CELL + CELL / 2, ey = (ROWS - 1) * CELL + CELL / 2;
    var pulse = Math.sin(gameTime * 0.004) * 0.15 + 0.85;
    // Outer glow
    var exitGrad = ctx.createRadialGradient(ex, ey, 0, ex, ey, CELL * 0.45);
    exitGrad.addColorStop(0, 'rgba(163,230,53,.25)');
    exitGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = exitGrad;
    ctx.fillRect(ex - CELL * 0.5, ey - CELL * 0.5, CELL, CELL);
    // Ring
    ctx.beginPath();
    ctx.arc(ex, ey, CELL * 0.28 * pulse, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(163,230,53,.6)';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Inner dot
    ctx.beginPath();
    ctx.arc(ex, ey, CELL * 0.1, 0, Math.PI * 2);
    ctx.fillStyle = '#a3e635';
    ctx.fill();
    // Star sparkles around exit
    for (var s = 0; s < 4; s++) {
      var sa = (gameTime * 0.002 + s * Math.PI / 2) % (Math.PI * 2);
      var sr = CELL * 0.35;
      var sparkX = ex + Math.cos(sa) * sr;
      var sparkY = ey + Math.sin(sa) * sr;
      ctx.beginPath();
      ctx.arc(sparkX, sparkY, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(190,242,100,.6)';
      ctx.fill();
    }

    // Player character — animated star with face
    var bounce = Math.sin(gameTime * 0.006) * 2;
    var squish = animating ? 0.85 : 1;
    var squishY = animating ? 1.15 : 1;
    var bodyR = CELL * 0.32;

    // Player shadow
    ctx.beginPath();
    ctx.ellipse(px, py + bodyR + 3, bodyR * 0.7, 3, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,.3)';
    ctx.fill();

    // Player outer glow (pulsing)
    var glowPulse = Math.sin(gameTime * 0.005) * 0.08 + 0.2;
    ctx.beginPath();
    ctx.arc(px, py + bounce, bodyR * 1.4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(167,139,250,' + glowPulse + ')';
    ctx.fill();

    // Body (Star Shape)
    ctx.save();
    ctx.translate(px, py + bounce);
    ctx.scale(squish, squishY);

    function drawStarPath(cx, cy, spikes, outerRadius, innerRadius) {
      var rot = (Math.PI / 2 * 3) + (gameTime * 0.002); // Add rotation
      var x = cx, y = cy, step = Math.PI / spikes;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
      for (var i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;
        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }
      ctx.closePath();
    }

    // Main star gradient
    var starGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, bodyR);
    starGrad.addColorStop(0, '#ddd6fe');
    starGrad.addColorStop(0.4, '#a78bfa');
    starGrad.addColorStop(1, '#7c3aed');
    
    // Sharper star: innerRadius is 0.4 of outerRadius
    drawStarPath(0, 0, 5, bodyR, bodyR * 0.4);
    ctx.fillStyle = starGrad;
    ctx.fill();

    // Subtle edge highlight
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Eyes
    var eyeOffX = 0, eyeOffY = 0;
    if (player.facing === 'left') eyeOffX = -2;
    if (player.facing === 'right') eyeOffX = 2;
    if (player.facing === 'up') eyeOffY = -2;
    if (player.facing === 'down') eyeOffY = 2;

    var eyeSpacing = bodyR * 0.25;
    // Eyes
    ctx.fillStyle = '#1e1a38';
    ctx.beginPath(); ctx.arc(-eyeSpacing + eyeOffX, -bodyR * 0.05 + eyeOffY, bodyR * 0.1, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(eyeSpacing + eyeOffX, -bodyR * 0.05 + eyeOffY, bodyR * 0.1, 0, Math.PI * 2); ctx.fill();
    
    // Tiny white shine
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(-eyeSpacing + eyeOffX - 1, -bodyR * 0.07 + eyeOffY, bodyR * 0.04, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(eyeSpacing + eyeOffX - 1, -bodyR * 0.07 + eyeOffY, bodyR * 0.04, 0, Math.PI * 2); ctx.fill();

    // Smile
    ctx.beginPath();
    ctx.arc(0 + eyeOffX * 0.5, bodyR * 0.1 + eyeOffY * 0.5, bodyR * 0.15, 0.1 * Math.PI, 0.9 * Math.PI, false);
    ctx.strokeStyle = '#1e1a38';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.restore();

    // Keep the render loop going for animations
    if (gameActive) {
      animFrame = requestAnimationFrame(drawMaze);
    }
  }

  // Smooth lerp movement
  function lerpTo(targetX, targetY, dir) {
    if (animating) return;
    animating = true;
    player.facing = dir;
    var startX = player.renderX, startY = player.renderY;
    var duration = 100; // ms
    var startTime = performance.now();

    function step(now) {
      var t = Math.min((now - startTime) / duration, 1);
      // Ease out cubic
      t = 1 - Math.pow(1 - t, 3);
      player.renderX = startX + (targetX - startX) * t;
      player.renderY = startY + (targetY - startY) * t;
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        player.renderX = targetX;
        player.renderY = targetY;
        animating = false;
      }
    }
    requestAnimationFrame(step);
  }

  function movePlayer(dir) {
    if (!gameActive || animating) return;
    var c = grid[player.y][player.x];
    var newX = player.x, newY = player.y;
    if (dir === 'up' && !c.top && player.y > 0) newY--;
    if (dir === 'down' && !c.bottom && player.y < ROWS - 1) newY++;
    if (dir === 'left' && !c.left && player.x > 0) newX--;
    if (dir === 'right' && !c.right && player.x < COLS - 1) newX++;

    if (newX !== player.x || newY !== player.y) {
      if (moves === 0) startTimer(); // Start timer on first move
      player.x = newX;
      player.y = newY;
      visited[newX + ',' + newY] = true;
      moves++;
      moveCountEl.textContent = moves;
      lerpTo(newX, newY, dir);

      if (player.x === COLS - 1 && player.y === ROWS - 1) {
        gameActive = false;
        clearInterval(timerID);
        setTimeout(showWin, 400);
      }
    } else {
      // Bump animation — face the direction even if blocked
      player.facing = dir;
    }
  }

  function formatTime(sec) {
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function startTimer() {
    elapsed = 0;
    clearInterval(timerID);
    timerEl.textContent = '0:00';
    timerID = setInterval(function () {
      elapsed++;
      timerEl.textContent = formatTime(elapsed);
    }, 1000);
  }

  function newGame() {
    if (animFrame) cancelAnimationFrame(animFrame);
    if (confettiTimeout) clearTimeout(confettiTimeout);
    initMazeSize();
    generateMaze();
    player.x = 0; player.y = 0;
    player.renderX = 0; player.renderY = 0;
    player.facing = 'right';
    visited = {}; visited['0,0'] = true;
    moves = 0; animating = false;
    moveCountEl.textContent = '0';
    timerEl.textContent = '0:00';
    elapsed = 0;
    clearInterval(timerID);
    timerID = null;
    gameActive = true;
    animFrame = requestAnimationFrame(drawMaze);
  }

  function showWin() {
    winMovesEl.textContent = moves;
    winTimeEl.textContent = formatTime(elapsed);
    winOverlay.classList.add('show');
    fireConfetti();
  }

  // Lightweight confetti with auto-cleanup
  function fireConfetti() {
    var cc = document.getElementById('confetti-canvas');
    if (!cc) return;
    var ctx = cc.getContext('2d');
    cc.width = window.innerWidth;
    cc.height = window.innerHeight;
    var particles = [];
    var colors = ['#8b5cf6', '#a3e635', '#22d3ee', '#f472b6', '#fb923c', '#bef264'];
    var running = true;

    for (var i = 0; i < 50; i++) {
      particles.push({
        x: cc.width / 2 + (Math.random() - 0.5) * 160,
        y: cc.height / 2,
        vx: (Math.random() - 0.5) * 12,
        vy: Math.random() * -11 - 3,
        w: Math.random() * 7 + 3,
        h: Math.random() * 5 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        rot: Math.random() * 360,
        rv: (Math.random() - 0.5) * 10,
        life: 1
      });
    }

    function draw() {
      if (!running) { ctx.clearRect(0, 0, cc.width, cc.height); return; }
      ctx.clearRect(0, 0, cc.width, cc.height);
      var alive = false;
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        if (p.life <= 0) continue;
        alive = true;
        p.vy += 0.25;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.rv;
        p.life -= 0.015;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot * Math.PI / 180);
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      if (alive) requestAnimationFrame(draw);
    }
    draw();

    // Auto-stop after 3 seconds to prevent frame drops
    confettiTimeout = setTimeout(function () {
      running = false;
      ctx.clearRect(0, 0, cc.width, cc.height);
    }, 3000);
  }

  if (mazeCanvas) {
    newGame();
    window.addEventListener('resize', function () {
      initMazeSize();
      if (gameActive) drawMaze();
    }, { passive: true });

    document.getElementById('new-maze-btn').addEventListener('click', function () {
      winOverlay.classList.remove('show');
      newGame();
    });
    document.getElementById('play-again-btn').addEventListener('click', function () {
      winOverlay.classList.remove('show');
      newGame();
    });

    // Keyboard
    document.addEventListener('keydown', function (e) {
      if (document.getElementById('terminal-overlay').classList.contains('show')) return;
      var dirMap = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', a: 'left', s: 'down', d: 'right', W: 'up', A: 'left', S: 'down', D: 'right' };
      if (dirMap[e.key]) { e.preventDefault(); movePlayer(dirMap[e.key]); }
    });

    // D-pad
    document.querySelectorAll('.dpad-btn').forEach(function (btn) {
      btn.addEventListener('click', function () { movePlayer(btn.dataset.dir); });
    });

    // Swipe
    var sx = 0, sy = 0;
    mazeCanvas.addEventListener('touchstart', function (e) {
      sx = e.touches[0].clientX; sy = e.touches[0].clientY;
    }, { passive: true });
    mazeCanvas.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - sx;
      var dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
      if (Math.abs(dx) > Math.abs(dy)) { movePlayer(dx > 0 ? 'right' : 'left'); }
      else { movePlayer(dy > 0 ? 'down' : 'up'); }
    }, { passive: true });
  }

  // ═══════════════════════════════════════════════════════
  // INTERACTIVE TERMINAL
  // ═══════════════════════════════════════════════════════

  var termOverlay = document.getElementById('terminal-overlay');
  var termInput = document.getElementById('terminal-input');
  var termOutput = document.getElementById('terminal-output');
  var termBody = document.getElementById('terminal-body');

  function toggleTerminal(show) {
    if (show === undefined) show = !termOverlay.classList.contains('show');
    termOverlay.classList.toggle('show', show);
    if (show) {
      document.body.style.overflow = 'hidden';
      setTimeout(function () { termInput.focus(); }, 100);
    } else {
      document.body.style.overflow = '';
    }
  }

  // Open with backtick
  document.addEventListener('keydown', function (e) {
    if (e.key === '`' && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      toggleTerminal();
    }
  });

  // Close button
  var termClose = document.getElementById('terminal-close');
  if (termClose) termClose.addEventListener('click', function () { toggleTerminal(false); });

  // Click outside to close
  if (termOverlay) {
    termOverlay.addEventListener('click', function (e) {
      if (e.target === termOverlay) toggleTerminal(false);
    });
  }

  // Draggable terminal window
  (function () {
    var termBar = document.getElementById('terminal-bar');
    var termWin = document.getElementById('terminal-window');
    if (!termBar || !termWin) return;
    var dragging = false, offX = 0, offY = 0;

    termBar.addEventListener('mousedown', function (e) {
      if (e.target.id === 'terminal-close') return;
      dragging = true;
      var rect = termWin.getBoundingClientRect();
      offX = e.clientX - rect.left;
      offY = e.clientY - rect.top;
      termWin.style.position = 'fixed';
      termWin.style.margin = '0';
    });

    document.addEventListener('mousemove', function (e) {
      if (!dragging) return;
      termWin.style.left = (e.clientX - offX) + 'px';
      termWin.style.top = (e.clientY - offY) + 'px';
    });

    document.addEventListener('mouseup', function () { dragging = false; });
  })();

  // Terminal commands
  var COMMANDS = {
    help: function () {
      return [
        '<span class="term-accent">Available commands:</span>',
        '',
        '  <span class="term-cmd">about</span>      Who is Jeof?',
        '  <span class="term-cmd">skills</span>     Technical skills',
        '  <span class="term-cmd">projects</span>   Featured projects',
        '  <span class="term-cmd">experience</span> Work history',
        '  <span class="term-cmd">contact</span>    Get in touch',
        '  <span class="term-cmd">maze</span>       Jump to the maze game',
        '  <span class="term-cmd">clear</span>      Clear terminal',
        '  <span class="term-cmd">exit</span>       Close terminal',
        '',
        '<span class="term-pink">Tip: Press ` (backtick) to toggle this terminal anytime.</span>'
      ];
    },
    about: function () {
      return [
        '<span class="term-accent">Jeof Yciar T. Sison</span>',
        'BSIT Graduate | IT Support | Service Desk | Dev',
        '',
        'Resolving technical issues, building web systems,',
        'and crafting interactive games.',
        '',
        '<span class="term-cyan">Navigating to About section...</span>'
      ];
    },
    skills: function () {
      return [
        '<span class="term-accent">Technical Skills</span>',
        '',
        '  <span class="term-cmd">IT Support:</span> PC Troubleshooting, OS Config, SSD Upgrades',
        '  <span class="term-cmd">Tools:</span>      ServiceNow, SCCM, Quick Assist, Teams',
        '  <span class="term-cmd">Dev:</span>        PHP, JS, HTML/CSS, Python, C#, SQL, Unity',
        '',
        '<span class="term-cyan">Navigating to Skills section...</span>'
      ];
    },
    projects: function () {
      return [
        '<span class="term-accent">Featured Projects</span>',
        '',
        '  1. <span class="term-cmd">Internal Ticketing System</span> — PHP, SQL, WebSockets',
        '  2. <span class="term-cmd">Neural Labyrinth</span> — Unity, C# (Capstone)',
        '  3. <span class="term-cmd">Veloci</span> — Budget tracker for PH entrepreneurs',
        '  4. <span class="term-cmd">Auto Portfolio Generator</span> — No-code portfolio builder',
        '',
        '<span class="term-cyan">Navigating to Projects section...</span>'
      ];
    },
    experience: function () {
      return [
        '<span class="term-accent">Work Experience</span>',
        '',
        '  <span class="term-cmd">Service Desk L1</span> @ Unison Solutions (Jul 2025 — Mar 2026)',
        '  <span class="term-cmd">Technical Support</span> @ Unison Solutions (Jun — Jul 2025)',
        '  <span class="term-cmd">IT Intern</span> @ Phil. First Insurance (486 hrs)',
        '',
        '<span class="term-cyan">Navigating to Experience section...</span>'
      ];
    },
    contact: function () {
      return [
        '<span class="term-accent">Contact</span>',
        '',
        '  <span class="term-cmd">Email:</span>    jeofsison9@gmail.com',
        '  <span class="term-cmd">GitHub:</span>   github.com/R41CY',
        '  <span class="term-cmd">Facebook:</span> raicy.gov',
        '',
        '<span class="term-cyan">Navigating to Contact section...</span>'
      ];
    },
    maze: function () {
      return ['<span class="term-cyan">Opening the maze game...</span>'];
    },
    clear: 'clear',
    exit: 'exit'
  };

  // Section navigation map
  var NAV_MAP = { about: '#about', skills: '#skills', projects: '#projects', experience: '#experience', contact: '#contact', maze: '#playground' };

  function addTermLine(html) {
    var div = document.createElement('div');
    div.className = 'term-line';
    div.innerHTML = html;
    termOutput.appendChild(div);
    termBody.scrollTop = termBody.scrollHeight;
  }

  if (termInput) {
    termInput.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      var cmd = termInput.value.trim().toLowerCase();
      termInput.value = '';
      if (!cmd) return;

      // Echo the command
      var echo = document.createElement('div');
      echo.className = 'term-prompt-echo';
      echo.textContent = 'jeof@portfolio:~$ ' + cmd;
      termOutput.appendChild(echo);

      if (cmd === 'clear') {
        termOutput.innerHTML = '';
      } else if (cmd === 'exit') {
        toggleTerminal(false);
      } else if (COMMANDS[cmd]) {
        var output = typeof COMMANDS[cmd] === 'function' ? COMMANDS[cmd]() : [];
        var i = 0;
        function typeLine() {
          if (i < output.length) {
            addTermLine(output[i]);
            i++;
            setTimeout(typeLine, 40);
          } else if (NAV_MAP[cmd]) {
            setTimeout(function () {
              toggleTerminal(false);
              var el = document.querySelector(NAV_MAP[cmd]);
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 600);
          }
        }
        typeLine();
      } else {
        addTermLine('Command not found: <span class="term-pink">' + cmd + '</span>. Type <span class="term-cmd">help</span> for available commands.');
      }
      termBody.scrollTop = termBody.scrollHeight;
    });
  }

  // ═══════════════════════════════════════════════════════
  // KONAMI CODE EASTER EGG
  // ═══════════════════════════════════════════════════════

  var konamiSeq = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  var konamiIdx = 0;

  document.addEventListener('keydown', function (e) {
    if (e.key === konamiSeq[konamiIdx]) {
      konamiIdx++;
      if (konamiIdx === konamiSeq.length) {
        konamiIdx = 0;
        document.body.classList.add('konami-mode');
        setTimeout(function () { document.body.classList.remove('konami-mode'); }, 5000);
      }
    } else {
      konamiIdx = 0;
    }
  });

})();
