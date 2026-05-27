(function () {
  'use strict';

  var APP_VERSION = window.__APP_VERSION__ || 'dev';
  var VERSION_URL = 'version.json';
  var VERSION_STORAGE_KEY = 'gymgurus:pwa-version';
  var CHECK_INTERVAL_MS = 5 * 60 * 1000;
  var AUTO_REFRESH_DELAY_MS = 8000;

  var deferredInstallPrompt;
  var flutterRegistration;
  var pendingWorker;
  var refreshTimer;
  var isRefreshing = false;
  var updateToastShown = false;

  function isStandalone() {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    );
  }

  function showToast(id) {
    var toast = document.getElementById(id);
    if (!toast) return;
    toast.classList.add('show');
  }

  function hideToast(id) {
    var toast = document.getElementById(id);
    if (!toast) return;
    toast.classList.remove('show');
  }

  function refreshNow() {
    hideToast('pwa-update-toast');

    if (pendingWorker) {
      pendingWorker.postMessage({ type: 'SKIP_WAITING' });
      return;
    }

    window.location.reload();
  }

  function scheduleRefresh() {
    window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(refreshNow, AUTO_REFRESH_DELAY_MS);
  }

  function showUpdatePrompt(worker) {
    if (worker) pendingWorker = worker;
    if (updateToastShown) return;

    updateToastShown = true;
    showToast('pwa-update-toast');
    scheduleRefresh();
  }

  function hideSplashWhenFlutterPaints() {
    var hasFlutterPainted = function () {
      return document.querySelector(
        'flt-glass-pane, flutter-view, flt-scene-host',
      );
    };

    var hide = function () {
      document.documentElement.classList.add('flutter-loaded');
      window.setTimeout(function () {
        var splash = document.getElementById('pwa-splash');
        if (splash) splash.remove();
      }, 260);
    };

    if (hasFlutterPainted()) {
      hide();
      return;
    }

    var observer = new MutationObserver(function () {
      if (hasFlutterPainted()) {
        observer.disconnect();
        hide();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    window.setTimeout(hide, 8000);
  }

  function versionUrl() {
    return VERSION_URL + '?v=' + encodeURIComponent(Date.now().toString());
  }

  function readStoredVersion() {
    try {
      return window.localStorage.getItem(VERSION_STORAGE_KEY);
    } catch (_) {
      return null;
    }
  }

  function storeVersion(version) {
    try {
      window.localStorage.setItem(VERSION_STORAGE_KEY, version);
    } catch (_) {
      // Storage can be unavailable in private browsing. The SW update path still works.
    }
  }

  function checkVersion() {
    return fetch(versionUrl(), {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' },
    })
      .then(function (response) {
        if (!response.ok) return null;
        return response.json();
      })
      .then(function (data) {
        if (!data || !data.version) return;

        var latestVersion = String(data.version);
        var storedVersion = readStoredVersion();
        if (!storedVersion) {
          storeVersion(latestVersion);
          return;
        }

        if (storedVersion !== latestVersion || APP_VERSION !== latestVersion) {
          storeVersion(latestVersion);
          if (flutterRegistration) flutterRegistration.update();
          showUpdatePrompt();
        }
      })
      .catch(function () {
        // Offline or GitHub Pages propagation delay. Try again on the next tick.
      });
  }

  function watchRegistration(registration) {
    flutterRegistration = registration;

    if (registration.waiting && navigator.serviceWorker.controller) {
      showUpdatePrompt(registration.waiting);
    }

    registration.addEventListener('updatefound', function () {
      var installing = registration.installing;
      if (!installing) return;

      installing.addEventListener('statechange', function () {
        if (
          installing.state === 'installed' &&
          navigator.serviceWorker.controller
        ) {
          showUpdatePrompt(installing);
        }
      });
    });
  }

  function attachFlutterServiceWorkerWatcher() {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.ready
      .then(function (registration) {
        watchRegistration(registration);
        registration.update();
        checkVersion();
        window.setInterval(function () {
          registration.update();
          checkVersion();
        }, CHECK_INTERVAL_MS);
      })
      .catch(function (error) {
        console.warn('PWA service worker watcher failed:', error);
      });

    navigator.serviceWorker.addEventListener('controllerchange', function () {
      if (isRefreshing) return;
      isRefreshing = true;
      window.location.reload();
    });
  }

  window.addEventListener('beforeinstallprompt', function (event) {
    if (isStandalone()) return;
    event.preventDefault();
    deferredInstallPrompt = event;
    showToast('pwa-install-toast');
  });

  window.addEventListener('appinstalled', function () {
    deferredInstallPrompt = null;
    hideToast('pwa-install-toast');
  });

  window.addEventListener('load', function () {
    hideSplashWhenFlutterPaints();

    var installButton = document.getElementById('pwa-install-button');
    if (installButton) {
      installButton.addEventListener('click', function () {
        if (!deferredInstallPrompt) {
          hideToast('pwa-install-toast');
          return;
        }
        deferredInstallPrompt.prompt();
        deferredInstallPrompt.userChoice.finally(function () {
          deferredInstallPrompt = null;
          hideToast('pwa-install-toast');
        });
      });
    }

    var updateButton = document.getElementById('pwa-update-button');
    if (updateButton) {
      updateButton.addEventListener('click', refreshNow);
    }

    attachFlutterServiceWorkerWatcher();
  });

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') {
      if (flutterRegistration) flutterRegistration.update();
      checkVersion();
    }
  });
})();
