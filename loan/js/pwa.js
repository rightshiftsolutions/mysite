/* ==========================================================================
   LoanFlow — PWA Helper (js/pwa.js)
   Service worker registration, native PWA installation flow (Android, Edge & iOS Safari),
   mobile keyboard optimizations, native touch feedback, and app loading shell helpers.
   ========================================================================== */

(() => {
  // Determine relative path to service worker based on file location
  const isSubfolder = location.pathname.includes('/pages/');
  const swPath = isSubfolder ? '../sw.js' : './sw.js';
  const swScope = isSubfolder ? '../' : './';

  // Environment Check: Register in production or when forced
  const isLocalhost = Boolean(
    location.hostname === 'localhost' ||
    location.hostname === '127.0.0.1' ||
    location.hostname === '[::1]' ||
    location.protocol === 'file:'
  );
  const isProduction = (!isLocalhost && location.protocol === 'https:') || Boolean(window.LOANFLOW_FORCE_SW);

  // 1. Service Worker Registration
  if ('serviceWorker' in navigator && isProduction) {
    window.addEventListener('load', () => {
      try {
        navigator.serviceWorker.register(swPath, { scope: swScope })
          .then((reg) => {
            reg.addEventListener('updatefound', () => {
              const installingWorker = reg.installing;
              if (!installingWorker) return;
              installingWorker.addEventListener('statechange', () => {
                if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  if (window.LoanFlow && window.LoanFlow.Toast) {
                    window.LoanFlow.Toast.show('info', 'A new update is available. Refresh when ready.');
                  }
                }
              });
            });
          })
          .catch((err) => {
            console.debug('[PWA] Service Worker registration gracefully caught:', err);
          });
      } catch (err) {
        console.debug('[PWA] Service Worker initialization error:', err);
      }
    });
  }

  // 2. Online / Offline Status Notifications
  window.addEventListener('online', () => {
    if (window.LoanFlow && window.LoanFlow.Toast) {
      window.LoanFlow.Toast.show('success', 'Back online! Connection restored.');
    }
  });

  window.addEventListener('offline', () => {
    if (window.LoanFlow && window.LoanFlow.Toast) {
      window.LoanFlow.Toast.show('warning', 'You are currently offline. Live backend updates may be paused.');
    }
  });

  // 3. PWA Installation Flow (Android Chrome, Edge, Samsung Internet)
  let deferredPrompt = null;
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || Boolean(navigator.standalone);

  const isRecentlyDismissed = () => {
    const dismissedTime = localStorage.getItem('lf_pwa_dismissed');
    if (!dismissedTime) return false;
    // Hide for 3 days if dismissed by user
    return (Date.now() - parseInt(dismissedTime, 10)) < 3 * 24 * 60 * 60 * 1000;
  };

  function createInstallBanner() {
    if (isStandalone || isRecentlyDismissed() || document.getElementById('pwaInstallBanner')) return;

    const banner = document.createElement('div');
    banner.id = 'pwaInstallBanner';
    banner.className = 'pwa-install-banner';
    banner.innerHTML = `
      <div class="d-flex align-items-center justify-content-center bg-primary bg-opacity-25 text-primary rounded-3" style="width:38px;height:38px;flex-shrink:0;">
        <i class="bi bi-download fs-5"></i>
      </div>
      <div class="flex-grow-1" style="min-width:0;">
        <div class="fw-semibold text-white small" style="line-height:1.2;">Install LoanFlow</div>
        <div class="text-secondary" style="font-size:0.75rem;">Fast access & native app feel</div>
      </div>
      <div class="d-flex align-items-center gap-2">
        <button id="pwaInstallBtn" class="btn btn-sm btn-gradient px-3 py-1 text-nowrap">Install</button>
        <button id="pwaDismissBtn" class="btn btn-sm text-secondary p-0 border-0 bg-transparent" title="Dismiss" style="line-height:1;"><i class="bi bi-x fs-4"></i></button>
      </div>
    `;

    document.body.appendChild(banner);

    // Install Button Handler
    document.getElementById('pwaInstallBtn')?.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('[PWA] User response to install prompt:', outcome);
      deferredPrompt = null;
      banner.remove();
    });

    // Dismiss Button Handler
    document.getElementById('pwaDismissBtn')?.addEventListener('click', () => {
      localStorage.setItem('lf_pwa_dismissed', Date.now().toString());
      banner.remove();
    });
  }

  // Capture beforeinstallprompt event for Android Chrome, Edge, Samsung Internet, Brave, Opera
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    window.deferredPWAInstallPrompt = deferredPrompt;
    createInstallBanner();
  });

  // Automatically hide installation prompt when app is installed
  window.addEventListener('appinstalled', () => {
    console.log('[PWA] LoanFlow successfully installed.');
    deferredPrompt = null;
    document.getElementById('pwaInstallBanner')?.remove();
  });

  // 4. iOS Safari Installation Flow ("Add to Home Screen")
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isSafari = /Safari/.test(navigator.userAgent) && !/CriOS|FxiOS|EdgiOS/.test(navigator.userAgent);

  if (isIOS && isSafari && !isStandalone && !isRecentlyDismissed()) {
    window.addEventListener('DOMContentLoaded', () => {
      if (document.getElementById('pwaInstallBanner')) return;

      const iosBanner = document.createElement('div');
      iosBanner.id = 'pwaInstallBanner';
      iosBanner.className = 'pwa-install-banner';
      iosBanner.innerHTML = `
        <div class="d-flex align-items-center justify-content-center bg-primary bg-opacity-25 text-primary rounded-3" style="width:38px;height:38px;flex-shrink:0;">
          <i class="bi bi-box-arrow-up fs-5"></i>
        </div>
        <div class="flex-grow-1" style="min-width:0;">
          <div class="fw-semibold text-white small" style="line-height:1.2;">Install on iPhone</div>
          <div class="text-secondary" style="font-size:0.75rem;">Tap <i class="bi bi-box-arrow-up mx-1 text-info"></i> then "Add to Home Screen"</div>
        </div>
        <button id="pwaDismissBtn" class="btn btn-sm text-secondary p-0 border-0 bg-transparent" title="Dismiss" style="line-height:1;"><i class="bi bi-x fs-4"></i></button>
      `;

      document.body.appendChild(iosBanner);

      document.getElementById('pwaDismissBtn')?.addEventListener('click', () => {
        localStorage.setItem('lf_pwa_dismissed', Date.now().toString());
        iosBanner.remove();
      });
    });
  }

  // 5. Native Mobile Keyboard, Focus & Touch Interaction Enhancements
  document.addEventListener('DOMContentLoaded', () => {
    // Inject Native App Loading Screen fade-out listener
    const loader = document.getElementById('app-splash-loader');
    if (loader) {
      setTimeout(() => loader.classList.add('fade-out'), 150);
    }

    // Enhance input fields with optimal mobile keyboard types
    document.querySelectorAll('input').forEach((input) => {
      const name = (input.name || input.id || '').toLowerCase();
      const type = (input.type || '').toLowerCase();

      if (type === 'number' || name.includes('amount') || name.includes('rate') || name.includes('tenure') || name.includes('interest') || name.includes('percent')) {
        if (!input.hasAttribute('inputmode')) input.setAttribute('inputmode', 'decimal');
      } else if (name.includes('phone') || name.includes('mobile') || name.includes('otp') || name.includes('code') || name.includes('pin')) {
        if (!input.hasAttribute('inputmode')) input.setAttribute('inputmode', 'numeric');
      } else if (type === 'email' || name.includes('email')) {
        if (!input.hasAttribute('inputmode')) input.setAttribute('inputmode', 'email');
        if (!input.hasAttribute('autocomplete')) input.setAttribute('autocomplete', 'email');
        input.setAttribute('autocapitalize', 'off');
        input.setAttribute('autocorrect', 'off');
      }
    });

    // Auto-scroll input into view on focus so virtual keyboard doesn't cover active input
    document.addEventListener('focusin', (e) => {
      const el = e.target;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT')) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 180);
      }
    });

    // Auto-dismiss keyboard when pressing Enter on single-line inputs
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target && e.target.tagName === 'INPUT' && e.target.type !== 'textarea') {
        e.target.blur();
      }
    });

    // Prevent double-tap zoom delay on fast repetitive taps
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'SELECT') {
          e.preventDefault();
        }
      }
      lastTouchEnd = now;
    }, false);
  });
})();
