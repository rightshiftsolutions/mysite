/**
 * Reusable Bootstrap Modal Component
 */

class ModalService {
  constructor() {
    this.modalEl = null;
    this.modalInstance = null;
  }

  init() {
    this.modalEl = document.getElementById('modal-container-global');
    if (!this.modalEl) {
      this.modalEl = document.createElement('div');
      this.modalEl.id = 'modal-container-global';
      this.modalEl.className = 'modal fade';
      this.modalEl.tabIndex = -1;
      this.modalEl.setAttribute('aria-hidden', 'true');
      document.body.appendChild(this.modalEl);
    }
  }

  /**
   * Show a modal dialog
   * @param {object} options
   * @param {string} options.title - Header title
   * @param {string} options.body - Body text or HTML
   * @param {string} [options.confirmText='OK'] - Confirm button label
   * @param {string} [options.cancelText] - Cancel button label (if cancel button is wanted)
   * @param {function} [options.onConfirm] - Confirm button callback
   * @param {function} [options.onCancel] - Cancel button callback
   */
  show({ title, body, confirmText = 'OK', cancelText = '', onConfirm = null, onCancel = null }) {
    this.init();

    const hasCancel = !!cancelText;
    const cancelBtnHtml = hasCancel ? `<button type="button" class="btn btn-outline-secondary rounded-pill px-4" id="global-modal-cancel">${cancelText}</button>` : '';

    this.modalEl.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content shadow-premium border-0" style="border-radius: 16px;">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title fw-bold" style="font-size: 1.25rem;">${title}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" id="global-modal-close-icon"></button>
          </div>
          <div class="modal-body py-3 text-muted">
            ${body}
          </div>
          <div class="modal-footer border-0 pt-0">
            ${cancelBtnHtml}
            <button type="button" class="btn btn-primary rounded-pill px-4" id="global-modal-confirm">${confirmText}</button>
          </div>
        </div>
      </div>
    `;

    // Initialize Bootstrap Modal instance if available (rely on bootstrap global object)
    if (window.bootstrap && window.bootstrap.Modal) {
      this.modalInstance = new window.bootstrap.Modal(this.modalEl);
      this.modalInstance.show();
    } else {
      console.warn("Bootstrap JS is not loaded. Falling back to simple showing.");
      this.modalEl.classList.add('show');
      this.modalEl.style.display = 'block';
    }

    const confirmBtn = this.modalEl.querySelector('#global-modal-confirm');
    const cancelBtn = this.modalEl.querySelector('#global-modal-cancel');
    const closeIcon = this.modalEl.querySelector('#global-modal-close-icon');

    const handleConfirm = () => {
      this.hide();
      if (onConfirm) onConfirm();
    };

    const handleCancel = () => {
      this.hide();
      if (onCancel) onCancel();
    };

    confirmBtn.addEventListener('click', handleConfirm);
    if (cancelBtn) cancelBtn.addEventListener('click', handleCancel);
    closeIcon.addEventListener('click', handleCancel);
  }

  hide() {
    if (this.modalInstance) {
      this.modalInstance.hide();
    } else if (this.modalEl) {
      this.modalEl.classList.remove('show');
      this.modalEl.style.display = 'none';
    }
  }
}

export const modal = new ModalService();
