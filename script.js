/* ═══════════════════════════════════════════════
   PORTFOLIO — MAXENCE DUHAMEL — script.js
   Stack : Vanilla JS + GSAP 3.12 + ScrollTrigger
═══════════════════════════════════════════════ */

/* ─── Page scroll progress bar ──────────────── */
const progressBar = document.getElementById('page-progress');
if (progressBar) {
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = max > 0 ? (scrolled / max * 100) + '%' : '0%';
  }, { passive: true });
}

/* ─── Navbar scroll state ────────────────────── */
const siteHeader = document.querySelector('.site-header');
if (siteHeader) {
  const updateHeader = () => siteHeader.classList.toggle('scrolled', window.scrollY > 20);
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();
}

/* ─── Theme toggle ───────────────────────────── */
const themeToggleBtn = document.getElementById('theme-toggle');
if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    document.documentElement.classList.add('theme-transition');
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    if (isLight) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    }
    window.setTimeout(() => document.documentElement.classList.remove('theme-transition'), 400);
  });
}

/* ─── Mobile menu ────────────────────────────── */
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const navCloseBtn   = document.getElementById('nav-close-btn');
const mobileNav     = document.getElementById('mobile-nav');
const menuOverlay   = document.getElementById('menu-overlay');
const navLinks      = mobileNav ? mobileNav.querySelectorAll('a') : [];

const openMenu  = () => { mobileNav?.classList.add('open'); menuOverlay?.classList.add('open'); document.body.style.overflow = 'hidden'; };
const closeMenu = () => { mobileNav?.classList.remove('open'); menuOverlay?.classList.remove('open'); document.body.style.overflow = ''; };

mobileMenuBtn?.addEventListener('click', openMenu);
navCloseBtn?.addEventListener('click', closeMenu);
menuOverlay?.addEventListener('click', closeMenu);
navLinks.forEach(link => link.addEventListener('click', closeMenu));

/* ─── Smooth anchor scroll ───────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const targetId = link.getAttribute('href');
    if (!targetId || targetId === '#') return;
    const target = document.querySelector(targetId);
    if (!target) return;
    e.preventDefault();
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 72, behavior: 'smooth' });
  });
});

/* ─── Dynamic year ───────────────────────────── */
const yearSpan = document.getElementById('year');
if (yearSpan) yearSpan.textContent = new Date().getFullYear();

/* ─── Language ring progress ─────────────────── */
const langCards = document.querySelectorAll('.pm-lang-card[data-lang-level]');
const CIRC = 2 * Math.PI * 35;
langCards.forEach(card => {
  const level = parseInt(card.dataset.langLevel || '0', 10);
  const ring  = card.querySelector('.pm-lang-ring-fill');
  if (!ring) return;
  const target = CIRC * (1 - level / 100);
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { ring.style.strokeDashoffset = target; io.disconnect(); } });
    }, { threshold: 0.3 });
    io.observe(card);
  } else {
    ring.style.strokeDashoffset = target;
  }
});

/* ═══════════════════════════════════════════════
   CURSEUR LERP — suit la souris avec un léger lag
   Fonctionne avec ou sans GSAP
═══════════════════════════════════════════════ */
const cursor = document.querySelector('.custom-cursor');

if (cursor && window.matchMedia('(hover: hover)').matches) {
  let mx = 0, my = 0, cx = 0, cy = 0;

  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  window.addEventListener('mouseleave', () => cursor.classList.add('cursor-hidden'));
  window.addEventListener('mouseenter', () => cursor.classList.remove('cursor-hidden'));

  const LERP_FACTOR = 0.13;
  (function tickCursor() {
    cx += (mx - cx) * LERP_FACTOR;
    cy += (my - cy) * LERP_FACTOR;
    cursor.style.left = cx + 'px';
    cursor.style.top  = cy + 'px';
    requestAnimationFrame(tickCursor);
  })();

  document.querySelectorAll('a, button, .btn, .nav-cta, .pm-exp-card, .pm-skill-card, .pm-project-card, .pm-lang-card, .pm-interest-item').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('cursor-grow'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-grow'));
  });
}

/* ═══════════════════════════════════════════════
   GSAP ANIMATIONS
═══════════════════════════════════════════════ */
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {

  gsap.registerPlugin(ScrollTrigger);
  document.body.classList.add('gsap-ready');

  /* ─────────────────────────────────────────────
     HERO ENTRANCE TIMELINE — paused, déclenché
     après le loader (ou immédiatement si déjà vu)
  ───────────────────────────────────────────── */
  const heroTl = gsap.timeline({ paused: true, defaults: { ease: 'power4.out' } });

  // Meta row — slide depuis le haut
  heroTl.from('.hero-clean-meta', { y: -28, opacity: 0, duration: 0.65 }, 0.2);

  // PORT — entre depuis la gauche hors écran avec overshoot
  // clearProps:'transform,opacity' obligatoire : background-clip:text sur le parent
  // est cassé par la compositing layer créée par GSAP si transform reste en inline style
  heroTl.fromTo('.hct-word--port',
    { x: -clampPx(280), opacity: 0 },
    { x: 0, opacity: 1, duration: 0.95, ease: 'back.out(1.5)', clearProps: 'transform,opacity' },
    0.45);

  // FOLIO — entre depuis la droite, 200ms après PORT
  heroTl.fromTo('.hct-word--folio',
    { x: clampPx(280), opacity: 0 },
    { x: 0, opacity: 1, duration: 0.95, ease: 'back.out(1.5)', clearProps: 'transform,opacity' },
    0.65);

  // Deco geo shapes — scale depuis 0 en cascade aléatoire
  heroTl.from('.hct-pill, .geo', {
    scale: 0, opacity: 0, duration: 0.75, ease: 'back.out(1.4)',
    stagger: { each: 0.05, from: 'random' }
  }, 0.75);

  // Geo-strip — slide depuis la droite
  heroTl.from('.geo-strip', { x: 24, opacity: 0, duration: 0.5 }, 1.0);

  // Bottom row — slide depuis le bas
  heroTl.from('.hero-clean-bottom', { y: 30, opacity: 0, duration: 0.65 }, 0.95);

  // Boutons CTA — fade + translateY en cascade — clearProps évite opacity:0 bloqué
  heroTl.fromTo('.hero-clean-cta .btn',
    { y: 22, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.55, stagger: 0.10, clearProps: 'all' },
    1.05);

  // Scroll indicator
  heroTl.from('.hero-scroll-indicator', { opacity: 0, duration: 0.55 }, 1.35);

  /* ─────────────────────────────────────────────
     startHero() — déclenche le hero après le loader
     ou directement si session déjà vue
  ───────────────────────────────────────────── */
  function startHero() {
    const curtain = document.getElementById('page-curtain');
    if (curtain) curtain.style.display = 'none';
    heroTl.play();
  }

  /* ─────────────────────────────────────────────
     LOADER D'INTRO — joue à chaque chargement
  ───────────────────────────────────────────── */
  const loaderEl = document.getElementById('loader');

  if (loaderEl) {
    // Bloquer le scroll pendant le loader
    document.body.style.overflow = 'hidden';

    // Timeline du loader
    const loadTl = gsap.timeline({
      delay: 0.15,
      onComplete: () => {
        document.body.style.overflow = '';
        startHero();
      }
    });

    // 1 — MD : fade in + léger scale depuis 0.85
    loadTl.fromTo('.loader-md',
      { opacity: 0, scale: 0.85 },
      { opacity: 1, scale: 1, duration: 0.55, ease: 'power3.out' },
      0);

    // 2 — Cercle : se dessine en 650ms (stroke-dashoffset 515 → 0)
    loadTl.fromTo('.loader-ring-path',
      { strokeDashoffset: 515 },
      { strokeDashoffset: 0, duration: 0.65, ease: 'power2.inOut' },
      0.20);

    // 3 — Lettres PORTFOLIO en cascade (50ms entre chaque)
    loadTl.fromTo('.loader-letter',
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.22, stagger: 0.05, ease: 'power2.out' },
      0.75);

    // 4 — Pause courte
    loadTl.to({}, { duration: 0.32 });

    // 5 — Sortie : fade + scale up
    loadTl.to('#loader', {
      opacity: 0,
      scale: 1.06,
      duration: 0.50,
      ease: 'power2.inOut',
      onComplete: () => { loaderEl.style.display = 'none'; }
    });

  } else {
    // Pas de loader dans le DOM — lance le hero directement
    gsap.delayedCall(0.1, startHero);
  }

  /* ─────────────────────────────────────────────
     HERO PARALLAX au scroll
  ───────────────────────────────────────────── */
  ScrollTrigger.create({
    trigger: '#hero',
    start: 'top top',
    end: 'bottom top',
    scrub: 1,
    onUpdate: self => {
      const p = self.progress;
      gsap.set('.hero-clean-title', { yPercent: -14 * p });
      gsap.set('.hero-clean-meta',  { yPercent: -24 * p, opacity: 1 - p * 1.6 });
      gsap.set('.hero-clean-cta',   { yPercent: -10 * p, opacity: 1 - p * 2.0 });
    }
  });

  // Parallaxe indépendant sur les deco circles
  [
    { sel: '.geo-circle--orange',  factor: -55 },
    { sel: '.geo-circle--cyan',    factor: -35 },
    { sel: '.geo-circle--purple',  factor: -45 },
    { sel: '.geo-circle--magenta', factor: -28 },
  ].forEach(({ sel, factor }) => {
    const el = document.querySelector(sel);
    if (!el) return;
    ScrollTrigger.create({
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1.3,
      onUpdate: self => gsap.set(el, { y: factor * self.progress })
    });
  });

  /* ─────────────────────────────────────────────
     SECTIONS — kicker + titre
     ⚠ Titre entier — ne pas splitter (.pm-section-title
       utilise background-clip:text, splitter casserait le gradient)
  ───────────────────────────────────────────── */
  document.querySelectorAll('.pm-section').forEach(section => {
    const kicker  = section.querySelector('.pm-kicker-group');
    const titleEl = section.querySelector('.pm-section-title');

    if (kicker) {
      gsap.from(kicker, {
        scrollTrigger: { trigger: kicker, start: 'top 88%', once: true },
        x: -24, opacity: 0, duration: 0.60, ease: 'power3.out'
      });
    }
    if (titleEl) {
      gsap.from(titleEl, {
        scrollTrigger: { trigger: titleEl, start: 'top 90%', once: true },
        y: 44, opacity: 0, duration: 0.82, ease: 'power4.out', delay: 0.06
      });
    }
  });

  /* ─────────────────────────────────────────────
     ABOUT — entrée gauche / droite
  ───────────────────────────────────────────── */
  const aboutSplit = document.querySelector('.pm-about-split');
  if (aboutSplit) {
    gsap.from('.pm-about-visual', {
      scrollTrigger: { trigger: aboutSplit, start: 'top 80%', once: true },
      x: -56, opacity: 0, duration: 0.90, ease: 'power3.out'
    });
    gsap.from('.pm-about-content', {
      scrollTrigger: { trigger: aboutSplit, start: 'top 80%', once: true },
      x: 56, opacity: 0, duration: 0.90, ease: 'power3.out', delay: 0.12
    });
  }

  /* ─────────────────────────────────────────────
     CARDS — cascade staggerée depuis le bas
  ───────────────────────────────────────────── */
  [
    { sel: '.pm-exp-card',      parent: '.pm-exp-grid' },
    { sel: '.pm-skill-card',    parent: '.pm-skills-grid' },
    { sel: '.pm-project-card',  parent: '.pm-projects-grid' },
    { sel: '.pm-interest-item', parent: '.pm-interests-grid' },
    { sel: '.pm-lang-card',     parent: '.pm-lang-cards' },
  ].forEach(({ sel, parent }) => {
    const parentEl = document.querySelector(parent);
    if (!parentEl) return;
    gsap.from(parentEl.querySelectorAll(sel), {
      scrollTrigger: { trigger: parentEl, start: 'top 82%', once: true },
      y: 50, opacity: 0, duration: 0.70,
      stagger: { each: 0.09, ease: 'power1.inOut' },
      ease: 'power3.out'
    });
  });

  /* ─────────────────────────────────────────────
     FORMATIONS — slide depuis la gauche en cascade
  ───────────────────────────────────────────── */
  document.querySelectorAll('.pm-edu-item').forEach((item, i) => {
    gsap.from(item, {
      scrollTrigger: { trigger: item, start: 'top 88%', once: true },
      x: -38, opacity: 0, duration: 0.70, ease: 'power3.out',
      delay: i * 0.10
    });
  });

  /* ─────────────────────────────────────────────
     CONTACT — bas + slide
  ───────────────────────────────────────────── */
  const contactWrap = document.querySelector('.pm-contact-wrap');
  if (contactWrap) {
    gsap.from('.pm-contact-left', {
      scrollTrigger: { trigger: contactWrap, start: 'top 82%', once: true },
      y: 40, opacity: 0, duration: 0.80, ease: 'power3.out'
    });
    gsap.from('.pm-contact-right', {
      scrollTrigger: { trigger: contactWrap, start: 'top 82%', once: true },
      y: 40, opacity: 0, duration: 0.80, ease: 'power3.out', delay: 0.14
    });
    // Contact lines : x seulement (évite opacity stuck sur liens)
    gsap.from('.pm-contact-line', {
      scrollTrigger: { trigger: contactWrap, start: 'top 78%', once: true },
      x: 22, duration: 0.55, stagger: 0.10, ease: 'power2.out', delay: 0.28
    });
  }

  /* ─────────────────────────────────────────────
     SKILL BARS — animation de largeur au scroll
  ───────────────────────────────────────────── */
  document.querySelectorAll('.pm-skill-fill').forEach(fill => {
    const lvl = fill.style.getPropertyValue('--lvl') || '0%';
    gsap.set(fill, { width: 0 });
    gsap.to(fill, {
      scrollTrigger: { trigger: fill, start: 'top 88%', once: true },
      width: lvl, duration: 1.35, ease: 'power2.out', delay: 0.15
    });
  });

  /* ─────────────────────────────────────────────
     FOOTER
  ───────────────────────────────────────────── */
  const footer = document.querySelector('.pm-footer');
  if (footer) {
    gsap.from(footer, {
      scrollTrigger: { trigger: footer, start: 'top 96%', once: true },
      y: 26, opacity: 0, duration: 0.65, ease: 'power3.out'
    });
  }

  /* ─────────────────────────────────────────────
     3D TILT sur les cards au hover
  ───────────────────────────────────────────── */
  document.querySelectorAll(
    '.pm-exp-card, .pm-skill-card, .pm-project-card, .pm-interest-item, .pm-lang-card'
  ).forEach(card => {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const dx = (e.clientX - r.left  - r.width  / 2) / (r.width  / 2);
      const dy = (e.clientY - r.top   - r.height / 2) / (r.height / 2);
      gsap.to(card, {
        rotateY: dx * 6, rotateX: -dy * 6,
        transformPerspective: 900, transformOrigin: 'center center',
        duration: 0.40, ease: 'power2.out', overwrite: 'auto'
      });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotateX: 0, rotateY: 0,
        duration: 0.65, ease: 'elastic.out(1, 0.45)', overwrite: 'auto'
      });
    });
  });

  /* ─────────────────────────────────────────────
     FILET DE SÉCURITÉ — 3s après le chargement,
     on force opacity:1 sur tout contenu critique
     au cas où une animation GSAP raterait.
  ───────────────────────────────────────────── */
  setTimeout(() => {
    const critiques = document.querySelectorAll(
      '.hero-clean-title-wrap, .hero-clean-cta, .hero-clean-bottom, ' +
      '.pm-section-title, .pm-contact-left, .pm-contact-right, ' +
      '.pm-about-lead, .pm-about-text, .pm-footer-inner'
    );
    critiques.forEach(el => {
      if (parseFloat(getComputedStyle(el).opacity) < 0.1) {
        el.style.opacity = '1'; el.style.transform = 'none';
      }
    });
    // Mots du hero : retirer tout inline style GSAP si opacity < 0.1
    document.querySelectorAll('.hct-word, .hero-clean-cta .btn').forEach(el => {
      if (parseFloat(getComputedStyle(el).opacity) < 0.1) {
        el.style.cssText = ''; // purge tous les inline styles GSAP
      }
    });
  }, 3000);

} else {
  /* ─── FALLBACK sans GSAP ────────────────────── */
  const revealSections = document.querySelectorAll('.section-reveal');
  if ('IntersectionObserver' in window && revealSections.length) {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in-view'); observer.unobserve(e.target); }
      }),
      { threshold: 0.12 }
    );
    revealSections.forEach(s => observer.observe(s));
  } else {
    revealSections.forEach(s => s.classList.add('in-view'));
  }

  // Skill bars fallback
  document.querySelectorAll('.pm-skill-fill').forEach(fill => {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          fill.style.transition = 'width 1.3s ease';
          fill.style.width = fill.style.getPropertyValue('--lvl');
          io.disconnect();
        }
      });
    }, { threshold: 0.3 });
    io.observe(fill);
  });
}

/* ─── Helper : valeur de déplacement clampée ── */
function clampPx(base) {
  return Math.min(base, window.innerWidth * 0.3);
}
