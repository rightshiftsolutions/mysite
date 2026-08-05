import { api } from './api.js';
import { loader } from './loader.js';
import { toast } from './toast.js';

let historyList = [];
let reportList = [];

// ==========================================
// Populates Course Selector dropdown
// ==========================================
async function populateCoursesDropdown(dropdownId, onSelectCallback) {
  const select = document.getElementById(dropdownId);
  if (!select) return;

  try {
    const res = await api.getMyCourses();
    if (res.success && res.data) {
      if (res.data.length === 0) {
        select.innerHTML = '<option value="" disabled selected>No courses assigned</option>';
        return;
      }

      select.innerHTML = '<option value="" disabled selected>Select Course</option>' +
        res.data.map(c => `<option value="${c.course_id}">${c.course_name}</option>`).join('');

      select.addEventListener('change', (e) => {
        onSelectCallback(e.target.value);
      });
    }
  } catch (error) {
    toast.error('Failed to load courses.');
  }
}

// ==========================================
// Populates Streams filter based on course ID
// ==========================================
async function updateStreamsFilter(courseId, dropdownId) {
  const select = document.getElementById(dropdownId);
  if (!select) return;

  try {
    const res = await api.getCourseStreams(courseId);
    if (res.success && res.data) {
      select.innerHTML = '<option value="">All Streams</option>' +
        res.data.map(s => `<option value="${s.stream_id}">${s.stream_name}</option>`).join('');
    }
  } catch (error) {
    select.innerHTML = '<option value="">All Streams</option>';
  }
}

// ==========================================
// Attendance History Flow
// ==========================================
export async function loadAttendanceHistory(courseId, filters = {}) {
  const tbody = document.getElementById('history-table-body');
  if (!tbody) return;

  try {
    loader.show('Loading attendance records...');
    const res = await api.getCourseAttendance(courseId, filters);
    loader.hide();

    if (res.success && res.data) {
      historyList = res.data;
      renderHistoryTable(historyList);
    }
  } catch (error) {
    loader.hide();
    if (error.message.includes('Not Found') || error.message.includes('No records')) {
      renderHistoryTable([]);
    } else {
      toast.error('Failed to load attendance history.');
      tbody.innerHTML = `<tr><td colspan="9" class="text-center text-danger">Error: ${error.message}</td></tr>`;
    }
  }
}

function renderHistoryTable(list) {
  const tbody = document.getElementById('history-table-body');
  const emptyState = document.getElementById('empty-state-container');
  const tableWrapper = document.getElementById('table-wrapper-container');

  if (!tbody) return;

  if (list.length === 0) {
    if (tableWrapper) tableWrapper.style.display = 'none';
    if (emptyState) {
      emptyState.style.display = 'block';
      emptyState.innerHTML = `
        <div class="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
          <div class="text-muted fs-1 mb-2"><i class="bi bi-clock-history"></i></div>
          <h5 class="fw-bold mb-2">No Records Found</h5>
          <p class="text-secondary small mb-0">No past attendance logs match the query parameters.</p>
        </div>
      `;
    } else {
      tbody.innerHTML = `<tr><td colspan="9" class="text-center py-4 text-muted">No attendance logs found.</td></tr>`;
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
        <td><strong>#${item.attendance_id}</strong></td>
        <td>${item.student_id || 'N/A'}</td>
        <td class="fw-semibold text-slate-800">${item.name || item.student_name || 'N/A'}</td>
        <td><span class="badge bg-light text-primary border rounded-pill px-2.5 py-1">${item.course_name}</span></td>
        <td><span class="badge bg-light text-secondary border rounded-pill px-2.5 py-1">${item.stream_name}</span></td>
        <td>${item.attendance_date}</td>
        <td>${item.attendance_time}</td>
        <td><span class="${badgeColor}">${statusText}</span></td>
        <td class="text-muted small">${item.remark || '-'}</td>
      </tr>
    `;
  }).join('');
}

function setupHistorySearch() {
  const searchInput = document.getElementById('history-search-input');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase().trim();
    if (!term) {
      renderHistoryTable(historyList);
      return;
    }

    const filtered = historyList.filter(item => 
      (item.name || item.student_name || '').toLowerCase().includes(term) ||
      (item.student_id || '').toLowerCase().includes(term)
    );
    renderHistoryTable(filtered);
  });
}

// ==========================================
// Attendance Report Flow
// ==========================================
export async function loadAttendanceReport(courseId, filters = {}) {
  const tbody = document.getElementById('report-table-body');
  if (!tbody) return;

  try {
    loader.show('Generating report stats...');
    const res = await api.getAttendanceReport(courseId, filters);
    loader.hide();

    if (res.success && res.data) {
      reportList = res.data;
      
      // Update Stats Panel
      const courseNameEl = document.getElementById('report-course-name');
      const totalStudentsEl = document.getElementById('report-total-students');
      if (courseNameEl) courseNameEl.textContent = res.course || 'Physics';
      if (totalStudentsEl) totalStudentsEl.textContent = res.total_students || reportList.length;

      calculateAndRenderSummaryStats(reportList);
      renderReportTable(reportList);
    }
  } catch (error) {
    loader.hide();
    toast.error('Failed to generate report.');
    tbody.innerHTML = `<tr><td colspan="8" class="text-center text-danger">Error: ${error.message}</td></tr>`;
  }
}

function calculateAndRenderSummaryStats(list) {
  const avgPercentageEl = document.getElementById('report-avg-percentage');
  const presentPercentageEl = document.getElementById('report-present-percentage');
  const absentPercentageEl = document.getElementById('report-absent-percentage');
  const pendingPercentageEl = document.getElementById('report-pending-percentage');

  if (list.length === 0) {
    if (avgPercentageEl) avgPercentageEl.textContent = '0%';
    if (presentPercentageEl) presentPercentageEl.textContent = '0%';
    if (absentPercentageEl) absentPercentageEl.textContent = '0%';
    if (pendingPercentageEl) pendingPercentageEl.textContent = '0%';
    return;
  }

  let totalPct = 0;
  let totalClasses = 0;
  let totalPresents = 0;
  let totalAbsents = 0;
  let totalPendings = 0;

  list.forEach(student => {
    totalPct += Number(student.attendance_percentage || 0);
    totalClasses += student.total_classes || 0;
    totalPresents += student.present || 0;
    totalAbsents += student.absent || 0;
    totalPendings += student.pending || 0;
  });

  const avgPct = (totalPct / list.length).toFixed(1);
  const presentPct = totalClasses > 0 ? ((totalPresents / totalClasses) * 100).toFixed(1) : 0;
  const absentPct = totalClasses > 0 ? ((totalAbsents / totalClasses) * 100).toFixed(1) : 0;
  const pendingPct = totalClasses > 0 ? ((totalPendings / totalClasses) * 100).toFixed(1) : 0;

  if (avgPercentageEl) avgPercentageEl.textContent = `${avgPct}%`;
  if (presentPercentageEl) presentPercentageEl.textContent = `${presentPct}%`;
  if (absentPercentageEl) absentPercentageEl.textContent = `${absentPct}%`;
  if (pendingPercentageEl) pendingPercentageEl.textContent = `${pendingPct}%`;
}

function renderReportTable(list) {
  const tbody = document.getElementById('report-table-body');
  if (!tbody) return;

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-muted">No student metrics mapped.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(item => {
    const pct = Number(item.attendance_percentage || 0).toFixed(1);
    
    // Percentage color badges
    const badgeColorClass = pct >= 90 ? 'percentage-badge-high' :
                            pct >= 75 ? 'percentage-badge-medium' :
                            pct >= 50 ? 'percentage-badge-low' : 'percentage-badge-critical';

    // Circular visual color
    const textThemeColor = pct >= 90 ? 'text-success' :
                           pct >= 75 ? 'text-primary' :
                           pct >= 50 ? 'text-warning' : 'text-danger';

    return `
      <tr>
        <td><strong>${item.student_id || `STU-${item.id}`}</strong></td>
        <td class="fw-semibold text-slate-800">${item.name}</td>
        <td><span class="badge bg-light text-secondary border rounded-pill px-2.5 py-1">${item.stream_name || 'Science'}</span></td>
        <td>${item.total_classes}</td>
        <td class="text-success fw-medium">${item.present}</td>
        <td class="text-danger fw-medium">${item.absent}</td>
        <td class="text-warning fw-medium">${item.pending}</td>
        <td>
          <div class="d-flex align-items-center gap-2">
            <div class="progress progress-custom flex-grow-1">
              <div class="progress-bar" role="progressbar" style="width: ${pct}%; background-color: currentColor;" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
            <span class="badge ${badgeColorClass} px-2.5 py-1">${pct}%</span>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Auto-apply current progress colors based on class text bindings
  tbody.querySelectorAll('.progress-bar').forEach(bar => {
    const val = parseFloat(bar.getAttribute('aria-valuenow'));
    if (val >= 90) bar.style.color = '#198754';
    else if (val >= 75) bar.style.color = '#0d6efd';
    else if (val >= 50) bar.style.color = '#ffc107';
    else bar.style.color = '#dc3545';
  });
}

// ==========================================
// Initialization bindings
// ==========================================
function init() {
  // History Page Settings
  if (document.getElementById('history-course-select')) {
    populateCoursesDropdown('history-course-select', async (courseId) => {
      await updateStreamsFilter(courseId, 'history-stream-select');
      loadAttendanceHistory(courseId);
    });

    setupHistorySearch();

    // Filters Actions
    const applyBtn = document.getElementById('btn-apply-history-filters');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        const courseId = document.getElementById('history-course-select').value;
        if (!courseId) {
          toast.warning('Please select a course first.');
          return;
        }

        const filters = {};
        const streamId = document.getElementById('history-stream-select').value;
        const status = document.getElementById('history-status-select').value;
        const date = document.getElementById('history-date-picker').value;

        if (streamId) filters.stream_id = streamId;
        if (status) filters.status = status;
        if (date) filters.date = date;

        loadAttendanceHistory(courseId, filters);
      });
    }

    const resetBtn = document.getElementById('btn-reset-history-filters');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        const courseSelect = document.getElementById('history-course-select');
        const courseId = courseSelect.value;
        
        document.getElementById('history-stream-select').value = '';
        document.getElementById('history-status-select').value = '';
        document.getElementById('history-date-picker').value = '';
        document.getElementById('history-search-input').value = '';

        if (courseId) {
          loadAttendanceHistory(courseId);
        } else {
          renderHistoryTable([]);
        }
      });
    }
  }

  // Reports Page Settings
  if (document.getElementById('report-course-select')) {
    populateCoursesDropdown('report-course-select', (courseId) => {
      const dateVal = document.getElementById('report-date-select').value;
      loadAttendanceReport(courseId, dateVal ? { date: dateVal } : {});
    });

    const applyReportBtn = document.getElementById('btn-apply-report-filters');
    if (applyReportBtn) {
      applyReportBtn.addEventListener('click', () => {
        const courseId = document.getElementById('report-course-select').value;
        if (!courseId) {
          toast.warning('Please select a course first.');
          return;
        }

        const filters = {};
        const dateVal = document.getElementById('report-date-select').value;
        if (dateVal) filters.date = dateVal;

        loadAttendanceReport(courseId, filters);
      });
    }

    const resetReportBtn = document.getElementById('btn-reset-report-filters');
    if (resetReportBtn) {
      resetReportBtn.addEventListener('click', () => {
        const courseSelect = document.getElementById('report-course-select');
        const courseId = courseSelect.value;
        document.getElementById('report-date-select').value = '';

        if (courseId) {
          loadAttendanceReport(courseId);
        } else {
          const courseNameEl = document.getElementById('report-course-name');
          const totalStudentsEl = document.getElementById('report-total-students');
          if (courseNameEl) courseNameEl.textContent = 'Physics';
          if (totalStudentsEl) totalStudentsEl.textContent = '0';
          calculateAndRenderSummaryStats([]);
          renderReportTable([]);
        }
      });
    }

    // Download PDF button — teacher must have a Course + Date selected
    const downloadPdfBtn = document.getElementById('btn-download-report-pdf');
    if (downloadPdfBtn) {
      downloadPdfBtn.addEventListener('click', async () => {
        const courseId = document.getElementById('report-course-select').value;
        const dateVal = document.getElementById('report-date-select').value;

        if (!courseId) {
          toast.warning('Please select a course first.');
          return;
        }
        if (!dateVal) {
          toast.warning('Please select a date first.');
          return;
        }

        try {
          loader.show('Generating PDF report...');
          await api.downloadAttendanceReportPdf(courseId, dateVal);
          loader.hide();
          toast.success('Attendance report PDF downloaded.');
        } catch (error) {
          loader.hide();
          toast.error(error.message || 'Failed to generate attendance report PDF.');
        }
      });
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
