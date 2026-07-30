import { api } from './api.js';
import { loader } from './loader.js';
import { toast } from './toast.js';
import { storage } from './storage.js';
import { validation } from './validation.js';

let teacherStreams = [];

// ==========================================
// List and Delete Teacher Streams
// ==========================================
export async function loadTeacherStreamsList() {
  const container = document.getElementById('teacher-streams-container');
  if (!container) return;

  try {
    loader.show('Loading your assigned streams...');
    const res = await api.getMyStreams();
    loader.hide();

    if (res.success && res.data) {
      teacherStreams = res.data;
      renderTeacherStreams(teacherStreams);
    }
  } catch (error) {
    loader.hide();
    toast.error('Failed to load assigned streams.');
    container.innerHTML = `<div class="col-12 text-center text-danger py-4">Error: ${error.message}</div>`;
  }
}

function renderTeacherStreams(streams) {
  const container = document.getElementById('teacher-streams-container');
  if (!container) return;

  if (streams.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center py-5 text-muted">
        <i class="bi bi-bookmark-dash fs-1 text-slate-300 d-block mb-2"></i>
        You have no assigned academic streams yet.
      </div>
    `;
    return;
  }

  container.innerHTML = streams.map(stream => {
    // Note: res returns ts.id as id from our backend fix
    const statusBadge = stream.status === 'approved' 
      ? `<span class="badge bg-success-subtle text-success border rounded-pill px-3 py-1 text-uppercase" style="font-size: 0.75rem;">Approved</span>`
      : `<span class="badge bg-warning-subtle text-warning border rounded-pill px-3 py-1 text-uppercase" style="font-size: 0.75rem;">Pending Approval</span>`;

    return `
      <div class="col-md-4 col-sm-6" id="teacher-stream-card-${stream.id}">
        <div class="stream-card-custom shadow-premium">
          <div class="stream-card-header">
            <div class="stream-card-icon">
              <i class="bi bi-collection"></i>
            </div>
            <h4 class="stream-card-title">${stream.stream_name}</h4>
          </div>
          <div class="stream-card-actions">
            ${statusBadge}
            <button class="btn btn-sm btn-outline-danger rounded-pill px-3 remove-assignment-btn" data-id="${stream.id}" data-name="${stream.stream_name}">
              <i class="bi bi-trash me-1"></i>Remove
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Bind remove buttons
  container.querySelectorAll('.remove-assignment-btn').forEach(btn => {
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
      body: `Are you sure you want to remove assignment for stream <strong>${name}</strong>? You will no longer manage courses mapped to this stream.`,
      confirmText: 'Remove Stream',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          loader.show('Removing assignment...');
          const res = await api.deleteTeacherStream(id);
          loader.hide();

          if (res.success) {
            toast.success(res.message || 'Assignment removed successfully.');
            // Refresh
            loadTeacherStreamsList();
          }
        } catch (error) {
          loader.hide();
          toast.error(error.message || 'Failed to remove assignment.');
        }
      }
    });
  });
}

// ==========================================
// Assign Stream Flow
// ==========================================
export async function setupAssignStreamForm() {
  const teacherSelect = document.getElementById('teacher-id');
  const streamSelect = document.getElementById('stream-id');
  if (!teacherSelect) return;

  const current = storage.getUser();
  if (current) {
    teacherSelect.innerHTML = `<option value="${current.id}" selected>${current.name} (You)</option>`;
  }

  if (streamSelect) {
    try {
      const res = await api.getPublicStreams();
      if (res.success && res.data && res.data.length > 0) {
        streamSelect.innerHTML = '<option value="" disabled selected>Select stream to assign</option>' +
          res.data.map(s => `<option value="${s.stream_id}">${s.stream_name}</option>`).join('');
      }
    } catch (error) {
      console.error("Failed to load streams dynamically in assign form:", error);
    }
  }
}

export async function handleStreamAssign(event) {
  event.preventDefault();

  const teacherSelect = document.getElementById('teacher-id');
  const streamSelect = document.getElementById('stream-id');
  const submitBtn = document.getElementById('submit-btn');

  const teacherId = teacherSelect.value;
  const streamId = streamSelect.value;

  let isValid = true;

  if (!teacherId) {
    validation.setInputValidity(teacherSelect, false, 'Teacher selection is required.');
    isValid = false;
  } else {
    validation.setInputValidity(teacherSelect, true);
  }

  if (!streamId) {
    validation.setInputValidity(streamSelect, false, 'Stream selection is required.');
    isValid = false;
  } else {
    validation.setInputValidity(streamSelect, true);
  }

  if (!isValid) return;

  try {
    loader.show('Assigning academic stream...');
    submitBtn.disabled = true;

    const res = await api.assignTeacherStream({
      teacher_id: Number(teacherId),
      stream_id: Number(streamId)
    });

    loader.hide();

    if (res.success) {
      toast.success(res.message || 'Stream assigned successfully.');
      setTimeout(() => {
        window.location.href = './teacher-dashboard.html';
      }, 1000);
    }
  } catch (error) {
    loader.hide();
    submitBtn.disabled = false;
    toast.error(error.message);
  }
}

// ==========================================
// Admin List and Delete Streams
// ==========================================
let allStreamsList = [];

export async function loadStreamsTable() {
  const tbody = document.getElementById('streams-table-body');
  if (!tbody) return;

  try {
    loader.show('Loading academic streams...');
    const res = await api.getStreams();
    loader.hide();

    if (res.success && res.data) {
      allStreamsList = res.data;
      renderStreams(allStreamsList);
    }
  } catch (error) {
    loader.hide();
    toast.error('Failed to load academic streams.');
    tbody.innerHTML = `<tr><td colspan="3" class="text-center text-danger py-4">Error: ${error.message}</td></tr>`;
  }
}

function renderStreams(list) {
  const tbody = document.getElementById('streams-table-body');
  if (!tbody) return;

  if (list.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="3" class="text-center py-5 text-muted">
          <i class="bi bi-folder-x fs-1 text-slate-300 d-block mb-2"></i>
          No Academic Streams Found
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = list.map(stream => {
    return `
      <tr id="stream-row-${stream.stream_id}">
        <td>${stream.stream_id}</td>
        <td class="fw-semibold">${stream.stream_name}</td>
        <td>
          <div class="action-btn-group">
            <a href="stream-edit.html?id=${stream.stream_id}" class="btn btn-action btn-outline-primary" title="Edit Stream">
              <i class="bi bi-pencil"></i>
            </a>
            <button class="btn btn-action btn-outline-danger delete-stream-btn" data-id="${stream.stream_id}" data-name="${stream.stream_name}" title="Delete Stream">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Bind Delete buttons
  tbody.querySelectorAll('.delete-stream-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const btnEl = e.currentTarget;
      const id = btnEl.getAttribute('data-id');
      const name = btnEl.getAttribute('data-name');
      confirmDeleteStream(id, name);
    });
  });
}

function confirmDeleteStream(id, name) {
  import('../components/modal.js').then(({ modal }) => {
    modal.show({
      title: 'Confirm Delete',
      body: `Are you sure you want to delete the stream <strong>${name}</strong>? This action cannot be undone and may affect associated courses and students.`,
      confirmText: 'Delete Stream',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          loader.show('Deleting stream...');
          const res = await api.deleteStream(id);
          loader.hide();

          if (res.success) {
            toast.success(res.message || 'Stream deleted successfully.');
            loadStreamsTable();
          }
        } catch (error) {
          loader.hide();
          toast.error(error.message || 'Failed to delete stream.');
        }
      }
    });
  });
}

export function setupAdminStreamsSearch() {
  const searchInput = document.getElementById('streams-search-input');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase().trim();
    if (!term) {
      renderStreams(allStreamsList);
      return;
    }

    const filtered = allStreamsList.filter(stream => 
      String(stream.stream_id).includes(term) ||
      stream.stream_name.toLowerCase().includes(term)
    );
    renderStreams(filtered);
  });
}

// ==========================================
// Admin Create Stream
// ==========================================
export async function handleStreamCreate(event) {
  event.preventDefault();

  const nameInput = document.getElementById('stream-name');
  const submitBtn = document.getElementById('submit-btn');
  const streamName = nameInput.value.trim();

  const feedback = nameInput.parentNode.querySelector('.invalid-feedback-custom') || nameInput.parentNode.querySelector('.invalid-feedback');

  if (!streamName) {
    validation.setInputValidity(nameInput, false, 'Stream name is required.');
    if (feedback) {
      feedback.textContent = 'Stream name is required.';
      feedback.style.display = 'block';
    }
    return;
  }
  validation.setInputValidity(nameInput, true);
  if (feedback) {
    feedback.textContent = '';
    feedback.style.display = 'none';
  }

  try {
    loader.show('Creating stream...');
    submitBtn.disabled = true;

    const res = await api.createStream({ stream_name: streamName });
    loader.hide();

    if (res.success) {
      toast.success(res.message || 'Stream created successfully.');
      setTimeout(() => {
        window.location.href = './admin-dashboard.html';
      }, 1000);
    }
  } catch (error) {
    loader.hide();
    submitBtn.disabled = false;
    toast.error(error.message || 'Failed to create stream.');
  }
}

// ==========================================
// Admin Edit Stream
// ==========================================
let currentEditStreamId = null;

export async function setupStreamEditForm() {
  const nameInput = document.getElementById('stream-name');
  if (!nameInput) return;

  const urlParams = new URLSearchParams(window.location.search);
  currentEditStreamId = urlParams.get('id');

  if (!currentEditStreamId) {
    toast.error('No stream ID specified.');
    setTimeout(() => {
      window.location.href = './streams.html';
    }, 1500);
    return;
  }

  try {
    loader.show('Loading stream details...');
    // Workaround since GET /api/stream/:id doesn't exist
    const res = await api.getStreams();
    loader.hide();

    if (res.success && res.data) {
      const stream = res.data.find(s => String(s.stream_id) === String(currentEditStreamId));
      if (stream) {
        nameInput.value = stream.stream_name;
      } else {
        throw new Error('Stream not found.');
      }
    }
  } catch (error) {
    loader.hide();
    toast.error(error.message || 'Failed to load stream details.');
    setTimeout(() => {
      window.location.href = './streams.html';
    }, 1500);
  }
}

export async function handleStreamEdit(event) {
  event.preventDefault();

  const nameInput = document.getElementById('stream-name');
  const submitBtn = document.getElementById('submit-btn');
  const streamName = nameInput.value.trim();

  const feedback = nameInput.parentNode.querySelector('.invalid-feedback-custom') || nameInput.parentNode.querySelector('.invalid-feedback');

  if (!streamName) {
    validation.setInputValidity(nameInput, false, 'Stream name is required.');
    if (feedback) {
      feedback.textContent = 'Stream name is required.';
      feedback.style.display = 'block';
    }
    return;
  }
  validation.setInputValidity(nameInput, true);
  if (feedback) {
    feedback.textContent = '';
    feedback.style.display = 'none';
  }

  if (!currentEditStreamId) return;

  try {
    loader.show('Updating stream...');
    submitBtn.disabled = true;

    const res = await api.updateStream(currentEditStreamId, { stream_name: streamName });
    loader.hide();

    if (res.success) {
      toast.success(res.message || 'Stream updated successfully.');
      setTimeout(() => {
        window.location.href = './admin-dashboard.html';
      }, 1000);
    }
  } catch (error) {
    loader.hide();
    submitBtn.disabled = false;
    toast.error(error.message || 'Failed to update stream.');
  }
}

function init() {
  // Teacher Pages
  if (document.getElementById('teacher-streams-container')) {
    loadTeacherStreamsList();
  }
  if (document.getElementById('assign-stream-form')) {
    setupAssignStreamForm();
    document.getElementById('assign-stream-form').addEventListener('submit', handleStreamAssign);
  }

  // Admin Pages
  if (document.getElementById('streams-table-body')) {
    loadStreamsTable();
    setupAdminStreamsSearch();
  }
  if (document.getElementById('stream-create-form')) {
    document.getElementById('stream-create-form').addEventListener('submit', handleStreamCreate);
  }
  if (document.getElementById('stream-edit-form')) {
    setupStreamEditForm();
    document.getElementById('stream-edit-form').addEventListener('submit', handleStreamEdit);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
