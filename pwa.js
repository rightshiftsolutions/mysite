(function () {
  'use strict';

  var customWorkerRegistration;
  var deferredInstallPrompt;
  var updateWorker;

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

  function hideSplashWhenFlutterPaints() {
    var hasFlutterPainted = function () {
      return document.querySelector('flt-glass-pane, flutter-view, flt-scene-host');
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
      updateButton.addEventListener('click', function () {
        hideToast('pwa-update-toast');
        if (updateWorker) {
          updateWorker.postMessage({ type: 'SKIP_WAITING' });
        } else {
          window.location.reload();
        }
      });
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('pwa_service_worker.js')
        .then(function (registration) {
          customWorkerRegistration = registration;

          registration.addEventListener('updatefound', function () {
            var installing = registration.installing;
            if (!installing) return;

            installing.addEventListener('statechange', function () {
              if (
                installing.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                updateWorker = installing;
                showToast('pwa-update-toast');
              }
            });
          });

          window.setInterval(function () {
            registration.update();
          }, 60 * 60 * 1000);
        })
        .catch(function (error) {
          console.warn('PWA service worker registration failed:', error);
        });

      var refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', function () {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });
    }
  });

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible' && customWorkerRegistration) {
      customWorkerRegistration.update();
    }
  });
})();
