/**
 * pwa.js — Service Worker Registration & PWA Install Prompt
 * LMS Arena
 */

(function () {
  'use strict';

  /* ── 1. Service Worker Registration ──────────────────────── */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then(function (reg) {
          console.log('[PWA] Service Worker registered. Scope:', reg.scope);

          // Listen for updates
          reg.addEventListener('updatefound', function () {
            const worker = reg.installing;
            worker.addEventListener('statechange', function () {
              if (worker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content available – show a subtle toast
                showUpdateToast();
              }
            });
          });
        })
        .catch(function (err) {
          console.warn('[PWA] Service Worker registration failed:', err);
        });

      // Handle SW controller change (page reload after update)
      navigator.serviceWorker.addEventListener('controllerchange', function () {
        // Only reload if the user triggered the update
        if (window.__pwaReloading) return;
        window.__pwaReloading = true;
        window.location.reload();
      });
    });
  }

  /* ── 2. Install Prompt (Android Chrome "Add to Home Screen") */
  let deferredPrompt = null;

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;

    // Don't show banner if already installed or user dismissed before
    if (sessionStorage.getItem('pwa-banner-dismissed')) return;
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    // Small delay so the page settles first
    setTimeout(showInstallBanner, 3000);
  });

  window.addEventListener('appinstalled', function () {
    hideBanner();
    deferredPrompt = null;
    console.log('[PWA] App installed successfully');
  });

  /* ── 3. Install Banner DOM ────────────────────────────────── */
  function createBanner() {
    if (document.getElementById('pwa-install-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'pwa-install-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Install app');
    banner.innerHTML = `
      <div class="banner-icon">🎮</div>
      <div class="banner-text">
        <div class="banner-title">Install LMS Arena</div>
        <div class="banner-sub">Add to home screen for the full app experience</div>
      </div>
      <button class="banner-btn" id="pwa-install-btn">Install</button>
      <button class="banner-close" id="pwa-banner-close" aria-label="Dismiss">✕</button>
    `;
    document.body.appendChild(banner);

    document.getElementById('pwa-install-btn').addEventListener('click', triggerInstall);
    document.getElementById('pwa-banner-close').addEventListener('click', dismissBanner);
  }

  function showInstallBanner() {
    createBanner();
    requestAnimationFrame(function () {
      const banner = document.getElementById('pwa-install-banner');
      if (banner) banner.classList.add('show');
    });
  }

  function hideBanner() {
    const banner = document.getElementById('pwa-install-banner');
    if (banner) {
      banner.classList.remove('show');
      setTimeout(() => banner.remove(), 400);
    }
  }

  function dismissBanner() {
    sessionStorage.setItem('pwa-banner-dismissed', '1');
    hideBanner();
  }

  async function triggerInstall() {
    if (!deferredPrompt) return;
    hideBanner();
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log('[PWA] Install prompt outcome:', outcome);
    deferredPrompt = null;
  }

  /* ── 4. Update Toast ─────────────────────────────────────── */
  function showUpdateToast() {
    // Reuse any existing neon toast system if available
    if (typeof window.showNeonToast === 'function') {
      window.showNeonToast('🔄 New version available — tap to refresh', 'info');
      return;
    }

    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed; top: calc(80px + env(safe-area-inset-top, 0px));
      left: 50%; transform: translateX(-50%);
      background: rgba(0,229,255,0.15); border: 1px solid rgba(0,229,255,0.4);
      color: #f0f2ff; padding: 0.75rem 1.5rem; border-radius: 2rem;
      font-weight: 700; font-size: 0.9rem; z-index: 99999;
      cursor: pointer; backdrop-filter: blur(20px); white-space: nowrap;
      box-shadow: 0 0 20px rgba(0,229,255,0.2);
    `;
    toast.textContent = '🔄 Update available — tap to refresh';
    toast.addEventListener('click', function () {
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
      }
      window.location.reload();
    });
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 8000);
  }

  /* ── 5. Page transition animation ───────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    document.body.classList.add('page-fade-in');
  });

  /* ── 6. Prevent pull-to-refresh on game/quiz screens ──────── */
  document.addEventListener('touchmove', function (e) {
    // Only block overscroll when on a game screen
    const isGameScreen = document.body.classList.contains('kbc-bg') ||
                         document.body.classList.contains('game-bg') ||
                         document.getElementById('quizSection') !== null;
    if (isGameScreen && e.touches.length === 1) {
      // Let normal scrolling work; only block body overscroll
    }
  }, { passive: true });

  /* ── 7. Viewport height fix (address bar resize on Android) */
  function setVH() {
    document.documentElement.style.setProperty('--vh', window.innerHeight * 0.01 + 'px');
  }
  setVH();
  window.addEventListener('resize', setVH);
  window.addEventListener('orientationchange', function () {
    setTimeout(setVH, 200);
  });

  /* ── 8. iOS Standalone detection ─────────────────────────── */
  const isStandalone = window.navigator.standalone === true ||
                       window.matchMedia('(display-mode: standalone)').matches;
  if (isStandalone) {
    document.documentElement.setAttribute('data-pwa', 'standalone');
  }

})();
