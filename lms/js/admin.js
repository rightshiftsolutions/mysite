import { api } from './api.js';
import { loader } from './loader.js';
import { toast } from './toast.js';
import { validation } from './validation.js';

let adminsList = [];

// ==========================================
// List and Search Admins
// ==========================================
export async function loadAdminsTable() {
  const tbody = document.getElementById('admins-table-body');
  if (!tbody) return;

  try {
    loader.show('Loading administrators...');
    const res = await api.getAdmins();
    loader.hide();

    if (res.success && res.data) {
      adminsList = res.data;
      renderAdmins(adminsList);
    }
  } catch (error) {
    loader.hide();
    toast.error('Failed to retrieve admins list.');
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Error loading administrators: ${error.message}</td></tr>`;
  }
}

function renderAdmins(list) {
  const tbody = document.getElementById('admins-table-body');
  if (!tbody) return;

  if (list.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center py-5 text-muted">
          <i class="bi bi-shield-slash fs-1 text-slate-300 d-block mb-2"></i>
          No Administrators Found
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = list.map(admin => {
    const badgeColor = admin.status === 'active' ? 'success' : 'danger';
    return `
      <tr id="admin-row-${admin.admin_id}">
        <td>${admin.admin_id}</td>
        <td class="fw-semibold">${admin.name}</td>
        <td>${admin.email}</td>
        <td><span class="badge bg-secondary rounded-pill px-2.5 py-1 text-uppercase" style="font-size: 0.7rem;">${admin.role}</span></td>
        <td><span class="badge bg-${badgeColor} rounded-pill px-2.5 py-1 text-uppercase" style="font-size: 0.7rem;">${admin.status}</span></td>
        <td>
          <div class="action-btn-group">
            <a href="admin-edit.html?id=${admin.admin_id}" class="btn btn-action btn-outline-primary" title="Edit Admin">
              <i class="bi bi-pencil"></i>
            </a>
            <button class="btn btn-action btn-outline-danger delete-admin-btn" data-id="${admin.admin_id}" data-name="${admin.name}" title="Delete Admin">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Bind Delete buttons
  tbody.querySelectorAll('.delete-admin-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const btnEl = e.currentTarget;
      const id = btnEl.getAttribute('data-id');
      const name = btnEl.getAttribute('data-name');
      confirmDeleteAdmin(id, name);
    });
  });
}

// Local client-side search filtering
export function setupAdminSearch() {
  const searchInput = document.getElementById('admin-search-input');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase().trim();
    if (!term) {
      renderAdmins(adminsList);
      return;
    }

    const filtered = adminsList.filter(admin => 
      String(admin.admin_id).includes(term) ||
      admin.name.toLowerCase().includes(term) ||
      admin.email.toLowerCase().includes(term) ||
      admin.role.toLowerCase().includes(term)
    );
    renderAdmins(filtered);
  });
}

// ==========================================
// Delete Admin Flow
// ==========================================
function confirmDeleteAdmin(id, name) {
  // Rely on modal helper from modal.js
  import('../components/modal.js').then(({ modal }) => {
    modal.show({
      title: 'Confirm Delete',
      body: `Are you sure you want to delete Admin <strong>${name}</strong> (ID: ${id})? This action cannot be undone.`,
      confirmText: 'Delete Admin',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          loader.show('Deleting admin account...');
          const res = await api.deleteAdmin(id);
          loader.hide();

          if (res.success) {
            toast.success(res.message || 'Admin deleted successfully.');
            // Remove row from UI
            const row = document.getElementById(`admin-row-${id}`);
            if (row) row.remove();
            
            // Update cache list
            adminsList = adminsList.filter(a => String(a.admin_id) !== String(id));
            if (adminsList.length === 0) {
              renderAdmins(adminsList);
            }
          }
        } catch (error) {
          loader.hide();
          toast.error(error.message || 'Failed to delete administrator.');
        }
      }
    });
  });
}

// ==========================================
// Create Admin Flow
// ==========================================
export async function handleAdminCreate(event) {
  event.preventDefault();
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const roleSelect = document.getElementById('role');
  const submitBtn = document.getElementById('submit-btn');

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const role = roleSelect.value;

  let isValid = true;

  if (!name) {
    validation.setInputValidity(nameInput, false, 'Name is required.');
    isValid = false;
  } else {
    validation.setInputValidity(nameInput, true);
  }

  if (!email || !validation.isValidEmail(email)) {
    validation.setInputValidity(emailInput, false, 'Enter a valid email address.');
    isValid = false;
  } else {
    validation.setInputValidity(emailInput, true);
  }

  if (!password || !validation.isValidPassword(password)) {
    validation.setInputValidity(passwordInput, false, 'Password must be at least 8 characters.');
    isValid = false;
  } else {
    validation.setInputValidity(passwordInput, true);
  }

  if (!role) {
    validation.setInputValidity(roleSelect, false, 'Role selection is required.');
    isValid = false;
  } else {
    validation.setInputValidity(roleSelect, true);
  }

  if (!isValid) {
    toast.error('Validation failed.');
    return;
  }

  try {
    loader.show('Creating admin account...');
    submitBtn.disabled = true;

    const res = await api.createAdmin({ name, email, password, role });
    loader.hide();

    if (res.success) {
      toast.success('Admin created successfully.');
      setTimeout(() => {
        window.location.href = './admin-list.html';
      }, 1000);
    }
  } catch (error) {
    loader.hide();
    submitBtn.disabled = false;
    toast.error(error.message);
  }
}

// ==========================================
// Edit Admin Flow
// ==========================================
let currentEditId = null;

export async function loadEditAdminPage() {
  const form = document.getElementById('admin-edit-form');
  if (!form) return;

  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  if (!id) {
    toast.error('No admin ID supplied for editing.');
    window.location.href = './admin-list.html';
    return;
  }
  currentEditId = id;

  try {
    loader.show('Loading admin detail...');
    const res = await api.getAdmins();
    loader.hide();

    if (res.success && res.data) {
      const admin = res.data.find(a => String(a.admin_id) === String(id));
      if (!admin) {
        toast.error('Admin details not found.');
        window.location.href = './admin-list.html';
        return;
      }

      document.getElementById('name').value = admin.name;
      document.getElementById('email').value = admin.email;
      document.getElementById('role').value = admin.role;
      document.getElementById('status').value = admin.status;
    }
  } catch (error) {
    loader.hide();
    toast.error('Failed to retrieve admin details.');
    window.location.href = './admin-list.html';
  }
}

export async function handleAdminUpdate(event) {
  event.preventDefault();
  if (!currentEditId) return;

  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const roleSelect = document.getElementById('role');
  const statusSelect = document.getElementById('status');
  const submitBtn = document.getElementById('submit-btn');

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const role = roleSelect.value;
  const status = statusSelect.value;

  let isValid = true;

  if (!name) {
    validation.setInputValidity(nameInput, false, 'Name is required.');
    isValid = false;
  } else {
    validation.setInputValidity(nameInput, true);
  }

  if (!email || !validation.isValidEmail(email)) {
    validation.setInputValidity(emailInput, false, 'Enter a valid email.');
    isValid = false;
  } else {
    validation.setInputValidity(emailInput, true);
  }

  if (!role) {
    validation.setInputValidity(roleSelect, false, 'Role is required.');
    isValid = false;
  } else {
    validation.setInputValidity(roleSelect, true);
  }

  if (!status) {
    validation.setInputValidity(statusSelect, false, 'Status is required.');
    isValid = false;
  } else {
    validation.setInputValidity(statusSelect, true);
  }

  if (!isValid) return;

  try {
    loader.show('Updating admin profile...');
    submitBtn.disabled = true;

    const res = await api.updateAdmin(currentEditId, { name, email, role, status });
    loader.hide();

    if (res.success) {
      toast.success(res.message || 'Admin profile updated.');
      setTimeout(() => {
        window.location.href = './admin-list.html';
      }, 1000);
    }
  } catch (error) {
    loader.hide();
    submitBtn.disabled = false;
    toast.error(error.message);
  }
}

// Auto binder
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('admins-table-body')) {
    loadAdminsTable();
    setupAdminSearch();
  }
  if (document.getElementById('admin-edit-form')) {
    loadEditAdminPage();
    document.getElementById('admin-edit-form').addEventListener('submit', handleAdminUpdate);
  }
  if (document.getElementById('admin-create-form')) {
    document.getElementById('admin-create-form').addEventListener('submit', handleAdminCreate);
  }
});
