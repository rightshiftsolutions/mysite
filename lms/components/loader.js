/**
 * Reusable Loading Spinner Component
 */

class LoaderService {
  constructor() {
    this.element = null;
    this.init();
  }

  init() {
    this.element = document.getElementById('loader-overlay-global');
    if (!this.element) {
      this.element = document.createElement('div');
      this.element.id = 'loader-overlay-global';
      this.element.className = 'loader-overlay';
      this.element.innerHTML = `
        <div class="loader-content">
          <div class="brand-spinner" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <span class="loader-text" id="loader-text-msg">Processing...</span>
        </div>
      `;
      document.body.appendChild(this.element);
    }
  }

  /**
   * Display the loading spinner
   * @param {string} text - Custom message to show below the spinner (default: 'Processing...')
   */
  show(text = 'Processing...') {
    this.init();
    const textEl = this.element.querySelector('#loader-text-msg');
    if (textEl) {
      textEl.textContent = text;
    }
    this.element.classList.add('active');
  }

  /**
   * Hide the loading spinner
   */
  hide() {
    this.init();
    this.element.classList.remove('active');
  }
}

export const loader = new LoaderService();
