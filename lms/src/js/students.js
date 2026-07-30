import { api } from './api.js';
import { loader } from './loader.js';
import { toast } from './toast.js';

let studentsList = [];

// ==========================================
// Load List with Filter parameters
// ==========================================
export async function loadStudentsTable(filters = {}) {
  const tbody = document.getElementById('students-table-body');
  if (!tbody) return;

  try {
    loader.show('Retrieving student registry...');
    const res = await api.getStudents(filters);
    loader.hide();

    if (res.success && res.data) {
      studentsList = res.data;
      renderStudents(studentsList);
    }
  } catch (error) {
    loader.hide();
    
    // Map response error codes to UI alerts
    if (error.message.includes('Resource Not Found') || error.message.includes('No Students Found')) {
      renderStudents([]);
    } else {
      toast.error('Failed to retrieve student registry.');
      tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Error loading students: ${error.message}</td></tr>`;
    }
  }
}

function renderStudents(list) {
  const tbody = document.getElementById('students-table-body');
  const emptyState = document.getElementById('empty-state-container');
  const tableWrapper = document.getElementById('table-wrapper-container');

  if (!tbody) return;

  if (list.length === 0) {
    if (tableWrapper) tableWrapper.style.display = 'none';
    if (emptyState) {
      emptyState.style.display = 'block';
      emptyState.innerHTML = `
        <div class="empty-state-box card border-0 shadow-sm rounded-4 p-5">
          <div class="empty-state-icon"><i class="bi bi-people"></i></div>
          <h4 class="fw-bold mb-2">No Students Found</h4>
          <p class="text-secondary small mb-0">No student records match the active search or filter configuration.</p>
        </div>
      `;
    } else {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No students found.</td></tr>`;
    }
    return;
  }

  if (tableWrapper) tableWrapper.style.display = 'block';
  if (emptyState) emptyState.style.display = 'none';

  tbody.innerHTML = list.map(student => {
    // Generate simple ID if not present
    const studentCode = student.student_id || `STU-${student.id}`;
    return `
      <tr>
        <td><strong>${studentCode}</strong></td>
        <td class="fw-semibold text-slate-800">${student.name}</td>
        <td>${student.email}</td>
        <td>${student.mobile}</td>
        <td><span class="badge bg-light text-secondary border rounded-pill px-2.5 py-1">${student.stream_name || 'N/A'}</span></td>
        <td>
          <button class="btn btn-sm btn-outline-primary rounded-pill px-3 view-student-details-btn" data-id="${student.id}" title="View Profile">
            <i class="bi bi-eye me-1"></i>View
          </button>
        </td>
      </tr>
    `;
  }).join('');

  // Bind Details button click
  tbody.querySelectorAll('.view-student-details-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      showStudentDetailsModal(id);
    });
  });
}

// ==========================================
// View Details Modal
// ==========================================
function showStudentDetailsModal(id) {
  const student = studentsList.find(s => String(s.id) === String(id));
  if (!student) {
    toast.error('Student details not found.');
    return;
  }

  // Populate modal container
  const nameEl = document.getElementById('modal-student-name');
  const emailEl = document.getElementById('modal-student-email');
  const mobileEl = document.getElementById('modal-student-mobile');
  const streamEl = document.getElementById('modal-student-stream');

  if (nameEl) nameEl.textContent = student.name;
  if (emailEl) emailEl.textContent = student.email;
  if (mobileEl) mobileEl.textContent = student.mobile;
  if (streamEl) streamEl.textContent = student.stream_name || 'Not Mapped';

  // Toggle modal using Bootstrap API
  const modalEl = document.getElementById('student-detail-modal');
  if (modalEl && window.bootstrap && window.bootstrap.Modal) {
    const modalInstance = new window.bootstrap.Modal(modalEl);
    modalInstance.show();
  }
}

// ==========================================
// Setup Filter Dropdowns (Streams and Courses)
// ==========================================
async function populateFilterOptions() {
  const streamSelect = document.getElementById('filter-stream');
  const courseSelect = document.getElementById('filter-course');

  if (!streamSelect || !courseSelect) return;

  try {
    const [streamsRes, coursesRes] = await Promise.all([
      api.getTeacherSelfStreams().catch(() => ({ success: false, data: [] })),
      api.getTeacherSelfCourses().catch(() => ({ success: false, data: [] }))
    ]);

    if (streamsRes.success && streamsRes.data.length > 0) {
      streamSelect.innerHTML = '<option value="">All Streams</option>' +
        streamsRes.data.map(s => `<option value="${s.stream_id}">${s.stream_name}</option>`).join('');
    }

    if (coursesRes.success && coursesRes.data.length > 0) {
      courseSelect.innerHTML = '<option value="">All Courses</option>' +
        coursesRes.data.map(c => `<option value="${c.course_id}">${c.course_name}</option>`).join('');
    }
  } catch (e) {
    console.error("Error populating search filters:", e);
  }
}

// ==========================================
// Event Listeners for Filters
// ==========================================
export function setupStudentFilters() {
  const applyBtn = document.getElementById('btn-apply-filters');
  const resetBtn = document.getElementById('btn-reset-filters');
  const searchInput = document.getElementById('student-search-input');
  const streamSelect = document.getElementById('filter-stream');
  const courseSelect = document.getElementById('filter-course');

  if (!applyBtn || !resetBtn) return;

  const getActiveFilters = () => {
    const filters = {};
    if (searchInput && searchInput.value.trim()) {
      filters.search = searchInput.value.trim();
    }
    if (streamSelect && streamSelect.value) {
      filters.stream_id = streamSelect.value;
    }
    if (courseSelect && courseSelect.value) {
      filters.course_id = courseSelect.value;
    }
    return filters;
  };

  applyBtn.addEventListener('click', () => {
    loadStudentsTable(getActiveFilters());
  });

  resetBtn.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    if (streamSelect) streamSelect.value = '';
    if (courseSelect) courseSelect.value = '';
    loadStudentsTable();
  });

  // Bind Export button click (UI only)
  const exportBtn = document.getElementById('btn-export-students');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      toast.success('Export features are ready. Students registry downloading...');
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('students-table-body')) {
    populateFilterOptions();
    setupStudentFilters();
    
    // Check if redirect query search is loaded
    const urlParams = new URLSearchParams(window.location.search);
    const searchVal = urlParams.get('search');
    if (searchVal) {
      const searchInput = document.getElementById('student-search-input');
      if (searchInput) {
        searchInput.value = searchVal;
        loadStudentsTable({ search: searchVal });
      }
    } else {
      loadStudentsTable();
    }
  }
});
