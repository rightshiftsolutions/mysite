/* ============================================================
   teacher.js — Teacher Dashboard + Student Spinner
   Features: game management, canvas wheel, live scoring
   UPDATED LAYOUT: projector-optimised spinner + blast effect
   ============================================================ */

// ── State ───────────────────────────────────────────────────
let teacherGames    = [];
let students        = [];          // [{id, name, totalScore}]
let selectedStudent = null;       // currently selected student object
let isSpinning      = false;      // prevent double-spin
let spinAngle       = 0;          // current wheel rotation (radians)
let spinVelocity    = 0;          // current spin speed
let spinRAF         = null;       // requestAnimationFrame handle
let actionLog       = [];         // session log entries

let generatedData = null;

// Wheel colour palette (neon-arcade)
const WHEEL_COLORS = [
  ['#1a0533','#b44fff'],   // purple
  ['#051a30','#00e5ff'],   // cyan
  ['#0a2010','#39ff77'],   // green
  ['#1a0a00','#ffe135'],   // yellow
  ['#1a0515','#ff4fcb'],   // pink
  ['#150510','#ff4455'],   // red
  ['#0a0a20','#7b2ff7'],   // indigo
  ['#001a10','#00c46e'],   // teal
];

// ── Init ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const user = requireAuth(['TEACHER']);
  if (!user) return;
loadBatches();
  loadCourses(); 
   loadTeacherCourses();
  loadTeacherGames();
  setupSpinnerCourseDropdown();

  // ✅ dropdown event yahin add karo
  const dropdown = document.getElementById('courseFilter');

  if (dropdown) {
    dropdown.addEventListener('change', (e) => {
      const selectedCourse = e.target.value;
      loadTeacherGames(selectedCourse);
    });
  }
});

// ── Escape helper ────────────────────────────────────────────
function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, c =>
    ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])
  );
}

// ─────────────────────────────────────────────────────────────
//  GAME MANAGEMENT (existing functionality preserved)
// ─────────────────────────────────────────────────────────────
function showNeonToast(message, type = 'success', duration = 2500) {
  const container = document.getElementById('neonToastContainer');
  if (!container) {
    // Fallback to legacy alert if toast container not in page
    const alertType = type === 'success' ? 'success' : type === 'warning' ? 'warning' : 'danger';
    showAlert('createGameMessage', message, alertType);
    return;
  }

  const toast = document.createElement('div');
  toast.className = `neon-toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-hide');
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, 350);
  }, duration);
}

async function loadCourses() {
  try {
    // Fetch only this teacher's own courses
    const courses = await apiFetch('/api/courses/');
    // API returns an array directly for teacherOnly route

    const dropdown = document.getElementById('courseFilter');
    if (!dropdown) return;

    dropdown.innerHTML = `<option value="">All Courses</option>`;

    courses.forEach(c => {
      const option = document.createElement('option');
      option.value = c.course_name || c.courseName;
      option.textContent = c.course_name || c.courseName;
      dropdown.appendChild(option);
    });

  } catch (error) {
    console.error('Failed to load courses:', error.message);
  }
}

async function loadTeacherGames(course = '') {
  try {
    let url = '/api/teacher/games';

    if (course) {
      url += `?course=${encodeURIComponent(course)}`;
    }

    const result = await apiFetch(url);
    teacherGames = result.games || [];
    renderTeacherGames();
  } catch (error) {
    showAlert('teacherMessage', error.message, 'danger');
  }
}

function renderTeacherGames() {
  const tbody = document.getElementById('gamesTableBody');
  if (!tbody) return;

  if (!teacherGames.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center py-4 arena-text-muted">No games created yet.</td>
      </tr>`;
    return;
  }

  tbody.innerHTML = teacherGames.map(game => {
    const statusColor = game.status === 'STARTED' ? 'neon-green' : game.status === 'COMPLETED' ? 'neon-purple' : 'neon-yellow';
    const action = getToggleButtonConfig(game.status);

    return `
      <tr>
        <td class="arena-text-muted">${escapeHtml(game.id)}</td>
        <td>
          <div class="fw-bold">${escapeHtml(game.gameName)}</div>
          <div class="arena-text-muted" style="font-size:0.8rem">${escapeHtml(game.courseName)}</div>
        </td>
        <td><span class="teacher-type-badge">${escapeHtml(formatGameType(game.gameType))}</span></td>
        <td><span class="teacher-status-badge status-${statusColor}">${escapeHtml(game.status)}</span></td>
        <td class="text-nowrap">
          <button
            class="teacher-action-btn ${action.btnClass}"
            id="toggle-btn-${game.id}"
            onclick="toggleGameState(${game.id}, '${escapeJs(game.status)}', this)"
          >${action.label}</button>
          <button
            class="teacher-action-btn btn-edit-game"
            onclick="openEditGameModal(${game.id})"
          >&#9998; Edit</button>
          <button
            class="teacher-action-btn btn-delete-game"
            onclick="deleteGame(${game.id}, '${escapeJs(game.gameName)}')"
          >&#128465; Delete</button>
        </td>
      </tr>`;
  }).join('');
}

function getToggleButtonConfig(status) {
  const configs = {
    INACTIVE: { label: 'Start', btnClass: 'btn-start-game' },
    STARTED: { label: 'Done', btnClass: 'btn-complete-game' },
    COMPLETED: { label: 'Restart', btnClass: 'btn-restart-game' }
  };
  return configs[status] || configs.INACTIVE;
}

function escapeJs(value) {
  return String(value).replaceAll('\\', '\\\\').replaceAll("'", "\\'");
}
function formatGameType(value) {
  const labels = {
    SHADOWMIND: 'KBC',
    RAPID_FIRE: 'Rapid Fire',
    BONUS_POINTS: 'Bonus Points',
    NEGATIVE_MARKING: 'Negative Marking',
    NO_NEGATIVE_MARKING: 'No Negative Marking'
  };
  return labels[String(value).trim().toUpperCase()] || String(value || '').replace(/_/g, ' ');
}

async function startGame(gameId) {
  try {
    await apiFetch(`/api/teacher/games/${gameId}/start`, { method: 'PUT' });
    showAlert('teacherMessage', '✅ Game started successfully.', 'success');
    await loadTeacherGames();
  } catch (error) {
    showAlert('teacherMessage', error.message, 'danger');
  }
}

async function completeGame(gameId) {
  try {
    await apiFetch(`/api/teacher/games/${gameId}/complete`, { method: 'PUT' });
    showAlert('teacherMessage', '✅ Game completed.', 'success');
    await loadTeacherGames();
  } catch (error) {
    showAlert('teacherMessage', error.message, 'danger');
  }
}

// ─────────────────────────────────────────────────────────────
async function toggleGameState(gameId, currentStatus, button) {
  const nextAction = currentStatus === 'STARTED' ? 'complete' : 'start';
  const loadingText = currentStatus === 'STARTED' ? 'Saving...' : 'Starting...';

  try {
    if (button) {
      button.disabled = true;
      button.dataset.originalText = button.innerHTML;
      button.textContent = loadingText;
    }

    await apiFetch(`/api/teacher/games/${gameId}/${nextAction}`, { method: 'PUT' });
    showAlert('teacherMessage', nextAction === 'complete' ? 'Game marked done.' : 'Game started successfully.', 'success');
    await loadTeacherGames();
  } catch (error) {
    if (button) {
      button.disabled = false;
      button.innerHTML = button.dataset.originalText || button.innerHTML;
    }
    showAlert('teacherMessage', error.message, 'danger');
  }
}

// \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
//  GAME EDIT & DELETE
// \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

async function openEditGameModal(gameId) {
  try {
    const res = await apiFetch(`/api/teacher/games/${gameId}`);
    const game = res.game;
    if (!game) { showNeonToast('Game not found.', 'error'); return; }

    // Build modal HTML
    const existingModal = document.getElementById('editGameModal');
    if (existingModal) existingModal.remove();

    const gameTypeOptions = [
      { value: 'RAPID_FIRE',        label: 'Rapid Fire' },
      { value: 'BONUS_POINTS',      label: 'Bonus Points' },
      { value: 'NEGATIVE_MARKING',  label: 'Negative Marking' },
      { value: 'NO_NEGATIVE_MARKING', label: 'No Negative Marking' },
      { value: 'SHADOWMIND',        label: 'KBC' },
    ].map(opt => `<option value="${opt.value}" ${opt.value === game.gameType ? 'selected' : ''}>${escapeHtml(opt.label)}</option>`).join('');

    const modal = document.createElement('div');
    modal.id = 'editGameModal';
    modal.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;padding:16px;';
    modal.innerHTML = `
      <div style="background:#1a1a2e;border:1px solid rgba(255,255,255,0.15);border-radius:16px;padding:32px;width:100%;max-width:480px;">
        <h4 style="color:#fff;margin-bottom:24px;">&#9998; Edit Game</h4>
        <div class="mb-3">
          <label style="color:#aaa;font-size:0.9rem;">Game Name</label>
          <input id="editGameName" class="form-control mt-1" value="${escapeHtml(game.gameName)}" />
        </div>
        <div class="mb-3">
          <label style="color:#aaa;font-size:0.9rem;">Game Type</label>
          <select id="editGameType" class="form-select mt-1">${gameTypeOptions}</select>
        </div>
        <div class="mb-4">
          <label style="color:#aaa;font-size:0.9rem;">Answer Key</label>
          <input id="editAnswerKey" class="form-control mt-1" value="${escapeHtml(game.answerKeyString)}" placeholder="e.g. 1A2B3C"/>
        </div>
        <div class="d-flex gap-2 justify-content-end">
          <button class="btn btn-secondary" onclick="document.getElementById('editGameModal').remove()">Cancel</button>
          <button class="btn btn-primary" onclick="saveEditGame(${game.id})">Save Changes</button>
        </div>
      </div>`;

    document.body.appendChild(modal);
  } catch (err) {
    showNeonToast('Failed to load game: ' + err.message, 'error');
  }
}

async function saveEditGame(gameId) {
  const gameName      = document.getElementById('editGameName')?.value?.trim();
  const gameType      = document.getElementById('editGameType')?.value;
  const answerKeyString = document.getElementById('editAnswerKey')?.value?.trim();

  if (!gameName || !gameType || !answerKeyString) {
    showNeonToast('All fields are required.', 'warning');
    return;
  }

  try {
    await apiFetch(`/api/teacher/games/${gameId}`, {
      method: 'PUT',
      body: { gameName, gameType, answerKeyString }
    });
    document.getElementById('editGameModal')?.remove();
    showNeonToast('&#10003; Game updated successfully!', 'success');
    await loadTeacherGames();
  } catch (err) {
    showNeonToast('&#10007; Update failed: ' + err.message, 'error');
  }
}

async function deleteGame(gameId, gameName) {
  if (!confirm(`Delete game "${gameName}"?\n\nThis will also remove all student attempts for this game.`)) return;

  try {
    await apiFetch(`/api/teacher/games/${gameId}`, { method: 'DELETE' });
    showNeonToast('&#128465; Game deleted.', 'success');
    await loadTeacherGames();
  } catch (err) {
    showNeonToast('&#10007; Delete failed: ' + err.message, 'error');
  }
}

//  STUDENT SPINNER — FETCH
// ─────────────────────────────────────────────────────────────

/**
 * Fetch all students from the backend.
 * Expected: GET /api/student → { students: [{id, name, totalScore}] }
 */
async function setupSpinnerCourseDropdown() {
  try {

    // Teacher ke courses
    const courses = await apiFetch('/api/courses/');

    const dropdown = document.getElementById('spinnerCourseFilter');

    if (!dropdown) return;

    dropdown.innerHTML = `
      <option value="">Select Course</option>
    `;

    courses.forEach(course => {
      dropdown.innerHTML += `
        <option value="${course.course_id}">
          ${course.course_name}
        </option>
      `;
    });

    // Course select event
    dropdown.addEventListener('change', async (e) => {

  const courseId = e.target.value;

  const batch =
    document.getElementById('spinnerBatchFilter').value.trim();

  if (!courseId || !batch) {

    students = [];

    drawEmptyWheel();

    return;
  }

  await fetchStudentsByCourse(courseId, batch);

});

const batchDropdown =
  document.getElementById('spinnerBatchFilter');

if (batchDropdown) {

  batchDropdown.addEventListener('change', async () => {

    const courseId =
      document.getElementById('spinnerCourseFilter').value;

    const batch = batchDropdown.value;

    if (!courseId || !batch) {

      students = [];

      drawEmptyWheel();

      return;
    }

    await fetchStudentsByCourse(courseId, batch);

  });

}
  } catch (err) {
    console.error(err);
  }
}


async function fetchStudentsByCourse(courseId, batch) {

  try {

    const result =
  await apiFetch(`/api/student/${courseId}/${batch}`);

    // Normalize snake_case fields (total_score, tests_completed) → camelCase
    // so the spinner blast overlay and control strip show correct scores on first spin.
    students = (result || []).map(s => ({
      ...s,
      totalScore:     typeof s.totalScore     === 'number' ? s.totalScore
                    : typeof s.total_score    === 'number' ? s.total_score    : 0,
      testsCompleted: typeof s.testsCompleted === 'number' ? s.testsCompleted
                    : typeof s.tests_completed=== 'number' ? s.tests_completed : 0,
    }));

    if (!students.length) {

      document.getElementById('noStudentsMsg')
        .classList.remove('hidden');

      syncCanvasSize();
      drawEmptyWheel();

      return;
    }

    document.getElementById('noStudentsMsg')
      .classList.add('hidden');

    syncCanvasSize();

    drawWheel(spinAngle);

  } catch (error) {

    students = [];

    document.getElementById('noStudentsMsg')
      .classList.remove('hidden');

    syncCanvasSize();

    drawEmptyWheel();

    console.error('Failed to fetch students:', error.message);
  }
}

// ─────────────────────────────────────────────────────────────
//  CANVAS SIZE SYNC
//  SPINNER SIZE FIX: match canvas pixel size to CSS layout size
// ─────────────────────────────────────────────────────────────

/**
 * Sync canvas.width / canvas.height to the wrapper's rendered CSS size.
 * Must be called after the CSS has settled (DOMContentLoaded + resize).
 */
function syncCanvasSize() {
  const wrap   = document.getElementById('wheelCanvasWrap');
  const canvas = document.getElementById('spinnerCanvas');
  if (!wrap || !canvas) return;

  // Use the wrapper's actual rendered square side
  const rect = wrap.getBoundingClientRect();
  const size = Math.round(rect.width);

  if (size > 0 && (canvas.width !== size || canvas.height !== size)) {
    canvas.width  = size;
    canvas.height = size;
  }
}

// ─────────────────────────────────────────────────────────────
//  CANVAS WHEEL — DRAW
// ─────────────────────────────────────────────────────────────

/**
 * Draw the spinning wheel on canvas.
 * Each segment = one student, colour cycles through WHEEL_COLORS.
 * @param {number} angle - current rotation in radians
 */
function drawWheel(angle) {
  const canvas = document.getElementById('spinnerCanvas');
  if (!canvas) return;

  // SPINNER SIZE FIX: re-sync size in case layout changed
  syncCanvasSize();

  const ctx    = canvas.getContext('2d');
  const W      = canvas.width;
  const H      = canvas.height;
  const cx     = W / 2;
  const cy     = H / 2;
  const radius = Math.min(cx, cy) - 6;
  const n      = students.length;

  ctx.clearRect(0, 0, W, H);

  if (!n) { drawEmptyWheel(); return; }

  const arc = (2 * Math.PI) / n;

  students.forEach((student, i) => {
    const startAngle = angle + i * arc;
    const endAngle   = startAngle + arc;
    const colors     = WHEEL_COLORS[i % WHEEL_COLORS.length];

    // Segment fill (radial gradient for depth)
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    grad.addColorStop(0, colors[0]);
    grad.addColorStop(1, colors[1]);

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Segment border
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Label — SPINNER SIZE FIX: scale font with canvas size
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(startAngle + arc / 2);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#fff';
    // Font scales between 11px (many students) and 22px (few students)
    const baseFontSize = Math.min(22, Math.max(11, (radius * 0.22) / Math.max(n / 8, 1)));
    ctx.font = `bold ${Math.round(baseFontSize)}px Nunito, sans-serif`;
    ctx.shadowColor = 'rgba(0,0,0,0.7)';
    ctx.shadowBlur  = 5;

    // Truncate long names
    const label = student.name.length > 16 ? student.name.slice(0, 15) + '…' : student.name;
    ctx.fillText(label, radius - 16, 6);
    ctx.restore();
  });

  // Outer rim
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = 'rgba(255,225,53,0.6)';
  ctx.lineWidth = 5;
  ctx.shadowColor = 'rgba(255,225,53,0.9)';
  ctx.shadowBlur  = 22;
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function drawEmptyWheel() {
  const canvas = document.getElementById('spinnerCanvas');
  if (!canvas) return;
  syncCanvasSize();
  const ctx = canvas.getContext('2d');
  const cx  = canvas.width / 2;
  const cy  = canvas.height / 2;
  const r   = cx - 6;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, 2 * Math.PI);
  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = 'rgba(240,242,255,0.4)';
  // SPINNER SIZE FIX: font scales with canvas
  const emptyFontSize = Math.max(14, Math.round(cx * 0.06));
  ctx.font = `bold ${emptyFontSize}px Nunito, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('No students yet', cx, cy - emptyFontSize * 0.8);
  ctx.font = `${emptyFontSize * 1.5}px sans-serif`;
  ctx.fillText('😴', cx, cy + emptyFontSize * 1.2);
}

// ─────────────────────────────────────────────────────────────
//  SPINNER — ANIMATION
// ─────────────────────────────────────────────────────────────

/**
 * Spin the wheel with ease-out physics.
 * Randomly picks a target student index and calculates the
 * exact stop angle so that student's segment faces the top pointer.
 */
function spinWheel() {
  if (isSpinning || !students.length) return;

  // BLAST EFFECT: clear previous blast before spinning again
  hideBlast();

  isSpinning = true;
  selectedStudent = null;

  // Reset selected UI
  hideScoringMessage();

  // Disable spin button
  const btn = document.getElementById('spinBtn');
  btn.disabled = true;
  document.getElementById('spinBtnText').textContent = 'Spinning…';

  // Pick a random winner
  const winnerIndex = Math.floor(Math.random() * students.length);
  const n           = students.length;
  const arc         = (2 * Math.PI) / n;

  // Target angle: winner segment centre lands at top (−π/2)
  const extraSpins   = (6 + Math.floor(Math.random() * 4)) * 2 * Math.PI;
  const targetOffset = -Math.PI / 2 - (winnerIndex * arc + arc / 2);
  let targetAngle    = targetOffset - spinAngle;
  targetAngle = ((targetAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  if (targetAngle < 0.1) targetAngle += 2 * Math.PI;
  const finalAngle   = spinAngle + extraSpins + targetAngle;

  // Ease-out animation
  const startAngle   = spinAngle;
  const totalDelta   = finalAngle - startAngle;
  const duration     = 4000 + Math.random() * 1500; // 4–5.5s
  let   startTime    = null;

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animate(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed  = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased    = easeOut(progress);

    spinAngle = startAngle + totalDelta * eased;
    drawWheel(spinAngle);

    if (progress < 1) {
      spinRAF = requestAnimationFrame(animate);
    } else {
      spinAngle = finalAngle % (2 * Math.PI);
      drawWheel(spinAngle);
      onSpinComplete(winnerIndex);
    }
  }

  spinRAF = requestAnimationFrame(animate);
}

/**
 * Called when the wheel finishes spinning.
 * Highlights the winner and shows the scoring panel.
 */
function onSpinComplete(winnerIndex) {
  isSpinning = false;
  selectedStudent = students[winnerIndex];

  const btn = document.getElementById('spinBtn');
  btn.disabled = false;
  document.getElementById('spinBtnText').textContent = 'Spin Again 🎡';

  // BLAST EFFECT: show big name overlay
  showBlast(selectedStudent);

  // Update compact controls bar
  showControlWho(selectedStudent);

  // Task 1: Fetch & display real-time score immediately after selection
  fetchAndRefreshStudentScore(selectedStudent);

  // Flash wheel rim
  flashWheel();

  addActionLog(`🎯 Spinner selected <strong>${escapeHtml(selectedStudent.name)}</strong>`);
}

// ─────────────────────────────────────────────────────────────
//  BLAST OVERLAY
//  BLAST EFFECT: dramatic full-stage name reveal
// ─────────────────────────────────────────────────────────────

let blastTimeout = null;
let blastSettleTimeout = null;

/** Show the blast overlay with the selected student's name. */
function showBlast(student) {
  const overlay = document.getElementById('blastOverlay');
  if (!overlay) return;

  document.getElementById('blastName').textContent  = student.name;
  // Fix #1: Always show '…' first; fetchAndRefreshStudentScore will fill real value immediately
  const blastScoreEl = document.getElementById('blastScore');
  if (blastScoreEl) {
    blastScoreEl.textContent = (typeof student.totalScore === 'number') ? student.totalScore : '…';
  }

  // FIXED OVERLAY ISSUE: clear settled state on each new spin
  overlay.classList.remove('hidden', 'blast-exit', 'blast-visible', 'blast-enter', 'blast-settled');
  void overlay.offsetWidth;
  overlay.classList.add('blast-enter');

  clearTimeout(blastTimeout);
  blastTimeout = setTimeout(() => {
    overlay.classList.remove('blast-enter');
    overlay.classList.add('blast-visible');
  }, 700);

  // ADDED AUTO FADE: settle to compact state after 2.5s
  clearTimeout(blastSettleTimeout);
  blastSettleTimeout = setTimeout(() => {
    overlay.classList.add('blast-settled');
  }, 2500);
}

/** CONTROL ACCESS FIX: settle immediately when teacher touches controls */
function settleBlastOnInteraction() {
  const overlay = document.getElementById('blastOverlay');
  if (overlay && !overlay.classList.contains('hidden')) {
    overlay.classList.add('blast-settled');
  }
}

/** Dismiss the blast overlay with exit animation. */
function hideBlast() {
  const overlay = document.getElementById('blastOverlay');
  if (!overlay || overlay.classList.contains('hidden')) return;
  clearTimeout(blastSettleTimeout); // ADDED AUTO FADE: cleanup
  overlay.classList.remove('blast-enter', 'blast-visible', 'blast-settled');
  overlay.classList.add('blast-exit');
  setTimeout(() => {
    overlay.classList.add('hidden');
    overlay.classList.remove('blast-exit');
  }, 420);
}

/** Update the "Selected:" strip in the controls zone. */
function showControlWho(student) {
  const nameEl  = document.getElementById('controlWhoName');
  const scoreEl = document.getElementById('controlWhoScore');
  if (nameEl)  nameEl.textContent  = student.name;
  // Fix #1: show real fetched score or '…' if not yet loaded
  if (scoreEl) scoreEl.textContent = (typeof student.totalScore === 'number') ? `${student.totalScore} pts` : '… pts';
}

/**
 * Fetch the student's real-time course-specific score from course_students.
 * Called automatically after the spinner selects a student.
 */
async function fetchAndRefreshStudentScore(student) {
  if (!student || !student.id) return;
  try {
    const courseId = document.getElementById('spinnerCourseFilter')?.value || '';
    const query    = courseId ? `?courseId=${encodeURIComponent(courseId)}` : '';
    const result   = await apiFetch(`/api/student/${student.id}/points${query}`);
    if (result && typeof result.totalScore === 'number') {
      student.totalScore = result.totalScore;
      const idx = students.findIndex(s => s.id === student.id);
      if (idx !== -1) students[idx].totalScore = result.totalScore;
      updateSelectedScore(result.totalScore);
    }
  } catch (_) {
    // Fallback: students-array value already shown; silently ignore
  }
}

function flashWheel() {
  const wrap = document.querySelector('.wheel-canvas-wrap');
  if (!wrap) return;
  wrap.classList.add('wheel-flash');
  setTimeout(() => wrap.classList.remove('wheel-flash'), 900);
}

// ─────────────────────────────────────────────────────────────
//  SELECTED STUDENT UI (backward-compat stubs)
// ─────────────────────────────────────────────────────────────

function showIdlePanel() {
  // Kept for backward compatibility — no-op in new layout
}

// Task 2: Reset selected student state with fade-out animation
function resetSelectedStudent() {
  const strip = document.getElementById('controlSelectedStrip');
  if (strip) {
    strip.style.transition = 'opacity 0.4s ease';
    strip.style.opacity = '0';
    setTimeout(() => {
      strip.style.opacity = '';
      strip.style.transition = '';
      const nameEl  = document.getElementById('controlWhoName');
      const scoreEl = document.getElementById('controlWhoScore');
      if (nameEl)  nameEl.textContent  = '—';
      if (scoreEl) scoreEl.textContent = '';
    }, 420);
  }

  // Also hide blast overlay if still showing
  const overlay = document.getElementById('blastOverlay');
  if (overlay && !overlay.classList.contains('hidden')) {
    overlay.classList.add('blast-exit');
    setTimeout(() => {
      overlay.classList.add('hidden');
      overlay.classList.remove('blast-exit');
    }, 420);
  }

  selectedStudent = null;
}

function showSelectedPanel(student) {
  // Kept for backward compatibility — visual handled by blast overlay
}

function updateSelectedScore(newScore) {
  if (selectedStudent) selectedStudent.totalScore = newScore;

  // Update in students array
  const idx = students.findIndex(s => s.id === selectedStudent?.id);
  if (idx !== -1) students[idx].totalScore = newScore;

  // BLAST EFFECT: keep blast overlay score in sync
  const blastScoreEl   = document.getElementById('blastScore');
  const controlScoreEl = document.getElementById('controlWhoScore');
  if (blastScoreEl)   blastScoreEl.textContent   = newScore;
  if (controlScoreEl) controlScoreEl.textContent = `${newScore} pts`;
}

// ─────────────────────────────────────────────────────────────
//  POINTS — UPDATE
// ─────────────────────────────────────────────────────────────

/**
 * Send points update to backend.
 * PUT /api/students/:id/points → { points: ±N }
 * @param {'add'|'deduct'} action
 */
async function updatePoints(action) {
  settleBlastOnInteraction(); // CONTROL ACCESS FIX

  if (!selectedStudent) {
    showScoringMessage('⚠️ Spin the wheel first to select a student.', 'warn');
    return;
  }

  const raw = parseInt(document.getElementById('pointsInput').value, 10);
  if (!raw || raw <= 0) {
    showScoringMessage('⚠️ Enter a valid points value (> 0).', 'warn');
    return;
  }

  const points = action === 'add' ? raw : -raw;

  try {
    const courseId = document.getElementById('spinnerCourseFilter')?.value || '';

    if (!courseId) {
      showScoringMessage('⚠️ Please select a course before updating points.', 'warn');
      return;
    }

    const result = await apiFetch(`/api/student/${selectedStudent.id}/points`, {
      method: 'PUT',
      body: { points, courseId: parseInt(courseId, 10) }
    });

    const newScore = result.totalScore ?? ((selectedStudent.totalScore ?? 0) + points);
    updateSelectedScore(newScore);

    const sign  = action === 'add' ? '+' : '–';
    const emoji = action === 'add' ? '🟢' : '🔴';
    showScoringMessage(`${emoji} ${sign}${raw} points applied to ${selectedStudent.name}!`, action === 'add' ? 'success' : 'deduct');
    addActionLog(`${emoji} <strong>${escapeHtml(selectedStudent.name)}</strong>: ${sign}${raw} points (now ${newScore})`);

    // Mini confetti on add
    if (action === 'add') launchMiniConfetti();

    // Task 2: Fade-out and reset selected student state after points applied
    setTimeout(() => {
      resetSelectedStudent();
    }, 1800);

  } catch (error) {
    showScoringMessage(`❌ Failed: ${error.message}`, 'error');
  }
}

// ─────────────────────────────────────────────────────────────
//  SCORING MESSAGE
// ─────────────────────────────────────────────────────────────

function showScoringMessage(text, type = 'success') {
  const el = document.getElementById('scoringMessage');
  if (!el) return;
  el.innerHTML = text;
  el.className = `scoring-message scoring-message-${type}`;
  el.classList.remove('hidden');
  clearTimeout(el._timeout);
  el._timeout = setTimeout(() => el.classList.add('hidden'), 3500);
}

function hideScoringMessage() {
  const el = document.getElementById('scoringMessage');
  if (el) el.classList.add('hidden');
}

// ─────────────────────────────────────────────────────────────
//  SESSION LOG
// ─────────────────────────────────────────────────────────────

function addActionLog(html) {
  actionLog.unshift({ html, time: new Date().toLocaleTimeString() });
  renderActionLog();
}

function renderActionLog() {
  const list = document.getElementById('actionsLogList');
  if (!list) return;

  if (!actionLog.length) {
    list.innerHTML = '<div class="arena-text-muted" style="font-size:0.85rem">Actions will appear here...</div>';
    return;
  }

  list.innerHTML = actionLog.slice(0, 10).map(entry => `
    <div class="log-entry">
      <span class="log-time">${entry.time}</span>
      <span>${entry.html}</span>
    </div>
  `).join('');
}

// ─────────────────────────────────────────────────────────────
//  MINI CONFETTI (on points add)
// ─────────────────────────────────────────────────────────────

function launchMiniConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  if (!canvas) return;
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx    = canvas.getContext('2d');
  const colors = ['#ffe135','#ff4fcb','#00e5ff','#39ff77','#ff4455'];
  const particles = Array.from({ length: 80 }, () => ({
    x: Math.random() * canvas.width,
    y: -10,
    w: 7 + Math.random() * 9,
    h: 4 + Math.random() * 6,
    color: colors[Math.floor(Math.random() * colors.length)],
    angle: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.18,
    vx: (Math.random() - 0.5) * 4,
    vy: 3 + Math.random() * 4,
    alpha: 1,
    decay: 0.013,
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    particles.forEach(p => {
      if (p.alpha <= 0.01) return;
      alive = true;
      p.x += p.vx; p.y += p.vy;
      p.angle += p.spin; p.alpha -= p.decay;
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
      ctx.restore();
    });
    if (alive) requestAnimationFrame(draw);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  draw();
}

// ─────────────────────────────────────────────────────────────
//  showAlert helper (used across pages)
// ─────────────────────────────────────────────────────────────

function showAlert(containerId, message, type = 'info', autoDismissMs = 5000) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${escapeHtml(message)}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>`;

  // Auto-dismiss with smooth fade-out
  if (autoDismissMs > 0) {
    const alertEl = el.querySelector('.alert');
    if (alertEl) {
      setTimeout(() => {
        alertEl.classList.remove('show');
        alertEl.addEventListener('transitionend', () => {
          if (alertEl.parentNode) alertEl.remove();
        }, { once: true });
        setTimeout(() => { if (alertEl.parentNode) alertEl.remove(); }, 500);
      }, autoDismissMs);
    }
  }
}


document.addEventListener('DOMContentLoaded', () => {
  loadCourseDropdown();

  const form = document.getElementById('createGameForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!generatedData) {
      showNeonToast('⚠️ Generate questions first!', 'warning');
      return;
    }

    const submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = '⏳ Saving…'; }

    try {
      const courseName = document.getElementById('courseName').value;
      const gameName   = document.getElementById('gameName').value;
      const gameType   = document.getElementById('gameType').value;

      await apiRequest('/api/teacher/games', {
        method: 'POST',
        body: {
          courseName,
          gameName,
          gameType,
          jsonText: JSON.stringify(generatedData),
          answerKeyString: generatedData.answerKeyString
        }
      });

      // Task 7: neon success toast at top center
      showNeonToast('🎮 Game created successfully!', 'success');

      // Reset preview after short delay
      setTimeout(() => {
        const preview = document.getElementById('questionsPreview');
        if (preview) {
          preview.innerHTML = `
            <div class="text-center py-5" style="color:var(--text-muted);">
              <div style="font-size:3.5rem;margin-bottom:1rem;">🎯</div>
              <p style="font-family:'Fredoka One',cursive;font-size:1.1rem;color:var(--text-primary);">
                Questions will appear here
              </p>
              <p style="font-size:0.85rem;">Fill in the settings and click Generate Questions</p>
            </div>`;
        }
        const previewActions = document.getElementById('previewActions');
        if (previewActions) previewActions.style.display = 'none';
        generatedData = null;
      }, 1800);

    } catch (err) {
      showNeonToast('❌ ' + err.message, 'error');
    } finally {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = '🚀 Save Game'; }
    }
  });
});


async function generateQuestions() {
  const btn = document.getElementById('generateBtn');

  if (btn) {
    btn.disabled = true;
    btn.textContent = '⏳ Generating…';
  }

  const courseName     = document.getElementById('courseName').value;
  const gameName       = document.getElementById('gameName').value;
  const questionCount  = document.getElementById('questionCount').value;
  const conditions     = document.getElementById('conditions').value;

  // Show loading state in preview pane
  const preview = document.getElementById('questionsPreview');
  if (preview) {
    preview.innerHTML = `
      <div class="text-center py-5" style="color:var(--text-muted);">
        <div class="spinner-glow mx-auto mb-3"></div>
        <p style="font-family:'Fredoka One',cursive;color:var(--text-primary);">Generating questions…</p>
        <p style="font-size:0.82rem;">AI is crafting your MCQs</p>
      </div>`;
  }

  try {
    const res = await apiRequest('/api/teacher/generate-questions', {
      method: 'POST',
      body: { courseName, gameName, questionCount, conditions }
    });

    generatedData = res;
    renderQuestions(res.questions);
    showNeonToast('✅ Questions generated!', 'success');

  } catch (err) {
    showNeonToast('❌ ' + err.message, 'error');
    if (preview) {
      preview.innerHTML = `
        <div class="text-center py-5" style="color:var(--neon-red);">
          <div style="font-size:3rem;margin-bottom:1rem;">⚠️</div>
          <p style="font-family:'Fredoka One',cursive;">Generation failed</p>
          <p style="font-size:0.85rem;color:var(--text-muted);">${escapeHtml(err.message)}</p>
        </div>`;
    }
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = '⚡ Generate Questions';
    }
  }
}

function renderQuestions(questions) {
  const container = document.getElementById('questionsPreview');
  if (!container) return;

  // Show save button
  const previewActions = document.getElementById('previewActions');
  if (previewActions) previewActions.style.display = 'flex';

  container.innerHTML = questions.map((q, idx) => `
    <div class="question-preview-card" style="animation-delay:${idx * 0.08}s;">
      <div class="d-flex justify-content-between align-items-start mb-3 flex-wrap gap-2">
        <span class="question-preview-number">Q${q.no}</span>
        <button
          class="teacher-action-btn btn-restart-game"
          onclick="regenerateQuestion(${q.no})"
        >🔄 Change Questions</button>
      </div>

      <div class="question-preview-text">${escapeHtml(q.question)}</div>

      ${q.code ? `
        <pre class="question-code-block">${escapeHtml(q.code)}</pre>
      ` : ''}

      <div class="mb-2">
        ${q.options.map(opt => `
          <div class="question-preview-option ${opt.id === q.correctAnswer ? 'correct-opt' : ''}">
            <span style="font-family:'Fredoka One',cursive;font-size:0.9rem;min-width:1.4rem;flex-shrink:0;">
              ${escapeHtml(opt.id)}.
            </span>
            <span>${escapeHtml(opt.text)}</span>
            ${opt.id === q.correctAnswer
              ? '<span style="margin-left:auto;font-size:0.82rem;">✅</span>'
              : ''}
          </div>
        `).join('')}
      </div>

      <div class="question-preview-correct">
        ✅ Correct: <strong style="margin-left:0.3rem;">${escapeHtml(q.correctAnswer)}</strong>
      </div>
    </div>
  `).join('');
}

async function regenerateQuestion(questionNo) {
  const courseName = document.getElementById('courseName').value;
  // const topic = document.getElementById('topic').value;

  try {
    const res = await apiRequest('/api/teacher/regenerate-question', {
      method: 'POST',
      body: {
  courseName,
  gameName: document.getElementById('gameName').value,
  questionNo
}
    });

    const index = generatedData.questions.findIndex(q => q.no === questionNo);
    generatedData.questions[index] = res;

    updateAnswerKey();
    renderQuestions(generatedData.questions);

  } catch (err) {
    alert(err.message);
  }
}

function updateAnswerKey() {
  let key = '';

  generatedData.questions.forEach(q => {
    key += `${q.no}${q.correctAnswer}`;
  });

  generatedData.answerKeyString = key;
}

async function loadCourseDropdown() {
  try {
    const courses = await apiRequest('/api/courses/');

    const dropdown = document.getElementById('courseName');

    if (!dropdown) return;

    dropdown.innerHTML = `
      <option value="">Select Course</option>
    `;

    courses.forEach(course => {
      dropdown.innerHTML += `
        <option value="${course.course_name}">
          ${course.course_name}
        </option>
      `;
    });

  } catch (err) {
    console.error(err);
  }
}


async function loadTeacherCourses() {
  try {
    const courses = await apiRequest('/api/courses/');

    const tbody = document.getElementById('coursesTableBody');

    if (!tbody) return;

    if (!courses.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="3" class="text-center">
            No courses found
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = courses.map(course => `
      <tr>
        <td>${course.course_id}</td>

        <td>${escapeHtml(course.course_name)}</td>

        <td>
          <button
            class="btn btn-danger btn-sm"
            onclick="deleteCourse(${course.course_id})"
          >
            Delete
          </button>
        </td>
      </tr>
    `).join('');

  } catch (err) {
    console.error(err);
    showAlert('courseMessage', err.message, 'danger');
  }
}

async function createCourse() {
  try {
    const course_name =
      document.getElementById('newCourseName').value.trim();

    if (!course_name) {
      showAlert('courseMessage', 'Course name required', 'warning');
      return;
    }

    await apiRequest('/api/courses/create-course', {
      method: 'POST',
      body: {
        course_name
      }
    });

    document.getElementById('newCourseName').value = '';

    showAlert(
      'courseMessage',
      'Course created successfully!',
      'success'
    );

    await loadTeacherCourses();
    await loadCourses();

  } catch (err) {
    showAlert('courseMessage', err.message, 'danger');
  }
}

async function deleteCourse(courseId) {
  try {

    if (!confirm('Delete this course?')) {
      return;
    }

    await apiRequest(`/api/courses/${courseId}`, {
      method: 'DELETE'
    });

    showAlert(
      'courseMessage',
      'Course deleted successfully!',
      'success'
    );

    await loadTeacherCourses();
    await loadCourses();

  } catch (err) {
    showAlert('courseMessage', err.message, 'danger');
  }
}

async function loadBatches() {
  try {

    const batches = await apiFetch('/api/student/batches');

    const dropdown =
      document.getElementById('spinnerBatchFilter');

    if (!dropdown) return;

    dropdown.innerHTML = `
      <option value="">Choose Batch</option>
    `;

    batches.forEach(item => {

      dropdown.innerHTML += `
        <option value="${item.batch}">
          ${item.batch}
        </option>
      `;
    });

  } catch (err) {
    console.error(err);
  }
}
