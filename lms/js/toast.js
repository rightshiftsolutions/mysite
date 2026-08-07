/**
 * Toast Notification Utility
 */

class ToastService {
  constructor() {
    this.container = null;
    this.initContainer();
  }

  initContainer() {
    this.container = document.getElementById('toast-container-custom');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container-custom';
      this.container.className = 'toast-container-custom position-fixed top-0 end-0 p-3';
      
      // Inject standard styles if not loaded
      if (!document.querySelector('style[id="toast-styles-fallback"]')) {
        const style = document.createElement('style');
        style.id = 'toast-styles-fallback';
        style.textContent = `
          .toast-container-custom {
            position: fixed;
            top: 24px;
            right: 24px;
            z-index: 10000;
          }
        `;
        document.head.appendChild(style);
      }

      document.body.appendChild(this.container);
    }
  }

  show(title, message, type = 'info', delay = 4000) {
    this.initContainer();

    const toastElement = document.createElement('div');
    toastElement.className = `toast align-items-center text-white bg-${type} border-0 shadow show`;
    toastElement.role = 'alert';
    toastElement.ariaLive = 'assertive';
    toastElement.ariaAtomic = 'true';
    toastElement.setAttribute('data-bs-delay', delay);

    const iconClass = type === 'success' ? 'bi-check-circle-fill' : 
                      type === 'danger' ? 'bi-exclamation-triangle-fill' :
                      type === 'warning' ? 'bi-exclamation-circle-fill' : 'bi-info-circle-fill';

    toastElement.innerHTML = `
      <div class="d-flex">
        <div class="toast-body d-flex align-items-center gap-2">
          <i class="bi ${iconClass} fs-5"></i>
          <div>
            <strong>${title}</strong><br>
            <span style="font-size: 0.9rem;">${message}</span>
          </div>
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    `;

    this.container.appendChild(toastElement);

    setTimeout(() => {
      toastElement.classList.remove('show');
      setTimeout(() => {
        if (toastElement.parentNode) {
          toastElement.remove();
        }
      }, 500);
    }, delay);

    const closeBtn = toastElement.querySelector('.btn-close');
    closeBtn.addEventListener('click', () => {
      toastElement.remove();
    });
  }

  success(message, title = 'Success') {
    this.show(title, message, 'success');
  }

  error(message, title = 'Error') {
    this.show(title, message, 'danger');
  }

  warning(message, title = 'Warning') {
    this.show(title, message, 'warning');
  }

  info(message, title = 'Info') {
    this.show(title, message, 'info');
  }
}

export const toast = new ToastService();
export default toast;
