import { api } from './api.js';
import { loader } from './loader.js';
import { toast } from './toast.js';
import { validation } from './validation.js';

let coursesList = [];

// ==========================================
// List and Search Courses
// ==========================================
export async function loadCoursesTable() {
  const tbody = document.getElementById('courses-table-body');
  if (!tbody) return;

  try {
    loader.show('Loading your courses...');
    const res = await api.getMyCourses();
    loader.hide();

    if (res.success && res.data) {
      coursesList = res.data;
      renderCourses(coursesList);
    }
  } catch (error) {
    loader.hide();
    toast.error('Failed to load courses.');
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Error: ${error.message}</td></tr>`;
  }
}

function renderCourses(list) {
  const tbody = document.getElementById('courses-table-body');
  const emptyState = document.getElementById('empty-state-container');
  const tableWrapper = document.getElementById('table-wrapper-container');

  if (!tbody) return;

  if (list.length === 0) {
    if (tableWrapper) tableWrapper.style.display = 'none';
    if (emptyState) {
      emptyState.style.display = 'block';
      emptyState.innerHTML = `
        <div class="empty-state-box card border-0 shadow-sm rounded-4 p-5 text-center">
          <div class="empty-state-icon"><i class="bi bi-journal-x"></i></div>
          <h4 class="fw-bold mb-2">No Courses Found</h4>
          <p class="text-secondary small mb-0">You have not created any courses yet.</p>
        </div>
      `;
    } else {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">No courses found.</td></tr>`;
    }
    return;
  }

  if (tableWrapper) tableWrapper.style.display = 'block';
  if (emptyState) emptyState.style.display = 'none';

  tbody.innerHTML = list.map(course => {
    const streamBadges = (course.stream_names || '')
      .split(', ')
      .map(name => `<span class="badge bg-light text-secondary border rounded-pill px-2.5 py-1 me-1">${name}</span>`)
      .join('');

    return `
      <tr id="course-row-${course.course_id}">
        <td class="fw-semibold text-slate-800">${course.course_name}</td>
        <td>
          <span class="badge bg-light text-primary border rounded-pill px-3 py-1.5"><i class="bi bi-clock me-1"></i>${course.timing || 'N/A'}</span>
          ${course.batch_end_year ? `<span class="badge bg-light text-success border rounded-pill px-2.5 py-1 ms-1"><i class="bi bi-mortarboard me-1"></i>Batch ${course.batch_end_year}</span>` : ''}
        </td>
        <td><div class="d-flex flex-wrap gap-1">${streamBadges || '<span class="text-muted small">None</span>'}</div></td>
        <td>
          <div class="action-btn-group">
            <a href="edit-course.html?id=${course.course_id}" class="btn btn-action btn-outline-primary" title="Edit Course">
              <i class="bi bi-pencil"></i>
            </a>
            <button class="btn btn-action btn-outline-danger delete-course-btn" data-id="${course.course_id}" data-name="${course.course_name}" title="Delete Course">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Bind Actions
  tbody.querySelectorAll('.delete-course-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const name = e.currentTarget.getAttribute('data-name');
      confirmDeleteCourse(id, name);
    });
  });
}

export function setupCourseSearch() {
  const searchInput = document.getElementById('course-search-input');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase().trim();
    if (!term) {
      renderCourses(coursesList);
      return;
    }

    const filtered = coursesList.filter(course => 
      course.course_name.toLowerCase().includes(term) ||
      (course.stream_names || '').toLowerCase().includes(term)
    );
    renderCourses(filtered);
  });
}

// ==========================================
// Delete Course Flow
// ==========================================
function confirmDeleteCourse(id, name) {
  import('../components/modal.js').then(({ modal }) => {
    modal.show({
      title: 'Delete Course',
      body: `Are you sure you want to delete course <strong>${name}</strong>? All mapped configurations will be lost.`,
      confirmText: 'Delete Course',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          loader.show('Deleting course...');
          const res = await api.deleteCourse(id);
          loader.hide();

          if (res.success) {
            toast.success(res.message || 'Course deleted successfully.');
            loadCoursesTable();
          }
        } catch (error) {
          loader.hide();
          toast.error(error.message || 'Failed to delete course.');
        }
      }
    });
  });
}

// ==========================================
// Create Course Form setups
// ==========================================
export async function populateStreamsChecklist() {
  const container = document.getElementById('streams-checklist-container');
  if (!container) return;

  try {
    const res = await api.getMyStreams();
    if (res.success && res.data) {
      // Only admin-approved streams can be used to create/assign courses.
      // Streams still pending (or rejected) approval are excluded here.
      const approvedStreams = res.data.filter(stream => stream.status === 'approved');

      if (approvedStreams.length === 0) {
        container.innerHTML = `
          <div class="text-warning small py-1">
            <i class="bi bi-exclamation-triangle me-1"></i>
            No admin-approved streams yet. Please <a href="./assign-stream.html" class="text-decoration-none">request a stream</a> and wait for admin approval before creating a course.
          </div>
        `;
        return;
      }

      container.innerHTML = approvedStreams.map(stream => `
        <div class="form-check mb-2">
          <input class="form-check-input stream-checkbox" type="checkbox" value="${stream.stream_id}" id="stream-chk-${stream.stream_id}">
          <label class="form-check-label" for="stream-chk-${stream.stream_id}">
            ${stream.stream_name}
          </label>
        </div>
      `).join('');
    }
  } catch (e) {
    container.innerHTML = `<div class="text-danger small py-1">Failed to load streams checklist.</div>`;
  }
}

// ==========================================
// Batch End Year Helper
// ==========================================
export function populateBatchYearOptions(selectedYear) {
  const select = document.getElementById('batch-end-year');
  if (!select) return;

  const currentYear = new Date().getFullYear();
  let options = '<option value="" disabled selected>Select batch end year</option>';
  for (let y = currentYear - 1; y <= currentYear + 6; y++) {
    options += `<option value="${y}">${y}</option>`;
  }
  select.innerHTML = options;

  if (selectedYear) {
    select.value = String(selectedYear);
  }
}

// ==========================================
// Course Timing Helper Functions
// ==========================================
function parseTimingParts(timingStr) {
  const result = {
    startHour: '', startMinute: '', startPeriod: '',
    endHour: '', endMinute: '', endPeriod: ''
  };
  if (!timingStr) return result;
  const parts = timingStr.split('-');
  if (parts.length !== 2) return result;

  const startMatch = parts[0].trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (startMatch) {
    result.startHour = startMatch[1].padStart(2, '0');
    result.startMinute = startMatch[2];
    result.startPeriod = startMatch[3].toUpperCase();
  }

  const endMatch = parts[1].trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (endMatch) {
    result.endHour = endMatch[1].padStart(2, '0');
    result.endMinute = endMatch[2];
    result.endPeriod = endMatch[3].toUpperCase();
  }

  return result;
}

export async function handleCourseCreate(event) {
  event.preventDefault();

  const nameInput = document.getElementById('course-name');
  const startHourSel = document.getElementById('start-hour');
  const startMinSel = document.getElementById('start-minute');
  const startPeriodSel = document.getElementById('start-period');
  const endHourSel = document.getElementById('end-hour');
  const endMinSel = document.getElementById('end-minute');
  const endPeriodSel = document.getElementById('end-period');
  const batchYearSelect = document.getElementById('batch-end-year');
  const submitBtn = document.getElementById('submit-btn');

  const course_name = nameInput.value.trim();
  const startHour = startHourSel.value;
  const startMin = startMinSel.value;
  const startPeriod = startPeriodSel.value;
  const endHour = endHourSel.value;
  const endMin = endMinSel.value;
  const endPeriod = endPeriodSel.value;
  const batchEndYear = batchYearSelect ? batchYearSelect.value : '';

  // Retrieve checked stream IDs
  const checkedCheckboxes = document.querySelectorAll('.stream-checkbox:checked');
  const stream_ids = Array.from(checkedCheckboxes).map(chk => Number(chk.value));

  let isValid = true;

  if (!course_name) {
    validation.setInputValidity(nameInput, false, 'Course name is required.');
    isValid = false;
  } else {
    validation.setInputValidity(nameInput, true);
  }

  const startError = document.getElementById('start-time-error');
  if (!startHour || !startMin || !startPeriod) {
    if (startError) startError.style.display = 'block';
    isValid = false;
  } else {
    if (startError) startError.style.display = 'none';
  }

  const endError = document.getElementById('end-time-error');
  if (!endHour || !endMin || !endPeriod) {
    if (endError) endError.style.display = 'block';
    isValid = false;
  } else {
    if (endError) endError.style.display = 'none';
  }

  const checklistContainer = document.getElementById('streams-checklist-container');
  if (stream_ids.length === 0) {
    if (checklistContainer) {
      checklistContainer.classList.add('is-invalid', 'border', 'border-danger', 'p-2', 'rounded');
      const err = checklistContainer.parentNode.querySelector('.invalid-feedback-custom');
      if (err) err.style.display = 'block';
    }
    isValid = false;
  } else {
    if (checklistContainer) {
      checklistContainer.classList.remove('is-invalid', 'border', 'border-danger', 'p-2');
      const err = checklistContainer.parentNode.querySelector('.invalid-feedback-custom');
      if (err) err.style.display = 'none';
    }
  }

  if (!isValid) return;

  if (!batchEndYear) {
    if (batchYearSelect) validation.setInputValidity(batchYearSelect, false, 'Please select the batch end year.');
    toast.error('Please select the batch end year for this course.');
    return;
  } else {
    if (batchYearSelect) validation.setInputValidity(batchYearSelect, true);
  }

  const timing = `${startHour}:${startMin} ${startPeriod} - ${endHour}:${endMin} ${endPeriod}`;

  try {
    loader.show('Creating course...');
    submitBtn.disabled = true;

    const res = await api.createCourse({
      course_name,
      stream_ids,
      timing,
      batch_end_year: Number(batchEndYear)
    });

    loader.hide();

    if (res.success) {
      toast.success(res.message || 'Course created successfully.');
      setTimeout(() => {
        window.location.href = './my-courses.html';
      }, 1000);
    }
  } catch (error) {
    loader.hide();
    submitBtn.disabled = false;
    toast.error(error.message);
  }
}

// ==========================================
// Edit Course Page Flow
// ==========================================
let currentEditCourseId = null;

export async function loadEditCoursePage() {
  const form = document.getElementById('course-edit-form');
  if (!form) return;

  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  if (!id) {
    toast.error('No course ID supplied.');
    window.location.href = './my-courses.html';
    return;
  }
  currentEditCourseId = id;

  try {
    loader.show('Loading details...');
    
    // Load checklist streams first
    await populateStreamsChecklist();

    // Populate batch year select options
    populateBatchYearOptions();

    // Fetch course details
    const res = await api.getCourseDetails(id);
    loader.hide();

    if (res.success && res.data) {
      const course = res.data;
      
      document.getElementById('course-name').value = course.course_name;

      // Pre-select the course's existing batch end year
      const batchYearSelect = document.getElementById('batch-end-year');
      if (batchYearSelect && course.batch_end_year) {
        batchYearSelect.value = String(course.batch_end_year);
      }
      
      const timingParts = parseTimingParts(course.timing || '');
      document.getElementById('start-hour').value = timingParts.startHour || '';
      document.getElementById('start-minute').value = timingParts.startMinute || '';
      document.getElementById('start-period').value = timingParts.startPeriod || '';
      document.getElementById('end-hour').value = timingParts.endHour || '';
      document.getElementById('end-minute').value = timingParts.endMinute || '';
      document.getElementById('end-period').value = timingParts.endPeriod || '';

      // Check current assigned streams
      if (course.streams) {
        course.streams.forEach(s => {
          const chk = document.getElementById(`stream-chk-${s.stream_id}`);
          if (chk) chk.checked = true;
        });
      }
    }
  } catch (error) {
    loader.hide();
    toast.error('Failed to load course details.');
    window.location.href = './my-courses.html';
  }
}

export async function handleCourseUpdate(event) {
  event.preventDefault();
  if (!currentEditCourseId) return;

  const nameInput = document.getElementById('course-name');
  const startHourSel = document.getElementById('start-hour');
  const startMinSel = document.getElementById('start-minute');
  const startPeriodSel = document.getElementById('start-period');
  const endHourSel = document.getElementById('end-hour');
  const endMinSel = document.getElementById('end-minute');
  const endPeriodSel = document.getElementById('end-period');
  const batchYearSelect = document.getElementById('batch-end-year');
  const submitBtn = document.getElementById('submit-btn');

  const course_name = nameInput.value.trim();
  const startHour = startHourSel.value;
  const startMin = startMinSel.value;
  const startPeriod = startPeriodSel.value;
  const endHour = endHourSel.value;
  const endMin = endMinSel.value;
  const endPeriod = endPeriodSel.value;
  const batchEndYear = batchYearSelect ? batchYearSelect.value : '';

  const checkedCheckboxes = document.querySelectorAll('.stream-checkbox:checked');
  const stream_ids = Array.from(checkedCheckboxes).map(chk => Number(chk.value));

  let isValid = true;

  if (!course_name) {
    validation.setInputValidity(nameInput, false, 'Course name is required.');
    isValid = false;
  } else {
    validation.setInputValidity(nameInput, true);
  }

  const startError = document.getElementById('start-time-error');
  if (!startHour || !startMin || !startPeriod) {
    if (startError) startError.style.display = 'block';
    isValid = false;
  } else {
    if (startError) startError.style.display = 'none';
  }

  const endError = document.getElementById('end-time-error');
  if (!endHour || !endMin || !endPeriod) {
    if (endError) endError.style.display = 'block';
    isValid = false;
  } else {
    if (endError) endError.style.display = 'none';
  }

  if (stream_ids.length === 0) {
    const checklistContainer = document.getElementById('streams-checklist-container');
    if (checklistContainer) {
      checklistContainer.classList.add('is-invalid', 'border', 'border-danger', 'p-2', 'rounded');
      const err = checklistContainer.parentNode.querySelector('.invalid-feedback-custom');
      if (err) err.style.display = 'block';
    }
    isValid = false;
  }

  if (!batchEndYear) {
    if (batchYearSelect) validation.setInputValidity(batchYearSelect, false, 'Please select the batch end year.');
    isValid = false;
  } else {
    if (batchYearSelect) validation.setInputValidity(batchYearSelect, true);
  }

  if (!isValid) return;

  const timing = `${startHour}:${startMin} ${startPeriod} - ${endHour}:${endMin} ${endPeriod}`;

  try {
    loader.show('Saving changes...');
    submitBtn.disabled = true;

    const res = await api.updateCourse(currentEditCourseId, {
      course_name,
      stream_ids,
      timing,
      batch_end_year: Number(batchEndYear)
    });

    loader.hide();

    if (res.success) {
      toast.success(res.message || 'Course updated successfully.');
      setTimeout(() => {
        window.location.href = './my-courses.html';
      }, 1000);
    }
  } catch (error) {
    loader.hide();
    submitBtn.disabled = false;
    toast.error(error.message);
  }
}

// ==========================================
// Course Details Flow
// ==========================================
export async function loadCourseDetailsPage() {
  const container = document.getElementById('course-details-container');
  if (!container) return;

  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');

  if (!id) {
    toast.error('No course ID specified.');
    window.location.href = './my-courses.html';
    return;
  }

  try {
    loader.show('Loading course profile...');
    const res = await api.getCourseDetails(id);
    loader.hide();

    if (res.success && res.data) {
      const course = res.data;
      
      const createdDateStr = new Date(course.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const updatedDateStr = new Date(course.updated_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const streamBadges = course.streams.map(s => `
        <span class="stream-pill-badge">
          <i class="bi bi-collection"></i> ${s.stream_name}
        </span>
      `).join('');

      container.innerHTML = `
        <div class="course-detail-card">
          <div class="course-detail-header d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <span class="badge bg-primary rounded-pill mb-2 px-3 py-1 text-uppercase" style="font-size: 0.75rem;">Course details</span>
              <h2 class="fw-bold mb-0">${course.course_name}</h2>
            </div>
            <div>
              <a href="edit-course.html?id=${course.course_id}" class="btn btn-outline-light rounded-pill px-4">
                <i class="bi bi-pencil-square me-1"></i>Edit Course
              </a>
            </div>
          </div>
          
          <div class="course-detail-body bg-white">
            <div class="row g-4">
              <!-- Info Columns -->
              <div class="col-md-6 border-end">
                <h5 class="fw-bold text-slate-800 mb-3"><i class="bi bi-info-circle text-primary me-2"></i>General Information</h5>
                <div class="mb-3">
                  <div class="text-muted small">COURSE ID</div>
                  <div class="fw-semibold text-dark">${course.course_id}</div>
                </div>
                <div class="mb-3">
                  <div class="text-muted small">TIMING SCHEDULE</div>
                  <div class="course-timing-tag mt-1">
                    <i class="bi bi-clock"></i> ${course.timing || 'Not Specified'}
                  </div>
                </div>
                <div class="mb-3">
                  <div class="text-muted small">CREATED DATE</div>
                  <div class="fw-semibold text-dark">${createdDateStr}</div>
                </div>
                <div class="mb-0">
                  <div class="text-muted small">LAST UPDATED</div>
                  <div class="fw-semibold text-dark">${updatedDateStr}</div>
                </div>
              </div>

              <!-- Streams Assigned -->
              <div class="col-md-6">
                <h5 class="fw-bold text-slate-800 mb-3"><i class="bi bi-diagram-2 text-primary me-2"></i>Assigned Streams</h5>
                <div class="d-flex flex-wrap gap-2">
                  ${streamBadges || '<div class="text-muted">No streams assigned.</div>'}
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }
  } catch (error) {
    loader.hide();
    toast.error('Failed to retrieve course details.');
    container.innerHTML = `
      <div class="alert alert-danger border-0">
        <i class="bi bi-exclamation-triangle me-2"></i> ${error.message}
      </div>
    `;
  }
}

function init() {
  if (document.getElementById('courses-table-body')) {
    loadCoursesTable();
    setupCourseSearch();
  }
  if (document.getElementById('stream-create-form')) {
    populateStreamsChecklist();
  }
  if (document.getElementById('course-create-form')) {
    populateStreamsChecklist();
    populateBatchYearOptions();
    document.getElementById('course-create-form').addEventListener('submit', handleCourseCreate);
  }
  if (document.getElementById('course-edit-form')) {
    loadEditCoursePage();
    document.getElementById('course-edit-form').addEventListener('submit', handleCourseUpdate);
  }
  if (document.getElementById('course-details-container')) {
    loadCourseDetailsPage();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
