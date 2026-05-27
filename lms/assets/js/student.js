/* ============================================================
   student.js — Student Dashboard
   Course-aware leaderboard, game visibility, & enrollment
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const user = requireAuth(["STUDENT"]);
  if (!user) return;
  loadStudentDashboard();
});

async function loadStudentDashboard() {
  await Promise.allSettled([
    loadProfile(),
    loadActiveGame(),
    loadEnrollmentDropdown(),   // All courses for enrolling
    loadAssignedCourses()
  ]);
  // Mini leaderboard loads after courses are known
  await loadMiniLeaderboard();

  // Check if first-time student (no courses assigned yet)
  checkFirstTimeCoursePopup();
}

// ── First-time student popup ────────────────────────────────
async function checkFirstTimeCoursePopup() {
  try {
    const courses = await apiFetch("/api/student/my-courses");
    if (!courses || courses.length === 0) {
      showCourseAssignmentPopup();
    }
  } catch (err) {
    // Fail silently
  }
}

function showCourseAssignmentPopup() {
  const existingModal = document.getElementById('firstTimeCourseModal');
  if (existingModal) return;

  const modal = document.createElement('div');
  modal.id = 'firstTimeCourseModal';
  modal.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;padding:16px;';
  modal.innerHTML = `
    <div style="background:#0d0f1c;border:1px solid rgba(0,229,255,0.35);border-radius:1.25rem;padding:2.2rem;width:100%;max-width:440px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.7);">
      <div style="font-size:3rem;margin-bottom:1rem;">🎓</div>
      <h4 style="color:#00e5ff;font-family:'Fredoka One',cursive;margin-bottom:0.75rem;">Welcome to the Arena!</h4>
      <p style="color:rgba(240,242,255,0.65);font-size:0.95rem;margin-bottom:1.8rem;line-height:1.6;">
        To get started, you need to select and enroll in a course first.<br>
        <strong style="color:#ffe135;">Pick your course below to begin!</strong>
      </p>
      <div id="popupCourseSelect" style="margin-bottom:1.4rem;">
        <select id="popupCourseDropdown" class="form-select" style="background:#111;color:#f0f2ff;border-color:rgba(255,255,255,0.2);text-align:center;">
          <option value="">— Select a Course —</option>
        </select>
      </div>
      <div class="d-flex gap-3 justify-content-center flex-wrap">
        <button class="btn btn-outline-secondary btn-sm" onclick="document.getElementById('firstTimeCourseModal').remove()">Skip for now</button>
        <button class="btn btn-info" onclick="assignCourseFromPopup()">➕ Enroll in Course</button>
      </div>
    </div>`;
  document.body.appendChild(modal);

  // Populate the popup dropdown
  const mainDropdown = document.getElementById('courseDropdown');
  const popupDropdown = document.getElementById('popupCourseDropdown');
  if (mainDropdown && popupDropdown) {
    popupDropdown.innerHTML = mainDropdown.innerHTML;
  }
}

async function assignCourseFromPopup() {
  const dropdown = document.getElementById('popupCourseDropdown');
  const courseId = dropdown && dropdown.value;

  if (!courseId) {
    dropdown && dropdown.style.setProperty('border-color', '#ff4455');
    setTimeout(() => dropdown && dropdown.style.removeProperty('border-color'), 1500);
    return;
  }

  try {
    const result = await apiFetch(`/api/student/assign-course/${courseId}`, { method: "POST" });
    showAlert("studentMessage", result.message, "success");
    document.getElementById('firstTimeCourseModal')?.remove();
    await loadAssignedCourses();
    await loadMiniLeaderboard();
  } catch (error) {
    showAlert("studentMessage", error.message, "danger");
  }
}

// ── Enrollment dropdown: ALL available courses ─────────────────
// (This is for students who want to JOIN a new course)
async function loadEnrollmentDropdown() {
  const dropdown = document.getElementById("courseDropdown");
  if (!dropdown) return;

  try {
    const courses = await apiFetch("/api/courses/AllCourses");

    dropdown.innerHTML = `<option value="">— Select Course —</option>`;
    courses.forEach(course => {
      dropdown.innerHTML += `
        <option value="${course.course_id}">
          ${escapeHtml(course.course_name)}
        </option>`;
    });
  } catch (error) {
    showAlert("studentMessage", "Failed to load courses", "danger");
  }
}

async function assignCourse() {
  const dropdown = document.getElementById("courseDropdown");
  const courseId = dropdown.value;

  if (!courseId) {
    showAlert("studentMessage", "Please select a course", "danger");
    return;
  }

  try {
    const result = await apiFetch(`/api/student/assign-course/${courseId}`, { method: "POST" });
    showAlert("studentMessage", result.message, "success");
    dropdown.value = "";
    await loadAssignedCourses();
    await loadMiniLeaderboard(); // Refresh leaderboard after enrollment
  } catch (error) {
    showAlert("studentMessage", error.message, "danger");
  }
}

// ── Profile ────────────────────────────────────────────────────
async function loadProfile() {
  try {
    const result = await apiFetch("/api/student/my-profile");
    const student = result.student;
    setText("studentName", student.name);
    setText("totalScore", student.totalScore);
    setText("testsCompleted", student.testsCompleted);
    setText("studentRank", student.rank || "–");
  } catch (error) {
    showAlert("studentMessage", error.message, "danger");
  }
}

// ── Active Game ────────────────────────────────────────────────
async function loadActiveGame() {
  const holder = document.getElementById("activeGameHolder");
  if (!holder) return;

  try {
    const result = await apiFetch("/api/student/active-game");

    if (!result.hasActiveGame) {
      holder.innerHTML = `
        <div class="active-game-empty">
          <div style="font-size:3.5rem;margin-bottom:1rem;">😴</div>
          <h4 style="font-family:'Fredoka One',cursive;color:var(--text-primary);margin-bottom:0.5rem;">
            No Active Challenge
          </h4>
          <p class="arena-text-muted mb-0">
            Your teacher will launch the next game soon. Stay ready, Player!
          </p>
        </div>`;
      return;
    }

    const game             = result.game;
    const alreadySubmitted = result.alreadySubmitted;
    const isShadowMind     = isShadowMindGame(game);

    holder.innerHTML = `
      <div class="active-game-neon">
        <div class="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-4">
          <div style="flex:1;">
            <span class="active-game-type-badge mb-2 d-inline-block">
              ${escapeHtml(formatGameType(game.gameType))}
            </span>
            <h3 class="active-game-title" style="margin-top:0.4rem;">
              ${escapeHtml(game.gameName)}
            </h3>
            <p class="active-game-course" style="display:flex;align-items:center;gap:0.4rem;">
              <span>📚</span> ${escapeHtml(game.courseName)}
            </p>
          </div>
          <div class="text-lg-end flex-shrink-0">
            ${alreadySubmitted ? `
              <button class="btn-game btn-game-ghost" disabled style="cursor:not-allowed;opacity:0.65;">
                ✅ Already Attempted
              </button>
              <div class="arena-text-muted mt-2" style="font-size:0.82rem;">
                You have completed this challenge.
              </div>
            ` : `
              <button
                class="btn-start-challenge"
                onclick="startStudentGame()"
                style="white-space:nowrap;"
              >
                ${isShadowMind ? "⚡ Enter KBC" : "🚀 Start Challenge"}
              </button>
              <div class="arena-text-muted mt-2" style="font-size:0.82rem;">
                ${isShadowMind
                  ? "Your KBC arena is ready."
                  : "Result appears only after final submit."}
              </div>
            `}
          </div>
        </div>
      </div>`;

  } catch (error) {
    showAlert("studentMessage", error.message, "danger");
  }
}

// ── Assigned Courses ───────────────────────────────────────────
async function loadAssignedCourses() {
  const holder = document.getElementById("assignedCourses");
  if (!holder) return;

  try {
    const courses = await apiFetch("/api/student/my-courses");

    if (!courses.length) {
      holder.innerHTML = `<div class="text-muted">No courses assigned yet.</div>`;
      return;
    }

    holder.innerHTML = courses.map(course => `
      <div class="glass-card p-3 mb-3">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h6 class="mb-1 fw-bold">${escapeHtml(course.course_name)}</h6>
          </div>
          <button class="btn btn-danger btn-sm" onclick="removeCourse(${course.course_id})">
            Remove
          </button>
        </div>
      </div>
    `).join("");

  } catch (error) {
    holder.innerHTML = `<div class="text-danger">Failed to load assigned courses.</div>`;
  }
}

async function removeCourse(courseId) {
  if (!confirm("Remove this course?")) return;

  try {
    const result = await apiFetch(`/api/student/remove-course/${courseId}`, { method: "DELETE" });
    showAlert("studentMessage", result.message, "success");
    await loadAssignedCourses();
    await loadMiniLeaderboard();
  } catch (error) {
    showAlert("studentMessage", error.message, "danger");
  }
}

// ── Mini Leaderboard (course-aware) ───────────────────────────
async function loadMiniLeaderboard() {
  const list = document.getElementById("miniLeaderboard");
  if (!list) return;

  // Get the student's enrolled courses to find a courseId for the filter
  let courseId = "";
  try {
    const courses = await apiFetch("/api/student/my-courses");
    if (courses && courses.length > 0) {
      // Use courseId selector if available, else default to first course
      const sel = document.getElementById("miniLbCourseSelect");
      courseId = sel ? sel.value : String(courses[0].course_id);

      // Populate the selector if it exists and hasn't been filled yet
      if (sel && sel.options.length <= 1) {
        // No "All Courses" — only enrolled courses
        sel.innerHTML = `<option value="" disabled>— Select Course —</option>`;
        courses.forEach(c => {
          sel.innerHTML += `<option value="${c.course_id}">${escapeHtml(c.course_name)}</option>`;
        });
        sel.value = String(courses[0].course_id);
        courseId  = String(courses[0].course_id);
      }
    }
  } catch (_) {}

  try {
    const url = courseId
      ? `/api/leaderboard?courseId=${encodeURIComponent(courseId)}`
      : "/api/leaderboard";

    const result = await apiFetch(url);
    const topThree = result.topThree || [];

    if (!topThree.length) {
      list.innerHTML = `<div class="text-muted">Leaderboard is empty for this course.</div>`;
      return;
    }

    const medals = ["🥇", "🥈", "🥉"];
    list.innerHTML = topThree.map((student, index) => `
      <div class="d-flex align-items-center justify-content-between py-2"
           style="border-bottom:1px solid rgba(255,255,255,0.08);">
        <div class="d-flex align-items-center gap-2">
          <span style="font-size:1.2rem;">${medals[index] || (index + 1)}</span>
          <span class="fw-semibold" style="color:var(--text-primary)">${escapeHtml(student.name)}</span>
        </div>
        <div class="fw-bold" style="color:var(--neon-cyan,#00e5ff);">${escapeHtml(String(student.totalScore))} pts</div>
      </div>
    `).join("");
  } catch {
    list.innerHTML = `<div class="text-muted">Could not load leaderboard.</div>`;
  }
}

// ── Start Game ────────────────────────────────────────────────
async function startStudentGame() {
  try {
    const result = await apiFetch("/api/student/start-game", { method: "POST" });
    sessionStorage.setItem("currentGame", JSON.stringify(result));
    sessionStorage.removeItem("lastResult");
    window.location.href = isShadowMindGame(result) ? "kbc.html" : "game.html";
  } catch (error) {
    showAlert("studentMessage", error.message, "danger");
  }
}

// ── Helpers ───────────────────────────────────────────────────
function isShadowMindGame(game) {
  return String(game?.gameType || game?.game_type || "").trim().toUpperCase() === "SHADOWMIND";
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function formatGameType(value) {
  return String(value || "").replace(/_/g, " ");
}

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, c =>
    ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c])
  );
}
