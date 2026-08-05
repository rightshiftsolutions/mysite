import { api } from './api.js';
import { loader } from './loader.js';
import { toast } from './toast.js';

let assignmentsList = [];

// ==========================================
// List and Search Assignments
// ==========================================
export async function loadTeacherAssignmentsTable() {
  const tbody = document.getElementById('teacher-streams-body');
  if (!tbody) return;

  try {
    loader.show('Loading stream assignments...');
    const res = await api.getTeacherStreams();
    loader.hide();

    if (res.success && res.data) {
      assignmentsList = res.data;
      renderAssignments(assignmentsList);
    }
  } catch (error) {
    loader.hide();
    toast.error('Failed to load teacher stream assignments.');
    tbody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Error: ${error.message}</td></tr>`;
  }
}

function renderAssignments(list) {
  const tbody = document.getElementById('teacher-streams-body');
  if (!tbody) return;

  if (list.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center py-5 text-muted">
          <i class="bi bi-person-video3 fs-1 text-slate-300 d-block mb-2"></i>
          No Stream Assignments Found
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = list.map(item => {
    const statusBadge = item.status === 'approved' 
      ? `<span class="badge bg-success-subtle text-success border rounded-pill px-2.5 py-1 text-uppercase" style="font-size: 0.7rem;">Approved</span>`
      : `<span class="badge bg-warning-subtle text-warning border rounded-pill px-2.5 py-1 text-uppercase" style="font-size: 0.7rem;">Pending</span>`;

    const actionButtons = item.status === 'approved'
      ? `<a href="teacher-stream-details.html?id=${item.teacher_id}&name=${encodeURIComponent(item.teacher_name)}" class="btn btn-sm btn-outline-secondary rounded-pill px-3">
           <i class="bi bi-eye me-1"></i>Details
         </a>
         <button class="btn btn-sm btn-outline-danger rounded-pill px-3 delete-assignment-btn" data-id="${item.id}" data-name="${item.stream_name}">
           <i class="bi bi-trash me-1"></i>Delete
         </button>`
      : `<button class="btn btn-sm btn-success rounded-pill px-3 approve-request-btn" data-id="${item.id}">
           <i class="bi bi-check-circle me-1"></i>Approve
         </button>
         <button class="btn btn-sm btn-danger rounded-pill px-3 reject-request-btn" data-id="${item.id}">
           <i class="bi bi-x-circle me-1"></i>Reject
         </button>`;

    return `
      <tr>
        <td class="fw-semibold">${item.teacher_name}</td>
        <td>${item.teacher_id}</td>
        <td><span class="badge bg-primary rounded-pill px-2.5 py-1" style="font-size: 0.75rem;">${item.stream_name}</span></td>
        <td>${statusBadge}</td>
        <td>
          <div class="d-flex gap-1">
            ${actionButtons}
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Bind actions
  tbody.querySelectorAll('.approve-request-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      try {
        loader.show('Approving stream request...');
        const res = await api.updateTeacherStreamStatus(id, 'approved');
        loader.hide();
        if (res.success) {
          toast.success(res.message || 'Stream assignment approved.');
          loadTeacherAssignmentsTable();
        }
      } catch (error) {
        loader.hide();
        toast.error(error.message);
      }
    });
  });

  tbody.querySelectorAll('.reject-request-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      try {
        loader.show('Rejecting stream request...');
        const res = await api.updateTeacherStreamStatus(id, 'rejected');
        loader.hide();
        if (res.success) {
          toast.success(res.message || 'Stream assignment request rejected.');
          loadTeacherAssignmentsTable();
        }
      } catch (error) {
        loader.hide();
        toast.error(error.message);
      }
    });
  });

  tbody.querySelectorAll('.delete-assignment-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const name = e.currentTarget.getAttribute('data-name');
      confirmRemoveStream(id, name);
    });
  });
}

function confirmRemoveStream(id, name) {
  import('../components/modal.js').then(({ modal }) => {
    modal.show({
      title: 'Confirm Remove',
      body: `Are you sure you want to remove assignment for stream <strong>${name}</strong>? All associated courses and student enrollments will also be deleted.`,
      confirmText: 'Remove Stream',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          loader.show('Removing assignment...');
          const res = await api.deleteTeacherStream(id);
          loader.hide();

          if (res.success) {
            toast.success(res.message || 'Assignment removed successfully.');
            loadTeacherAssignmentsTable();
          }
        } catch (error) {
          loader.hide();
          toast.error(error.message || 'Failed to remove assignment.');
        }
      }
    });
  });
}

export function setupAssignmentsSearch() {
  const searchInput = document.getElementById('assignments-search-input');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase().trim();
    if (!term) {
      renderAssignments(assignmentsList);
      return;
    }

    const filtered = assignmentsList.filter(item => 
      String(item.teacher_id).includes(term) ||
      item.teacher_name.toLowerCase().includes(term) ||
      item.stream_name.toLowerCase().includes(term)
    );
    renderAssignments(filtered);
  });
}

// ==========================================
// View Detailed Teacher Streams
// ==========================================
export async function loadTeacherStreamDetailsPage() {
  const container = document.getElementById('teacher-details-streams-container');
  if (!container) return;

  const urlParams = new URLSearchParams(window.location.search);
  const teacherId = urlParams.get('id');
  const teacherName = urlParams.get('name') || 'Teacher';

  if (!teacherId) {
    toast.error('No Teacher ID specified.');
    window.location.href = './teacher-streams.html';
    return;
  }

  // Set header details
  const nameHeader = document.getElementById('teacher-detail-name');
  const idHeader = document.getElementById('teacher-detail-id');
  
  if (nameHeader) nameHeader.textContent = teacherName;
  if (idHeader) idHeader.textContent = `Teacher ID: ${teacherId}`;

  try {
    loader.show('Loading assigned streams...');
    const res = await api.getTeacherStreamDetails(teacherId);
    loader.hide();

    if (res.success && res.data) {
      renderTeacherStreamsCards(res.data);
    }
  } catch (error) {
    loader.hide();
    toast.error('Failed to load stream details for teacher.');
    container.innerHTML = `
      <div class="alert alert-danger border-0 shadow-sm" role="alert">
        <i class="bi bi-exclamation-triangle-fill me-2"></i> ${error.message}
      </div>
    `;
  }
}

function renderTeacherStreamsCards(streams) {
  const container = document.getElementById('teacher-details-streams-container');
  if (!container) return;

  if (streams.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center py-5 text-muted">
        <i class="bi bi-bookmark-dash fs-1 text-slate-300 d-block mb-2"></i>
        This teacher has not self-assigned any academic streams yet.
      </div>
    `;
    return;
  }

  container.innerHTML = streams.map(stream => {
    return `
      <div class="col-md-4">
        <div class="card shadow-sm border-0 rounded-4 bg-white h-100 p-4 text-center">
          <div class="rounded-circle bg-primary-subtle d-inline-flex align-items-center justify-content-center mx-auto mb-3" style="width: 54px; height: 54px; background-color: rgba(13, 110, 253, 0.1);">
            <i class="bi bi-collection text-primary fs-3"></i>
          </div>
          <h4 class="fw-bold mb-2 h5">${stream.stream_name}</h4>
          <span class="text-muted small">Stream ID: ${stream.stream_id}</span>
        </div>
      </div>
    `;
  }).join('');
}

// ==========================================
// Admin Assign Stream Modal Handler
// ==========================================
let assignModal = null;

export async function setupAssignStreamModal() {
  const assignBtn = document.getElementById('admin-assign-btn');
  const form = document.getElementById('admin-assign-form');
  const teacherSelect = document.getElementById('modal-teacher-select');
  const streamSelect = document.getElementById('modal-stream-select');

  if (!assignBtn || !form || !teacherSelect || !streamSelect) return;

  // Initialize Bootstrap Modal
  const modalEl = document.getElementById('assignStreamModal');
  if (modalEl && typeof bootstrap !== 'undefined') {
    assignModal = new bootstrap.Modal(modalEl);
  }

  // Open modal handler
  assignBtn.addEventListener('click', async () => {
    if (assignModal) assignModal.show();
    
    // Load options
    try {
      teacherSelect.innerHTML = '<option value="" disabled selected>Loading teachers...</option>';
      streamSelect.innerHTML = '<option value="" disabled selected>Loading streams...</option>';

      // Fetch approved teachers
      const teachersRes = await api.getApprovedTeachers();
      if (teachersRes.success && teachersRes.data) {
        teacherSelect.innerHTML = '<option value="" disabled selected>Select a Teacher</option>' +
          teachersRes.data.map(t => `<option value="${t.id}">${t.name} (${t.email})</option>`).join('');
      } else {
        teacherSelect.innerHTML = '<option value="" disabled selected>No approved teachers found</option>';
      }

      // Fetch all academic streams
      const streamsRes = await api.getStreams();
      if (streamsRes.success && streamsRes.data) {
        streamSelect.innerHTML = '<option value="" disabled selected>Select a Stream</option>' +
          streamsRes.data.map(s => `<option value="${s.stream_id}">${s.stream_name}</option>`).join('');
      } else {
        streamSelect.innerHTML = '<option value="" disabled selected>No streams found</option>';
      }

    } catch (error) {
      toast.error('Failed to populate assignment options.');
    }
  });

  // Submit assignment handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const teacherId = teacherSelect.value;
    const streamId = streamSelect.value;
    const submitBtn = document.getElementById('modal-submit-btn');

    let isValid = true;
    if (!teacherId) {
      teacherSelect.classList.add('is-invalid');
      isValid = false;
    } else {
      teacherSelect.classList.remove('is-invalid');
    }

    if (!streamId) {
      streamSelect.classList.add('is-invalid');
      isValid = false;
    } else {
      streamSelect.classList.remove('is-invalid');
    }

    if (!isValid) return;

    try {
      loader.show('Assigning academic stream...');
      if (submitBtn) submitBtn.disabled = true;

      const res = await api.adminAssignStream({
        teacher_id: Number(teacherId),
        stream_id: Number(streamId)
      });

      loader.hide();
      if (submitBtn) submitBtn.disabled = false;

      if (res.success) {
        toast.success(res.message || 'Stream assigned successfully.');
        if (assignModal) assignModal.hide();
        form.reset();
        // Refresh assignments table
        loadTeacherAssignmentsTable();
      }
    } catch (error) {
      loader.hide();
      if (submitBtn) submitBtn.disabled = false;
      toast.error(error.message || 'Failed to assign stream.');
    }
  });
}

function init() {
  if (document.getElementById('teacher-streams-body')) {
    loadTeacherAssignmentsTable();
    setupAssignmentsSearch();
    setupAssignStreamModal();
  }
  if (document.getElementById('teacher-details-streams-container')) {
    loadTeacherStreamDetailsPage();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
