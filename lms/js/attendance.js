import { api } from './api.js';
import { loader } from './loader.js';
import { toast } from './toast.js';
import { storage } from './storage.js';

let pendingList = [];
let activeAttendanceId = null;

// ==========================================
// Teacher: Load and Render Pending Attendance List
// ==========================================
export async function loadPendingAttendance() {
  const tbody = document.getElementById('pending-table-body');
  if (!tbody) return;

  try {
    loader.show('Loading pending attendances...');
    const res = await api.getPendingAttendance();
    loader.hide();

    if (res.success && res.data) {
      pendingList = res.data;
      renderPendingList(pendingList);
    }
  } catch (error) {
    loader.hide();
    
    if (error.message.includes('No Pending Attendance') || error.message.includes('Resource Not Found') || error.message.includes('Not Found')) {
      renderPendingList([]);
    } else {
      toast.error('Failed to load pending attendances.');
      tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Error: ${error.message}</td></tr>`;
    }
  }
}

async function directUpdateStatus(attendanceId, status) {
  try {
    loader.show(`Marking attendance as ${status}...`);
    const res = await api.updateAttendance(attendanceId, {
      status,
      remark: null
    });
    loader.hide();
    if (res.success) {
      toast.success(res.message || `Attendance marked ${status}.`);
      loadPendingAttendance();
    }
  } catch (error) {
    loader.hide();
    toast.error(error.message);
  }
}

function renderPendingList(list) {
  const tbody = document.getElementById('pending-table-body');
  const emptyState = document.getElementById('empty-state-container');
  const tableWrapper = document.getElementById('table-wrapper-container');

  if (!tbody) return;

  if (list.length === 0) {
    if (tableWrapper) tableWrapper.style.display = 'none';
    if (emptyState) {
      emptyState.style.display = 'block';
      emptyState.innerHTML = `
        <div class="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
          <div class="text-warning fs-1 mb-2"><i class="bi bi-calendar2-x"></i></div>
          <h4 class="fw-bold text-slate-800 mb-2">No Pending Attendance</h4>
          <p class="text-secondary small mb-0">All student attendance requests have been verified.</p>
        </div>
      `;
    } else {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">No pending records.</td></tr>`;
    }
    return;
  }

  if (tableWrapper) tableWrapper.style.display = 'block';
  if (emptyState) emptyState.style.display = 'none';

  tbody.innerHTML = list.map(item => `
    <tr>
      <td>${item.student_id || 'N/A'}</td>
      <td class="fw-semibold text-slate-800">${item.student_name}</td>
      <td><span class="badge bg-light text-primary border rounded-pill px-2.5 py-1">${item.course_name}</span></td>
      <td><span class="badge bg-light text-secondary border rounded-pill px-2.5 py-1">${item.stream_name || 'N/A'}</span></td>
      <td>
        <div class="d-flex gap-1">
          <button class="btn btn-sm btn-success rounded-pill px-3 approve-btn" data-id="${item.attendance_id}">
            <i class="bi bi-check-circle"></i> Approve
          </button>
          <button class="btn btn-sm btn-danger rounded-pill px-3 reject-btn" data-id="${item.attendance_id}">
            <i class="bi bi-x-circle"></i> Reject
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  // Bind Actions
  tbody.querySelectorAll('.approve-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      await directUpdateStatus(id, 'present');
    });
  });

  tbody.querySelectorAll('.reject-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      await directUpdateStatus(id, 'absent');
    });
  });
}

function openMarkModal(attendanceId, defaultStatus, studentName) {
  activeAttendanceId = attendanceId;
  
  const studentNameEl = document.getElementById('modal-student-name');
  if (studentNameEl) studentNameEl.textContent = studentName;

  const statusSelect = document.getElementById('modal-attendance-status');
  if (statusSelect) statusSelect.value = defaultStatus;

  const remarkTextarea = document.getElementById('modal-remark');
  if (remarkTextarea) remarkTextarea.value = '';

  const modalEl = document.getElementById('mark-attendance-modal');
  if (modalEl && window.bootstrap && window.bootstrap.Modal) {
    const modalInstance = new window.bootstrap.Modal(modalEl);
    modalInstance.show();
  }
}

export async function handleAttendanceMarkSubmit(event) {
  event.preventDefault();
  if (!activeAttendanceId) return;

  const statusSelect = document.getElementById('modal-attendance-status');
  const remarkTextarea = document.getElementById('modal-remark');
  const submitBtn = document.getElementById('modal-submit-btn');

  const status = statusSelect.value;
  const remark = remarkTextarea.value.trim();

  try {
    loader.show('Updating attendance status...');
    submitBtn.disabled = true;

    const res = await api.updateAttendance(activeAttendanceId, {
      status,
      remark: remark || null
    });

    loader.hide();

    if (res.success) {
      toast.success(res.message || 'Attendance status verified.');
      
      const modalEl = document.getElementById('mark-attendance-modal');
      if (modalEl) {
        const modalInstance = window.bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) modalInstance.hide();
      }

      loadPendingAttendance();
    }
  } catch (error) {
    loader.hide();
    submitBtn.disabled = false;
    toast.error(error.message);
  }
}

// ==========================================
// Student: Mark Self Attendance
// ==========================================
function parseTimeString(timeStr) {
  if (!timeStr) return null;
  timeStr = timeStr.trim();
  const match = timeStr.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM|Am|Pm|am|pm)$/i);
  if (!match) return null;
  
  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const ampm = match[3].toLowerCase();
  
  if (ampm === 'pm' && hours < 12) {
    hours += 12;
  } else if (ampm === 'am' && hours === 12) {
    hours = 0;
  }
  
  return { hours, minutes };
}

function isCurrentTimeWithinTiming(timing) {
  if (!timing) return true; // If no timing set, always show button
  
  let parts = [];
  if (timing.toLowerCase().includes('to')) {
    parts = timing.split(/\bto\b/i);
  } else if (timing.includes('-')) {
    parts = timing.split('-');
  } else {
    return true; // unrecognized timing format, allow by default
  }
  
  if (parts.length !== 2) return true;
  
  const start = parseTimeString(parts[0]);
  const end = parseTimeString(parts[1]);
  
  if (!start || !end) return true;
  
  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  
  const currentVal = currentHours * 60 + currentMinutes;
  const startVal = start.hours * 60 + start.minutes;
  const endVal = end.hours * 60 + end.minutes;
  
  if (startVal <= endVal) {
    return currentVal >= startVal && currentVal <= endVal;
  } else {
    // Overnight course (e.g. 11 PM to 1 AM)
    return currentVal >= startVal || currentVal <= endVal;
  }
}

let studentCourses = [];

async function populateStudentCoursesDropdown() {
  const container = document.getElementById('active-class-container');
  const submitBtn = document.getElementById('submit-btn');
  const btnWrapper = document.getElementById('submit-btn-wrapper');
  if (!container) return;

  if (submitBtn) {
    submitBtn.style.display = 'none';
  }
  if (btnWrapper) {
    btnWrapper.style.display = 'none';
  }

  try {
    const res = await api.getStudentCourses();
    if (res.success && res.data) {
      studentCourses = res.data;
      if (res.data.length === 0) {
        container.innerHTML = `
          <div class="p-3 rounded-3 bg-danger-subtle text-danger border border-danger-subtle text-center">
            <i class="bi bi-exclamation-triangle-fill fs-4 mb-2 d-block"></i>
            <h6 class="fw-bold mb-1">No Courses Enrolled</h6>
            <p class="small text-secondary mb-0">You are not enrolled in any courses yet.</p>
          </div>
        `;
        return;
      }

      // Find course with active timing
      const activeCourse = res.data.find(c => isCurrentTimeWithinTiming(c.timing));

      if (activeCourse) {
        if (activeCourse.already_marked) {
          container.innerHTML = `
            <div class="p-3 rounded-3 bg-success-subtle text-success border border-success-subtle text-center">
              <i class="bi bi-patch-check-fill fs-4 mb-2 d-block"></i>
              <h6 class="fw-bold mb-1">Already Marked Present</h6>
              <p class="small text-secondary mb-0">Your check-in request for <strong>${activeCourse.course_name}</strong> is already registered today.</p>
            </div>
          `;
          if (submitBtn) submitBtn.style.display = 'none';
          if (btnWrapper) btnWrapper.style.display = 'none';
        } else {
          container.innerHTML = `
            <div class="p-3 rounded-3 bg-primary-subtle text-primary border border-primary-subtle">
              <div class="small fw-semibold text-uppercase text-secondary mb-1" style="font-size: 0.7rem;">Active Classroom</div>
              <h5 class="fw-bold mb-1 text-slate-800">${activeCourse.course_name}</h5>
              <div class="small text-muted" style="font-size: 0.75rem;"><i class="bi bi-clock me-1"></i>Timing: ${activeCourse.timing || 'Not Specified'}</div>
              <input type="hidden" id="student-course-select" value="${activeCourse.course_id}">
            </div>
          `;
          if (submitBtn) submitBtn.style.display = 'block';
          if (btnWrapper) btnWrapper.style.display = 'block';
        }
      } else {
        container.innerHTML = `
          <div class="p-3 rounded-3 bg-danger-subtle text-danger border border-danger-subtle text-center">
            <i class="bi bi-clock-fill fs-4 mb-2 d-block"></i>
            <h6 class="fw-bold mb-1">No Active Classes Right Now</h6>
            <p class="small text-secondary mb-0">Check-in is only available during your scheduled class hours.</p>
          </div>
        `;
      }
    }
  } catch (error) {
    container.innerHTML = `
      <div class="p-3 rounded-3 bg-danger-subtle text-danger border border-danger-subtle text-center">
        <i class="bi bi-exclamation-circle-fill fs-4 mb-2 d-block"></i>
        <h6 class="fw-bold mb-1">Error Loading Courses</h6>
        <p class="small text-secondary mb-0">${error.message}</p>
      </div>
    `;
  }
}

export async function handleStudentSelfCheckIn(event) {
  event.preventDefault();

  const select = document.getElementById('student-course-select');
  const submitBtn = document.getElementById('submit-btn');
  const animContainer = document.getElementById('success-animation-container');

  const course_id = select.value;

  if (!course_id) {
    select.classList.add('is-invalid');
    return;
  }
  select.classList.remove('is-invalid');

  try {
    loader.show('Submitting attendance request...');
    submitBtn.disabled = true;

    const res = await api.markAttendance({
      course_id: Number(course_id)
    });

    loader.hide();

    if (res.success) {
      toast.success(res.message || 'Attendance marked successfully.');
      
      // Render success animation
      if (animContainer) {
        animContainer.style.display = 'block';
        animContainer.innerHTML = `
          <div class="success-checkmark-circle">
            <i class="bi bi-patch-check-fill"></i>
          </div>
          <h4 class="fw-bold text-slate-800 mb-2">Check-in Requested</h4>
          <p class="text-secondary small mb-4">Request #${res.attendance_id || 100} has been sent to your teacher for approval.</p>
        `;
      }

      setTimeout(() => {
        window.location.href = './student-dashboard.html';
      }, 2000);
    }
  } catch (error) {
    loader.hide();
    submitBtn.disabled = false;
    toast.error(error.message);
  }
}

// ==========================================
// Student: Load Attendance History Logs
// ==========================================
export async function loadStudentAttendanceHistory() {
  const tbody = document.getElementById('student-history-table-body');
  if (!tbody) return;

  try {
    loader.show('Loading check-in history...');
    const res = await api.getAttendanceHistory();
    loader.hide();

    if (res.success && res.data) {
      renderStudentHistoryTable(res.data);
    }
  } catch (error) {
    loader.hide();
    if (error.message.includes('No Attendance') || error.message.includes('Not Found')) {
      renderStudentHistoryTable([]);
    } else {
      toast.error('Failed to load attendance history.');
      tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Error: ${error.message}</td></tr>`;
    }
  }
}

function renderStudentHistoryTable(list) {
  const tbody = document.getElementById('student-history-table-body');
  const emptyState = document.getElementById('student-empty-state-container');
  const tableWrapper = document.getElementById('student-table-wrapper-container');

  if (!tbody) return;

  if (list.length === 0) {
    if (tableWrapper) tableWrapper.style.display = 'none';
    if (emptyState) {
      emptyState.style.display = 'block';
      emptyState.innerHTML = `
        <div class="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
          <div class="text-muted fs-1 mb-2"><i class="bi bi-calendar-x"></i></div>
          <h4 class="fw-bold text-slate-800 mb-2">No Attendance Logged</h4>
          <p class="text-secondary small mb-0">You have not requested check-ins for any classes yet.</p>
        </div>
      `;
    } else {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No attendance history found.</td></tr>`;
    }
    return;
  }

  if (tableWrapper) tableWrapper.style.display = 'block';
  if (emptyState) emptyState.style.display = 'none';

  tbody.innerHTML = list.map(item => {
    const badgeColor = item.status === 'present' ? 'badge-status-present' : 
                       item.status === 'absent' ? 'badge-status-absent' : 'badge-status-pending';

    const statusText = item.status.charAt(0).toUpperCase() + item.status.slice(1);

    return `
      <tr>
        <td class="fw-bold">${item.course_name}</td>
        <td><span class="badge bg-light text-secondary border rounded-pill px-2.5 py-1">${item.stream_name || 'N/A'}</span></td>
        <td>${item.attendance_date}</td>
        <td>${item.attendance_time}</td>
        <td><span class="${badgeColor}">${statusText}</span></td>
        <td class="text-muted small">${item.remark || '-'}</td>
      </tr>
    `;
  }).join('');
}

// Auto mappings
function init() {
  const role = storage.getRole();
  
  if (role === 'teacher' && document.getElementById('pending-table-body')) {
    loadPendingAttendance();
    const form = document.getElementById('mark-attendance-form');
    if (form) form.addEventListener('submit', handleAttendanceMarkSubmit);
  }

  if (role === 'student') {
    if (document.getElementById('active-class-container')) {
      populateStudentCoursesDropdown();
      document.getElementById('mark-self-attendance-form').addEventListener('submit', handleStudentSelfCheckIn);
    }
    if (document.getElementById('student-history-table-body')) {
      loadStudentAttendanceHistory();
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
