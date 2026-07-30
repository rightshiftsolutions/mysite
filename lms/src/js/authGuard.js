import { storage } from './storage.js';
import { initGlobalFx } from './fx.js';

/**
 * Checks if user is authenticated and matches specific role
 */
export function checkAuthGuard() {
  const token = storage.getToken();
  const role = storage.getRole();
  const path = window.location.pathname.toLowerCase();
  
  // Extract exact page filename to prevent substring collisions (e.g. teacher-streams.html matching streams.html)
  const page = path.split('/').pop();

  // Public / Login pages to skip
  const publicPages = ['admin-login.html', 'login.html', 'index.html', 'student-register.html', 'teacher-register.html'];
  if (publicPages.includes(page) || !page) {
    return true;
  }

  if (!token) {
    storage.logout();
    // Admin login redirect check
    const adminPages = ['admin-dashboard.html', 'admin-profile.html', 'admin-list.html', 'admin-create.html', 'admin-edit.html', 'teacher-requests.html', 'student-requests.html', 'streams.html', 'stream-create.html', 'stream-edit.html', 'teacher-stream-details.html', 'teacher-streams.html'];
    const isAdminPath = adminPages.includes(page) || page.startsWith('admin-');
    window.location.href = isAdminPath ? './admin-login.html' : './login.html';
    return false;
  }

  // Admin pages protection
  const adminPages = ['admin-dashboard.html', 'admin-profile.html', 'admin-list.html', 'admin-create.html', 'admin-edit.html', 'teacher-requests.html', 'student-requests.html', 'streams.html', 'stream-create.html', 'stream-edit.html', 'teacher-stream-details.html'];

  if (adminPages.includes(page)) {
    if (role !== 'admin') {
      storage.logout();
      window.location.href = './admin-login.html';
      return false;
    }
    return true;
  }

  // Teacher specific pages
  const teacherPages = ['teacher-dashboard.html', 'teacher-profile.html', 'assign-stream.html', 'create-course.html', 'edit-course.html', 'course-details.html', 'pending-attendance.html', 'attendance-report.html', 'create-game.html', 'edit-game.html', 'lucky-spinner.html', 'my-courses.html'];

  if (teacherPages.includes(page)) {
    if (role !== 'teacher') {
      storage.logout();
      window.location.href = './login.html';
      return false;
    }
    return true;
  }

  // Student specific pages
  const studentPages = ['student-dashboard.html', 'student-profile.html'];
  
  if (studentPages.includes(page)) {
    if (role !== 'student') {
      storage.logout();
      window.location.href = './login.html';
      return false;
    }
    return true;
  }

  // Shared pages (both student and teacher)
  const studentTeacherPages = ['edit-profile.html', 'change-password.html', 'game-details.html', 'games.html', 'leaderboard.html'];
  if (studentTeacherPages.includes(page)) {
    if (role !== 'teacher' && role !== 'student') {
      storage.logout();
      window.location.href = './login.html';
      return false;
    }
    return true;
  }

  // Shared pages (both admin and teacher)
  const adminTeacherPages = ['teacher-streams.html'];
  if (adminTeacherPages.includes(page)) {
    if (role !== 'admin' && role !== 'teacher') {
      storage.logout();
      window.location.href = './login.html';
      return false;
    }
    return true;
  }

  return true;
}

/**
 * Dynamically renders the sidebar and top navbar for Admin, Teacher, and Student Panels
 */
export function renderDashboardLayout() {
  const sidebarContainer = document.getElementById('sidebar-container');
  const headerContainer = document.getElementById('header-container');

  const path = window.location.pathname.toLowerCase();
  const role = storage.getRole();
  const user = storage.getUser() || { name: 'User', email: '' };

  if (sidebarContainer) {
    if (role === 'admin') {
      sidebarContainer.innerHTML = '';
      sidebarContainer.style.display = 'none';
    } else if (role === 'teacher') {
      sidebarContainer.innerHTML = '';
      sidebarContainer.style.display = 'none';
    } else if (role === 'student') {
      sidebarContainer.innerHTML = '';
      sidebarContainer.style.display = 'none';
    }
  }

  if (headerContainer) {
    const brandHtml = (role === 'student' || role === 'teacher' || role === 'admin') ? `
      <a href="${role === 'admin' ? './admin-dashboard.html' : role === 'student' ? './student-dashboard.html' : './teacher-dashboard.html'}" class="d-flex align-items-center gap-2 text-decoration-none text-light fw-bold" style="font-size: 1.1rem;">
        <img src="../assets/logo.png" alt="LMS Logo" style="height: 28px; object-fit: contain;" onerror="this.src='https://placehold.co/100x100?text=LMS'">
        <span>LMS</span>
        <span class="role-badge ms-1" style="--role-accent: var(--role-${role});">${role.charAt(0).toUpperCase() + role.slice(1)}</span>
      </a>
    ` : `
      <button class="sidebar-toggle-btn d-lg-none" id="sidebar-toggle">
        <i class="bi bi-list"></i>
      </button>
    `;

    const headerClass = role === 'admin' ? 'admin-header' : role === 'student' ? 'student-header' : 'teacher-header';
    headerContainer.innerHTML = `
      <div class="${headerClass} shadow-sm">
        ${brandHtml}
        <div class="ms-auto d-flex align-items-center gap-3">
          <button class="btn btn-link text-secondary p-1 position-relative" title="Notifications">
            <i class="bi bi-bell fs-5"></i>
            <span class="position-absolute top-2 start-75 translate-middle p-1 bg-danger border border-light rounded-circle">
              <span class="visually-hidden">New alerts</span>
            </span>
          </button>
          
          <div class="dropdown">
            <a class="d-flex align-items-center gap-2 text-decoration-none dropdown-toggle text-dark" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="bi bi-person-circle fs-5 text-secondary"></i>
              <span class="fw-semibold small d-none d-md-inline text-light">${user.name}</span>
            </a>
            <ul class="dropdown-menu dropdown-menu-end shadow border-0 mt-2" style="border-radius: 12px;">
              <li><a class="dropdown-item py-2" href="${role === 'admin' ? './admin-dashboard.html' : role === 'student' ? './student-dashboard.html' : './teacher-dashboard.html'}"><i class="bi bi-speedometer2 me-2"></i>Dashboard</a></li>
              <li><a class="dropdown-item py-2" href="${role === 'admin' ? './admin-profile.html' : role === 'student' ? './student-profile.html' : './teacher-profile.html'}"><i class="bi bi-person me-2"></i>My Profile</a></li>
              ${role === 'teacher' || role === 'student' ? `
                <li><a class="dropdown-item py-2" href="./edit-profile.html"><i class="bi bi-pencil-square me-2"></i>Edit Profile</a></li>
                <li><a class="dropdown-item py-2" href="./change-password.html"><i class="bi bi-key me-2"></i>Change Password</a></li>
              ` : ''}
              <li><hr class="dropdown-divider"></li>
              <li><button class="dropdown-item py-2 text-danger logout-trigger-btn"><i class="bi bi-box-arrow-right me-2"></i>Logout</button></li>
            </ul>
          </div>
        </div>
      </div>
    `;

    // Bind sidebar toggle (for mobile layouts)
    const toggleBtn = document.getElementById('sidebar-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const sidebar = document.querySelector(role === 'admin' ? '.admin-sidebar' : role === 'student' ? '.student-sidebar' : '.teacher-sidebar');
        if (sidebar) {
          sidebar.classList.toggle('show');
        }
      });
    }

    // Bind logout click trigger in dropdown
    const dropLogout = headerContainer.querySelector('.logout-trigger-btn');
    if (dropLogout) {
      dropLogout.addEventListener('click', () => storage.logout());
    }
  }
}

// Execute guard checks
const authOk = checkAuthGuard();
if (authOk) {
  document.addEventListener('DOMContentLoaded', renderDashboardLayout);
  document.addEventListener('DOMContentLoaded', initGlobalFx);
}
export default checkAuthGuard;
