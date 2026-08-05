import { api } from './api.js';
import { loader } from './loader.js';
import { toast } from './toast.js';

export async function loadStudentCourses() {
  const container = document.getElementById('student-courses-container');
  if (!container) return;

  try {
    loader.show('Loading your enrolled courses...');
    const res = await api.getStudentCourses();
    loader.hide();

    if (res.success && res.data) {
      renderStudentCourses(res.data);
    }
  } catch (error) {
    loader.hide();
    toast.error('Failed to load courses.');
    container.innerHTML = `<div class="col-12 text-center text-danger py-4">Error: ${error.message}</div>`;
  }
}

function renderStudentCourses(courses) {
  const container = document.getElementById('student-courses-container');
  if (!container) return;

  if (courses.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center py-5 text-muted bg-white card rounded-4 border-0 shadow-sm">
        <i class="bi bi-journal-x fs-1 text-slate-300 d-block mb-2"></i>
        You are not enrolled in any academic courses yet.
      </div>
    `;
    return;
  }

  container.innerHTML = courses.map(course => {
    const createdDate = new Date(course.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    const updatedDate = new Date(course.updated_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    return `
      <div class="col-md-6 col-lg-4">
        <div class="card border-0 shadow-sm rounded-4 h-100 bg-white p-4 d-flex flex-column justify-content-between">
          <div>
            <div class="d-flex align-items-center gap-2 mb-3">
              <div class="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center" style="width: 42px; height: 42px; background-color: rgba(13, 110, 253, 0.1);">
                <i class="bi bi-journal-bookmark-fill"></i>
              </div>
              <h5 class="fw-bold mb-0 text-slate-800">${course.course_name}</h5>
            </div>
            
            <div class="mb-3">
              <div class="text-secondary small">Instructor Educator</div>
              <div class="fw-semibold text-dark"><i class="bi bi-person-badge me-1.5 text-secondary"></i>${course.teacher_name || 'Assigned Professor'}</div>
            </div>
            
            <div class="row g-2 mb-4 pt-2 border-top">
              <div class="col-6">
                <span class="text-muted small d-block">Start Date</span>
                <span class="small fw-semibold text-slate-700">${createdDate}</span>
              </div>
              <div class="col-6">
                <span class="text-muted small d-block">Last Sync</span>
                <span class="small fw-semibold text-slate-700">${updatedDate}</span>
              </div>
            </div>
          </div>

          <div class="d-grid">
            <button class="btn btn-sm btn-outline-primary rounded-pill px-4 view-course-details-btn" data-id="${course.course_id}" data-name="${course.course_name}">
              View Details
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Bind Details action button
  container.querySelectorAll('.view-course-details-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const name = e.currentTarget.getAttribute('data-name');
      const id = e.currentTarget.getAttribute('data-id');
      
      import('../components/modal.js').then(({ modal }) => {
        modal.show({
          title: 'Course Enrollment Details',
          body: `
            <div class="text-center mb-3">
              <div class="rounded-circle bg-primary-subtle text-primary d-inline-flex align-items-center justify-content-center mb-2" style="width: 60px; height: 60px; background-color: rgba(13, 110, 253, 0.1);">
                <i class="bi bi-journal-bookmark-fill" style="font-size: 1.8rem;"></i>
              </div>
              <h4 class="fw-bold">${name}</h4>
              <span class="badge bg-success-subtle text-success border rounded-pill px-3 py-1">Enrolled</span>
            </div>
            <p class="text-secondary small text-center mb-0">You have been mapped to course ID ${id}. Attend class check-ins under the Mark Attendance tab.</p>
          `,
          confirmText: 'Okay',
          onConfirm: () => {}
        });
      });

    });
  });
}

function init() {
  if (document.getElementById('student-courses-container')) {
    loadStudentCourses();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
