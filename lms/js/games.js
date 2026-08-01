import { api } from './api.js';
import { loader } from './loader.js';
import { toast } from './toast.js';
import { storage } from './storage.js';
import { validation } from './validation.js';
import { GAME_TYPES, formatSeconds, buildQuestionsPrompt, buildAnswerKeyPrompt, getGameDescription } from './gameTypesConfig.js';

let gamesList = [];
let currentPage = 1;
let totalPages = 1;

// ==========================================
// Teacher: List and Search Games (games.html)
// ==========================================
export async function loadTeacherGamesTable(queryParams = {}) {
  const tbody = document.getElementById('games-table-body');
  if (!tbody) return;

  try {
    loader.show('Loading educational games...');
    const res = await api.getGames({
      page: currentPage,
      limit: 10,
      ...queryParams
    });
    loader.hide();

    if (res.success && res.data) {
      gamesList = res.data;
      renderTeacherGamesTable(gamesList);
      renderPagination(res.pagination, 'teacher');
    }
  } catch (error) {
    loader.hide();
    tbody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Error: ${error.message}</td></tr>`;
  }
}

function renderTeacherGamesTable(list) {
  const tbody = document.getElementById('games-table-body');
  const emptyState = document.getElementById('empty-state-container');
  const tableWrapper = document.getElementById('table-wrapper-container');

  if (!tbody) return;

  if (list.length === 0) {
    if (tableWrapper) tableWrapper.style.display = 'none';
    if (emptyState) {
      emptyState.style.display = 'block';
      emptyState.innerHTML = `
        <div class="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
          <div class="text-muted fs-1 mb-2"><i class="bi bi-controller"></i></div>
          <h5 class="fw-bold mb-2">No Games Created</h5>
          <p class="text-secondary small mb-0">Use the Create Game button to set up your first classroom quiz.</p>
        </div>
      `;
    } else {
      tbody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-muted">No games found.</td></tr>`;
    }
    return;
  }

  if (tableWrapper) tableWrapper.style.display = 'block';
  if (emptyState) emptyState.style.display = 'none';

  tbody.innerHTML = list.map(game => {
    const typeLabel = (GAME_TYPES[game.game_type] && GAME_TYPES[game.game_type].label) || game.game_type || '-';

    let statusBtn = '';
    if (game.status === 'draft') {
      statusBtn = `<button class="btn btn-sm btn-success rounded-pill px-3 py-1 status-toggle-btn d-inline-flex align-items-center gap-1" data-id="${game.game_id}" data-next-status="active"><i class="bi bi-play-fill"></i> Start</button>`;
    } else if (game.status === 'active') {
      statusBtn = `<button class="btn btn-sm btn-danger rounded-pill px-3 py-1 status-toggle-btn d-inline-flex align-items-center gap-1" data-id="${game.game_id}" data-next-status="inactive"><i class="bi bi-stop-fill"></i> Stop</button>`;
    } else {
      statusBtn = `<button class="btn btn-sm status-toggle-btn d-inline-flex align-items-center gap-1 rounded-pill px-3 py-1" data-id="${game.game_id}" data-next-status="active" style="background-color: rgba(255, 193, 7, 0.12) !important; color: #ffd54f !important; border: 1px solid rgba(255, 193, 7, 0.3) !important;"><i class="bi bi-arrow-clockwise"></i> Restart</button>`;
    }

    return `
      <tr class="game-row" data-id="${game.game_id}" style="cursor: pointer;">
        <td><span class="badge bg-light text-info border rounded-pill px-2.5 py-1">${typeLabel}</span></td>
        <td><span class="badge bg-light text-primary border rounded-pill px-2.5 py-1">${game.course_name}</span></td>
        <td>
          <div class="fw-semibold text-slate-800">${game.game_name}</div>
          <small class="text-muted d-block" style="font-size: 0.75rem;">Unit: ${game.unit_name || '-'}</small>
        </td>
        <td>${statusBtn}</td>
      </tr>
      <tr class="action-row" id="actions-row-${game.game_id}" style="display: none; background-color: rgba(139, 92, 246, 0.05) !important;">
        <td colspan="4" style="border-top: none;">
          <div class="px-4 py-3 d-flex align-items-center gap-3">
            <span class="text-secondary small fw-semibold text-uppercase tracking-wider"><i class="bi bi-gear-fill me-1 text-primary"></i> Console Actions:</span>
            <a href="edit-game.html?id=${game.game_id}" class="btn btn-sm btn-outline-primary rounded-pill px-3 py-1 d-inline-flex align-items-center gap-1.5" style="font-size: 0.8rem;">
              <i class="bi bi-pencil"></i> Edit Properties
            </a>
            <button class="btn btn-sm btn-outline-danger rounded-pill px-3 py-1 delete-game-btn" data-id="${game.game_id}" data-name="${game.game_name}" style="font-size: 0.8rem;">
              <i class="bi bi-trash"></i> Delete Game
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Bind click listener on game row to toggle its action row
  tbody.querySelectorAll('.game-row').forEach(row => {
    row.addEventListener('click', (e) => {
      // Don't toggle if user clicked on status button
      if (e.target.closest('.status-toggle-btn')) return;

      const gameId = row.getAttribute('data-id');
      const actionRow = document.getElementById(`actions-row-${gameId}`);
      if (actionRow) {
        const isCollapsed = actionRow.style.display === 'none';
        
        // Hide other open action rows
        tbody.querySelectorAll('.action-row').forEach(r => r.style.display = 'none');
        
        if (isCollapsed) {
          actionRow.style.display = 'table-row';
        } else {
          actionRow.style.display = 'none';
        }
      }
    });
  });

  // Bind status toggle click events
  tbody.querySelectorAll('.status-toggle-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const newStatus = btn.getAttribute('data-next-status');
      try {
        loader.show('Updating status...');
        const res = await api.updateGameStatus(id, newStatus);
        loader.hide();
        if (res.success) {
          if (newStatus !== 'active') {
            toast.success(res.message || 'Game status updated successfully.');
          }
          loadTeacherGamesTable();
        }
      } catch (err) {
        loader.hide();
        toast.error(err.message);
        loadTeacherGamesTable();
      }
    });
  });

  tbody.querySelectorAll('.delete-game-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = e.currentTarget.getAttribute('data-id');
      const name = e.currentTarget.getAttribute('data-name');
      confirmDeleteGame(id, name);
    });
  });
}

function confirmDeleteGame(id, name) {
  import('../components/modal.js').then(({ modal }) => {
    modal.show({
      title: 'Delete Quiz Game',
      body: `Are you sure you want to delete game quiz <strong>${name}</strong>? This action cannot be undone.`,
      confirmText: 'Delete Quiz',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          loader.show('Deleting game...');
          const res = await api.deleteGame(id);
          loader.hide();
          if (res.success) {
            toast.success(res.message || 'Game deleted successfully.');
            loadTeacherGamesTable();
          }
        } catch (error) {
          loader.hide();
          toast.error(error.message);
        }
      }
    });
  });
}

// ==========================================
// Student: Available Games (games.html)
// ==========================================
export async function loadStudentGames(queryParams = {}) {
  const container = document.getElementById('student-games-container');
  if (!container) return;

  try {
    loader.show('Retrieving games list...');
    const res = await api.getStudentGames({
      page: currentPage,
      limit: 9,
      ...queryParams
    });
    loader.hide();

    if (res.success && res.data) {
      gamesList = res.data;
      renderStudentGames(gamesList, 'student-games-container');
      renderPagination(res.pagination, 'student');
    }
  } catch (error) {
    loader.hide();
    container.innerHTML = `<div class="col-12 text-center text-danger py-4">Error: ${error.message}</div>`;
  }
}

// ==========================================
// Student: Active Games widget on the Dashboard
// (the standalone Games list page section has been removed — any game a
// teacher marks Active now surfaces here so the student can jump straight
// into it without navigating to a separate page)
// ==========================================
export async function loadDashboardActiveGames(containerId = 'dashboard-active-games', limit = 4) {
  const container = document.getElementById(containerId);
  if (!container) return;

  try {
    const res = await api.getStudentGames({ page: 1, limit });
    if (res.success && res.data) {
      renderStudentGames(res.data, containerId, { compact: true });
    } else {
      container.innerHTML = `<div class="col-12 text-center text-muted small py-3">Could not load active games.</div>`;
    }
  } catch (error) {
    container.innerHTML = `<div class="col-12 text-center text-danger small py-3">Error: ${error.message}</div>`;
  }
}

function renderStudentGames(list, containerId = 'student-games-container', options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const compact = !!options.compact;

  if (list.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center ${compact ? 'py-4' : 'py-5'} text-muted bg-white card rounded-4 border-0 shadow-sm">
        <i class="bi bi-controller fs-1 text-slate-300 d-block mb-2"></i>
        No educational quiz games are currently assigned to your streams.
      </div>
    `;
    return;
  }

  const typeMeta = {
    Rapid_fire: { icon: 'bi-lightning-charge-fill', color: '#ff5c5c' },
    Bonus_Points: { icon: 'bi-gem', color: '#f59e0b' },
    Negative_Marking: { icon: 'bi-exclamation-triangle-fill', color: '#dc3545' },
    No_negative_marking: { icon: 'bi-shield-check', color: '#198754' },
    Kbc: { icon: 'bi-trophy-fill', color: '#6f42c1' }
  };

  container.innerHTML = list.map(game => {
    const meta = typeMeta[game.game_type] || { icon: 'bi-controller', color: '#0d6efd' };
    const typeLabel = (GAME_TYPES[game.game_type] && GAME_TYPES[game.game_type].label) || 'Quiz Game';

    if (compact) {
      const actionButtons = game.already_attempted ? `
          <div class="d-flex gap-2 w-100">
            <button class="btn btn-sm btn-secondary rounded-pill px-2 flex-fill w-100" disabled style="font-size: 0.75rem;">
              <i class="bi bi-check-circle-fill me-1"></i>Already Attempted
            </button>
          </div>
      ` : `
          <div class="d-flex gap-2">
            <button class="btn btn-sm btn-outline-primary rounded-pill px-2 flex-fill view-student-game-btn" data-id="${game.game_id}" style="font-size: 0.75rem;">
              Details
            </button>
            <button class="btn btn-sm btn-primary rounded-pill px-2 flex-fill start-student-game-btn" data-id="${game.game_id}" data-time="${game.time_limit}" data-game-type="${game.game_type}" style="font-size: 0.75rem;">
              Play Now
            </button>
          </div>
      `;

      return `
      <div class="col-md-6">
        <div class="card border-0 shadow-sm rounded-4 h-100 bg-white p-3 dash-game-card" data-game-type="${game.game_type}" style="--card-accent: ${meta.color};">
          <div class="d-flex align-items-center gap-2 mb-2">
            <div class="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style="width: 34px; height: 34px; background-color: ${meta.color}22; color: ${meta.color};">
              <i class="bi ${meta.icon}"></i>
            </div>
            <h6 class="fw-bold mb-0 text-slate-800 text-truncate">${game.game_name}</h6>
          </div>
          <div class="mb-2">
            <span class="badge rounded-pill px-2 py-1 me-1" style="background-color: ${meta.color}22; color: ${meta.color}; border: 1px solid ${meta.color}55; font-size: 0.65rem;">${typeLabel}</span>
            <span class="badge bg-light text-secondary border rounded-pill px-2 py-1" style="font-size: 0.65rem;">${game.course_name}</span>
          </div>
          <div class="d-flex justify-content-between text-muted small mb-3" style="font-size: 0.75rem;">
            <span><strong>${game.total_questions}</strong> Qs</span>
            <span><strong>${formatSeconds(game.time_limit)}</strong></span>
          </div>
          ${actionButtons}
        </div>
      </div>
      `;
    }

    const actionButtons = game.already_attempted ? `
        <div class="d-flex gap-2 w-100">
          <button class="btn btn-sm btn-secondary rounded-pill px-3 flex-fill w-100" disabled>
            <i class="bi bi-check-circle-fill me-1"></i>Already Attempted
          </button>
        </div>
    ` : `
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-outline-primary rounded-pill px-3 flex-fill view-student-game-btn" data-id="${game.game_id}">
            View Details
          </button>
          <button class="btn btn-sm btn-primary rounded-pill px-3 flex-fill start-student-game-btn" data-id="${game.game_id}" data-time="${game.time_limit}" data-game-type="${game.game_type}">
            Start Game
          </button>
        </div>
    `;

    return `
    <div class="col-md-6 col-lg-4">
      <div class="card border-0 shadow-sm rounded-4 h-100 bg-white p-4 d-flex flex-column justify-content-between dash-game-card" data-game-type="${game.game_type}" style="--card-accent: ${meta.color};">
        <div>
          <div class="d-flex align-items-center gap-2 mb-3">
            <div class="rounded-circle d-flex align-items-center justify-content-center" style="width: 42px; height: 42px; background-color: ${meta.color}22; color: ${meta.color};">
              <i class="bi ${meta.icon}"></i>
            </div>
            <h5 class="fw-bold mb-0 text-slate-800">${game.game_name}</h5>
          </div>

          <div class="mb-3">
            <span class="badge rounded-pill px-2.5 py-1 me-1" style="background-color: ${meta.color}22; color: ${meta.color}; border: 1px solid ${meta.color}55;">${typeLabel}</span>
            <span class="badge bg-light text-primary border rounded-pill px-2.5 py-1 me-1">${game.course_name}</span>
            <span class="badge bg-light text-secondary border rounded-pill px-2.5 py-1">${game.stream_name}</span>
          </div>

          <p class="text-secondary small mb-3 text-truncate-2">${getGameDescription(game.game_type)}</p>

          <div class="d-flex justify-content-between text-muted small pt-2 border-top mb-4">
            <span>Questions: <strong>${game.total_questions}</strong></span>
            <span>Limit: <strong>${formatSeconds(game.time_limit)}</strong></span>
          </div>
        </div>

        ${actionButtons}
      </div>
    </div>
  `;
  }).join('');

  // Bind View Details buttons
  container.querySelectorAll('.view-student-game-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      window.location.href = `./game-details.html?id=${id}`;
    });
  });

  // Bind Start Quiz buttons
  container.querySelectorAll('.start-student-game-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const time = e.currentTarget.getAttribute('data-time');
      const type = e.currentTarget.getAttribute('data-game-type');
      confirmStartQuiz(id, time, type);
    });
  });
}

function confirmStartQuiz(gameId, timeLimitSeconds, gameType) {
  const desc = gameType ? getGameDescription(gameType) : '';
  const descHtml = desc 
    ? `<div class="alert alert-info border-0 rounded-4 text-start mb-3" style="font-size: 0.85rem; line-height: 1.4;">
         <i class="bi bi-info-circle-fill me-2"></i><strong>Rules & Marking Scheme:</strong><br>${desc}
       </div>`
    : '';

  import('../components/modal.js').then(({ modal }) => {
    modal.show({
      title: 'Start Quiz Game',
      body: `
        ${descHtml}
        <p class="mb-0 text-slate-700">You are about to start this quiz. You will have exactly <strong>${formatSeconds(timeLimitSeconds)}</strong> to answer all questions. Click Start Game to begin!</p>
      `,
      confirmText: 'Start Game',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          loader.show('Launching quiz session...');
          const res = await api.startGame(gameId);
          loader.hide();

          if (res.success && res.data) {
            toast.success(res.message || 'Game session started.');
            
            // Store details in local cache
            localStorage.setItem('active_attempt_id', res.data.attempt_id);
            localStorage.setItem('active_game_time_limit', timeLimitSeconds);

            setTimeout(() => {
              window.location.href = `./quiz.html`;
            }, 1000);
          }
        } catch (error) {
          loader.hide();
          toast.error(error.message);
        }
      }
    });
  });
}

function renderPagination(pagination, role) {
  const container = document.getElementById('pagination-container');
  if (!container || !pagination) return;

  currentPage = pagination.current_page || pagination.page;
  totalPages = pagination.total_pages;

  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  let html = `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}"><button class="page-link" data-page="${currentPage - 1}">Previous</button></li>`;
  for (let i = 1; i <= totalPages; i++) {
    html += `<li class="page-item ${currentPage === i ? 'active' : ''}"><button class="page-link" data-page="${i}">${i}</button></li>`;
  }
  html += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}"><button class="page-link" data-page="${currentPage + 1}">Next</button></li>`;

  container.innerHTML = html;

  container.querySelectorAll('.page-link').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const page = parseInt(e.target.getAttribute('data-page'));
      if (page >= 1 && page <= totalPages) {
        currentPage = page;
        if (role === 'teacher') loadTeacherGamesTable();
        else loadStudentGames();
      }
    });
  });
}

// ==========================================
// Search and Filter Setup
// ==========================================
export async function populateGameFilters() {
  const courseSelect = document.getElementById('filter-course');
  const streamSelect = document.getElementById('filter-stream');
  if (!courseSelect || !streamSelect) return;

  try {
    const [coursesRes, streamsRes] = await Promise.all([
      api.getMyCourses().catch(() => ({ success: false, data: [] })),
      api.getMyStreams().catch(() => ({ success: false, data: [] }))
    ]);

    if (coursesRes.success) {
      courseSelect.innerHTML = '<option value="">All Courses</option>' +
        coursesRes.data.map(c => `<option value="${c.course_id}">${c.course_name}</option>`).join('');
    }

    if (streamsRes.success) {
      streamSelect.innerHTML = '<option value="">All Streams</option>' +
        streamsRes.data.map(s => `<option value="${s.stream_id}">${s.stream_name}</option>`).join('');
    }
  } catch (e) {
    console.error(e);
  }
}

export function setupGameFilters() {
  const courseSelect = document.getElementById('filter-course');
  const streamSelect = document.getElementById('filter-stream');
  const unitInput = document.getElementById('filter-unit');

  const getFilters = () => {
    const filters = {};
    if (courseSelect && courseSelect.value) filters.course_id = courseSelect.value;
    if (streamSelect && streamSelect.value) filters.stream_id = streamSelect.value;
    if (unitInput && unitInput.value.trim()) filters.unit_name = unitInput.value.trim();
    return filters;
  };

  const triggerFilterUpdate = () => {
    currentPage = 1;
    const role = storage.getRole();
    if (role === 'teacher') loadTeacherGamesTable(getFilters());
    else loadStudentGames(getFilters());
  };

  if (courseSelect) {
    courseSelect.addEventListener('change', triggerFilterUpdate);
  }

  if (streamSelect) {
    streamSelect.addEventListener('change', triggerFilterUpdate);
  }

  let debounceTimeout;
  if (unitInput) {
    unitInput.addEventListener('input', () => {
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(triggerFilterUpdate, 350);
    });
  }
}

// ==========================================
// Student: Game Details preview (game-details.html)
// ==========================================
async function loadStudentGamePreview(id) {
  const container = document.getElementById('student-game-details-preview');
  if (!container) return;

  try {
    loader.show('Loading game preview...');
    const res = await api.getGameDetails(id);
    loader.hide();
    if (res.success && res.data) {
      const game = res.data;
      const meta = typeMeta[game.game_type] || { icon: 'bi-controller', color: '#0d6efd' };
      const typeLabel = (GAME_TYPES[game.game_type] && GAME_TYPES[game.game_type].label) || 'Quiz Game';
      
      container.innerHTML = `
        <div class="row justify-content-center">
          <div class="col-lg-8">
            <div class="card border-0 shadow-sm rounded-4 p-5 bg-white text-center">
              <div class="rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 70px; height: 70px; background-color: ${meta.color}22; color: ${meta.color};">
                <i class="bi ${meta.icon}" style="font-size: 2.2rem;"></i>
              </div>
              <h2 class="fw-bold mb-2 text-slate-800">${game.game_name}</h2>
              <p class="text-secondary small mb-3">${game.course_name} • ${game.stream_name}</p>
              <div class="mb-4">
                <span class="badge rounded-pill px-3 py-1.5" style="background-color: ${meta.color}22; color: ${meta.color}; border: 1px solid ${meta.color}55; font-size: 0.8rem;">
                  ${typeLabel}
                </span>
              </div>
 
              <div class="bg-light p-4 rounded-4 mb-4 text-start" style="border: 1px dashed #4a5b78;">
                <h6 class="fw-bold text-slate-700 mb-2"><i class="bi bi-info-circle-fill text-secondary me-1.5"></i>Description</h6>
                <p class="text-secondary small mb-0">${getGameDescription(game.game_type)}</p>
              </div>

              <div class="row g-3 mb-5">
                <div class="col-6 col-sm-3 border-end">
                  <div class="text-muted small">Total Questions</div>
                  <h4 class="fw-bold mt-1 mb-0">${game.total_questions}</h4>
                </div>
                <div class="col-6 col-sm-3 border-end-sm">
                  <div class="text-muted small">Time Limit</div>
                  <h4 class="fw-bold mt-1 mb-0">${formatSeconds(game.time_limit)}</h4>
                </div>
                <div class="col-6 col-sm-3 border-end">
                  <div class="text-muted small">Total Players</div>
                  <h4 class="fw-bold mt-1 mb-0">${game.total_players || 0}</h4>
                </div>
                <div class="col-6 col-sm-3">
                  <div class="text-muted small">Total Attempts</div>
                  <h4 class="fw-bold mt-1 mb-0">${game.total_attempts || 0}</h4>
                </div>
              </div>

              <div class="d-flex justify-content-center gap-2">
                <a href="./games.html" class="btn btn-light border rounded-pill px-4">Back to List</a>
                <button class="btn btn-primary rounded-pill px-4" id="btn-start-preview-quiz">Start Game</button>
              </div>
            </div>
          </div>
        </div>
      `;

      document.getElementById('btn-start-preview-quiz').addEventListener('click', () => {
        confirmStartQuiz(game.game_id, game.time_limit, game.game_type);
      });
    }
  } catch (error) {
    loader.hide();
    container.innerHTML = `<div class="alert alert-danger border-0">${error.message}</div>`;
  }
}

// ==========================================
// Teacher: Create Game Multi-Step Builder
// ==========================================
let currentStep = 1;
let activeTab = 'builder'; // 'builder' (paste JSON) or 'json' (upload file)
let uploadedQuestions = null;
let uploadedAnswers = null;
let pastedQuestions = null;
let pastedAnswers = null;

// ==========================================
// Shared: Render fixed config summary (Step 2) for a game type
// ==========================================
function renderGameConfigSummary(gameType, targetId = 'game-config-summary') {
  const container = document.getElementById(targetId);
  if (!container) return;

  const config = GAME_TYPES[gameType];

  if (!config) {
    container.innerHTML = `<div class="col-12 text-secondary small">Select a Game Type in Step 1 to see fixed questions, time limit and marks.</div>`;
    // Reset hidden fields
    const tq = document.getElementById('total-questions');
    const tl = document.getElementById('time-limit');
    if (tq) tq.value = '';
    if (tl) tl.value = '';
    return;
  }

  const perQuestionCard = config.per_question_time_seconds
    ? `
      <div class="col-6 col-md-3">
        <div class="bg-light border rounded-4 p-3 text-center h-100">
          <div class="text-muted small mb-1">Time / Question</div>
          <div class="fw-bold text-slate-800">${config.per_question_time_seconds} sec</div>
        </div>
      </div>`
    : '';

  container.innerHTML = `
    <div class="col-6 col-md-3">
      <div class="bg-light border rounded-4 p-3 text-center h-100">
        <div class="text-muted small mb-1">Total Questions</div>
        <div class="fw-bold text-slate-800">${config.total_questions}</div>
      </div>
    </div>
    <div class="col-6 col-md-3">
      <div class="bg-light border rounded-4 p-3 text-center h-100">
        <div class="text-muted small mb-1">Total Time</div>
        <div class="fw-bold text-slate-800">${formatSeconds(config.total_time_seconds)}</div>
      </div>
    </div>
    ${perQuestionCard}
    <div class="col-12 col-md-${config.per_question_time_seconds ? '3' : '6'}">
      <div class="bg-light border rounded-4 p-3 text-center h-100">
        <div class="text-muted small mb-1">Marking Scheme</div>
        <div class="fw-bold text-slate-800 small">${config.marks_display}</div>
      </div>
    </div>
  `;

  // Keep hidden fields in sync for any legacy reads
  const tq = document.getElementById('total-questions');
  const tl = document.getElementById('time-limit');
  if (tq) tq.value = config.total_questions;
  if (tl) tl.value = config.total_time_seconds;
}

// ==========================================
// Shared: Refresh the two ChatGPT prompt textareas (Questions + Answer Key)
// ==========================================
function refreshChatGptPrompt() {
  const questionsBox = document.getElementById('chatgpt-questions-prompt-box');
  const answersBox = document.getElementById('chatgpt-answers-prompt-box');
  if (!questionsBox && !answersBox) return;

  const gameType = document.getElementById('game-type')?.value;
  const courseSelect = document.getElementById('course-id');
  const courseName = courseSelect?.selectedOptions?.[0]?.textContent?.trim() || '';
  const gameTitle = document.getElementById('game-name')?.value?.trim() || '';
  const unitName = document.getElementById('unit-name')?.value?.trim() || '';

  if (!gameType) {
    const placeholder = 'Complete Step 1 (Course, Game Title, Unit Section Name, Game Type) to generate your ChatGPT prompt.';
    if (questionsBox) questionsBox.value = placeholder;
    if (answersBox) answersBox.value = placeholder;
    return;
  }

  if (questionsBox) questionsBox.value = buildQuestionsPrompt({ gameType, courseName, gameTitle, unitName });
  if (answersBox) answersBox.value = buildAnswerKeyPrompt({ gameType, courseName, gameTitle, unitName });
}

// ==========================================
// Shared: Auto-fill the (read-only) Description field based on Game Type.
// Teachers never type their own description — every game of a given type
// always ships with the same fixed description text.
// ==========================================
function syncFixedDescription() {
  const descriptionEl = document.getElementById('description');
  if (!descriptionEl) return;
  const gameType = document.getElementById('game-type')?.value;
  descriptionEl.value = gameType ? getGameDescription(gameType) : '';
}

// ==========================================
// Shared: One-click "Copy" button binder for a prompt textarea
// ==========================================
function bindCopyPromptButton(buttonId, boxId, successMessage) {
  const btn = document.getElementById(buttonId);
  if (!btn) return;
  btn.addEventListener('click', async () => {
    const box = document.getElementById(boxId);
    if (!box) return;
    try {
      await navigator.clipboard.writeText(box.value);
      toast.success(successMessage);
    } catch (e) {
      box.select();
      document.execCommand('copy');
      toast.success(successMessage);
    }
  });
}

// ==========================================
// Shared: Clean up raw ChatGPT output into parseable JSON.
// Handles: markdown code fences (```json ... ```), stray text before/after
// the array, and teachers accidentally pasting BOTH the "QUESTIONS JSON"
// and "ANSWER KEY JSON" blocks into a single box.
// ==========================================
function extractJsonArrayText(rawText, kind) {
  // kind: 'questions' | 'answers'
  let text = rawText.trim();

  // Strip markdown code fences like ```json ... ``` or ``` ... ```
  text = text.replace(/```json/gi, '```').split('```').join('');

  // If both labelled blocks are present (teacher pasted the whole ChatGPT
  // reply into one box), isolate the section that matches what we want.
  const questionsLabelRe = /QUESTIONS\s*JSON/i;
  const answerLabelRe = /ANSWER\s*KEY\s*JSON/i;
  const hasQuestionsLabel = questionsLabelRe.test(text);
  const hasAnswerLabel = answerLabelRe.test(text);

  if (hasQuestionsLabel && hasAnswerLabel) {
    const qIndex = text.search(questionsLabelRe);
    const aIndex = text.search(answerLabelRe);

    if (kind === 'questions') {
      text = qIndex < aIndex ? text.slice(qIndex, aIndex) : text.slice(qIndex);
    } else {
      text = aIndex > qIndex ? text.slice(aIndex) : text.slice(aIndex, qIndex);
    }
  }

  // Extract just the [ ... ] array portion, ignoring any leading/trailing prose
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');

  if (start === -1 || end === -1 || end < start) {
    return rawText.trim(); // fall back to original, let JSON.parse report the error
  }

  return text.slice(start, end + 1).trim();
}

function getQuestionOptions(question) {
  if (!question) return [];
  const keys = Object.keys(question);
  const optionsKey = keys.find(k => {
    const lower = k.trim().toLowerCase();
    return lower === 'options' || lower === 'option' || lower === 'choices' || lower === 'choice';
  });

  if (optionsKey) {
    const val = question[optionsKey];
    if (Array.isArray(val)) return val;
    if (val && typeof val === 'object') return Object.values(val);
  }

  const directOptions = [];
  const standardLabels = ['a', 'b', 'c', 'd'];
  for (const label of standardLabels) {
    const propKey = keys.find(k => {
      const lower = k.trim().toLowerCase();
      return lower === `option_${label}` || lower === `option${label}` || lower === label;
    });
    if (propKey) {
      directOptions.push(question[propKey]);
    }
  }
  return directOptions;
}

// ==========================================
// Shared: Validate a pasted/uploaded JSON string against fixed config
// ==========================================
function parseAndValidateJson(rawText, kind, totalQuestions) {
  // kind: 'questions' | 'answers'
  if (!rawText || !rawText.trim()) {
    return { error: `Please provide the ${kind === 'questions' ? 'Questions' : 'Answer Key'} JSON.` };
  }

  const cleanedText = extractJsonArrayText(rawText, kind);

  let data;
  try {
    data = JSON.parse(cleanedText);
  } catch (e) {
    return { error: 'Invalid JSON format. Please paste the raw JSON exactly as generated by ChatGPT.' };
  }

  if (!Array.isArray(data)) {
    return { error: 'JSON must be an array.' };
  }

  if (data.length !== totalQuestions) {
    return { error: `Expected exactly ${totalQuestions} entries, found ${data.length}.` };
  }

  if (kind === 'questions') {
    for (const q of data) {
      const opts = getQuestionOptions(q);
      if (opts && opts.length === 4) {
        q.options = opts;
      }
      if (!q.question_id || !q.question || !Array.isArray(q.options) || q.options.length !== 4) {
        return { error: 'Each question needs question_id, question text and exactly 4 options.' };
      }
    }
  } else {
    const validOptions = ['A', 'B', 'C', 'D'];
    for (const a of data) {
      if (!a.question_id || !validOptions.includes(String(a.correct_answer).trim().toUpperCase())) {
        return { error: 'Each answer key entry needs question_id and correct_answer of A, B, C or D.' };
      }
    }
  }

  return { data };
}

export async function setupCreateGameForm() {
  const form = document.getElementById('game-create-form');
  if (!form) return;

  const courseSelect = document.getElementById('course-id');
  const streamSelect = document.getElementById('stream-id');
  const gameTypeSelect = document.getElementById('game-type');
  const gameNameInput = document.getElementById('game-name');
  const unitNameInput = document.getElementById('unit-name');

  // Load courses
  try {
    const coursesRes = await api.getMyCourses().catch(() => ({ success: false, data: [] }));

    if (coursesRes.success) {
      courseSelect.innerHTML = '<option value="" disabled selected>Select Course</option>' +
        coursesRes.data.map(c => `<option value="${c.course_id}">${c.course_name}</option>`).join('');
    }
  } catch (error) {
    toast.error('Failed to load course listings.');
  }

  // Auto-detect and populate Stream dropdown whenever the Course selection changes.
  const autoDetectStream = async () => {
    const courseId = courseSelect.value;
    if (streamSelect) {
      streamSelect.innerHTML = '<option value="" disabled selected>Select Course first...</option>';
    }

    if (!courseId) return;

    try {
      if (streamSelect) streamSelect.innerHTML = '<option value="" disabled selected>Detecting streams...</option>';
      const res = await api.getCourseStreams(courseId);
      if (res.success && res.data && res.data.length > 0) {
        streamSelect.innerHTML = res.data.map(s => 
          `<option value="${s.stream_id}">${s.stream_name}</option>`
        ).join('');
        
        // Auto-select if there is only one stream linked to the course
        if (res.data.length === 1) {
          streamSelect.value = res.data[0].stream_id;
        } else {
          // If multiple streams, add a prompt option at the top
          streamSelect.innerHTML = '<option value="" disabled selected>Select Stream</option>' + streamSelect.innerHTML;
        }
      } else {
        if (streamSelect) streamSelect.innerHTML = '<option value="" disabled>No approved stream linked to this course yet.</option>';
      }
    } catch (error) {
      if (streamSelect) streamSelect.innerHTML = '<option value="" disabled>Failed to load streams</option>';
      toast.error('Failed to auto-detect stream for the selected course.');
    }
  };

  courseSelect.addEventListener('change', autoDetectStream);

  // Keep the config summary + description + prompts fresh whenever relevant fields change
  const refreshAll = () => {
    renderGameConfigSummary(gameTypeSelect.value);
    syncFixedDescription();
    refreshChatGptPrompt();
  };
  gameTypeSelect.addEventListener('change', refreshAll);
  courseSelect.addEventListener('change', refreshChatGptPrompt);
  gameNameInput.addEventListener('input', refreshChatGptPrompt);
  unitNameInput.addEventListener('input', refreshChatGptPrompt);
  refreshAll();

  // Multi-step logic
  const prevBtn = document.getElementById('btn-prev-step');
  const nextBtn = document.getElementById('btn-next-step');
  const submitBtn = document.getElementById('submit-btn');

  const updateStepUI = () => {
    document.getElementById('step-pane-1').style.display = currentStep === 1 ? 'block' : 'none';
    document.getElementById('step-pane-2').style.display = currentStep === 2 ? 'block' : 'none';
    document.getElementById('step-pane-3').style.display = currentStep === 3 ? 'block' : 'none';

    // Update dots
    document.querySelectorAll('.builder-step-dot').forEach((dot, idx) => {
      if (idx + 1 <= currentStep) dot.classList.add('active');
      else dot.classList.remove('active');
    });

    if (prevBtn) prevBtn.style.display = currentStep === 1 ? 'none' : 'block';
    if (currentStep === 3) {
      if (nextBtn) nextBtn.style.display = 'none';
      if (submitBtn) submitBtn.style.display = 'block';
      refreshChatGptPrompt();
    } else {
      if (nextBtn) nextBtn.style.display = 'block';
      if (submitBtn) submitBtn.style.display = 'none';
    }
  };

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentStep === 1) {
        if (!courseSelect.value || !gameNameInput.value.trim() || !unitNameInput.value.trim() || !gameTypeSelect.value) {
          toast.warning('Please fill in all required fields, including Game Type.');
          return;
        }
        if (!streamSelect.value) {
          toast.warning('Please select an Academic Stream for this game.');
          return;
        }
      }

      if (currentStep < 3) {
        currentStep++;
        updateStepUI();
      }
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentStep > 1) {
        currentStep--;
        updateStepUI();
      }
    });
  }

  // Copy Prompt buttons (Questions prompt + Answer Key prompt, separately)
  bindCopyPromptButton('btn-copy-questions-prompt', 'chatgpt-questions-prompt-box', 'Questions prompt copied! Paste it into ChatGPT.');
  bindCopyPromptButton('btn-copy-answers-prompt', 'chatgpt-answers-prompt-box', 'Answer Key prompt copied! Paste it into ChatGPT.');

  // Tab switching
  const tabBuilder = document.getElementById('tab-builder');
  const tabJson = document.getElementById('tab-json');
  const builderPane = document.getElementById('builder-editor-pane');
  const uploaderPane = document.getElementById('uploader-editor-pane');

  if (tabBuilder && tabJson) {
    tabBuilder.addEventListener('click', () => {
      activeTab = 'builder';
      tabBuilder.classList.add('active');
      tabJson.classList.remove('active');
      if (builderPane) builderPane.style.display = 'block';
      if (uploaderPane) uploaderPane.style.display = 'none';
    });

    tabJson.addEventListener('click', () => {
      activeTab = 'json';
      tabJson.classList.add('active');
      tabBuilder.classList.remove('active');
      if (builderPane) builderPane.style.display = 'none';
      if (uploaderPane) uploaderPane.style.display = 'block';
    });
  }

  // Paste JSON textareas (live validation feedback)
  const pasteQuestionsBox = document.getElementById('paste-questions-json');
  const pasteAnswersBox = document.getElementById('paste-answers-json');
  const pasteQuestionsStatus = document.getElementById('paste-questions-status');
  const pasteAnswersStatus = document.getElementById('paste-answers-status');

  if (pasteQuestionsBox) {
    pasteQuestionsBox.addEventListener('input', () => {
      const totalQ = GAME_TYPES[gameTypeSelect.value]?.total_questions || 20;
      const result = parseAndValidateJson(pasteQuestionsBox.value, 'questions', totalQ);
      if (result.error) {
        pastedQuestions = null;
        pasteQuestionsStatus.textContent = pasteQuestionsBox.value.trim() ? result.error : '';
        pasteQuestionsStatus.className = 'form-text text-danger';
      } else {
        pastedQuestions = result.data;
        pasteQuestionsStatus.textContent = `Looks good — ${result.data.length} questions parsed.`;
        pasteQuestionsStatus.className = 'form-text text-success';
      }
    });
  }

  if (pasteAnswersBox) {
    pasteAnswersBox.addEventListener('input', () => {
      const totalQ = GAME_TYPES[gameTypeSelect.value]?.total_questions || 20;
      const result = parseAndValidateJson(pasteAnswersBox.value, 'answers', totalQ);
      if (result.error) {
        pastedAnswers = null;
        pasteAnswersStatus.textContent = pasteAnswersBox.value.trim() ? result.error : '';
        pasteAnswersStatus.className = 'form-text text-danger';
      } else {
        pastedAnswers = result.data;
        pasteAnswersStatus.textContent = `Looks good — ${result.data.length} answers parsed.`;
        pasteAnswersStatus.className = 'form-text text-success';
      }
    });
  }

  // JSON uploads
  const questionsInput = document.getElementById('upload-file-questions');
  const answersInput = document.getElementById('upload-file-answers');

  if (questionsInput) {
    questionsInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            uploadedQuestions = JSON.parse(extractJsonArrayText(event.target.result, 'questions'));
            toast.success('Questions JSON parsed successfully!');
          } catch (err) {
            toast.error('Invalid JSON file format for questions.');
            uploadedQuestions = null;
          }
        };
        reader.readAsText(file);
      }
    });
  }

  if (answersInput) {
    answersInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            uploadedAnswers = JSON.parse(extractJsonArrayText(event.target.result, 'answers'));
            toast.success('Answer Key JSON parsed successfully!');
          } catch (err) {
            toast.error('Invalid JSON file format for answers.');
            uploadedAnswers = null;
          }
        };
        reader.readAsText(file);
      }
    });
  }

  // Submit Handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const courseId = courseSelect.value;
    const streamId = streamSelect.value;
    const gameName = gameNameInput.value.trim();
    const unitName = unitNameInput.value.trim();
    const description = getGameDescription(gameTypeSelect.value);
    const gameType = gameTypeSelect.value;
    const config = GAME_TYPES[gameType];

    if (!config) {
      toast.warning('Please select a valid Game Type.');
      return;
    }

    if (!streamId) {
      toast.warning('Please select an Academic Stream for this game.');
      return;
    }

    let finalQuestions = [];
    let finalAnswers = [];

    if (activeTab === 'builder') {
      if (!pastedQuestions || !pastedAnswers) {
        toast.warning('Please paste valid Questions JSON and Answer Key JSON generated from the ChatGPT prompt.');
        return;
      }
      finalQuestions = pastedQuestions;
      finalAnswers = pastedAnswers;
    } else {
      if (!uploadedQuestions || !uploadedAnswers) {
        toast.warning('Please upload both Questions and Answer Key JSON files.');
        return;
      }
      finalQuestions = uploadedQuestions;
      finalAnswers = uploadedAnswers;
    }

    if (finalQuestions.length !== config.total_questions || finalAnswers.length !== config.total_questions) {
      toast.warning(`This game type requires exactly ${config.total_questions} questions and answers.`);
      return;
    }

    try {
      loader.show('Creating educational game...');
      submitBtn.disabled = true;

      const res = await api.createGame({
        course_id: Number(courseId),
        stream_id: Number(streamId),
        game_name: gameName,
        unit_name: unitName,
        description: description,
        game_type: gameType,
        questions: finalQuestions,
        answer_key: finalAnswers
      });

      loader.hide();
      submitBtn.disabled = false;

      if (res.success) {
        toast.success(res.message || 'Game created successfully!');
        setTimeout(() => {
          window.location.href = './games.html';
        }, 1500);
      }
    } catch (err) {
      loader.hide();
      submitBtn.disabled = false;
      toast.error(err.message || 'Failed to publish game.');
    }
  });
}
// ==========================================
// Teacher: Edit Game Specifications Form
// ==========================================
export async function setupEditGameForm() {
  const form = document.getElementById('game-edit-form');
  if (!form) return;

  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  if (!id) {
    toast.error('No game ID specified.');
    return;
  }

  const courseSelect = document.getElementById('course-id');
  const streamSelect = document.getElementById('stream-id');
  const gameTypeSelect = document.getElementById('game-type');
  const submitBtn = document.getElementById('submit-btn');
  const lockNote = document.getElementById('game-type-lock-note');

  let hasAttempts = false;

  const refreshSummaryAndPrompt = () => {
    renderGameConfigSummary(gameTypeSelect.value);
    syncFixedDescription();
    refreshChatGptPrompt();
  };

  gameTypeSelect.addEventListener('change', refreshSummaryAndPrompt);
  courseSelect.addEventListener('change', refreshChatGptPrompt);
  document.getElementById('game-name').addEventListener('input', refreshChatGptPrompt);
  document.getElementById('unit-name').addEventListener('input', refreshChatGptPrompt);

  // Load course/stream list & game details
  try {
    loader.show('Loading game data...');
    const [coursesRes, streamsRes, gameRes] = await Promise.all([
      api.getMyCourses().catch(() => ({ success: false, data: [] })),
      api.getMyStreams().catch(() => ({ success: false, data: [] })),
      api.getGameDetails(id)
    ]);
    loader.hide();

    if (coursesRes.success) {
      courseSelect.innerHTML = '<option value="" disabled>Select Course</option>' +
        coursesRes.data.map(c => `<option value="${c.course_id}">${c.course_name}</option>`).join('');
    }
    if (streamsRes.success) {
      streamSelect.innerHTML = '<option value="" disabled>Select Stream</option>' +
        streamsRes.data.map(s => `<option value="${s.stream_id}">${s.stream_name}</option>`).join('');
    }

    if (gameRes.success && gameRes.data) {
      const game = gameRes.data;
      courseSelect.value = game.course_id;
      streamSelect.value = game.stream_id;
      document.getElementById('game-name').value = game.game_name;
      document.getElementById('unit-name').value = game.unit_name;
      gameTypeSelect.value = game.game_type;
      syncFixedDescription();

      hasAttempts = (game.total_attempts || 0) > 0;
      if (hasAttempts && game.status === 'active') {
        gameTypeSelect.disabled = true;
        if (lockNote) lockNote.style.display = 'block';
      }

      refreshSummaryAndPrompt();
    }
  } catch (error) {
    loader.hide();
    toast.error('Failed to retrieve game details.');
  }

  const pasteQuestionsBox = document.getElementById('paste-questions-json');
  const pasteAnswersBox = document.getElementById('paste-answers-json');
  const pasteQuestionsStatus = document.getElementById('paste-questions-status');
  const pasteAnswersStatus = document.getElementById('paste-answers-status');
  let editPastedQuestions = null;
  let editPastedAnswers = null;

  if (pasteQuestionsBox) {
    pasteQuestionsBox.addEventListener('input', () => {
      const totalQ = GAME_TYPES[gameTypeSelect.value]?.total_questions || 20;
      const result = parseAndValidateJson(pasteQuestionsBox.value, 'questions', totalQ);
      if (result.error) {
        editPastedQuestions = null;
        pasteQuestionsStatus.textContent = pasteQuestionsBox.value.trim() ? result.error : '';
        pasteQuestionsStatus.className = 'form-text text-danger';
      } else {
        editPastedQuestions = result.data;
        pasteQuestionsStatus.textContent = `Looks good — ${result.data.length} questions parsed.`;
        pasteQuestionsStatus.className = 'form-text text-success';
      }
    });
  }

  if (pasteAnswersBox) {
    pasteAnswersBox.addEventListener('input', () => {
      const totalQ = GAME_TYPES[gameTypeSelect.value]?.total_questions || 20;
      const result = parseAndValidateJson(pasteAnswersBox.value, 'answers', totalQ);
      if (result.error) {
        editPastedAnswers = null;
        pasteAnswersStatus.textContent = pasteAnswersBox.value.trim() ? result.error : '';
        pasteAnswersStatus.className = 'form-text text-danger';
      } else {
        editPastedAnswers = result.data;
        pasteAnswersStatus.textContent = `Looks good — ${result.data.length} answers parsed.`;
        pasteAnswersStatus.className = 'form-text text-success';
      }
    });
  }

  bindCopyPromptButton('btn-copy-questions-prompt', 'chatgpt-questions-prompt-box', 'Questions prompt copied! Paste it into ChatGPT.');
  bindCopyPromptButton('btn-copy-answers-prompt', 'chatgpt-answers-prompt-box', 'Answer Key prompt copied! Paste it into ChatGPT.');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const courseId = courseSelect.value;
    const streamId = streamSelect.value;
    const gameName = document.getElementById('game-name').value.trim();
    const unitName = document.getElementById('unit-name').value.trim();
    const description = getGameDescription(gameTypeSelect.value);
    const gameType = gameTypeSelect.value;
    const config = GAME_TYPES[gameType];

    if (!courseId || !streamId || !gameName || !unitName || !config) {
      toast.warning('Please fill in all required fields, including a valid Game Type.');
      return;
    }

    // Only send questions/answer_key if the teacher pasted a replacement set
    const questionsProvided = pasteQuestionsBox && pasteQuestionsBox.value.trim();
    const answersProvided = pasteAnswersBox && pasteAnswersBox.value.trim();

    if ((questionsProvided || answersProvided) && (!editPastedQuestions || !editPastedAnswers)) {
      toast.warning('Both Questions JSON and Answer Key JSON must be valid to update them together.');
      return;
    }

    const payload = {
      course_id: Number(courseId),
      stream_id: Number(streamId),
      game_name: gameName,
      unit_name: unitName,
      description: description,
      game_type: gameType
    };

    if (editPastedQuestions && editPastedAnswers) {
      payload.questions = editPastedQuestions;
      payload.answer_key = editPastedAnswers;
    }

    try {
      loader.show('Updating game details...');
      submitBtn.disabled = true;

      const res = await api.updateGame(id, payload);

      loader.hide();
      submitBtn.disabled = false;

      if (res.success) {
        toast.success(res.message || 'Game details updated successfully.');
        setTimeout(() => {
          window.location.href = './games.html';
        }, 1500);
      }
    } catch (err) {
      loader.hide();
      submitBtn.disabled = false;
      toast.error(err.message || 'Failed to update game.');
    }
  });
}

// Auto controllers mappings
function init() {
  const role = storage.getRole();
  const path = window.location.pathname.toLowerCase();

  if (document.getElementById('games-table-body') && role === 'teacher') {
    populateGameFilters();
    setupGameFilters();
    loadTeacherGamesTable();
  }
  
  if (document.getElementById('student-games-container') && role === 'student') {
    populateGameFilters();
    setupGameFilters();
    loadStudentGames();
  }

  // Preview details handler
  if (path.includes('game-details.html')) {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (id && role === 'student') {
      loadStudentGamePreview(id);
    }
  }

  // Create game builder handler
  if (document.getElementById('game-create-form') && role === 'teacher') {
    setupCreateGameForm();
  }

  // Edit game builder handler
  if (document.getElementById('game-edit-form') && role === 'teacher') {
    setupEditGameForm();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
