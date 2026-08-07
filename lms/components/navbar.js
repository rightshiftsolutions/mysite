import { storage } from '../js/storage.js';
import { initGlobalFx } from '../js/fx.js';

/**
 * Render standard navbar in target element
 * @param {string} containerId - Element ID where navbar will be rendered
 */
export function renderNavbar(containerId = 'navbar-container') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const user = storage.getUser();
  const token = storage.getToken();
  const role = storage.getRole();
  
  const isLoggedIn = !!token && !!user;

  // Determine path offset based on current page url structure
  // If we are in standard pages dir (e.g. /pages/login.html), we need relative paths
  const isSubPage = window.location.pathname.includes('/pages/');
  const rootPrefix = isSubPage ? '../' : './';
  const pagesPrefix = isSubPage ? './' : './pages/';

  let navItems = '';

  if (isLoggedIn) {
    let dashboardLink = '#';
    if (role === 'admin') dashboardLink = `${pagesPrefix}admin-dashboard.html`;
    else if (role === 'teacher') dashboardLink = `${pagesPrefix}teacher-dashboard.html`;
    else if (role === 'student') dashboardLink = `${pagesPrefix}student-dashboard.html`;

    navItems = `
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        <li class="nav-item">
          <a class="nav-link active" aria-current="page" href="${dashboardLink}">Dashboard</a>
        </li>
      </ul>
      <div class="d-flex align-items-center gap-3">
        <span class="text-muted d-none d-md-inline">
          <i class="bi bi-person-circle me-1"></i>
          Welcome, <strong>${user.name}</strong> (${role})
        </span>
        <button id="logout-btn" class="btn btn-outline-danger btn-sm rounded-pill px-3">
          <i class="bi bi-box-arrow-right me-1"></i>Logout
        </button>
      </div>
    `;
  } else {
    navItems = `
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
      </ul>
      <div class="d-flex gap-2">
        <a href="${pagesPrefix}login.html" class="btn btn-outline-primary btn-sm rounded-pill px-3">Login</a>
        <div class="dropdown">
          <button class="btn btn-primary btn-sm rounded-pill px-3 dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
            Register
          </button>
          <ul class="dropdown-menu dropdown-menu-end shadow-premium border-0 mt-2" style="border-radius: 12px;">
            <li><a class="dropdown-item py-2" href="${pagesPrefix}student-register.html"><i class="bi bi-mortarboard me-2"></i>As Student</a></li>
            <li><a class="dropdown-item py-2" href="${pagesPrefix}teacher-register.html"><i class="bi bi-briefcase me-2"></i>As Teacher</a></li>
          </ul>
        </div>
        <a href="${pagesPrefix}admin-login.html" class="btn btn-light btn-sm rounded-pill px-3 border"><i class="bi bi-shield-lock me-1"></i>Admin</a>
      </div>
    `;
  }

  container.className = 'navbar navbar-expand-lg navbar-dark bg-dark-custom border-bottom py-3';
  container.innerHTML = `
    <div class="container">
      <a class="navbar-brand d-flex align-items-center gap-2 fw-bold text-primary" href="${rootPrefix}index.html">
        <img src="${rootPrefix}assets/logo.png" alt="LMS Logo" style="height: 32px; width: auto; object-fit: contain;" onerror="this.src='https://placehold.co/100x100?text=LMS'">
        <span>LMS Portal</span>
      </a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent" aria-controls="navbarContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarContent">
        ${navItems}
      </div>
    </div>
  `;

  // Attach logout handler if button exists
  const logoutBtn = container.querySelector('#logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      storage.logout();
    });
  }

  // Bootstrap global premium FX (scroll progress, reveal animations, ripple + sound)
  // — no-op if already initialized elsewhere (e.g. via authGuard.js)
  initGlobalFx();
}
