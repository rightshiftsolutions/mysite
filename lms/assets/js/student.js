document.addEventListener("DOMContentLoaded", () => {
  const user = requireAuth(["STUDENT"]);
  if (!user) return;

  loadStudentDashboard();
});

async function loadStudentDashboard() {
  await Promise.allSettled([
    loadProfile(),
    loadActiveGame(),
    loadMiniLeaderboard(),
    loadCoursesDropdown(),
    loadAssignedCourses()
  ]);
}

async function loadCoursesDropdown() {

  const dropdown = document.getElementById("courseDropdown");

  if (!dropdown) return;

  try {

    const courses = await apiFetch("/api/courses/AllCourses");

    dropdown.innerHTML = `
      <option value="">Select Course</option>
    `;

    courses.forEach(course => {

      dropdown.innerHTML += `
        <option value="${course.course_id}">
          ${escapeHtml(course.course_name)}
        </option>
      `;
    });

  } catch (error) {

    showAlert(
      "studentMessage",
      "Failed to load courses",
      "danger"
    );
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

    const result = await apiFetch(
      `/api/student/assign-course/${courseId}`,
      {
        method: "POST"
      }
    );

    showAlert("studentMessage", result.message, "success");

    dropdown.value = "";

    loadAssignedCourses();

  } catch (error) {

    showAlert("studentMessage", error.message, "danger");
  }
}

async function loadProfile() {
  try {
    const result = await apiFetch("/api/student/my-profile");
    const student = result.student;

    setText("studentName", student.name);
    setText("totalScore", student.totalScore);
    setText("testsCompleted", student.testsCompleted);
    setText("studentRank", student.rank || "-");
  } catch (error) {
    showAlert("studentMessage", error.message, "danger");
  }
}

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

    const game            = result.game;
    const alreadySubmitted = result.alreadySubmitted;
    const isShadowMind    = isShadowMindGame(game);

    holder.innerHTML = `
      <div class="active-game-neon">
        <div class="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-4">

          <!-- Game Info -->
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

          <!-- CTA -->
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
                ${isShadowMind ? "⚡ Enter ShadowMind" : "🚀 Start Challenge"}
              </button>
              <div class="arena-text-muted mt-2" style="font-size:0.82rem;">
                ${isShadowMind
                  ? "Your teacher-started arena is ready."
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


async function loadAssignedCourses() {

  const holder = document.getElementById("assignedCourses");

  if (!holder) return;

  try {

    const courses = await apiFetch("/api/student/my-courses");

    if (!courses.length) {

      holder.innerHTML = `
        <div class="text-muted">
          No courses assigned yet.
        </div>
      `;

      return;
    }

    holder.innerHTML = courses.map(course => `

      <div class="glass-card p-3 mb-3">

        <div class="d-flex justify-content-between align-items-center">

          <div>

            <h6 class="mb-1 fw-bold">
              ${escapeHtml(course.course_name)}
            </h6>

           

          </div>

          <button
            class="btn btn-danger btn-sm"
            onclick="removeCourse(${course.course_id})"
          >
            Remove
          </button>

        </div>

      </div>

    `).join("");

  } catch (error) {

    holder.innerHTML = `
      <div class="text-danger">
        Failed to load assigned courses.
      </div>
    `;
  }
}


async function removeCourse(courseId) {

  if (!confirm("Remove this course?")) return;

  try {

    const result = await apiFetch(
      `/api/student/remove-course/${courseId}`,
      {
        method: "DELETE"
      }
    );

    showAlert("studentMessage", result.message, "success");

    loadAssignedCourses();

  } catch (error) {

    showAlert("studentMessage", error.message, "danger");
  }
}

async function loadMiniLeaderboard() {
  const list = document.getElementById("miniLeaderboard");
  if (!list) return;

  try {
    const result = await apiFetch("/api/leaderboard");
    const topThree = result.topThree || [];

    if (!topThree.length) {
      list.innerHTML = `<div class="text-muted">Leaderboard is empty.</div>`;
      return;
    }

    list.innerHTML = topThree.map((student, index) => `
      <div class="d-flex align-items-center justify-content-between border-bottom py-2">
        <div>
          <span class="badge text-bg-${index === 0 ? "warning" : index === 1 ? "secondary" : "info"} me-2">${index + 1}</span>
          <span class="fw-semibold">${escapeHtml(student.name)}</span>
        </div>
        <div class="fw-bold">${escapeHtml(student.totalScore)}</div>
      </div>
    `).join("");
  } catch {
    list.innerHTML = `<div class="text-muted">Could not load leaderboard.</div>`;
  }
}

async function startStudentGame() {
  try {
    const result = await apiFetch("/api/student/start-game", {
      method: "POST"
    });

    sessionStorage.setItem("currentGame", JSON.stringify(result));
    sessionStorage.removeItem("lastResult");
   window.location.href =
  isShadowMindGame(result)
    ? "shadowmind.html"
    : "game.html";
  } catch (error) {
    showAlert("studentMessage", error.message, "danger");
  }
}

function isShadowMindGame(game) {

  const type = String(
    game?.gameType || game?.game_type || ''
  )
  .trim()
  .toUpperCase();

  return type === 'SHADOWMIND';
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function formatGameType(value) {
  return String(value || "").replace(/_/g, " ");
}
