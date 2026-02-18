/* ================================================================
   COSMOS FULL ANIMATION SUITE — SCRIPT.JS
   Particle starfield, shooting stars, rocket trails, physics springs,
   magnetic buttons, 3D tilt, parallax, scroll reveal, page loader,
   counter animation, FAQ accordion, cursor glow, SVG path draw,
   ShinyText, FlowingMenu, 3D Model particles
   ================================================================ */

(function () {
  'use strict';

  /* ── UTILITIES ────────────────────────────────────────────── */
  const lerp = (a, b, n) => a + (b - a) * n;
  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
  const isMobile = () => window.innerWidth <= 768;
  const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── STATE ────────────────────────────────────────────────── */
  const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  let scrollY = 0;

  document.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener('scroll', () => { scrollY = window.pageYOffset; }, { passive: true });


  /* ════════════════════════════════════════════════════════════
     1. PAGE LOADER
     ════════════════════════════════════════════════════════════ */
  window.addEventListener('load', () => {
    const loader = document.getElementById('pageLoader');
    setTimeout(() => {
      loader.classList.add('hidden');
      document.body.classList.remove('loading');
      triggerEntryAnimations();
      document.getElementById('nav').classList.add('loaded');
    }, 2000);
  });


  /* ════════════════════════════════════════════════════════════
     2. PAGE ENTRY ANIMATIONS
     ════════════════════════════════════════════════════════════ */
  function triggerEntryAnimations() {
    const heroAnims = document.querySelectorAll(
      '.anim-fade-up:not([data-scroll]),.anim-fade-down:not([data-scroll]),' +
      '.anim-blur-in:not([data-scroll]),.anim-slide-right:not([data-scroll]),' +
      '.anim-scale-rotate:not([data-scroll]),.anim-scale-up:not([data-scroll])'
    );
    heroAnims.forEach(el => {
      const delay = parseInt(el.dataset.delay) || 0;
      setTimeout(() => el.classList.add('animate'), delay);
    });
    setTimeout(() => {
      const svg = document.querySelector('.hero__path-svg');
      if (svg) svg.classList.add('drawn');
    }, 1200);
  }


  /* ════════════════════════════════════════════════════════════
     3. SCROLL-TRIGGERED ANIMATIONS (re-entrant)
     ════════════════════════════════════════════════════════════ */
  const scrollObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        entry.target.classList.toggle('in-view', entry.isIntersecting);
      });
    },
    { rootMargin: '0px 0px -80px 0px', threshold: 0.05 }
  );
  document.querySelectorAll('[data-scroll]').forEach(el => scrollObserver.observe(el));


  /* ════════════════════════════════════════════════════════════
     4. SCROLL PROGRESS BAR
     ════════════════════════════════════════════════════════════ */
  const progressBar = document.getElementById('scrollProgress');
  function updateScrollProgress() {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`;
  }


  /* ════════════════════════════════════════════════════════════
     5. SHINY TEXT — set CSS custom property for speed
     ════════════════════════════════════════════════════════════ */
  document.querySelectorAll('.shiny-text').forEach(el => {
    const speed = parseFloat(el.dataset.speed) || 3;
    el.style.setProperty('--shiny-speed', speed + 's');
  });


  /* ════════════════════════════════════════════════════════════
     6. PARTICLE STARFIELD + SHOOTING STARS + ROCKETS
     ════════════════════════════════════════════════════════════ */
  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  let stars = [], shootingStars = [], rocketTrails = [];

  function initCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    stars = [];
    const count = isMobile() ? 80 : 200;
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.8 + 0.3,
        alpha: Math.random() * 0.6 + 0.1,
        twinkleSpeed: Math.random() * 0.015 + 0.005,
        twinklePhase: Math.random() * Math.PI * 2,
        depth: Math.random() * 3 + 1,
      });
    }
  }

  function spawnShootingStar() {
    if (prefersReducedMotion()) return;
    shootingStars.push({
      x: Math.random() * canvas.width * 0.7,
      y: Math.random() * canvas.height * 0.4,
      len: Math.random() * 80 + 40,
      speed: Math.random() * 8 + 6,
      angle: Math.PI / 6 + Math.random() * 0.3,
      life: 1,
    });
  }

  function spawnRocket() {
    if (prefersReducedMotion() || isMobile()) return;
    const side = Math.random() > 0.5;
    rocketTrails.push({
      x: side ? -10 : canvas.width + 10,
      y: canvas.height * 0.3 + Math.random() * canvas.height * 0.4,
      vx: side ? (Math.random() * 3 + 2) : -(Math.random() * 3 + 2),
      vy: -(Math.random() * 1.5 + 0.5),
      life: 1,
      particles: [],
    });
  }

  function animateCanvas() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const scrollOff = scrollY * 0.05;

    // Stars
    stars.forEach(s => {
      s.twinklePhase += s.twinkleSpeed;
      const tw = Math.sin(s.twinklePhase) * 0.3 + 0.7;
      let py = (s.y - scrollOff * s.depth) % canvas.height;
      if (py < 0) py += canvas.height;
      const mx = (mouse.x - canvas.width / 2) * 0.003 * s.depth;
      const my = (mouse.y - canvas.height / 2) * 0.003 * s.depth;
      ctx.beginPath();
      ctx.arc(s.x + mx, py + my, s.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,190,255,${s.alpha * tw})`;
      ctx.fill();
    });

    // Shooting stars
    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const ss = shootingStars[i];
      ss.x += Math.cos(ss.angle) * ss.speed;
      ss.y += Math.sin(ss.angle) * ss.speed;
      ss.life -= 0.015;
      if (ss.life <= 0) { shootingStars.splice(i, 1); continue; }
      const g = ctx.createLinearGradient(ss.x, ss.y,
        ss.x - Math.cos(ss.angle) * ss.len, ss.y - Math.sin(ss.angle) * ss.len);
      g.addColorStop(0, `rgba(167,139,250,${ss.life})`);
      g.addColorStop(1, 'rgba(167,139,250,0)');
      ctx.beginPath();
      ctx.moveTo(ss.x, ss.y);
      ctx.lineTo(ss.x - Math.cos(ss.angle) * ss.len, ss.y - Math.sin(ss.angle) * ss.len);
      ctx.strokeStyle = g;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(ss.x, ss.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${ss.life})`;
      ctx.fill();
    }

    // Rocket trails
    for (let i = rocketTrails.length - 1; i >= 0; i--) {
      const rt = rocketTrails[i];
      rt.x += rt.vx; rt.y += rt.vy;
      rt.life -= 0.005;
      if (rt.life <= 0) { rocketTrails.splice(i, 1); continue; }
      if (Math.random() > 0.3) {
        rt.particles.push({
          x: rt.x, y: rt.y,
          vx: (Math.random() - 0.5) * 1.5, vy: Math.random() * 1.5 + 0.5,
          life: 1, size: Math.random() * 2 + 1,
        });
      }
      for (let j = rt.particles.length - 1; j >= 0; j--) {
        const p = rt.particles[j];
        p.x += p.vx; p.y += p.vy; p.life -= 0.025;
        if (p.life <= 0) { rt.particles.splice(j, 1); continue; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(124,58,237,${p.life * 0.5})`;
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(rt.x, rt.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(167,139,250,${rt.life * 0.6})`;
      ctx.shadowBlur = 12;
      ctx.shadowColor = 'rgba(167,139,250,0.4)';
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    requestAnimationFrame(animateCanvas);
  }

  initCanvas();
  animateCanvas();
  window.addEventListener('resize', initCanvas);
  setInterval(spawnShootingStar, 3000);
  setInterval(spawnRocket, 8000);


  /* ════════════════════════════════════════════════════════════
     7. PLANET DOT PARTICLES + ORBIT PARTICLES
     ════════════════════════════════════════════════════════════ */
  const planetDotsEl = document.getElementById('planetDots');
  if (planetDotsEl) {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 80; i++) {
      const dot = document.createElement('span');
      const sz = Math.random() * 2.5 + 1;
      const ang = Math.random() * 360;
      const dist = 20 + Math.random() * 28;
      const x = 50 + Math.cos(ang * Math.PI / 180) * dist;
      const y = 50 + Math.sin(ang * Math.PI / 180) * dist;
      Object.assign(dot.style, {
        position: 'absolute', width: sz + 'px', height: sz + 'px',
        left: x + '%', top: y + '%', borderRadius: '50%',
        background: `rgba(167,139,250,${Math.random() * .5 + .15})`,
        boxShadow: `0 0 ${sz * 3}px rgba(167,139,250,.25)`,
        animation: `dotTwinkle ${Math.random() * 3 + 2}s ease-in-out ${Math.random() * 6}s infinite`,
        pointerEvents: 'none',
      });
      frag.appendChild(dot);
    }
    planetDotsEl.appendChild(frag);
  }

  const planetParticlesEl = document.getElementById('planetParticles');
  if (planetParticlesEl) {
    for (let i = 0; i < 12; i++) {
      const p = document.createElement('span');
      const sz = Math.random() * 3 + 1;
      Object.assign(p.style, {
        position: 'absolute', width: sz + 'px', height: sz + 'px',
        left: '50%', top: '50%', borderRadius: '50%',
        background: `rgba(129,140,248,${Math.random() * .3 + .1})`,
        boxShadow: '0 0 6px rgba(129,140,248,.2)',
        animation: `orbitFloat ${6 + Math.random() * 4}s linear ${Math.random() * 3}s infinite`,
        transform: `rotate(${(i / 12) * 360}deg) translateX(${55 + Math.random() * 15}%)`,
        pointerEvents: 'none',
      });
      planetParticlesEl.appendChild(p);
    }
  }


  /* ════════════════════════════════════════════════════════════
     8. CTA + 3D MODEL FLOATING PARTICLES
     ════════════════════════════════════════════════════════════ */
  ['ctaParticles', 'modelParticles'].forEach(id => {
    const container = document.getElementById(id);
    if (!container) return;
    for (let i = 0; i < 24; i++) {
      const p = document.createElement('span');
      const sz = Math.random() * 3 + 1;
      Object.assign(p.style, {
        position: 'absolute',
        width: sz + 'px', height: sz + 'px',
        left: Math.random() * 100 + '%', top: Math.random() * 100 + '%',
        borderRadius: '50%',
        background: `rgba(167,139,250,${Math.random() * .15 + .05})`,
        animation: `floatParticle ${5 + Math.random() * 8}s ease-in-out ${Math.random() * 5}s infinite`,
        pointerEvents: 'none',
      });
      container.appendChild(p);
    }
  });


  /* ════════════════════════════════════════════════════════════
     9. PILLNAV — scroll + hover circles + mobile
     ════════════════════════════════════════════════════════════ */
  const nav = document.getElementById('nav');
  function updateNav() { nav.classList.toggle('scrolled', scrollY > 60); }

  // Hover-circle sizing (adapted from GSAP PillNav geometry)
  function layoutPillCircles() {
    document.querySelectorAll('.pill').forEach(pill => {
      const circle = pill.querySelector('.hover-circle');
      if (!circle) return;
      const rect = pill.getBoundingClientRect();
      const w = rect.width, h = rect.height;
      const R = ((w * w) / 4 + h * h) / (2 * h);
      const D = Math.ceil(2 * R) + 2;
      const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
      circle.style.width = D + 'px';
      circle.style.height = D + 'px';
      circle.style.bottom = '-' + delta + 'px';
    });
  }
  layoutPillCircles();
  window.addEventListener('resize', layoutPillCircles);

  // Mobile Menu
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    mobileMenu.querySelectorAll('.mobile-menu-link').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }


  /* ════════════════════════════════════════════════════════════
     11. COUNTER ANIMATION (elastic ease)
     ════════════════════════════════════════════════════════════ */
  let countersRan = false;
  const statNums = document.querySelectorAll('.stat__num');
  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting && !countersRan) { countersRan = true; runCounters(); }
    });
  }, { threshold: 0.3 });
  const statsEl = document.querySelector('.stats');
  if (statsEl) counterObs.observe(statsEl);

  function runCounters() {
    statNums.forEach(el => {
      const target = parseInt(el.dataset.target);
      const dec = el.dataset.decimal ? parseInt(el.dataset.decimal) : null;
      const dur = 2400, start = performance.now();
      (function tick(now) {
        const p = Math.min((now - start) / dur, 1);
        const ease = p === 1 ? 1 : 1 - Math.pow(2, -10 * p) * Math.cos((p * 10 - 0.75) * (2 * Math.PI) / 3);
        if (dec !== null) el.textContent = (ease * (target + dec / 10)).toFixed(1);
        else el.textContent = Math.floor(ease * target);
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = dec !== null ? `${target}.${dec}` : target;
      })(start);
    });
  }


  /* ════════════════════════════════════════════════════════════
     12. FAQ ACCORDION
     ════════════════════════════════════════════════════════════ */
  document.querySelectorAll('.faq__item').forEach(item => {
    item.querySelector('.faq__q').addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq__item').forEach(i => {
        i.classList.remove('open');
        i.querySelector('.faq__q').setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        item.querySelector('.faq__q').setAttribute('aria-expanded', 'true');
      }
    });
  });


  /* ════════════════════════════════════════════════════════════
     13. SMOOTH SCROLL
     ════════════════════════════════════════════════════════════ */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (e) {
      const id = this.getAttribute('href');
      if (id === '#') return;
      e.preventDefault();
      const target = document.querySelector(id);
      if (target) {
        smoothScrollTo(target.getBoundingClientRect().top + window.pageYOffset - 72, 900);
      }
    });
  });

  function smoothScrollTo(targetY, duration) {
    const startY = window.pageYOffset, diff = targetY - startY, start = performance.now();
    (function step(now) {
      const t = Math.min((now - start) / duration, 1);
      window.scrollTo(0, startY + diff * (1 - Math.pow(1 - t, 4)));
      if (t < 1) requestAnimationFrame(step);
    })(start);
  }


  /* ════════════════════════════════════════════════════════════
     14. 3D TILT EFFECT (spring-damped)
     ════════════════════════════════════════════════════════════ */
  document.querySelectorAll('[data-tilt]').forEach(el => {
    const maxTilt = parseInt(el.dataset.tiltMax) || 8;
    let cx = 0, cy = 0, tx = 0, ty = 0;
    el.addEventListener('mousemove', function (e) {
      if (isMobile()) return;
      const r = this.getBoundingClientRect();
      tx = ((e.clientY - r.top) / r.height - 0.5) * -maxTilt;
      ty = ((e.clientX - r.left) / r.width - 0.5) * maxTilt;
    });
    el.addEventListener('mouseleave', () => { tx = 0; ty = 0; });
    (function anim() {
      cx = lerp(cx, tx, 0.08);
      cy = lerp(cy, ty, 0.08);
      el.style.transform = `perspective(800px) rotateX(${cx}deg) rotateY(${cy}deg)`;
      requestAnimationFrame(anim);
    })();
  });


  /* ════════════════════════════════════════════════════════════
     15. CARD CURSOR GLOW
     ════════════════════════════════════════════════════════════ */
  document.querySelectorAll('.exp-card, .int-card').forEach(card => {
    card.addEventListener('mousemove', function (e) {
      const r = this.getBoundingClientRect();
      this.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
      this.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
    });
  });


  /* ════════════════════════════════════════════════════════════
     16. MAGNETIC BUTTONS (spring physics)
     ════════════════════════════════════════════════════════════ */
  document.querySelectorAll('.btn--magnetic').forEach(btn => {
    let bx = 0, by = 0, tx = 0, ty = 0;
    btn.addEventListener('mousemove', function (e) {
      if (isMobile()) return;
      const r = this.getBoundingClientRect();
      tx = (e.clientX - r.left - r.width / 2) * 0.25;
      ty = (e.clientY - r.top - r.height / 2) * 0.25;
    });
    btn.addEventListener('mouseleave', () => { tx = 0; ty = 0; });
    (function anim() {
      bx = lerp(bx, tx, 0.1);
      by = lerp(by, ty, 0.1);
      btn.style.transform = `translate(${bx}px,${by}px)`;
      requestAnimationFrame(anim);
    })();
  });


  /* ════════════════════════════════════════════════════════════
     17. BUTTON RIPPLE
     ════════════════════════════════════════════════════════════ */
  document.querySelectorAll('.btn--primary').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const r = this.getBoundingClientRect();
      const circle = document.createElement('span');
      Object.assign(circle.style, {
        position: 'absolute', width: '0', height: '0', borderRadius: '50%',
        background: 'rgba(255,255,255,.22)',
        left: (e.clientX - r.left) + 'px', top: (e.clientY - r.top) + 'px',
        transform: 'translate(-50%,-50%)', pointerEvents: 'none',
        animation: 'btnRipple .6s cubic-bezier(.34,1.56,.64,1) forwards',
      });
      this.appendChild(circle);
      circle.addEventListener('animationend', () => circle.remove());
    });
  });


  /* ════════════════════════════════════════════════════════════
     18. CURSOR GLOW FOLLOWER
     ════════════════════════════════════════════════════════════ */
  const cursorGlow = document.createElement('div');
  cursorGlow.className = 'cursor-glow';
  document.body.appendChild(cursorGlow);
  let glowX = mouse.x, glowY = mouse.y;

  function animateGlow() {
    if (!isMobile()) {
      glowX = lerp(glowX, mouse.x, 0.06);
      glowY = lerp(glowY, mouse.y, 0.06);
      cursorGlow.style.left = glowX + 'px';
      cursorGlow.style.top = glowY + 'px';
      cursorGlow.style.opacity = '1';
    }
    requestAnimationFrame(animateGlow);
  }
  animateGlow();
  document.addEventListener('mouseleave', () => { cursorGlow.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { cursorGlow.style.opacity = '1'; });


  /* ════════════════════════════════════════════════════════════
     19. MULTI-LAYER PARALLAX
     ════════════════════════════════════════════════════════════ */
  const parallaxEls = document.querySelectorAll('[data-parallax]');
  const mouseParallaxEls = document.querySelectorAll('[data-mouse-parallax]');

  function updateParallax() {
    parallaxEls.forEach(el => {
      el.style.transform = `translateY(${scrollY * (parseFloat(el.dataset.parallax) || 0.02)}px)`;
    });
    if (!isMobile()) {
      mouseParallaxEls.forEach(el => {
        const s = parseInt(el.dataset.mouseParallax) || 20;
        el.style.transform = `translate(${(mouse.x - window.innerWidth / 2) / window.innerWidth * s}px, ${(mouse.y - window.innerHeight / 2) / window.innerHeight * s}px)`;
      });
    }
  }


  /* ════════════════════════════════════════════════════════════
     20. FLOWING MENU — edge-detected marquee overlay
     ════════════════════════════════════════════════════════════ */
  function initFlowingMenu() {
    const items = document.querySelectorAll('.fm-item');
    if (!items.length) return;

    items.forEach(item => {
      const link = item.querySelector('.fm-item__link');

      function findEdge(mouseX, mouseY, width, height) {
        const topDist = mouseX * mouseX + mouseY * mouseY;
        const bottomDist = (mouseX - width / 2) * (mouseX - width / 2) + (mouseY - height) * (mouseY - height);
        // simpler: compare mouse Y to midpoint
        return mouseY < height / 2 ? 'top' : 'bottom';
      }

      link.addEventListener('mouseenter', function (e) {
        const rect = item.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        const edge = findEdge(mx, my, rect.width, rect.height);

        // Remove all edge/state classes
        item.classList.remove('marquee-active', 'marquee-enter-top', 'marquee-enter-bottom',
          'marquee-exit-top', 'marquee-exit-bottom');

        // Set enter direction
        item.classList.add(`marquee-enter-${edge}`);

        // Force reflow then activate
        void item.offsetHeight;
        item.classList.add('marquee-active');
      });

      link.addEventListener('mouseleave', function (e) {
        const rect = item.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        const edge = findEdge(mx, my, rect.width, rect.height);

        item.classList.remove('marquee-active');
        item.classList.remove('marquee-enter-top', 'marquee-enter-bottom');
        item.classList.add(`marquee-exit-${edge}`);

        // Clean up exit classes after transition
        setTimeout(() => {
          item.classList.remove('marquee-exit-top', 'marquee-exit-bottom');
        }, 600);
      });
    });
  }
  initFlowingMenu();


  /* ════════════════════════════════════════════════════════════
     21. MAIN RAF LOOP
     ════════════════════════════════════════════════════════════ */
  function mainLoop() {
    updateNav();
    updateScrollProgress();
    updateParallax();
    requestAnimationFrame(mainLoop);
  }
  requestAnimationFrame(mainLoop);


  /* ════════════════════════════════════════════════════════════
     22. INJECT DYNAMIC KEYFRAMES
     ════════════════════════════════════════════════════════════ */
  const dyn = document.createElement('style');
  dyn.textContent = `
@keyframes dotTwinkle{0%,100%{opacity:.15;transform:scale(.7)}50%{opacity:1;transform:scale(1.3)}}
@keyframes btnRipple{to{width:300px;height:300px;opacity:0}}
@keyframes orbitFloat{
  0%{transform:rotate(var(--angle,0deg)) translateX(55%) rotate(0deg)}
  100%{transform:rotate(calc(var(--angle,0deg) + 360deg)) translateX(55%) rotate(-360deg)}
}
@keyframes floatParticle{
  0%,100%{transform:translate(0,0);opacity:.3}
  25%{transform:translate(10px,-15px);opacity:.6}
  50%{transform:translate(-5px,-25px);opacity:.2}
  75%{transform:translate(15px,-10px);opacity:.5}
}
`;
  document.head.appendChild(dyn);


  /* ════════════════════════════════════════════════════════════
     23. STEPPER WIDGET
     ════════════════════════════════════════════════════════════ */


  /* ════════════════════════════════════════════════════════════
     24. PROFILE CARD — 3D tilt engine
     ════════════════════════════════════════════════════════════ */
  function initProfileCard() {
    const wrapper = document.getElementById('profileCard');
    const shell = document.getElementById('pcShell');
    if (!wrapper || !shell) return;

    const pcClamp = (v, min, max) => Math.min(Math.max(v, min), max);
    const pcRound = (v, p) => parseFloat(v.toFixed(p || 3));
    const pcAdjust = (v, fMin, fMax, tMin, tMax) => pcRound(tMin + ((tMax - tMin) * (v - fMin)) / (fMax - fMin));

    let currentX = 0, currentY = 0, targetX = 0, targetY = 0;
    let running = false, lastTs = 0;
    let rafId = null, enterTimer = null, leaveRaf = null;

    const DEFAULT_TAU = 0.14;
    const INITIAL_TAU = 0.6;
    let initialUntil = 0;

    function setVarsFromXY(x, y) {
      const w = shell.clientWidth || 1;
      const h = shell.clientHeight || 1;
      const px = pcClamp((100 / w) * x, 0, 100);
      const py = pcClamp((100 / h) * y, 0, 100);
      const cx = px - 50, cy = py - 50;

      wrapper.style.setProperty('--pointer-x', px + '%');
      wrapper.style.setProperty('--pointer-y', py + '%');
      wrapper.style.setProperty('--background-x', pcAdjust(px, 0, 100, 35, 65) + '%');
      wrapper.style.setProperty('--background-y', pcAdjust(py, 0, 100, 35, 65) + '%');
      wrapper.style.setProperty('--pointer-from-center', pcClamp(Math.hypot(py - 50, px - 50) / 50, 0, 1));
      wrapper.style.setProperty('--pointer-from-top', py / 100);
      wrapper.style.setProperty('--pointer-from-left', px / 100);
      wrapper.style.setProperty('--rotate-x', pcRound(-(cx / 5)) + 'deg');
      wrapper.style.setProperty('--rotate-y', pcRound(cy / 4) + 'deg');
    }

    function step(ts) {
      if (!running) return;
      if (lastTs === 0) lastTs = ts;
      const dt = (ts - lastTs) / 1000;
      lastTs = ts;

      const tau = ts < initialUntil ? INITIAL_TAU : DEFAULT_TAU;
      const k = 1 - Math.exp(-dt / tau);
      currentX += (targetX - currentX) * k;
      currentY += (targetY - currentY) * k;
      setVarsFromXY(currentX, currentY);

      const stillFar = Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05;
      if (stillFar || document.hasFocus()) {
        rafId = requestAnimationFrame(step);
      } else {
        running = false;
        lastTs = 0;
      }
    }

    function start() {
      if (running) return;
      running = true;
      lastTs = 0;
      rafId = requestAnimationFrame(step);
    }

    function setTarget(x, y) { targetX = x; targetY = y; start(); }

    function toCenter() {
      setTarget(shell.clientWidth / 2, shell.clientHeight / 2);
    }

    // Pointer events
    shell.addEventListener('pointerenter', function (e) {
      shell.classList.add('active');
      shell.classList.add('entering');
      if (enterTimer) clearTimeout(enterTimer);
      enterTimer = setTimeout(() => shell.classList.remove('entering'), 180);

      const r = this.getBoundingClientRect();
      setTarget(e.clientX - r.left, e.clientY - r.top);
    });

    shell.addEventListener('pointermove', function (e) {
      const r = this.getBoundingClientRect();
      setTarget(e.clientX - r.left, e.clientY - r.top);
    });

    shell.addEventListener('pointerleave', function () {
      toCenter();
      const checkSettle = () => {
        const settled = Math.hypot(targetX - currentX, targetY - currentY) < 0.6;
        if (settled) {
          shell.classList.remove('active');
          leaveRaf = null;
        } else {
          leaveRaf = requestAnimationFrame(checkSettle);
        }
      };
      if (leaveRaf) cancelAnimationFrame(leaveRaf);
      leaveRaf = requestAnimationFrame(checkSettle);
    });

    // Initial animation: start from top-right, glide to center
    const initX = (shell.clientWidth || 300) - 70;
    const initY = 60;
    currentX = initX; currentY = initY;
    setVarsFromXY(initX, initY);
    toCenter();
    initialUntil = performance.now() + 1200;
    start();
  }
  initProfileCard();


  /* ════════════════════════════════════════════════════════════
     25. ROTATING TEXT — character-by-character spring animation
     ════════════════════════════════════════════════════════════ */
  function initRotatingText() {
    const container = document.getElementById('rotatingText');
    if (!container) return;

    const texts = [
      'AI Systems',
      'NLP Pipelines',
      'Data Engines',
      'Secure APIs',
      'ML Models'
    ];
    const INTERVAL = 2000;
    const STAGGER = 25; // ms per char, from last
    let currentIndex = 0;
    const track = container.querySelector('.rotating-text-track');

    // Screen reader text
    const srSpan = document.createElement('span');
    srSpan.className = 'rt-sr-only';
    srSpan.textContent = texts[0];
    container.insertBefore(srSpan, track);

    function splitToChars(text) {
      if (typeof Intl !== 'undefined' && Intl.Segmenter) {
        const seg = new Intl.Segmenter('en', { granularity: 'grapheme' });
        return Array.from(seg.segment(text), s => s.segment);
      }
      return Array.from(text);
    }

    function buildText(text) {
      const words = text.split(' ');
      const allChars = [];
      const frag = document.createDocumentFragment();

      words.forEach((word, wi) => {
        const wordSpan = document.createElement('span');
        wordSpan.className = 'rt-word';

        const chars = splitToChars(word);
        chars.forEach(ch => {
          const charSpan = document.createElement('span');
          charSpan.className = 'rt-char entering';
          charSpan.textContent = ch;
          allChars.push(charSpan);
          wordSpan.appendChild(charSpan);
        });

        frag.appendChild(wordSpan);
        if (wi < words.length - 1) {
          const space = document.createElement('span');
          space.className = 'rt-space';
          space.textContent = ' ';
          frag.appendChild(space);
        }
      });

      return { fragment: frag, chars: allChars };
    }

    function setStaggerDelays(chars, staggerFrom) {
      const total = chars.length;
      chars.forEach((el, i) => {
        let delay;
        if (staggerFrom === 'last') {
          delay = (total - 1 - i) * STAGGER;
        } else {
          delay = i * STAGGER;
        }
        el.style.setProperty('--char-delay', delay + 'ms');
      });
    }

    function animateIn(chars) {
      setStaggerDelays(chars, 'last');
      // Force reflow
      void chars[0]?.offsetHeight;
      requestAnimationFrame(() => {
        chars.forEach(ch => {
          ch.classList.remove('entering');
          ch.classList.add('visible');
        });
      });
    }

    function animateOut(chars) {
      setStaggerDelays(chars, 'last');
      chars.forEach(ch => {
        ch.classList.remove('visible');
        ch.classList.add('exiting');
      });
    }

    // Initial render
    let currentChars = [];
    function showText(index, isInitial) {
      const { fragment, chars } = buildText(texts[index]);
      srSpan.textContent = texts[index];

      if (!isInitial && currentChars.length) {
        // Animate out current
        animateOut(currentChars);

        // After exit, swap
        const maxDelay = currentChars.length * STAGGER + 500;
        setTimeout(() => {
          track.innerHTML = '';
          track.appendChild(fragment);
          currentChars = chars;
          // Start entering
          requestAnimationFrame(() => animateIn(chars));
        }, maxDelay);
      } else {
        track.innerHTML = '';
        track.appendChild(fragment);
        currentChars = chars;
        requestAnimationFrame(() => animateIn(chars));
      }
    }

    showText(0, true);

    setInterval(() => {
      currentIndex = (currentIndex + 1) % texts.length;
      showText(currentIndex, false);
    }, INTERVAL);
  }
  initRotatingText();


  /* ════════════════════════════════════════════════════════════
     26. LOGOLOOP — infinite scrolling tech marquee
     ════════════════════════════════════════════════════════════ */
  function initLogoLoop() {
    const container = document.getElementById('logoLoop');
    const track = document.getElementById('logoLoopTrack');
    const seq = document.getElementById('logoLoopSeq');
    if (!container || !track || !seq) return;

    const SPEED = 80;           // px/s
    const SMOOTH_TAU = 0.25;
    const MIN_COPIES = 2;
    const COPY_HEADROOM = 2;
    const HOVER_SPEED = 0;

    let seqWidth = 0;
    let offset = 0;
    let velocity = 0;
    let lastTs = null;
    let isHovered = false;

    function measure() {
      const rect = seq.getBoundingClientRect();
      seqWidth = Math.ceil(rect.width);
      if (seqWidth <= 0) return;

      const containerW = container.clientWidth || seqWidth;
      const copiesNeeded = Math.max(MIN_COPIES, Math.ceil(containerW / seqWidth) + COPY_HEADROOM);

      // Remove extra copies
      const existing = track.querySelectorAll('.logoloop__list');
      while (existing.length > 1) {
        track.removeChild(existing[existing.length - 1]);
        existing.length--;
      }

      // Clone
      for (let i = 1; i < copiesNeeded; i++) {
        const clone = seq.cloneNode(true);
        clone.removeAttribute('id');
        clone.setAttribute('aria-hidden', 'true');
        track.appendChild(clone);
      }
    }

    function animate(ts) {
      if (lastTs === null) lastTs = ts;
      const dt = Math.max(0, ts - lastTs) / 1000;
      lastTs = ts;

      const target = isHovered ? HOVER_SPEED : SPEED;
      const k = 1 - Math.exp(-dt / SMOOTH_TAU);
      velocity += (target - velocity) * k;

      if (seqWidth > 0) {
        offset += velocity * dt;
        offset = ((offset % seqWidth) + seqWidth) % seqWidth;
        track.style.transform = `translate3d(${-offset}px, 0, 0)`;
      }

      requestAnimationFrame(animate);
    }

    // Hover
    track.addEventListener('mouseenter', () => { isHovered = true; });
    track.addEventListener('mouseleave', () => { isHovered = false; });

    // Resize
    if (window.ResizeObserver) {
      const ro = new ResizeObserver(measure);
      ro.observe(container);
      ro.observe(seq);
    } else {
      window.addEventListener('resize', measure);
    }

    // Wait for any images to load (SVGs are inline, so instant)
    measure();
    requestAnimationFrame(animate);
  }
  initLogoLoop();

})();
