/**
 * Loading Spinner Component Wrapper
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
      
      // Inject standard styles if not loaded
      if (!document.querySelector('style[id="loader-styles-fallback"]')) {
        const style = document.createElement('style');
        style.id = 'loader-styles-fallback';
        style.textContent = `
          .loader-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(15, 23, 42, 0.4);
            backdrop-filter: blur(4px);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.25s ease, visibility 0.25s ease;
          }
          .loader-overlay.active {
            opacity: 1;
            visibility: visible;
          }
          .loader-content {
            background: #1e2a3f;
            border: 1px solid #33415c;
            padding: 2rem;
            border-radius: 16px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
          }
        `;
        document.head.appendChild(style);
      }

      this.element.innerHTML = `
        <div class="loader-content">
          <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
            <span class="visually-hidden">Loading...</span>
          </div>
          <span class="loader-text" id="loader-text-msg" style="font-weight: 500; color: #e8eef7;">Processing...</span>
        </div>
      `;
      document.body.appendChild(this.element);
    }
  }

  show(text = 'Processing...') {
    this.init();
    const textEl = this.element.querySelector('#loader-text-msg');
    if (textEl) {
      textEl.textContent = text;
    }
    this.element.classList.add('active');
  }

  hide() {
    this.init();
    this.element.classList.remove('active');
  }
}

export const loader = new LoaderService();
export default loader;
