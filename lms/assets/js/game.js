/* ============================================================
   GAME ARENA – game.js
   Gamified MCQ experience: XP, streaks, confetti, sounds,
   timer effects, animated feedback, level system
   ============================================================ */

// ── State ──────────────────────────────────────────────────

// ===== NEW: Millionaire state =====
let millionaireQuestions = [];
let millionaireIndex = 0;
let wrongCount = 0;
let lifelineUsed = false;

let currentGame    = null;
let mcqData        = null;
let questions      = [];
let selectedAnswers = {};
let currentIndex   = 0;
let timerSeconds   = 0;
let timerInterval  = null;
let gameSubmitted  = false;
// NEW CODE – timeout handle for auto-advance; cleared on manual nav or re-selection
let autoNextTimeout = null;

// Gamification state
let xp             = 0;
let streak         = 0;
let maxStreak      = 0;
let isMuted        = false;
let confettiActive = false;
let confettiFrameId= null;
let confettiParticles = [];

// XP constants
const XP_PER_CORRECT  = 20;
const XP_PER_SKIP     = 0;
const XP_STREAK_BONUS = 10; // extra XP per streak point beyond 1

// Level thresholds
const LEVELS = [
  { name: 'ROOKIE',      min: 0,   max: 99   },
  { name: 'PLAYER',      min: 100, max: 249  },
  { name: 'CHALLENGER',  min: 250, max: 499  },
  { name: 'WARRIOR',     min: 500, max: 799  },
  { name: 'LEGEND',      min: 800, max: 1199 },
  { name: 'MASTER',      min: 1200, max: Infinity },
];

// Encouraging messages
const ENCOURAGEMENTS = [
  "You're crushing it! 💪",
  "Keep going, legend! 🚀",
  "On fire! 🔥",
  "Unstoppable! ⚡",
  "Brilliant move! 🧠",
  "Stay sharp! 🎯",
  "You've got this! 🌟",
  "Amazing focus! 👁️",
  "Level up incoming! ⬆️",
  "No one stops you now! 🏆",
];

const CORRECT_MESSAGES = ["Nice! ✅", "Correct! 🎉", "Boom! 💥", "Nailed it! 🎯", "Perfect! ⭐"];
const WRONG_MESSAGES   = ["Oops! ❌", "Not quite! 💔", "Try next! 🔄", "Almost! 😅"];
const STREAK_MESSAGES  = [
  null,
  null,
  "2x Streak! 🔥",
  "3x Combo! 🔥🔥",
  "4x Insane! 🔥🔥🔥",
  "5x LEGENDARY! 👑",
];

// ── Audio System ───────────────────────────────────────────
/**
 * Create a tiny synth sound using Web Audio API.
 * type: 'correct' | 'wrong' | 'click' | 'complete'
 */
function playSound(type) {
  if (isMuted) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    switch(type) {
      case 'correct':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start(); osc.stop(ctx.currentTime + 0.35);
        break;
      case 'wrong':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(280, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start(); osc.stop(ctx.currentTime + 0.3);
        break;
      case 'click':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(700, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start(); osc.stop(ctx.currentTime + 0.08);
        break;
      case 'complete':
        // Ascending fanfare
        [523, 659, 784, 1047].forEach((freq, i) => {
          const o2 = ctx.createOscillator();
          const g2 = ctx.createGain();
          o2.connect(g2); g2.connect(ctx.destination);
          o2.type = 'sine';
          o2.frequency.value = freq;
          g2.gain.setValueAtTime(0, ctx.currentTime + i * 0.12);
          g2.gain.linearRampToValueAtTime(0.25, ctx.currentTime + i * 0.12 + 0.05);
          g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.3);
          o2.start(ctx.currentTime + i * 0.12);
          o2.stop(ctx.currentTime + i * 0.12 + 0.35);
        });
        break;
    }
  } catch(e) { /* Audio not supported – silent fail */ }
}

function toggleMute() {
  isMuted = !isMuted;
  document.getElementById('muteBtn').textContent = isMuted ? '🔇' : '🔊';
}

// ── Confetti System ────────────────────────────────────────
/**
 * Canvas-based confetti.
 * intensity: 'light' (correct answer) | 'full' (game complete)
 */
function launchConfetti(intensity = 'light') {
  const canvas = document.getElementById('confettiCanvas');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');
  const count = intensity === 'full' ? 180 : 55;
  const colors = ['#ffe135','#ff4fcb','#00e5ff','#39ff77','#ff4455','#ff8c00','#fff'];

  confettiParticles = Array.from({ length: count }, () => ({
    x: Math.random() * canvas.width,
    y: -10 - Math.random() * 80,
    w: 7 + Math.random() * 9,
    h: 4 + Math.random() * 6,
    color: colors[Math.floor(Math.random() * colors.length)],
    angle: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.18,
    vx: (Math.random() - 0.5) * 4,
    vy: 3.5 + Math.random() * 4,
    alpha: 1,
    decay: intensity === 'full' ? 0.003 : 0.008,
  }));

  if (confettiFrameId) cancelAnimationFrame(confettiFrameId);

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    confettiParticles = confettiParticles.filter(p => p.alpha > 0.01);
    confettiParticles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.angle += p.spin;
      p.alpha -= p.decay;
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    if (confettiParticles.length > 0) {
      confettiFrameId = requestAnimationFrame(draw);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  draw();
}

// ── Feedback Toast ─────────────────────────────────────────
let toastTimeout = null;

/**
 * Show a big floating message in the centre of the screen.
 * type: 'correct' | 'wrong' | 'xp'
 */
function showFeedbackToast(html, type = '') {
  const toast = document.getElementById('feedbackToast');
  if (toastTimeout) clearTimeout(toastTimeout);
  toast.innerHTML = html;
  toast.className = `feedback-toast show ${type}-toast`;
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => { toast.className = 'feedback-toast hidden'; }, 300);
  }, 900);
}

// ── XP & Level System ──────────────────────────────────────
function getLevel(xpValue) {
  return LEVELS.find(l => xpValue >= l.min && xpValue <= l.max) || LEVELS[0];
}

function addXP(amount, label = '') {
  xp += amount;
  // XP display elements removed — no DOM update needed
  if (label) showFeedbackToast(`+${amount} XP ${label}`, 'xp');
}

function updateXPDisplay() {
  // XP/level bar elements removed from UI — no-op
}

// ── Streak System ──────────────────────────────────────────
function incrementStreak() {
  streak++;
  if (streak > maxStreak) maxStreak = streak;
  // streak badge removed — no-op display update
}

function resetStreak() {
  streak = 0;
}

function updateStreakDisplay() {
  // streak badge removed — no-op
}

// ── Encouragement Cycling ──────────────────────────────────
let encouragementIndex = 0;
function nextEncouragement() {
  const el = document.getElementById('encouragementText');
  if (!el) return;
  el.textContent = ENCOURAGEMENTS[encouragementIndex % ENCOURAGEMENTS.length];
  encouragementIndex++;
}

// ── Normalise question ─────────────────────────────────────
function normalizeQuestion(question, index) {
  return {
    ...question,
    no: question.no || question.id || index + 1,
    options: Array.isArray(question.options) ? question.options : [],
  };
}

// ── Escape helpers ─────────────────────────────────────────
function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function escapeJs(value) {
  return String(value).replaceAll('\\', '\\\\').replaceAll("'", "\\'");
}

// ── Game type config ───────────────────────────────────────
function getGameUiConfig(gameType) {
  const configs = {
    'RAPID_FIRE':       { icon: '⚡', title: 'Rapid Fire!', tagline: 'Speed is everything — think fast!', heroClass: 'game-hero-rapid',    timerSeconds: 300, questionMessage: "Think fast! ⚡" },
    'BONUS_POINTS':     { icon: '💎', title: 'Bonus Blast', tagline: 'Earn bonus XP for every right answer!', heroClass: 'game-hero-bonus', timerSeconds: 0,   questionMessage: "Bonus time! 💎" },
    'NEGATIVE_MARKING': { icon: '⚠️', title: 'Danger Zone',tagline: 'Wrong answers cost you — choose wisely!', heroClass: 'game-hero-negative', timerSeconds: 0, questionMessage: "Stay careful! ⚠️" },
    'SHADOWMIND': {
  icon: '🧠',
  title: 'ShadowMind Arena',
  tagline: 'Enter the ultimate futuristic quiz battle!',
  heroClass: 'game-hero-shadow',
  timerSeconds: 30,
  questionMessage: "Think wisely! 🧠"
},
  };
  return configs[gameType] || { icon: '🎮', title: 'Game On!', tagline: 'Show what you\'ve got!', heroClass: 'game-hero-default', timerSeconds: 0, questionMessage: "You've got this! 🌟" };
}

function gameTypeLabel(type) {
  return { 'RAPID_FIRE': '⚡ Rapid Fire', 'BONUS_POINTS': '💎 Bonus','SHADOWMIND': '🧠 ShadowMind', 'NEGATIVE_MARKING': '⚠️ Danger' }[type] || '🎮 Game';
}

// ── DOM Ready ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  if (!requireRole('STUDENT')) return;

  try {
    currentGame = JSON.parse(sessionStorage.getItem('currentGame'));
    if (!currentGame) { window.location.href = 'student-dashboard.html'; return; }

    document.getElementById('gameTitle').textContent    = currentGame.gameName  || 'Game';
    document.getElementById('gameCourse').textContent   = currentGame.courseName ? `📚 ${currentGame.courseName}` : '';
    document.getElementById('gameTypeBadge').textContent = gameTypeLabel(currentGame.gameType);

    await loadMcq();
    renderIntro();
    updateXPDisplay();
  } catch (error) {
    showGameError(error.message || 'Unable to load game.');
  }
});

// ── MCQ Loading ────────────────────────────────────────────
function resolveMcqFilePath(game) {

  // FIRST PRIORITY → GitHub URL
  const githubUrl = String(
    game?.mcqFileUrl || ''
  ).trim();

  if (githubUrl) {
    return githubUrl;
  }

  // FALLBACK → local path
  const filePath = String(
    game?.mcqFilePath ||
    game?.mcq_file_path ||
    ''
  ).trim().replace(/^\/+/, '');

  if (!filePath) {
    throw new Error('MCQ file path is missing.');
  }

  return filePath;
}

// async function loadMcq() {
//   const mcqFilePath = resolveMcqFilePath(currentGame);
//   const response = await fetch(mcqFilePath, { cache: 'no-store' });
//   if (!response.ok) throw new Error(`Unable to load MCQ file: ${mcqFilePath}`);
//   mcqData = await response.json();
//   questions = (mcqData.questions || []).map(normalizeQuestion);
//   if (!questions.length) throw new Error('MCQ file does not contain questions.');
// }

async function loadMcq() {

  const mcqFilePath =
    resolveMcqFilePath(currentGame);

  console.log(
    "FETCHING FILE:",
    mcqFilePath
  );

  const response = await fetch(mcqFilePath, {
    method: 'GET',
    mode: 'cors',
    headers: {
      'Accept': 'application/json'
    },
    cache: 'no-store'
  });

  if (!response.ok) {

    throw new Error(
      `Unable to load MCQ file: ${mcqFilePath}`
    );
  }

  mcqData = await response.json();

  questions =
    (mcqData.questions || [])
      .map(normalizeQuestion);

  // SUPPORT BOTH:
  // answer
  // correctAnswer

  questions = questions.map(q => ({
    ...q,
    answer: q.answer || q.correctAnswer
  }));

  if (!questions.length) {

    throw new Error(
      'MCQ file does not contain questions.'
    );
  }
}

// ── Intro Screen ───────────────────────────────────────────
function renderIntro() {
  const ui = getGameUiConfig(currentGame.gameType);
  const timerLabel = ui.timerSeconds ? `${Math.floor(ui.timerSeconds/60)}:00` : '∞';
  document.getElementById('timerBox').textContent       = timerLabel;
  document.getElementById('questionCounter').textContent = `${questions.length} Qs`;
  // Pre-fill the new RF timer text too
  const rfTxt = document.getElementById('rfTimerText');
  if (rfTxt) rfTxt.textContent = timerLabel;

  document.getElementById('introCard').innerHTML = `
    <div class="intro-hero">
      <span class="intro-hero-icon">${ui.icon}</span>
      <h2 class="intro-hero-title">${escapeHtml(ui.title)}</h2>
      <p class="intro-hero-tagline">${escapeHtml(ui.tagline)}</p>
      <div class="intro-stats">
        <div class="intro-stat">
          <div class="label">Game</div>
          <div class="value" style="font-size:1rem">${escapeHtml(currentGame.gameName)}</div>
        </div>
        <div class="intro-stat">
          <div class="label">Questions</div>
          <div class="value">${questions.length}</div>
        </div>
        <div class="intro-stat">
          <div class="label">Timer</div>
          <div class="value">${ui.timerSeconds ? `${Math.floor(ui.timerSeconds/60)}m` : '∞'}</div>
        </div>
        <div class="intro-stat">
          <div class="label">XP Available</div>
          <div class="value">${questions.length * XP_PER_CORRECT}+</div>
        </div>
      </div>
      <button class="btn-start pulse-glow" onclick="beginGame()">🚀 Start Challenge</button>
    </div>
  `;
}

// ── Begin Game ─────────────────────────────────────────────
function beginGame() {
  playSound('click');

  // ✅ NEW: Check millionaire game
  // if (currentGame.gameType === "MILLIONAIRE_QUIZ") {
  //   document.getElementById('introSection').classList.add('hidden');
  //   document.getElementById('playSection').classList.remove('hidden');
  //   document.getElementById('millionaireGame').classList.remove('hidden');

  //   loadMillionaireGame();
  //   return;
  // }

  // OLD LOGIC (keep as it is)
  const ui = getGameUiConfig(currentGame.gameType);

  document.getElementById('introSection').classList.add('hidden');
  document.getElementById('playSection').classList.remove('hidden');

  timerSeconds = ui.timerSeconds || 0;

  // Task 3: Show ShadowMind-style sticky timer for timed games (Rapid Fire)
  const rfTimerWrap = document.getElementById('rfTimerWrap');
  if (timerSeconds > 0) {
    if (rfTimerWrap) rfTimerWrap.classList.remove('hidden');
    document.body.classList.add('rf-timer-active');  // hides legacy corner pill
    startTimer();
  } else {
    if (rfTimerWrap) rfTimerWrap.classList.add('hidden');
    document.body.classList.remove('rf-timer-active');
    document.getElementById('timerBox').textContent = '∞';
  }

  nextEncouragement();
  renderQuestion();
}

// ── Timer ──────────────────────────────────────────────────
function startTimer() {
  updateTimerBox();
  timerInterval = setInterval(() => {
    timerSeconds--;
    updateTimerBox();

    // Last 10 seconds: visual warning
    if (timerSeconds <= 10 && timerSeconds > 0) {
      document.getElementById('timerBox').classList.add('warning');
    }
    // Under 5 seconds: urgent pulse (task 4)
    if (timerSeconds <= 5 && timerSeconds > 0) {
      document.getElementById('timerBox').classList.add('urgent');
    }
    if (timerSeconds <= 0) {
      clearInterval(timerInterval);
      submitGame(true);
    }
  }, 1000);
}

function updateTimerBox() {
  const m = Math.floor(timerSeconds / 60);
  const s = timerSeconds % 60;
  const timeStr = `${m}:${String(s).padStart(2, '0')}`;

  // ── Legacy corner pill (kept; hidden via CSS when RF timer is active) ──
  const legacyEl = document.getElementById('timerBox');
  if (legacyEl) legacyEl.textContent = timeStr;

  // ── New ShadowMind-style sticky RF timer ──
  const rfText = document.getElementById('rfTimerText');
  const rfPill = document.getElementById('rfTimerPill');
  const rfBar  = document.getElementById('rfTimerBarFill');
  if (!rfText || !rfPill || !rfBar) return;

  rfText.textContent = timeStr;

  // Bar fill — percentage of total game time remaining
  const totalSec = currentGame?.timerSeconds || 300;
  const pct = Math.max(0, (timerSeconds / totalSec) * 100);
  rfBar.style.width = pct + '%';

  // State classes
  rfPill.classList.remove('rf-warning', 'rf-urgent');
  rfBar.classList.remove('rf-warning', 'rf-urgent');

  if (timerSeconds <= 10) {
    rfPill.classList.add('rf-urgent');
    rfBar.classList.add('rf-urgent');
  } else if (timerSeconds <= 30) {
    rfPill.classList.add('rf-warning');
    rfBar.classList.add('rf-warning');
  }
}

// ── Render Question ────────────────────────────────────────
function renderQuestion() {
  const question     = questions[currentIndex];
  const answeredCount = Object.keys(selectedAnswers).length;
  const progress     = Math.round(((currentIndex + 1) / questions.length) * 100);

  // Update header elements
  document.getElementById('questionCounter').textContent = `${currentIndex + 1} / ${questions.length}`;
  document.getElementById('progressBar').style.width     = `${progress}%`;
  document.getElementById('progressText').textContent    = `${progress}%`;

  renderAnsweredPills();
  nextEncouragement();

  // Build options HTML
  const optionsHtml = question.options.map((option) => {
    const selected = selectedAnswers[question.no] === option.id;
    return `
      <div class="option-card ${selected ? 'selected' : ''}"
           onclick="selectAnswer('${escapeJs(question.no)}', '${escapeJs(option.id)}')">
        <span class="option-badge">${escapeHtml(option.id)}</span>
        <span class="option-text">${escapeHtml(option.text)}</span>
      </div>
    `;
  }).join('');

  document.getElementById('questionHolder').innerHTML = `
    <div class="question-card-outer">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <span class="question-number-tag">Question ${escapeHtml(String(question.no))}</span>
        <span style="font-size:0.85rem; color:var(--text-muted)">✅ ${answeredCount} / ${questions.length}</span>
      </div>
      <p class="question-text">${escapeHtml(question.question)}</p>
      <div class="options-grid">${optionsHtml}</div>
    </div>
  `;

  document.getElementById('prevButton').disabled = currentIndex === 0;
  const nextBtn = document.getElementById('nextButton');
  nextBtn.textContent = currentIndex === questions.length - 1 ? '🏁 Submit' : 'Next →';
}

// ── Answered Pills ─────────────────────────────────────────
function renderAnsweredPills() {
  const holder = document.getElementById('answeredPills');
  if (!holder) return;
  holder.innerHTML = questions.map((q, i) => {
    const answered = Boolean(selectedAnswers[q.no]);
    const active   = i === currentIndex;
    let cls = answered ? 'answered' : 'unanswered';
    if (active) cls += ' active';
    return `<span class="q-pill ${cls}" onclick="jumpToQuestion(${i})">${i + 1}</span>`;
  }).join('');
}

// ── Jump to question from pill ─────────────────────────────
function jumpToQuestion(index) {
  if (gameSubmitted) return;

  // NEW CODE
  if (autoNextTimeout) {
    clearTimeout(autoNextTimeout);
    autoNextTimeout = null;
  }

  currentIndex = index;
  renderQuestion();
  playSound('click');
}

// ── Select Answer ──────────────────────────────────────────
// FIXED: single render cycle — update DOM in place, then advance
function selectAnswer(questionNo, optionId) {
  if (gameSubmitted) return;

  // Cancel any pending auto-advance (user re-selected before it fired)
  if (autoNextTimeout) {
    clearTimeout(autoNextTimeout);
    autoNextTimeout = null;
  }

  const prevAnswer = selectedAnswers[questionNo];
  selectedAnswers[questionNo] = optionId;

  playSound('click');

  // Update option card states in-place to avoid a full re-render (fixes flicker)
  const optionCards = document.querySelectorAll('.option-card');
  optionCards.forEach(card => {
    const onclickAttr = card.getAttribute('onclick') || '';
    const match = onclickAttr.match(/selectAnswer\('[^']*',\s*'([^']+)'\)/);
    if (match) {
      if (match[1] === optionId) {
        card.classList.add('selected');
      } else {
        card.classList.remove('selected');
      }
    }
  });

  // Update the answered pills count label without full re-render
  const answeredCount = Object.keys(selectedAnswers).length;
  const countEl = document.querySelector('[style*="font-size:0.85rem"]');
  if (countEl) countEl.textContent = `✅ ${answeredCount} / ${questions.length}`;

  renderAnsweredPills();

  // Auto-advance after short delay — only one render will happen when next question loads
  const delay = 700 + Math.floor(Math.random() * 300);
  autoNextTimeout = setTimeout(() => {
    autoNextTimeout = null;
    if (currentIndex < questions.length - 1) {
      currentIndex++;
      renderQuestion();
    } else {
      // Last question — prompt submit
      const answered = Object.keys(selectedAnswers).length;
      const skipped  = questions.length - answered;
      if (confirm(`Submit game now?\n✅ Answered: ${answered}\n⏭️ Skipped: ${skipped}`)) {
        submitGame(false);
      }
    }
  }, delay);
}

// ── Navigation ─────────────────────────────────────────────
// UPDATED CODE – cancel auto-advance if user navigates manually
function previousQuestion() {
  if (gameSubmitted || currentIndex === 0) return;

  // NEW CODE – kill pending auto-advance
  if (autoNextTimeout) {
    clearTimeout(autoNextTimeout);
    autoNextTimeout = null;
  }

  playSound('click');
  currentIndex--;
  renderQuestion();
}

// UPDATED CODE – cancel any pending auto-advance before manual advance
function nextQuestion() {
  if (gameSubmitted) return;

  // NEW CODE – kill pending auto-advance (covers manual click racing the timer)
  if (autoNextTimeout) {
    clearTimeout(autoNextTimeout);
    autoNextTimeout = null;
  }

  playSound('click');

  if (currentIndex < questions.length - 1) {
    currentIndex++;
    renderQuestion();
    return;
  }

  const answered = Object.keys(selectedAnswers).length;
  const skipped  = questions.length - answered;
  if (confirm(`Submit game now?\n✅ Answered: ${answered}\n⏭️ Skipped: ${skipped}`)) {
    submitGame(false);
  }
}

// UPDATED CODE – skip/clear also cancels auto-advance
function clearCurrentAnswer() {
  if (gameSubmitted) return;

  // NEW CODE
  if (autoNextTimeout) {
    clearTimeout(autoNextTimeout);
    autoNextTimeout = null;
  }

  playSound('click');
  const question = questions[currentIndex];
  delete selectedAnswers[question.no];
  renderQuestion();
}

// ── Build Answer String ────────────────────────────────────
function buildAnswerString() {
  let str = '';
  questions.forEach((q) => {
    const sel = selectedAnswers[q.no];
    if (sel) str += `${q.no}${sel}`;
  });
  return str;
}

// ── Submit Game ────────────────────────────────────────────
async function submitGame(autoSubmit = false) {
  if (gameSubmitted) return;
  gameSubmitted = true;

  if (timerInterval) clearInterval(timerInterval);

  const nextBtn = document.getElementById('nextButton');
  const origText = nextBtn.textContent;
  nextBtn.textContent = '⏳ Submitting…';
  nextBtn.disabled = true;

  try {
    const answerString = buildAnswerString();

    const data = await apiRequest('/api/student/submit-attempt', {
      method: 'POST',
      body: { attemptId: currentGame.attemptId, answerString },
    });

    data.autoSubmitted       = autoSubmit;
    data.submittedAnswerString = answerString;
    data.earnedXP            = xp;
    data.maxStreak           = maxStreak;
    sessionStorage.setItem('lastResult', JSON.stringify(data));
    sessionStorage.removeItem('currentGame');

    playSound('complete');
    launchConfetti('full');
    renderResult(data);
  } catch (error) {
    gameSubmitted = false;
    nextBtn.textContent = origText;
    nextBtn.disabled = false;
    showGameError(error.message || 'Unable to submit game.');
  }
}

// ── Result Screen ──────────────────────────────────────────
function renderResult(data) {
  const result  = data.result  || {};
  const message = data.resultMessage || {};
  const student = data.student || {};
  const pct     = message.percentage || 0;
  const reviewHtml = renderAnswerReview(data.answerReview || []);

  document.getElementById('playSection').classList.add('hidden');
  document.getElementById('resultSection').classList.remove('hidden');
  document.getElementById('questionCounter').textContent = '🏁 Done';
  document.getElementById('timerBox').textContent        = '✅';
  // Task 3: Hide floating RF timer on result screen
  const rfW = document.getElementById('rfTimerWrap');
  if (rfW) rfW.classList.add('hidden');
  document.body.classList.remove('rf-timer-active');

  // Performance label
  const perfLevel = pct >= 90 ? '🏆 MASTER'
                  : pct >= 70 ? '🌟 PRO'
                  : pct >= 50 ? '👍 INTERMEDIATE'
                  : pct >= 30 ? '💪 BEGINNER'
                  : '🚀 KEEP TRYING';

  document.getElementById('resultCard').innerHTML = `
    <div class="result-hero">
      <span class="result-emoji">${getResultEmoji(pct)}</span>
      <h2 class="result-title">${escapeHtml(message.title || 'Test Submitted!')}</h2>
      <p class="result-message">${escapeHtml(message.message || 'Your score has been recorded.')}</p>

      <div class="result-level-badge">${perfLevel}</div>

      <div class="result-stats">
        <div class="result-stat score">
          <div class="label">Score</div>
          <div class="value">${result.score ?? 0}</div>
        </div>
        <div class="result-stat correct">
          <div class="label">Correct</div>
          <div class="value">${result.correctCount ?? 0}</div>
        </div>
        <div class="result-stat wrong">
          <div class="label">Wrong</div>
          <div class="value">${result.wrongCount ?? 0}</div>
        </div>
        <div class="result-stat skip">
          <div class="label">Skipped</div>
          <div class="value">${result.skippedCount ?? 0}</div>
        </div>
      </div>

      <div class="result-summary-bar">
        🏅 Total Score: <strong>${student.totalScore ?? '–'}</strong> &nbsp;|&nbsp;
        📝 Tests Completed: <strong>${student.testsCompleted ?? '–'}</strong> &nbsp;|&nbsp;
        🥇 Rank: <strong>${student.rank ? '#' + student.rank : '–'}</strong>
      </div>

      ${reviewHtml}

      <div class="result-actions">
        <a href="student-dashboard.html" class="btn-game btn-game-primary">🏠 Dashboard</a>
        <a href="leaderboard.html" class="btn-game btn-game-ghost">🏆 Leaderboard</a>
      </div>
    </div>
  `;
}

function renderAnswerReview(answerReview) {
  if (!Array.isArray(answerReview) || !answerReview.length) return '';

  const questionByNo = new Map(questions.map(question => [String(question.no), question]));

  const rows = answerReview.map(item => {
    const question = questionByNo.get(String(item.questionNo));
    if (!question) return '';

    const submittedOption = item.submittedOption || null;
    const correctOption = item.correctOption;
    const status = item.status || 'SKIPPED';
    const statusClass = status === 'CORRECT' ? 'correct' : status === 'WRONG' ? 'wrong' : 'skipped';
    const statusLabel = status === 'CORRECT' ? 'Correct' : status === 'WRONG' ? 'Wrong' : 'Skipped';
    const submittedText = submittedOption ? getOptionText(question, submittedOption) : 'Not answered';
    const correctText = getOptionText(question, correctOption);

    return `
      <div class="review-item review-${statusClass}">
        <div class="review-item-head">
          <span class="review-question-no">Q${escapeHtml(String(question.no))}</span>
          <span class="review-status">${statusLabel}</span>
        </div>
        <div class="review-question-text">${escapeHtml(question.question)}</div>
        <div class="review-answer-line ${statusClass}">
          Your Answer: <strong>${escapeHtml(submittedOption || '-')}</strong>
          <span>${escapeHtml(submittedText)}</span>
        </div>
        ${status === 'WRONG' || status === 'SKIPPED' ? `
          <div class="review-answer-line correct">
            Correct Answer: <strong>${escapeHtml(correctOption)}</strong>
            <span>${escapeHtml(correctText)}</span>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');

  return `
    <div class="answer-review-panel">
      <div class="answer-review-title">Answer Review</div>
      <div class="answer-review-list">${rows}</div>
    </div>
  `;
}

function getOptionText(question, optionId) {
  const option = (question.options || []).find(item => String(item.id) === String(optionId));
  return option ? option.text : '';
}

function getResultEmoji(pct) {
  if (pct >= 90) return '🏆';
  if (pct >= 70) return '🌟';
  if (pct >= 50) return '👍';
  if (pct >= 30) return '💪';
  return '🚀';
}

// ── Error display ──────────────────────────────────────────
function showGameError(message) {
  const el = document.getElementById('gameError');
  if (!el) return;
  el.innerHTML = `<div class="game-error-alert">⚠️ ${escapeHtml(message)}</div>`;
}

// ── Window resize: resize confetti canvas ──────────────────
window.addEventListener('resize', () => {
  const canvas = document.getElementById('confettiCanvas');
  if (canvas) { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
});
// ===== LOAD JSON =====
async function loadMillionaireGame() {
  const res = await fetch("assets/data/csharp-end.json");
  const data = await res.json();

  millionaireQuestions = data.questions;
  millionaireIndex = 0;
  wrongCount = 0;

  renderMillionaireQuestion();

  // ✅ FIXED
document.getElementById("lifeline5050").onclick = function () {

  if (lifelineUsed) return;
  lifelineUsed = true;

  const q = millionaireQuestions[millionaireIndex];

  const wrongOptions = q.options.filter(o => o.id !== q.correctAnswer);

  const remove = wrongOptions.slice(0, 2);

  document.querySelectorAll("#millionaireOptions button").forEach(btn => {
    remove.forEach(opt => {
      if (btn.innerText.startsWith(opt.id)) {
        btn.style.display = "none";
      }
    });
  });

  this.disabled = true;
};
}

function renderMillionaireQuestion() {
  const q = millionaireQuestions[millionaireIndex];

  document.getElementById("millionaireQuestion").innerText = q.question;

  document.getElementById("millionaireOptions").innerHTML =
    q.options.map(opt => `
      <div class="col-6">
        <button class="btn btn-game w-100"
          onclick="selectMillionaireAnswer('${opt.id}')">
          ${opt.id}: ${opt.text}
        </button>
      </div>
    `).join("");
}

function selectMillionaireAnswer(selected) {
  const q = millionaireQuestions[millionaireIndex];

  const isCorrect = selected === q.correctAnswer;

  if (!isCorrect) {
    wrongCount++;
  }

  // Save in browser
  let answers = JSON.parse(localStorage.getItem("millionaireAnswers") || "[]");

  answers.push({
    question: q.question,
    selected,
    correct: q.correctAnswer
  });

  localStorage.setItem("millionaireAnswers", JSON.stringify(answers));

  // Game over
  if (!isCorrect || wrongCount >= 2) {
    alert("Game Over!");
    return;
  }

  millionaireIndex++;
  renderMillionaireQuestion();
}

