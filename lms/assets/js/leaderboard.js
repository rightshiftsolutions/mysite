/* ============================================================
   leaderboard.js — Course-Specific + Batch-Filtered Leaderboard
   Both teachers and students can filter by course and batch.
   ============================================================ */

document.addEventListener("DOMContentLoaded", async () => {
  if (!requireAuth()) return;

  await loadCourseFilter();

  // For students the first enrolled course is auto-selected; trigger initial load
  const courseFilter = document.getElementById("lbCourseFilter");
  const batchFilter  = document.getElementById("lbBatchFilter");

  const user = getCurrentUser();
  const isStudent = user && user.role === "STUDENT";

  // Load leaderboard with current filter values
  const initCourseId = courseFilter ? courseFilter.value : "";
  if (isStudent && !initCourseId) {
    // No enrolled courses — show empty state
    const body = document.getElementById("leaderboardTableBody");
    if (body) body.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">Please enroll in a course to view the leaderboard.</td></tr>`;
  } else {
    loadLeaderboard(initCourseId, batchFilter ? batchFilter.value : "");
  }

  if (courseFilter) {
    courseFilter.addEventListener("change", async () => {
      const selectedCourse = courseFilter.value;
      if (!selectedCourse) return; // do not load without a course selection for students
      await loadBatchFilter(selectedCourse);
      loadLeaderboard(selectedCourse, batchFilter ? batchFilter.value : "");
    });
  }

  if (batchFilter) {
    batchFilter.addEventListener("change", () => {
      const selectedCourse = courseFilter ? courseFilter.value : "";
      loadLeaderboard(selectedCourse, batchFilter.value);
    });
  }
});

// ── Load course options based on role ─────────────────────────
async function loadCourseFilter() {
  const filter = document.getElementById("lbCourseFilter");
  if (!filter) return;

  const user = getCurrentUser();
  const isStudent = user && user.role === "STUDENT";

  try {
    let courses = [];

    if (isStudent) {
      // Students: only their enrolled courses (no "All Courses" option)
      courses = await apiRequest("/api/student/my-courses");
    } else {
      // Teachers: all courses with an "All Courses" option
      courses = await apiRequest("/api/courses/");
    }

    if (isStudent) {
      // No "All Courses" for students — only their enrolled courses
      filter.innerHTML = `<option value="" disabled>— Select Course —</option>`;
    } else {
      filter.innerHTML = `<option value="">🌐 All Courses</option>`;
    }

    courses.forEach(course => {
      const id   = course.course_id;
      const name = course.course_name;
      filter.innerHTML += `<option value="${id}">${escapeHtml(name)}</option>`;
    });

    // Auto-select first enrolled course for students
    if (isStudent && courses.length > 0) {
      filter.value = String(courses[0].course_id);
      await loadBatchFilter(courses[0].course_id);
    } else {
      await loadBatchFilter("");
    }

  } catch (err) {
    console.error("Failed to load leaderboard courses:", err.message);
  }
}

// ── Load batch options for the selected course ─────────────────
async function loadBatchFilter(courseId = "") {
  const filter = document.getElementById("lbBatchFilter");
  if (!filter) return;

  try {
    const url = courseId
      ? `/api/leaderboard/batches?courseId=${encodeURIComponent(courseId)}`
      : "/api/leaderboard/batches";

    const batches = await apiRequest(url);

    filter.innerHTML = `<option value="">👥 All Batches</option>`;
    (batches || []).forEach(batch => {
      filter.innerHTML += `<option value="${escapeHtml(batch)}">${escapeHtml(batch)}</option>`;
    });
  } catch (err) {
    console.error("Failed to load batches:", err.message);
    filter.innerHTML = `<option value="">👥 All Batches</option>`;
  }
}

// ── Fetch & render leaderboard ─────────────────────────────────
async function loadLeaderboard(courseId = "", batch = "") {
  const body = document.getElementById("leaderboardTableBody");
  if (body) {
    body.innerHTML = `
      <tr><td colspan="6" class="text-center arena-text-muted py-4">
        <div class="spinner-glow mx-auto mb-2"></div>Loading...
      </td></tr>`;
  }

  try {
    let url = "/api/leaderboard";
    const params = [];
    if (courseId) params.push(`courseId=${encodeURIComponent(courseId)}`);
    if (batch)    params.push(`batch=${encodeURIComponent(batch)}`);
    if (params.length) url += "?" + params.join("&");

    const data = await apiRequest(url);
    renderTopThree(data.topThree || []);
    renderLeaderboard(data.leaderboard || []);

    const countEl = document.getElementById("lbStudentCount");
    if (countEl) {
      const n = (data.leaderboard || []).length;
      countEl.textContent = n ? `${n} student${n !== 1 ? "s" : ""} ranked` : "";
    }
  } catch (error) {
    if (body) {
      body.innerHTML = `
        <tr><td colspan="6" class="text-danger text-center py-4">${escapeHtml(error.message)}</td></tr>
      `;
    }
    const holder = document.getElementById("topThreeHolder");
    if (holder) holder.innerHTML = "";
  }
}

function renderTopThree(topThree) {
  const container = document.getElementById("topThreeHolder");
  if (!container) return;

  if (!topThree.length) {
    container.innerHTML = `
      <div class="col-12">
        <div class="empty-state">
          <div class="display-5 mb-3">🏁</div>
          <h2 class="h4">No leaderboard yet</h2>
          <p class="mb-0">Students will appear here after submitting tests.</p>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = topThree.map(renderPodiumCard).join("");
}

function renderPodiumCard(student, index) {
  const medals   = ["🥇", "🥈", "🥉"];
  const messages = ["Champion zone", "Strong challenger", "Top performer"];
  const rankClass = `rank-${index + 1}`;

  return `
    <div class="col-md-4">
      <div class="card podium-card ${rankClass} text-center h-100">
        <div class="card-body">
          <div class="podium-medal">${medals[index] || "🏅"}</div>
          <div class="podium-name">${escapeHtml(student.name)}</div>
          ${student.batch ? `<div class="podium-batch" style="font-size:0.78rem;color:var(--text-muted);margin:0.2rem 0;">📋 ${escapeHtml(student.batch)}</div>` : ''}
          <div class="podium-rank">Rank #${student.rank}</div>
          <div class="podium-score">${student.totalScore} pts</div>
          <div class="podium-tests">${student.testsCompleted} tests</div>
          <div class="podium-label">${messages[index] || "Keep climbing"}</div>
        </div>
      </div>
    </div>
  `;
}

function renderLeaderboard(leaderboard) {
  const body = document.getElementById("leaderboardTableBody");
  if (!body) return;

  if (!leaderboard.length) {
    body.innerHTML = `
      <tr><td colspan="6" class="text-center text-muted py-4">No student scores found for this selection.</td></tr>
    `;
    return;
  }

  body.innerHTML = leaderboard.map((student) => `
    <tr>
      <td class="fw-bold">#${student.rank}</td>
      <td>${escapeHtml(student.name)}</td>
      <td>${escapeHtml(student.batch || "—")}</td>
      <td>${student.totalScore}</td>
      <td>${student.testsCompleted}</td>
      <td>${getLeaderboardMessage(student.rank)}</td>
    </tr>
  `).join("");
}

function getLeaderboardMessage(rank) {
  if (rank === 1)  return "Leading the board 🏆";
  if (rank <= 3)  return "Top three momentum 🌟";
  if (rank <= 10) return "Keep climbing 🚀";
  return "Every test improves you 💪";
}

function goDashboard() {
  const user = JSON.parse(localStorage.getItem("lms_user") || "{}");
  if (user.role === "TEACHER") {
    window.location.href = "teacher-dashboard.html";
  } else {
    window.location.href = "student-dashboard.html";
  }
}

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, c =>
    ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c])
  );
}
