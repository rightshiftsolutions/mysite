/* ==========================================================================
   LoanFlow — app.js
   Shared bootstrap: API client, auth guard, sidebar/navbar injection,
   toast notifications, formatting helpers. Loaded on every page.
   ========================================================================== */

const LoanFlow = (() => {

  const API_BASE = "https://loan.gymgurus.in"
  /* ---------------------------------------------------------------------
     Auth storage
  --------------------------------------------------------------------- */
  const Auth = {
    getToken: () => localStorage.getItem('lf_token'),
    getUser: () => {
      try { return JSON.parse(localStorage.getItem('lf_user') || 'null'); }
      catch (e) { return null; }
    },
    setSession: (token, user) => {
      localStorage.setItem('lf_token', token);
      if (user) localStorage.setItem('lf_user', JSON.stringify(user));
    },
    updateUser: (user) => localStorage.setItem('lf_user', JSON.stringify(user)),
    clear: () => { localStorage.removeItem('lf_token'); localStorage.removeItem('lf_user'); },
    isLoggedIn: () => !!localStorage.getItem('lf_token'),
    logout: () => { Auth.clear(); window.location.href = 'login.html'; }
  };

  /* ---------------------------------------------------------------------
     API wrapper
     - Adds Authorization header automatically when a token exists
     - JSON by default; pass a FormData body to send multipart
     - Redirects to login on 401
  --------------------------------------------------------------------- */
  async function api(path, { method = 'GET', body = null, isForm = false, auth = true } = {}) {
    const headers = {};
    if (!isForm) headers['Content-Type'] = 'application/json';
    if (auth && Auth.getToken()) headers['Authorization'] = `Bearer ${Auth.getToken()}`;

    let res, data;
    try {
      res = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        body: body ? (isForm ? body : JSON.stringify(body)) : undefined
      });
    } catch (err) {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        Toast.show('warning', 'You are currently offline. Please check your internet connection.');
      }
      throw { networkError: true, message: 'Could not reach the server. Is the API running at ' + API_BASE + '?' };
    }

    try { data = await res.json(); } catch (e) { data = {}; }

    if (res.status === 401) {
      Auth.clear();
      if (!location.pathname.endsWith('login.html')) {
        Toast.show('warning', 'Your session expired. Please sign in again.');
        setTimeout(() => window.location.href = 'login.html', 900);
      }
    }

    if (!res.ok) {
      const msg = data && data.message ? data.message : `Request failed (${res.status})`;
      throw { status: res.status, message: msg, data };
    }
    return data;
  }

  function requireAuth() {
    if (!Auth.isLoggedIn()) window.location.href = 'login.html';
  }
  function redirectIfLoggedIn() {
    if (Auth.isLoggedIn()) window.location.href = 'dashboard.html';
  }

  /* ---------------------------------------------------------------------
     Toasts
  --------------------------------------------------------------------- */
  const Toast = {
    icons: { success: 'bi-check-circle-fill', danger: 'bi-x-circle-fill', warning: 'bi-exclamation-triangle-fill', info: 'bi-info-circle-fill' },
    show(type, msg, timeout = 4200) {
      let stack = document.querySelector('.toast-stack');
      if (!stack) {
        stack = document.createElement('div');
        stack.className = 'toast-stack';
        document.body.appendChild(stack);
      }
      const el = document.createElement('div');
      el.className = `toast-item ${type}`;
      el.innerHTML = `<i class="bi ${this.icons[type] || this.icons.info}"></i><div class="msg">${msg}</div><i class="bi bi-x close-x"></i>`;
      el.querySelector('.close-x').addEventListener('click', () => el.remove());
      stack.appendChild(el);
      setTimeout(() => el.remove(), timeout);
    }
  };

  /* ---------------------------------------------------------------------
     Formatters
  --------------------------------------------------------------------- */
  const fmt = {
    money(n) {
      if (n === null || n === undefined || isNaN(n)) return '—';
      return '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 });
    },
    date(d) {
      if (!d) return '—';
      const dt = new Date(d);
      if (isNaN(dt)) return d;
      return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    },
    initials(name) {
      if (!name || typeof name !== 'string') return '?';
      const clean = name.trim();
      if (!clean) return '?';
      return clean.split(/\s+/).slice(0, 2).map(w => w && w[0] ? w[0].toUpperCase() : '').join('');
    },
    badgeClass(status) {
      const s = (status || '').toLowerCase();
      return {
        pending: 'badge-pending', active: 'badge-active', paid: 'badge-paid',
        completed: 'badge-completed', overdue: 'badge-overdue', rejected: 'badge-overdue',
        inactive: 'badge-inactive', confirmed: 'badge-confirmed'
      }[s] || 'badge-inactive';
    }
  };

  /* ---------------------------------------------------------------------
     Sidebar / Navbar templates
  --------------------------------------------------------------------- */
  const NAV_ITEMS = [
    { href: 'dashboard.html', icon: 'bi-grid-1x2-fill', label: 'Dashboard' },
    { href: 'loan-list.html', icon: 'bi-cash-coin', label: 'Loans', match: ['loan-list.html', 'loan-details.html', 'create-loan.html'] },
    { href: 'borrowed-loans.html', icon: 'bi-bank2', label: 'Borrowed Loans', match: ['borrowed-loans.html'] },
    { href: 'borrowers.html', icon: 'bi-people-fill', label: 'Borrowers' },
    { href: 'disbursement-list.html', icon: 'bi-send-check-fill', label: 'Disbursements', match: ['disbursement-list.html', 'create-disbursement.html'] },
    { href: 'installments.html', icon: 'bi-calendar2-week-fill', label: 'Installments' },
    { href: 'invitation.html', icon: 'bi-person-plus-fill', label: 'Invitations' },
  ];
  const NAV_BOTTOM = [
    { href: 'profile.html', icon: 'bi-person-circle', label: 'Profile' },
    { href: 'settings.html', icon: 'bi-gear-fill', label: 'Settings' },
  ];

  function isActive(item) {
    const current = location.pathname.split('/').pop() || 'dashboard.html';
    return item.match ? item.match.includes(current) : item.href === current;
  }

  function renderSidebar() {
    const mount = document.getElementById('sidebar-mount');
    if (!mount) return;
    const user = Auth.getUser();
    const links = NAV_ITEMS.map(item => `
      <a href="${item.href}" class="sidebar-link ${isActive(item) ? 'active' : ''}">
        <i class="bi ${item.icon}"></i><span class="nav-label-text">${item.label}</span>
      </a>`).join('');
    const bottomLinks = NAV_BOTTOM.map(item => `
      <a href="${item.href}" class="sidebar-link ${isActive(item) ? 'active' : ''}">
        <i class="bi ${item.icon}"></i><span class="nav-label-text">${item.label}</span>
      </a>`).join('');

    mount.innerHTML = `
      <aside class="sidebar" id="lfSidebar">
        <div class="sidebar-brand">
          <div class="mark"><i class="bi bi-diagram-3-fill"></i></div>
          <span class="word">LoanFlow</span>
        </div>
        <nav class="sidebar-nav">
          <div class="nav-label">Workspace</div>
          ${links}
          <div class="nav-label">Account</div>
          ${bottomLinks}
          <a href="#" id="logoutLink" class="sidebar-link"><i class="bi bi-box-arrow-right"></i><span class="nav-label-text">Logout</span></a>
        </nav>
        <div class="sidebar-foot">
          <div class="d-flex align-items-center gap-2">
            <div class="row-avatar">${fmt.initials(user?.full_name)}</div>
            <span class="small text-truncate" style="max-width:150px;">${user?.full_name || 'Account'}</span>
          </div>
        </div>
      </aside>
      <div class="sidebar-backdrop" id="sidebarBackdrop"></div>
    `;
    document.getElementById('logoutLink').addEventListener('click', (e) => { e.preventDefault(); Auth.logout(); });
    document.getElementById('sidebarBackdrop').addEventListener('click', closeMobileSidebar);
  }

  async function loadNotifications() {
    const notifDot = document.getElementById('notifDot');
    const notifCount = document.getElementById('notifCount');
    const notifList = document.getElementById('notifList');
    if (!notifList) return;

    try {
      const res = await api('/users/notifications');
      const items = res.data || [];
      const unread = items.filter(n => !n.is_read).length;

      if (unread > 0) {
        if (notifDot) notifDot.classList.remove('d-none');
        if (notifCount) {
          notifCount.textContent = unread > 9 ? '9+' : unread;
          notifCount.classList.remove('d-none');
        }
      } else {
        if (notifDot) notifDot.classList.add('d-none');
        if (notifCount) notifCount.classList.add('d-none');
      }

      if (items.length === 0) {
        notifList.innerHTML = `<div class="p-4 text-center text-secondary small"><i class="bi bi-bell-slash fs-4 d-block mb-1"></i>No notifications yet</div>`;
        return;
      }

      const iconMap = {
        warning: 'bi-exclamation-triangle-fill text-warning',
        success: 'bi-check-circle-fill text-success',
        danger: 'bi-x-circle-fill text-danger',
        info: 'bi-info-circle-fill text-info'
      };

      notifList.innerHTML = items.map(n => `
        <div class="p-3 border-bottom notification-item ${n.is_read ? 'opacity-75' : 'bg-primary bg-opacity-10'}" data-notif-id="${n.id}" data-title="${n.title || ''}" data-message="${n.message || ''}" data-related="${n.related_id || ''}" style="cursor: pointer; transition: background 0.2s;">
          <div class="d-flex align-items-start gap-2">
            <i class="bi ${iconMap[n.type] || iconMap.info} fs-5 mt-1"></i>
            <div class="flex-grow-1">
              <div class="fw-semibold small text-white">${n.title}</div>
              <div class="small text-secondary mt-1" style="line-height:1.35;">${n.message}</div>
              <div class="text-muted mt-1" style="font-size:0.7rem;">${fmt.date(n.created_at)}</div>
            </div>
          </div>
        </div>
      `).join('');

      notifList.querySelectorAll('.notification-item').forEach(item => {
        item.addEventListener('click', async () => {
          const id = item.dataset.notifId;
          const title = (item.dataset.title || '').toLowerCase();
          const message = (item.dataset.message || '').toLowerCase();
          const relatedId = item.dataset.related;
          const user = Auth.getUser() || {};

          // Delete permanently from database
          try {
            await api(`/users/notifications/${id}`, { method: 'DELETE' });
          } catch (err) { }

          // Determine target destination page
          let targetUrl = 'dashboard.html';
          if (title.includes('disbursement') || message.includes('disbursement')) {
            if (relatedId && (title.includes('Accepted') || title.includes('Disbursement'))) {
              targetUrl = `create-disbursement.html?loanId=${relatedId}`;
            } else {
              targetUrl = 'disbursement-list.html';
            }
          } else if (title.includes('installment') || message.includes('installment') || message.includes('payment')) {
            targetUrl = 'installments.html';
          } else if (title.includes('loan') || message.includes('loan')) {
            if (relatedId) {
              targetUrl = `loan-details.html?id=${relatedId}`;
            } else if (user.role === 'borrower') {
              targetUrl = 'borrowed-loans.html';
            } else {
              targetUrl = 'all-loans.html';
            }
          }

          window.location.href = targetUrl;
        });
      });

    } catch (e) {
      if (notifList) notifList.innerHTML = `<div class="p-3 text-center text-muted small">Could not load notifications</div>`;
    }
  }

  function renderNavbar(title = 'Dashboard') {
    const mount = document.getElementById('navbar-mount');
    if (!mount) return;
    const user = Auth.getUser();
    mount.innerHTML = `
      <div class="navbar-top">
        <button class="icon-btn sidebar-toggle-mobile" id="mobileSidebarBtn" style="display:none;"><i class="bi bi-list"></i></button>
        <h5 class="mb-0 me-2 d-none d-md-block">${title}</h5>
        <div class="search-pill">
          <i class="bi bi-search"></i>
          <input type="text" placeholder="Search loans, borrowers, invoices…" id="globalSearch">
        </div>
        <div class="ms-auto d-flex align-items-center gap-2">
          
          <!-- Notifications Dropdown -->
          <div class="dropdown me-1">
            <button class="icon-btn position-relative" id="notifDropdownBtn" data-bs-toggle="dropdown" aria-expanded="false" title="Notifications">
              <i class="bi bi-bell"></i>
              <span class="dot d-none" id="notifDot"></span>
              <span class="badge bg-danger rounded-pill position-absolute top-0 start-100 translate-middle d-none" id="notifCount" style="font-size:0.6rem;"></span>
            </button>
            <div class="dropdown-menu dropdown-menu-end p-0 shadow-lg" style="width:340px; max-height:420px; background:var(--bg-card); border:1px solid var(--border-strong); z-index:1050;">
              <div class="p-3 border-bottom d-flex align-items-center justify-content-between">
                <h6 class="mb-0 fw-semibold text-white"><i class="bi bi-bell me-2"></i>Notifications</h6>
                <button class="btn btn-link btn-sm p-0 text-decoration-none text-info" id="markReadBtn" style="font-size:0.8rem;">Mark all read</button>
              </div>
              <div class="overflow-auto" id="notifList" style="max-height:320px;">
                <div class="p-3 text-center text-muted small"><i class="bi bi-hourglass-split me-1"></i>Loading notifications…</div>
              </div>
            </div>
          </div>

          <div class="dropdown">
            <button class="btn btn-outline-soft dropdown-toggle d-flex align-items-center gap-2" type="button" data-bs-toggle="dropdown">
              <div class="row-avatar" style="width:28px;height:28px;font-size:.68rem;">${fmt.initials(user?.full_name)}</div>
              <span class="d-none d-sm-inline small">${(user?.full_name || 'Account').split(' ')[0]}</span>
            </button>
            <ul class="dropdown-menu dropdown-menu-end">
              <li><a class="dropdown-item" href="profile.html"><i class="bi bi-person me-2"></i>Profile</a></li>
              <li><a class="dropdown-item" href="settings.html"><i class="bi bi-gear me-2"></i>Settings</a></li>
              <li><hr class="dropdown-divider"></li>
              <li><a class="dropdown-item text-danger" href="#" id="navLogout"><i class="bi bi-box-arrow-right me-2"></i>Logout</a></li>
            </ul>
          </div>
        </div>
      </div>`;

    document.getElementById('navLogout').addEventListener('click', (e) => { e.preventDefault(); Auth.logout(); });
    document.getElementById('mobileSidebarBtn').addEventListener('click', openMobileSidebar);

    document.getElementById('markReadBtn')?.addEventListener('click', (e) => {
      e.preventDefault();
      api('/users/notifications/read-all', { method: 'PATCH' }).then(() => {
        loadNotifications();
        Toast.show('success', 'All notifications marked as read.');
      }).catch(() => { });
    });

    loadNotifications();
  }

  function openMobileSidebar() {
    document.getElementById('lfSidebar')?.classList.add('mobile-open');
    document.getElementById('sidebarBackdrop')?.classList.add('show');
  }
  function closeMobileSidebar() {
    document.getElementById('lfSidebar')?.classList.remove('mobile-open');
    document.getElementById('sidebarBackdrop')?.classList.remove('show');
  }

  function initLayout(title) {
    renderSidebar();
    renderNavbar(title);
  }

  /* ---------------------------------------------------------------------
     Small skeleton helper for tables
  --------------------------------------------------------------------- */
  function skeletonRows(cols, rows = 5) {
    let out = '';
    for (let r = 0; r < rows; r++) {
      out += '<tr>' + Array.from({ length: cols }).map(() => `<td><div class="skeleton" style="height:14px;width:${60 + Math.random() * 30 | 0}%;"></div></td>`).join('') + '</tr>';
    }
    return out;
  }

  return { API_BASE, Auth, api, requireAuth, redirectIfLoggedIn, Toast, fmt, initLayout, skeletonRows, openMobileSidebar, closeMobileSidebar };
})();
