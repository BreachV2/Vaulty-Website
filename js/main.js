/* ============================================================
   VAULTY – Main JavaScript
   Three.js 3D Scene + Interactions + Cookie Banner
   ============================================================ */

'use strict';

/* ── Cookie Banner ─────────────────────────────────────────── */
(function () {
  const banner = document.getElementById('cookieBanner');
  const acceptBtn = document.getElementById('cookieAccept');
  const rejectBtn = document.getElementById('cookieReject');

  if (!banner) return;

  const stored = localStorage.getItem('vaulty-cookie-consent');
  if (!stored) {
    setTimeout(() => banner.classList.add('is-visible'), 900);
  }

  function dismiss(choice) {
    localStorage.setItem('vaulty-cookie-consent', choice);
    banner.classList.remove('is-visible');
    setTimeout(() => banner.remove(), 600);
  }

  if (acceptBtn) acceptBtn.addEventListener('click', () => dismiss('accepted'));
  if (rejectBtn) rejectBtn.addEventListener('click', () => dismiss('rejected'));
})();

/* ── Navigation Scroll Effect ──────────────────────────────── */
(function () {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 80);
  }, { passive: true });
})();

/* ── Mobile Menu ───────────────────────────────────────────── */
(function () {
  const toggle = document.getElementById('mobileToggle');
  const menu = document.getElementById('mobileMenu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const isHidden = menu.hidden;
    menu.hidden = !isHidden;
    toggle.classList.toggle('open', isHidden);
    toggle.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
    toggle.setAttribute('aria-label', isHidden ? 'Menü schließen' : 'Menü öffnen');
  });

  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menu.hidden = true;
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Menü öffnen');
    });
  });
})();

/* ── Scroll Reveal ─────────────────────────────────────────── */
(function () {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));

  /* Stagger children within grids */
  document.querySelectorAll('.features-grid, .commands-grid').forEach(grid => {
    grid.querySelectorAll('.feature-card, .command-item').forEach((child, i) => {
      child.setAttribute('data-reveal', '');
      child.style.transitionDelay = `${i * 55}ms`;
      observer.observe(child);
    });
  });

  document.querySelectorAll('.stats-grid').forEach(grid => {
    grid.querySelectorAll('.stat-card').forEach((card, i) => {
      card.setAttribute('data-reveal', '');
      card.style.transitionDelay = `${i * 80}ms`;
      observer.observe(card);
    });
  });
})();

/* ── 3D Card Tilt ──────────────────────────────────────────── */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.querySelectorAll('[data-tilt]').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width  / 2;
      const cy = rect.height / 2;
      const rotX = ((y - cy) / cy) * -9;
      const rotY = ((x - cx) / cx) *  9;
      card.style.transform =
        `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(14px) scale(1.01)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform =
        'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)';
    });
  });
})();

/* ── Animated Counters ─────────────────────────────────────── */
(function () {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const fmt = (n) => n >= 1000 ? (n / 1000).toFixed(n % 1000 === 0 ? 0 : 0) + 'k' : String(n);

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const dur    = 1800;
      const start  = performance.now();

      const tick = (now) => {
        const p     = Math.min((now - start) / dur, 1);
        const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p); /* easeOutExpo */
        el.textContent = fmt(Math.floor(eased * target));
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = fmt(target);
      };

      requestAnimationFrame(tick);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(el => obs.observe(el));
})();

/* ── Three.js Hero 3D Coin Scene ──────────────────────────── */
(function () {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas || typeof THREE === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* ─ Scene Setup ─ */
  const scene    = new THREE.Scene();
  const camera   = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 100);
  camera.position.z = 6;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  /* ─ Lighting ─ */
  const ambient = new THREE.AmbientLight(0x0d1020, 4);
  scene.add(ambient);

  const goldLight = new THREE.PointLight(0xf5c842, 40, 22);
  goldLight.position.set(4, 4, 5);
  scene.add(goldLight);

  const blueLight = new THREE.PointLight(0x5865f2, 18, 18);
  blueLight.position.set(-5, -3, 3);
  scene.add(blueLight);

  const rimLight = new THREE.DirectionalLight(0xffd966, 0.6);
  rimLight.position.set(0, 2, 6);
  scene.add(rimLight);

  /* ─ Coin geometry (flat cylinder = coin) ─ */
  const coinGeo = new THREE.CylinderGeometry(1, 1, 0.1, 36);

  /* Engrave circle on coin face with a torus */
  const ringGeo = new THREE.TorusGeometry(0.72, 0.04, 8, 36);

  const COIN_COUNT = 22;
  const coins      = [];

  for (let i = 0; i < COIN_COUNT; i++) {
    const hue = 0.11 + Math.random() * 0.06; /* gold hue range */
    const mat = new THREE.MeshStandardMaterial({
      color:     new THREE.Color().setHSL(hue, 0.9, 0.45 + Math.random() * 0.1),
      metalness: 0.95,
      roughness: 0.06 + Math.random() * 0.08,
    });

    const mesh  = new THREE.Mesh(coinGeo, mat);
    const spread = 9;

    mesh.position.set(
      (Math.random() - 0.5) * spread,
      (Math.random() - 0.5) * 6,
      (Math.random() - 0.5) * 4 - 1
    );
    mesh.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    const s = 0.14 + Math.random() * 0.36;
    mesh.scale.setScalar(s);

    /* Ring detail on coin */
    const ringMat  = mat.clone();
    ringMat.color  = new THREE.Color(0xffd966);
    const ring     = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = 0.06;
    mesh.add(ring);
    const ring2    = ring.clone();
    ring2.position.y = -0.06;
    ring2.rotation.x  = Math.PI;
    mesh.add(ring2);

    scene.add(mesh);
    coins.push({
      mesh,
      floatSpeed:  0.35 + Math.random() * 0.65,
      floatOffset: Math.random() * Math.PI * 2,
      rotX:        (Math.random() - 0.5) * 0.014,
      rotY:        (Math.random() - 0.5) * 0.018,
      originY:     mesh.position.y,
    });
  }

  /* ─ Gold sparkle particles ─ */
  const PART_COUNT = 160;
  const pPos       = new Float32Array(PART_COUNT * 3);
  for (let i = 0; i < PART_COUNT; i++) {
    pPos[i * 3]     = (Math.random() - 0.5) * 18;
    pPos[i * 3 + 1] = (Math.random() - 0.5) * 11;
    pPos[i * 3 + 2] = (Math.random() - 0.5) * 6 - 2;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({
    color: 0xf5c842, size: 0.042,
    transparent: true, opacity: 0.45,
    sizeAttenuation: true,
  });
  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  /* ─ Mouse parallax ─ */
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener('mousemove', (e) => {
    mouse.tx = (e.clientX / innerWidth  - 0.5) * 2;
    mouse.ty = -(e.clientY / innerHeight - 0.5) * 2;
  }, { passive: true });

  /* ─ Resize handler ─ */
  window.addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  }, { passive: true });

  /* ─ Animation loop ─ */
  const clock = new THREE.Clock();
  let   rafId = 0;

  function animate() {
    rafId = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    /* Smooth camera parallax */
    mouse.x += (mouse.tx - mouse.x) * 0.04;
    mouse.y += (mouse.ty - mouse.y) * 0.04;
    camera.position.x = mouse.x * 0.7;
    camera.position.y = mouse.y * 0.45;
    camera.lookAt(scene.position);

    /* Animate coins */
    coins.forEach(c => {
      c.mesh.rotation.x += c.rotX;
      c.mesh.rotation.y += c.rotY;
      c.mesh.position.y  = c.originY + Math.sin(t * c.floatSpeed + c.floatOffset) * 0.28;
    });

    /* Slowly drift particles */
    particles.rotation.y =  t * 0.014;
    particles.rotation.x =  Math.sin(t * 0.008) * 0.08;

    /* Orbit lights */
    goldLight.position.x = Math.sin(t * 0.28) * 5;
    goldLight.position.y = Math.cos(t * 0.18) * 3.5;
    blueLight.position.x = Math.cos(t * 0.22) * 5;
    blueLight.position.y = Math.sin(t * 0.32) * 3;

    renderer.render(scene, camera);
  }

  animate();

  /* Stop rendering when hero is scrolled far out of view */
  const heroEl = canvas.parentElement;
  if (heroEl) {
    const stopObs = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) {
        cancelAnimationFrame(rafId);
      } else {
        animate();
      }
    }, { rootMargin: '200px' });
    stopObs.observe(heroEl);
  }
})();

/* ── Smooth Anchor Scroll ──────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const id  = a.getAttribute('href').slice(1);
    const el  = document.getElementById(id);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
