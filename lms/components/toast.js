/**
 * Toast Component Helper using Bootstrap 5 classes
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
      document.body.appendChild(this.container);
    }
  }

  /**
   * Show a toast message
   * @param {string} title - Header text
   * @param {string} message - Body text
   * @param {'success' | 'danger' | 'warning' | 'info'} type - Bootstrap style context
   * @param {number} delay - Time in ms before hiding (default: 4000)
   */
  show(title, message, type = 'info', delay = 4000) {
    this.initContainer();

    const toastElement = document.createElement('div');
    const typeClass = type === 'danger' ? 'toast-error' : type === 'success' ? 'toast-success' : `toast-${type}`;
    toastElement.className = `toast app-toast ${typeClass} align-items-center text-white bg-${type} border-0 shadow-premium show`;
    toastElement.role = 'alert';
    toastElement.ariaLive = 'assertive';
    toastElement.ariaAtomic = 'true';
    toastElement.setAttribute('data-bs-delay', delay);

    // Dynamic background matching for dark toast styles
    const iconClass = type === 'success' ? 'bi-check-circle-fill' : 
                      type === 'danger' ? 'bi-exclamation-triangle-fill' :
                      type === 'warning' ? 'bi-exclamation-circle-fill' : 'bi-info-circle-fill';

    toastElement.innerHTML = `
      <div class="d-flex">
        <div class="toast-body d-flex align-items-center gap-2">
          <i class="bi ${iconClass} fs-5 app-toast-icon"></i>
          <div>
            <strong>${title}</strong><br>
            <span style="font-size: 0.9rem;">${message}</span>
          </div>
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    `;

    this.container.appendChild(toastElement);

    // Auto-remove element from DOM after it finishes fading
    setTimeout(() => {
      toastElement.classList.remove('show');
      toastElement.classList.add('hide');
      setTimeout(() => {
        if (toastElement.parentNode) {
          toastElement.remove();
        }
      }, 500);
    }, delay);

    // Attach click listener to close button
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
