'use strict';

// ── Nav: scroll state + active link ────────────────────────────────────
const nav = document.getElementById('nav');
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav__links a');

function onScroll() {
  nav.classList.toggle('scrolled', window.scrollY > 40);

  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 160) current = s.id;
  });

  navAnchors.forEach(a => {
    const matches = a.getAttribute('href') === `#${current}`;
    a.classList.toggle('active', matches);
  });
}

window.addEventListener('scroll', onScroll, { passive: true });

// ── Mobile menu ─────────────────────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  hamburger.classList.toggle('open', open);
  hamburger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  document.body.style.overflow = open ? 'hidden' : '';
});

navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// ── Scroll-reveal ───────────────────────────────────────────────────────
function initReveal() {
  if (!('IntersectionObserver' in window)) {
    // Fallback: show everything
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('in-view'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in-view');
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -48px 0px' }
  );

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ── Vial fill animation re-trigger on scroll into view ──────────────────
function initVialAnimations() {
  const vials = document.querySelectorAll('.kit-vial__fill, .vial__liquid::after');

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Re-start CSS animation by removing and re-adding the element
        const el = entry.target;
        el.style.animation = 'none';
        requestAnimationFrame(() => {
          el.style.animation = '';
        });
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.3 });

  vials.forEach(v => obs.observe(v));
}

// ── Kit scene: box-opening on scroll ───────────────────────────────────
function initKitScene() {
  const scene = document.getElementById('kitScene');
  if (!scene) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || !('IntersectionObserver' in window)) {
    scene.classList.add('is-open');
    return;
  }

  const obs = new IntersectionObserver(
    entries => {
      if (!entries[0].isIntersecting) return;
      scene.classList.add('is-open');
      obs.unobserve(scene);
    },
    { threshold: 0.3, rootMargin: '0px 0px -40px 0px' }
  );

  obs.observe(scene);
}

// ── Smooth parallax glow on mouse move (hero only) ──────────────────────
function initHeroParallax() {
  const glow = document.querySelector('.hero__bg-glow');
  if (!glow || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.querySelector('.hero')?.addEventListener('mousemove', e => {
    const { clientX, clientY, currentTarget } = e;
    const { offsetWidth: w, offsetHeight: h } = currentTarget;
    const x = ((clientX / w) - 0.5) * 24;
    const y = ((clientY / h) - 0.5) * 14;
    glow.style.transform = `translate(${x}px, ${y}px)`;
  }, { passive: true });
}

// ── Init ────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  onScroll();
  initReveal();
  initVialAnimations();
  initKitScene();
  initHeroParallax();
});
