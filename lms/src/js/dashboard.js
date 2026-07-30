import { api } from './api.js';
import { loader } from './loader.js';
import { toast } from './toast.js';
import { storage } from './storage.js';
import { loadDashboardActiveGames } from './games.js';

// ==========================================
// Teacher Dashboard Flow
// ==========================================
export async function loadTeacherDashboard() {
  const dateEl = document.getElementById('current-date');
  if (dateEl) {
    dateEl.innerHTML = `<i class="bi bi-calendar3 me-2"></i>${new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })}`;
  }

  try {
    loader.show('Loading metrics...');
    const [studentsRes, coursesRes, attendanceRes, gamesRes] = await Promise.all([
      api.getStudents().catch(() => ({ success: false, data: [] })),
      api.getTeacherSelfCourses().catch(() => ({ success: false, data: [] })),
      api.getAttendancePending().catch(() => ({ success: false, data: [] })),
      api.getTeacherGames().catch(() => ({ success: false, data: [] }))
    ]);
    loader.hide();

    if (studentsRes.success) {
      const el = document.getElementById('stat-total-students');
      if (el) el.textContent = studentsRes.total || studentsRes.data.length;
      renderRecentStudents(studentsRes.data.slice(0, 3));
    }
    
    if (coursesRes.success) {
      const el = document.getElementById('stat-my-courses');
      if (el) el.textContent = coursesRes.total || coursesRes.data.length;
      renderUpcomingClasses(coursesRes.data);
    } else {
      const container = document.getElementById('upcoming-classes-container');
      if (container) {
        container.innerHTML = `<li class="list-group-item py-3 text-muted text-center small border-0"><i class="bi bi-exclamation-triangle me-1"></i> Failed to load classes.</li>`;
      }
    }
    
    if (attendanceRes.success) {
      const el = document.getElementById('stat-attendance-pending');
      if (el) el.textContent = attendanceRes.total || attendanceRes.data.length;
      renderActivities(attendanceRes.data, gamesRes.success ? gamesRes.data : []);
    }

    if (gamesRes.success) {
      const el = document.getElementById('stat-total-games');
      if (el) el.textContent = gamesRes.total || (gamesRes.data ? gamesRes.data.length : 0);
    }
  } catch (error) {
    loader.hide();
    toast.error('Failed to load dashboard metrics.');
  }
}

function renderRecentStudents(students) {
  const listEl = document.getElementById('recent-students-list');
  if (!listEl) return;

  if (students.length === 0) {
    listEl.innerHTML = `<tr><td colspan="4" class="text-center py-3 text-muted small">No students registered yet.</td></tr>`;
    return;
  }

  listEl.innerHTML = students.map(student => `
    <tr>
      <td>
        <div class="d-flex align-items-center gap-2">
          <div class="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white small" style="width: 28px; height: 28px;">
            ${(student.name || 'S').charAt(0)}
          </div>
          <span class="fw-semibold small text-slate-800">${student.name || 'Unnamed Student'}</span>
        </div>
      </td>
      <td class="small">${student.email || '-'}</td>
      <td class="small">${student.stream_name || 'N/A'}</td>
      <td>
        <span class="text-muted small">-</span>
      </td>
    </tr>
  `).join('');
}

function renderUpcomingClasses(courses) {
  const container = document.getElementById('upcoming-classes-container');
  if (!container) return;

  if (courses.length === 0) {
    container.innerHTML = `<li class="list-group-item py-3 text-muted text-center small border-0">No active courses registered.</li>`;
    return;
  }

  container.innerHTML = courses.slice(0, 3).map(course => `
    <li class="list-group-item py-3 border-bottom d-flex align-items-center justify-content-between">
      <div>
        <div class="fw-semibold text-slate-800" style="font-size: 0.9rem;">${course.course_name}</div>
        <small class="text-muted d-block" style="font-size: 0.75rem;"><i class="bi bi-clock me-1"></i>${course.timing || 'Mon, Wed 10:00 AM'}</small>
      </div>
      <span class="badge bg-light text-primary border rounded-pill px-2.5 py-1 text-uppercase" style="font-size: 0.7rem;">Active</span>
    </li>
  `).join('');
}

function renderActivities(pendingAttendances, games) {
  const container = document.getElementById('dashboard-activity-timeline');
  if (!container) return;

  let activities = [];
  if (pendingAttendances && pendingAttendances.length > 0) {
    pendingAttendances.forEach(att => {
      activities.push({
        text: `Attendance check-in requested by <strong>${att.student_name}</strong> for ${att.course_name}.`,
        time: 'Today',
        class: 'warning'
      });
    });
  }

  if (games && games.length > 0) {
    games.slice(0, 2).forEach(game => {
      activities.push({
        text: `New educational game <strong>${game.game_name}</strong> was published.`,
        time: 'Recently',
        class: 'success'
      });
    });
  }

  if (activities.length === 0) {
    activities = [
      { text: 'Teacher dashboard workspace initialized.', time: 'Just now', class: 'success' }
    ];
  }

  container.innerHTML = activities.slice(0, 4).map(act => `
    <div class="activity-item ${act.class || ''}">
      <div class="small text-slate-700 mb-0.5">${act.text}</div>
      <small class="text-muted" style="font-size: 0.7rem;">${act.time}</small>
    </div>
  `).join('');
}


// ==========================================
// Student Dashboard Flow
// ==========================================
export async function loadStudentDashboard() {
  const dateEl = document.getElementById('current-date');
  if (dateEl) {
    dateEl.innerHTML = `<i class="bi bi-calendar3 me-2"></i>${new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })}`;
  }

  try {
    loader.show('Loading details...');

    const attendanceRes = await api.getAttendanceHistory().catch(() => ({ success: false, data: [] }));

    loader.hide();

    // Attendance history table (recent 3 records)
    if (attendanceRes.success && attendanceRes.data) {
      renderStudentRecentAttendance(attendanceRes.data.slice(0, 3));
    }
  } catch (error) {
    loader.hide();
    toast.error('Failed to load student dashboard parameters.');
  }

  // Active Games widget — any game a teacher marks Active shows up here,
  // and the student can jump straight into it from the dashboard.
  loadDashboardActiveGames('dashboard-active-games', 4);

  // Mini Leaderboard widget
  loadDashboardLeaderboard();
}

// ==========================================
// Student: Mini Leaderboard widget (dashboard)
// ==========================================
async function loadDashboardLeaderboard() {
  const listEl = document.getElementById('dashboard-leaderboard-list');
  const selectEl = document.getElementById('dashboard-leaderboard-course-select');
  if (!listEl) return;

  try {
    const coursesRes = await api.getStudentCourses().catch(() => ({ success: false, data: [] }));

    if (!coursesRes.success || !coursesRes.data || coursesRes.data.length === 0) {
      listEl.innerHTML = `<li class="list-group-item py-3 px-0 border-0 text-center text-muted small">No enrolled courses yet.</li>`;
      if (selectEl) selectEl.style.display = 'none';
      return;
    }

    if (selectEl) {
      // Populate dropdown
      selectEl.style.display = 'block';
      selectEl.innerHTML = coursesRes.data.map((c, index) => 
        `<option value="${c.course_id}" ${index === 0 ? 'selected' : ''}>${c.course_name}</option>`
      ).join('');

      // Add change listener
      selectEl.addEventListener('change', async () => {
        const courseId = selectEl.value;
        const courseName = selectEl.options[selectEl.selectedIndex].text;
        await fetchAndRenderLeaderboard(courseId, courseName);
      });
    }

    // Load initial leaderboard for the first course
    const firstCourse = coursesRes.data[0];
    await fetchAndRenderLeaderboard(firstCourse.course_id, firstCourse.course_name);

  } catch (error) {
    listEl.innerHTML = `<li class="list-group-item py-3 px-0 border-0 text-center text-muted small">Could not load leaderboard.</li>`;
  }
}

async function fetchAndRenderLeaderboard(courseId, courseName) {
  const listEl = document.getElementById('dashboard-leaderboard-list');
  if (!listEl) return;

  listEl.innerHTML = `
    <li class="list-group-item py-4 text-center text-muted border-0 small">
      <div class="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
      Loading leaderboard...
    </li>
  `;

  try {
    const res = await api.getStudentLeaderboard(courseId, { page: 1, limit: 5 });

    if (res.success && res.leaderboard && res.leaderboard.length > 0) {
      const rankIcon = (rank) => {
        if (rank === 1) return '<i class="bi bi-trophy-fill text-warning"></i>';
        if (rank === 2) return '<i class="bi bi-award-fill text-secondary"></i>';
        if (rank === 3) return '<i class="bi bi-award-fill" style="color:#cd7f32;"></i>';
        return `#${rank}`;
      };

      listEl.innerHTML = res.leaderboard.map(item => {
        const score = item.total_score !== undefined ? item.total_score : item.score;
        return `
          <li class="list-group-item py-2 px-0 border-bottom d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center gap-2">
              <span style="width: 24px; text-align: center;" class="fw-bold small">${rankIcon(item.rank)}</span>
              <span class="fw-semibold text-slate-800 small">${item.student_name}</span>
            </div>
            <span class="fw-bold text-primary small">${score} pts</span>
          </li>
        `;
      }).join('');
    } else {
      listEl.innerHTML = `<li class="list-group-item py-3 px-0 border-0 text-center text-muted small">No leaderboard entries yet for ${courseName}.</li>`;
    }
  } catch (error) {
    listEl.innerHTML = `<li class="list-group-item py-3 px-0 border-0 text-center text-muted small">Could not load leaderboard.</li>`;
  }
}

function renderStudentRecentAttendance(records) {
  const tbody = document.getElementById('recent-attendance-list');
  if (!tbody) return;

  if (records.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center py-3 text-muted small">No check-in records logged yet.</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = records.map(r => {
    const badgeColor = r.status === 'present' ? 'badge-status-present' :
                       r.status === 'absent' ? 'badge-status-absent' : 'badge-status-pending';

    const statusText = r.status.charAt(0).toUpperCase() + r.status.slice(1);

    return `
      <tr>
        <td class="fw-semibold text-slate-800 small">${r.course_name}</td>
        <td class="small">${r.attendance_date}</td>
        <td class="small">${r.attendance_time}</td>
        <td><span class="${badgeColor}" style="font-size: 0.7rem;">${statusText}</span></td>
      </tr>
    `;
  }).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  const role = storage.getRole();
  if (role === 'teacher' && (document.getElementById('stat-my-courses') || document.getElementById('upcoming-classes-container'))) {
    loadTeacherDashboard();
  }
  if (role === 'student' && document.getElementById('mark-self-attendance-form')) {
    loadStudentDashboard();
  }
});
