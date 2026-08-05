import { api } from './api.js';
import { loader } from './loader.js';
import { toast } from './toast.js';

let requestsList = [];

export async function loadStudentRequests() {
  const tbody = document.getElementById('student-requests-body');
  if (!tbody) return;

  try {
    loader.show('Loading pending student requests...');
    const res = await api.getStudentRequests();
    loader.hide();

    if (res.success && res.data) {
      requestsList = res.data;
      renderRequests(requestsList);
    }
  } catch (error) {
    loader.hide();
    toast.error('Failed to load student requests.');
    tbody.innerHTML = `<tr><td colspan="9" class="text-center text-danger">Error: ${error.message}</td></tr>`;
  }
}

function renderRequests(list) {
  const tbody = document.getElementById('student-requests-body');
  if (!tbody) return;

  if (list.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" class="text-center py-5 text-muted">
          <i class="bi bi-mortarboard fs-1 text-slate-300 d-block mb-2"></i>
          No Pending Student Requests
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = list.map(req => {
    const formattedDate = new Date(req.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    return `
      <tr id="request-row-${req.id}">
        <td class="fw-semibold">${req.name}</td>
        <td>${req.email || '-'}</td>
        <td>${req.mobile}</td>
        <td>${req.student_id || '-'}</td>
        <td>${req.stream_name || '-'}</td>
        <td><span class="badge bg-light text-primary border rounded-pill px-3 py-1">${req.batch_end_year || '-'}</span></td>
        <td>${formattedDate}</td>
        <td>
          <span class="badge bg-warning text-dark rounded-pill px-3 py-1 text-uppercase" id="badge-${req.id}" style="font-size: 0.75rem;">
            Pending
          </span>
        </td>
        <td>
          <div class="action-btn-group" id="actions-${req.id}">
            <button class="btn btn-sm btn-success rounded-pill px-3 approve-btn" data-id="${req.id}" data-name="${req.name}">
              <i class="bi bi-check-circle me-1"></i>Approve
            </button>
            <button class="btn btn-sm btn-danger rounded-pill px-3 reject-btn" data-id="${req.id}" data-name="${req.name}">
              <i class="bi bi-x-circle me-1"></i>Reject
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Bind actions
  tbody.querySelectorAll('.approve-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const name = e.currentTarget.getAttribute('data-name');
      processStatusChange(id, name, 'approved');
    });
  });

  tbody.querySelectorAll('.reject-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const name = e.currentTarget.getAttribute('data-name');
      processStatusChange(id, name, 'declined');
    });
  });
}

async function processStatusChange(id, name, status) {
  const badge = document.getElementById(`badge-${id}`);
  const actions = document.getElementById(`actions-${id}`);

  const statusLabel = status === 'approved' ? 'Approving' : 'Declining';

  try {
    loader.show(`${statusLabel} student request...`);
    const res = await api.updateStudentStatus(id, status);
    loader.hide();

    if (res.success) {
      toast.success(res.message || `Request ${status} successfully.`);

      // Update UI state
      if (status === 'approved') {
        badge.className = 'badge bg-success rounded-pill px-3 py-1 text-uppercase';
        badge.textContent = 'Approved';
      } else {
        badge.className = 'badge bg-danger rounded-pill px-3 py-1 text-uppercase';
        badge.textContent = 'Declined';
      }

      // Hide buttons
      if (actions) {
        actions.innerHTML = `<span class="text-muted small"><i class="bi bi-info-circle me-1"></i>Processed</span>`;
      }
    }
  } catch (error) {
    loader.hide();
    toast.error(error.message || 'Failed to update student status.');
  }
}

// Setup local filter search
export function setupRequestsSearch() {
  const searchInput = document.getElementById('student-requests-search-input') || document.getElementById('requests-search-input');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase().trim();
    if (!term) {
      renderRequests(requestsList);
      return;
    }

    const filtered = requestsList.filter(req =>
      req.name.toLowerCase().includes(term) ||
      (req.email || '').toLowerCase().includes(term) ||
      (req.mobile || '').includes(term) ||
      String(req.student_id || '').includes(term)
    );
    renderRequests(filtered);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('student-requests-body')) {
    loadStudentRequests();
    setupRequestsSearch();
  }
});
