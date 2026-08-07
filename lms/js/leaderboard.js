import { api } from './api.js';
import { loader } from './loader.js';
import { toast } from './toast.js';
import { storage } from './storage.js';

let activeCourseId = null;
let leaderboardPage = 1;
let leaderboardTotalPages = 1;

// ==========================================
// Populates Course Selector dropdown
// ==========================================
async function populateCoursesDropdown() {
  const select = document.getElementById('leaderboard-course-select');
  if (!select) return;

  const role = storage.getRole();

  try {
    const res = role === 'student' ? 
      await api.getStudentCourses() : 
      await api.getMyCourses();

    if (res.success && res.data) {
      if (res.data.length === 0) {
        select.innerHTML = '<option value="" disabled selected>No courses assigned</option>';
        return;
      }

      select.innerHTML = '<option value="" disabled selected>Select Course</option>' +
        res.data.map(c => `<option value="${c.course_id}">${c.course_name}</option>`).join('');

      // Check for query parameter 'course_id' to pre-select course
      const urlParams = new URLSearchParams(window.location.search);
      const queryCourseId = urlParams.get('course_id');

      if (queryCourseId && res.data.some(c => String(c.course_id) === String(queryCourseId))) {
        select.value = queryCourseId;
        activeCourseId = queryCourseId;
        leaderboardPage = 1;
        loadCourseLeaderboard();
      }

      select.addEventListener('change', (e) => {
        activeCourseId = e.target.value;
        leaderboardPage = 1;
        loadCourseLeaderboard();
      });
    }
  } catch (error) {
    toast.error('Failed to load courses.');
  }
}

// ==========================================
// Fetch and Load Leaderboard data
// ==========================================
export async function loadCourseLeaderboard() {
  if (!activeCourseId) return;

  const tbody = document.getElementById('leaderboard-table-body');
  if (!tbody) return;

  const role = storage.getRole();

  try {
    loader.show('Loading leaderboard...');
    const res = role === 'student' ? 
      await api.getStudentLeaderboard(activeCourseId, { page: leaderboardPage, limit: 20 }) :
      await api.getLeaderboard(activeCourseId, { page: leaderboardPage, limit: 20 });
      
    loader.hide();

    if (res.success && res.leaderboard) {
      const formattedData = res.leaderboard.map(item => ({
        ...item,
        score: item.total_score !== undefined ? item.total_score : item.score
      }));
      renderLeaderboard(formattedData);
      renderLeaderboardPagination(res.pagination);
    }
  } catch (error) {
    loader.hide();
    tbody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Error: ${error.message}</td></tr>`;
  }
}

function renderLeaderboard(data) {
  const goldCard = document.getElementById('podium-gold-card');
  const silverCard = document.getElementById('podium-silver-card');
  const bronzeCard = document.getElementById('podium-bronze-card');
  const tbody = document.getElementById('leaderboard-table-body');
  const tableWrapper = document.getElementById('table-wrapper-container');

  if (!tbody) return;

  // Gold Winner (Rank 1)
  const first = data[0];
  if (first && goldCard) {
    goldCard.innerHTML = `
      <div class="podium-card podium-gold shadow-premium">
        <div class="podium-badge"><i class="bi bi-trophy-fill"></i></div>
        <h5 class="fw-bold text-slate-800 mb-1">${first.student_name}</h5>
        <div class="text-muted small">Student ID: ${first.student_id}</div>
        <div class="fs-4 fw-bold text-primary mt-2">${first.score} pts</div>
      </div>
    `;
  } else if (goldCard) {
    goldCard.innerHTML = `
      <div class="podium-card podium-gold shadow-premium opacity-50">
        <div class="podium-badge"><i class="bi bi-trophy-fill"></i></div>
        <h5 class="fw-bold text-secondary mb-1">No Winner</h5>
        <div class="text-muted small">-</div>
        <div class="fs-4 fw-bold text-secondary mt-2">0 pts</div>
      </div>
    `;
  }

  // Silver Winner (Rank 2)
  const second = data[1];
  if (second && silverCard) {
    silverCard.innerHTML = `
      <div class="podium-card podium-silver shadow-premium">
        <div class="podium-badge"><i class="bi bi-award-fill"></i></div>
        <h5 class="fw-bold text-slate-800 mb-1">${second.student_name}</h5>
        <div class="text-muted small">Student ID: ${second.student_id}</div>
        <div class="fs-4 fw-bold text-primary mt-2">${second.score} pts</div>
      </div>
    `;
  } else if (silverCard) {
    silverCard.innerHTML = `
      <div class="podium-card podium-silver shadow-premium opacity-50">
        <div class="podium-badge"><i class="bi bi-award-fill"></i></div>
        <h5 class="fw-bold text-secondary mb-1">No Winner</h5>
        <div class="text-muted small">-</div>
        <div class="fs-4 fw-bold text-secondary mt-2">0 pts</div>
      </div>
    `;
  }

  // Bronze Winner (Rank 3)
  const third = data[2];
  if (third && bronzeCard) {
    thirdCardDetails(third, bronzeCard);
  } else if (bronzeCard) {
    bronzeCard.innerHTML = `
      <div class="podium-card podium-bronze shadow-premium opacity-50">
        <div class="podium-badge"><i class="bi bi-award-fill"></i></div>
        <h5 class="fw-bold text-secondary mb-1">No Winner</h5>
        <div class="text-muted small">-</div>
        <div class="fs-4 fw-bold text-secondary mt-2">0 pts</div>
      </div>
    `;
  }

  // List all students in Table
  const tableData = data;

  if (tableWrapper) tableWrapper.style.display = 'block';

  if (tableData.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-muted small">No leaderboard records to display.</td></tr>`;
    return;
  }

  tbody.innerHTML = tableData.map(item => `
    <tr>
      <td><strong>#${item.rank}</strong></td>
      <td class="fw-semibold text-slate-800">${item.student_name}</td>
      <td>${item.student_id}</td>
      <td class="fw-bold text-primary">${item.score} pts</td>
    </tr>
  `).join('');
}

function thirdCardDetails(third, element) {
  element.innerHTML = `
    <div class="podium-card podium-bronze shadow-premium">
      <div class="podium-badge"><i class="bi bi-award-fill"></i></div>
      <h5 class="fw-bold text-slate-800 mb-1">${third.student_name}</h5>
      <div class="text-muted small">Student ID: ${third.student_id}</div>
      <div class="fs-4 fw-bold text-primary mt-2">${third.score} pts</div>
    </div>
  `;
}

function renderLeaderboardPagination(pagination) {
  const container = document.getElementById('leaderboard-pagination-container');
  if (!container || !pagination) return;

  leaderboardPage = pagination.page || 1;
  
  // Calculate total pages based on count
  const limit = pagination.limit || 20;
  const total = pagination.total || 0;
  leaderboardTotalPages = Math.ceil(total / limit);

  if (leaderboardTotalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  let html = `<li class="page-item ${leaderboardPage === 1 ? 'disabled' : ''}"><button class="page-link" data-page="${leaderboardPage - 1}">Previous</button></li>`;
  for (let i = 1; i <= leaderboardTotalPages; i++) {
    html += `<li class="page-item ${leaderboardPage === i ? 'active' : ''}"><button class="page-link" data-page="${i}">${i}</button></li>`;
  }
  html += `<li class="page-item ${leaderboardPage === leaderboardTotalPages ? 'disabled' : ''}"><button class="page-link" data-page="${leaderboardPage + 1}">Next</button></li>`;

  container.innerHTML = html;

  container.querySelectorAll('.page-link').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const page = parseInt(e.target.getAttribute('data-page'));
      if (page >= 1 && page <= leaderboardTotalPages) {
        leaderboardPage = page;
        loadCourseLeaderboard();
      }
    });
  });
}

function init() {
  if (document.getElementById('leaderboard-course-select')) {
    populateCoursesDropdown();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
