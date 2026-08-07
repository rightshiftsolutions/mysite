/**
 * Global premium FX bootstrap.
 * Adds: scroll progress bar, scroll-reveal animations, click ripple effect,
 * site-wide UI click/hover sound feedback, and a floating sound mute toggle.
 * Safe to call multiple times — guards against double-init.
 */
import { gameSound } from './gameSound.js';

let initialized = false;

function injectScrollProgressBar() {
  if (document.getElementById('scroll-progress-bar')) return;
  const bar = document.createElement('div');
  bar.id = 'scroll-progress-bar';
  document.body.appendChild(bar);

  const update = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const pct = height > 0 ? (scrollTop / height) * 100 : 0;
    bar.style.width = pct + '%';
  };

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}

function initScrollReveal() {
  const targets = document.querySelectorAll(
    '.card, .stat-card, .stat-card-teacher, .dash-card, .dash-game-card, .podium-card, .rank-row, .auth-card, .auth-split, .feature-card'
  );
  if (!targets.length) return;

  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('fx-in'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, idx) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = Math.min((idx % 8) * 60, 300);
          setTimeout(() => el.classList.add('fx-in'), delay);
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
  );

  targets.forEach((el) => {
    el.classList.add('fx-reveal');
    observer.observe(el);
  });
}

function initRippleAndSound() {
  const SELECTOR = 'button, .btn, a.btn, .nav-link, .dropdown-item, .palette-btn, .quiz-option-wrapper, .sidebar-link, [role="button"]';

  document.addEventListener(
    'pointerdown',
    (e) => {
      const target = e.target.closest(SELECTOR);
      if (!target || target.disabled) return;

      // Ripple
      target.classList.add('fx-ripple');
      const rect = target.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 1.4;
      const circle = document.createElement('span');
      circle.className = 'fx-ripple-circle';
      circle.style.width = circle.style.height = size + 'px';
      circle.style.left = (e.clientX - rect.left - size / 2) + 'px';
      circle.style.top = (e.clientY - rect.top - size / 2) + 'px';
      target.appendChild(circle);
      setTimeout(() => circle.remove(), 650);

      // Sound (skip on elements that already manage their own sound cues,
      // like quiz options, which trigger richer sounds from quiz.js)
      if (!target.classList.contains('quiz-option-wrapper')) {
        gameSound.uiClick();
      }
    },
    { passive: true }
  );

  let lastHoverSound = 0;
  document.addEventListener(
    'pointerover',
    (e) => {
      const target = e.target.closest(SELECTOR);
      if (!target || target.disabled) return;
      const now = Date.now();
      if (now - lastHoverSound < 90) return; // throttle
      lastHoverSound = now;
      gameSound.uiHover();
    },
    { passive: true }
  );
}

function injectSoundToggle() {
  if (document.getElementById('fx-global-sound-toggle')) return;

  const btn = document.createElement('button');
  btn.id = 'fx-global-sound-toggle';
  btn.className = 'fx-sound-toggle';
  btn.type = 'button';
  btn.title = 'Toggle sound effects';
  btn.style.position = 'fixed';
  btn.style.bottom = '20px';
  btn.style.right = '20px';
  btn.style.zIndex = '10040';

  const render = () => {
    const muted = gameSound.isMuted();
    btn.classList.toggle('is-muted', muted);
    btn.innerHTML = muted
      ? '<i class="bi bi-volume-mute-fill"></i>'
      : '<i class="bi bi-volume-up-fill"></i>';
  };
  render();

  btn.addEventListener('click', () => {
    gameSound.toggle();
    render();
    if (!gameSound.isMuted()) gameSound.toggleSound();
  });

  document.body.appendChild(btn);
}

export function initGlobalFx() {
  if (initialized) return;
  initialized = true;

  injectScrollProgressBar();
  initRippleAndSound();
  injectSoundToggle();

  // Reveal animation needs DOM content to exist — run now and shortly after,
  // since many pages inject cards dynamically after an API call.
  initScrollReveal();
  window.addEventListener('load', initScrollReveal);
  setTimeout(initScrollReveal, 600);
  setTimeout(initScrollReveal, 1500);
}

export default initGlobalFx;
