import { api } from './api.js';
import { loader } from './loader.js';
import { toast } from './toast.js';
import { Timer } from './timer.js';
import { gameSound } from './gameSound.js';
import { GAME_TYPES } from './gameTypesConfig.js';
import { burstConfetti, burstAt } from './confetti.js';

let questions = [];
let currentQuestionIndex = 0;
let attemptId = null;
let timerInstance = null;
let questionTimerInstance = null;
let savedAnswers = {}; // question_id: answer
let gameType = null;
let perQuestionSeconds = null;
let isKbc = false;
let sortedQuestionIds = [];
let questionLocked = false; // KBC: has the current question already been locked/revealed?
let eliminated = false;

// Live (client-side, cosmetic) scoreboard — for instant game-show style
// feedback on non-KBC games. The real, authoritative score is always
// computed server-side on submit; this never affects submission payload.
let liveScore = 0;
let liveFeedback = {}; // question_id: { isCorrect, delta }
let checkInFlight = {}; // question_id: bool, avoid overlapping checkAnswer calls

const THEME_META = {
  Rapid_fire: { theme: 'theme-rapid', icon: 'bi-lightning-charge-fill', label: 'Rapid Fire' },
  Bonus_Points: { theme: 'theme-bonus', icon: 'bi-gem', label: 'Bonus Points' },
  Negative_Marking: { theme: 'theme-negative', icon: 'bi-exclamation-triangle-fill', label: 'Negative Marking' },
  No_negative_marking: { theme: 'theme-safe', icon: 'bi-shield-check', label: 'No Negative Marking' },
  Kbc: { theme: 'theme-kbc', icon: 'bi-trophy-fill', label: 'KBC' }
};

// ==========================================
// Initializer Quiz Page
// ==========================================
export async function initializeQuizRunner() {
  attemptId = localStorage.getItem('active_attempt_id');
  if (!attemptId) {
    toast.error('No active quiz attempt session found.');
    window.location.href = './games.html';
    return;
  }

  // Load previously cached answers if page refreshed
  const cache = localStorage.getItem(`answers_${attemptId}`);
  if (cache) {
    savedAnswers = JSON.parse(cache);
  }

  bindSoundToggle();

  try {
    loader.show('Loading quiz questions...');
    const res = await api.getQuestions(attemptId);
    loader.hide();

    if (res.success && res.data) {
      // Backend returns { questions, game_type, time_limit, per_question_time_seconds, total_questions }
      questions = res.data.questions || [];
      gameType = res.data.game_type || null;
      perQuestionSeconds = res.data.per_question_time_seconds || null;
      isKbc = gameType === 'Kbc';
      sortedQuestionIds = [...questions]
        .map(q => Number(q.question_id))
        .sort((a, b) => a - b);

      if (questions.length === 0) {
        toast.error('No questions mapped for this quiz game.');
        window.location.href = './games.html';
        return;
      }

      applyGameTheme();
      gameSound.fanfare();

      // Total quiz timer, in seconds (fallback to cached value from games list)
      const totalSeconds = Number(res.data.time_limit) ||
        Number(localStorage.getItem('active_game_time_limit')) || 900;
      startQuizTimer(totalSeconds);

      // KBC style rules: no going back, no skipping, per-question countdown,
      // lock-in confirmation flow instead of free navigation.
      if (isKbc) {
        const prevBtn = document.getElementById('btn-prev-q');
        const skipBtn = document.getElementById('btn-skip-q');
        const nextBtn = document.getElementById('btn-next-q');
        if (prevBtn) prevBtn.style.display = 'none';
        if (skipBtn) skipBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';

        const qTimerBox = document.getElementById('quiz-question-timer-box');
        if (qTimerBox) qTimerBox.style.setProperty('display', 'inline-flex', 'important');

        renderKbcLadder();
      }

      // Render first question
      renderQuestion(0);
      renderPalette();
    }
  } catch (error) {
    loader.hide();
    toast.error('Failed to load quiz details.');
    console.error(error);
  }
}

// ==========================================
// Theming
// ==========================================
function applyGameTheme() {
  const meta = THEME_META[gameType] || THEME_META.Rapid_fire;
  const arena = document.getElementById('quiz-arena');
  if (arena) arena.classList.add(meta.theme);

  const titleEl = document.getElementById('quiz-game-title');
  if (titleEl) titleEl.textContent = `${meta.label} Challenge`;

  const badgeEl = document.getElementById('quiz-type-badge');
  if (badgeEl) badgeEl.textContent = meta.label;

  const iconEl = document.getElementById('quiz-type-icon');
  if (iconEl) iconEl.innerHTML = `<i class="bi ${meta.icon}"></i>`;
}

// ==========================================
// Live score chip (cosmetic count-up, non-KBC games)
// ==========================================
function animateScoreTo(newVal) {
  const el = document.getElementById('quiz-score-value');
  const box = document.getElementById('quiz-score-box');
  if (!el) return;

  const startVal = Number(el.textContent) || 0;
  const delta = newVal - startVal;
  if (delta === 0) return;

  const steps = 12;
  let i = 0;
  const stepTime = 18;

  const tickUp = setInterval(() => {
    i++;
    const val = Math.round(startVal + (delta * i) / steps);
    el.textContent = val;
    if (i >= steps) {
      el.textContent = newVal;
      clearInterval(tickUp);
    }
  }, stepTime);

  if (box) {
    box.classList.remove('score-bump', 'score-bump-down');
    // Force reflow so the animation restarts on repeated updates
    void box.offsetWidth;
    box.classList.add(delta > 0 ? 'score-bump' : 'score-bump-down');
  }
}

function bindSoundToggle() {
  const btn = document.getElementById('btn-sound-toggle');
  const icon = document.getElementById('sound-icon');
  if (!btn || !icon) return;

  const refresh = () => {
    const muted = gameSound.isMuted();
    icon.className = muted ? 'bi bi-volume-mute-fill' : 'bi bi-volume-up-fill';
    btn.classList.toggle('muted', muted);
  };

  btn.addEventListener('click', () => {
    gameSound.toggle();
    refresh();
  });

  refresh();
}

// ==========================================
// Timer controls
// ==========================================
function startQuizTimer(totalSeconds) {
  const timerBox = document.getElementById('quiz-timer-box');
  const timerVal = document.getElementById('quiz-timer-value');

  timerInstance = new Timer(
    totalSeconds,
    (tick) => {
      if (timerVal) timerVal.textContent = tick.display;
      if (tick.isWarning && timerBox) {
        timerBox.classList.add('timer-warning');
      }
      if (tick.secondsLeft <= 10 && tick.secondsLeft > 0) {
        gameSound.tick(tick.secondsLeft <= 5);
      }
    },
    () => {
      toast.warning('Quiz time has expired! Auto submitting...');
      submitQuizGame(true); // force auto-submit
    }
  );
  timerInstance.start();
}

// KBC-only: per-question countdown. On expiry, treat it like a lock-in
// with whatever (or no) answer is currently selected.
function startQuestionTimer() {
  if (!isKbc || !perQuestionSeconds) return;

  if (questionTimerInstance) questionTimerInstance.stop();

  const qTimerVal = document.getElementById('quiz-question-timer-value');
  const qTimerBox = document.getElementById('quiz-question-timer-box');
  if (qTimerVal) qTimerVal.textContent = perQuestionSeconds;
  if (qTimerBox) qTimerBox.classList.remove('timer-warning');

  questionTimerInstance = new Timer(
    perQuestionSeconds,
    (tick) => {
      if (qTimerVal) qTimerVal.textContent = tick.secondsLeft;
      if (tick.secondsLeft <= 10 && qTimerBox) {
        qTimerBox.classList.add('timer-warning');
      }
      if (tick.secondsLeft <= 10 && tick.secondsLeft > 0) {
        gameSound.tick(tick.secondsLeft <= 5);
      }
    },
    () => {
      if (eliminated || questionLocked) return;
      // Time's up on this question — lock in whatever is selected (or nothing)
      lockKbcAnswer(true);
    }
  );
  questionTimerInstance.start();
}

// ==========================================
// KBC Prize Ladder rendering
// ==========================================
function renderKbcLadder() {
  const card = document.getElementById('kbc-ladder-card');
  const list = document.getElementById('kbc-ladder-list');
  if (!card || !list) return;

  const ladder = GAME_TYPES.Kbc.ladder;

  const rungs = sortedQuestionIds.map((qId, idx) => {
    const position = idx + 1;
    const tier = ladder.find(t => position >= t.from && position <= t.to);
    return { position, marks: tier ? tier.marks : 0 };
  });

  list.innerHTML = rungs.map(r => `
    <div class="kbc-rung" data-position="${r.position}">
      <span>Q${r.position}</span>
      <span>${r.marks} pts</span>
    </div>
  `).join('');

  card.style.display = 'block';
  updateLadderActiveState();
}

function updateLadderActiveState() {
  const list = document.getElementById('kbc-ladder-list');
  if (!list) return;

  const currentPosition = currentQuestionIndex + 1;

  list.querySelectorAll('.kbc-rung').forEach(el => {
    const pos = Number(el.getAttribute('data-position'));
    el.classList.remove('active', 'done');
    if (pos < currentPosition) el.classList.add('done');
    if (pos === currentPosition) el.classList.add('active');
  });
}

// ==========================================
// Question Render Maps
// ==========================================
function renderQuestion(index) {
  currentQuestionIndex = index;
  questionLocked = false;
  const question = questions[index];

  // Update question counters
  const currentNumEl = document.getElementById('current-question-num');
  const totalNumEl = document.getElementById('total-questions-num');
  const progressEl = document.getElementById('quiz-progress-bar');

  if (currentNumEl) currentNumEl.textContent = index + 1;
  if (totalNumEl) totalNumEl.textContent = questions.length;

  if (progressEl) {
    const percent = ((index + 1) / questions.length) * 100;
    progressEl.style.width = `${percent}%`;
  }

  // Populate card details
  const qCard = document.getElementById('question-card-container');
  if (!qCard) return;

  const currentAnswer = savedAnswers[question.question_id] || '';

  const feedback = !isKbc ? liveFeedback[question.question_id] : null;

  const optionsHtml = question.options.map((opt, oIdx) => {
    // Standard option labels A, B, C, D
    const label = String.fromCharCode(65 + oIdx);
    const isSelected = currentAnswer === label;

    let markerClass = '';
    if (feedback) {
      if (label === feedback.correctAnswer) markerClass = 'opt-correct';
      else if (isSelected && !feedback.isCorrect) markerClass = 'opt-wrong';
    }

    return `
      <div class="quiz-option-wrapper ${isSelected ? 'selected' : ''} ${markerClass}" data-option="${label}">
        <input class="form-check-input quiz-option-input" type="radio" name="quiz-options" id="opt-${label}" value="${label}" ${isSelected ? 'checked' : ''}>
        <label class="form-check-label w-100 fw-semibold" for="opt-${label}">
          <strong>${label}.</strong> ${opt}
        </label>
      </div>
    `;
  }).join('');

  const cautionStripe = (gameType === 'Negative_Marking')
    ? '<div class="risk-meter-strip"><i class="bi bi-exclamation-triangle-fill"></i> Wrong answer = marks deducted</div>'
    : '';

  qCard.innerHTML = `
    ${cautionStripe}
    <h5 class="fw-bold mb-4 quiz-question-text">${question.question}</h5>
    <div class="d-grid gap-2">
      ${optionsHtml}
    </div>
  `;

  // Themed entrance animation for the question card content
  qCard.classList.remove('q-enter-kbc', 'q-enter-rapid', 'q-enter-default');
  void qCard.offsetWidth;
  if (isKbc) qCard.classList.add('q-enter-kbc');
  else if (gameType === 'Rapid_fire') qCard.classList.add('q-enter-rapid');
  else qCard.classList.add('q-enter-default');

  // Bind option click select trigger
  qCard.querySelectorAll('.quiz-option-wrapper').forEach(wrapper => {
    wrapper.addEventListener('click', () => {
      if (questionLocked) return;

      // Unselect others
      qCard.querySelectorAll('.quiz-option-wrapper').forEach(w => w.classList.remove('selected'));

      const radio = wrapper.querySelector('input');
      radio.checked = true;
      wrapper.classList.add('selected');

      const optionVal = wrapper.getAttribute('data-option');
      gameSound.select();
      saveAnswer(question.question_id, optionVal);

      if (isKbc) {
        const lockBtn = document.getElementById('btn-lock-answer');
        if (lockBtn) lockBtn.style.display = 'inline-block';
      } else {
        questionLocked = true; // Lock option selection to prevent multiple clicks/answers
        // Instant game-show style feedback for the 4 non-KBC themes.
        // Cosmetic only — final score is always computed server-side on submit.
        checkAnswerLive(question.question_id, optionVal, wrapper, qCard).then(() => {
          // After live check completes, auto-advance to the next question after a delay
          setTimeout(() => {
            if (index < questions.length - 1) {
              renderQuestion(index + 1);
            }
          }, 1000); // 1-second delay so they can see correct/wrong feedback
        });
      }
    });
  });

  // Toggle prev/next bottom buttons visibility
  const prevBtn = document.getElementById('btn-prev-q');
  const nextBtn = document.getElementById('btn-next-q');
  const submitBtn = document.getElementById('btn-submit-quiz');
  const lockBtn = document.getElementById('btn-lock-answer');

  if (!isKbc) {
    if (prevBtn) prevBtn.disabled = index === 0;

    if (index === questions.length - 1) {
      if (nextBtn) nextBtn.style.display = 'none';
      if (submitBtn) submitBtn.style.display = 'block';
    } else {
      if (nextBtn) nextBtn.style.display = 'none'; // Keep Next button hidden
      if (submitBtn) submitBtn.style.display = 'none';
    }
  } else {
    // KBC: lock button only shows once an option is picked for this question
    if (lockBtn) lockBtn.style.display = currentAnswer ? 'inline-block' : 'none';
  }

  // Highlight current palette element
  updatePaletteActiveState();
  if (isKbc) updateLadderActiveState();

  // KBC per-question countdown restarts on every question render
  startQuestionTimer();
}

// ==========================================
// Instant per-answer feedback (non-KBC themes)
// ==========================================
async function checkAnswerLive(questionId, answerVal, wrapperEl, qCard) {
  if (checkInFlight[questionId]) return;
  checkInFlight[questionId] = true;

  // Clear any previous correct/wrong markers from an earlier pick on this question
  if (qCard) {
    qCard.querySelectorAll('.quiz-option-wrapper').forEach(w => {
      w.classList.remove('opt-correct', 'opt-wrong');
    });
  }

  try {
    const res = await api.checkAnswer(attemptId, {
      question_id: questionId,
      answer: answerVal
    });
    checkInFlight[questionId] = false;
    if (!res.success) return;

    const { is_correct, correct_answer } = res.data;
    const config = GAME_TYPES[gameType] || GAME_TYPES.Rapid_fire;

    // Roll back any earlier delta counted for this question (answer changed)
    const prev = liveFeedback[questionId];
    if (prev) liveScore -= prev.delta;

    const delta = is_correct ? (config.correct_marks || 0) : -(config.wrong_marks || 0);
    liveFeedback[questionId] = { isCorrect: is_correct, delta, correctAnswer: correct_answer };
    liveScore += delta;
    animateScoreTo(liveScore);

    if (wrapperEl) {
      wrapperEl.classList.add(is_correct ? 'opt-correct' : 'opt-wrong');
    }

    applyThemeFeedback(gameType, is_correct, wrapperEl, delta);
  } catch (error) {
    checkInFlight[questionId] = false;
    // Silent fail — this is a cosmetic layer, never blocks the actual quiz flow
    console.error('Live check failed', error);
  }
}

function applyThemeFeedback(type, isCorrect, wrapperEl, delta) {
  const arena = document.getElementById('quiz-arena');

  if (type === 'Bonus_Points') {
    if (isCorrect) {
      gameSound.coin();
      // if (wrapperEl) burstAt(wrapperEl, { glyph: '💎', count: 10, duration: 650 });
      flashScorePop(`+${GAME_TYPES.Bonus_Points.correct_marks}`, 'pop-gain');
    } else {
      gameSound.wrong();
    }
    return;
  }

  if (type === 'Negative_Marking') {
    if (isCorrect) {
      gameSound.correct();
      flashScorePop(`+${GAME_TYPES.Negative_Marking.correct_marks}`, 'pop-gain');
    } else {
      gameSound.riskWarning();
      /* Screen shake disabled
      if (arena) {
        arena.classList.remove('danger-shake');
        void arena.offsetWidth;
        arena.classList.add('danger-shake');
      }
      */
      flashScorePop(`-${GAME_TYPES.Negative_Marking.wrong_marks}`, 'pop-loss');
    }
    return;
  }

  if (type === 'No_negative_marking') {
    if (isCorrect) {
      gameSound.softDing();
      // if (wrapperEl) burstAt(wrapperEl, { glyph: '🙂', count: 6, duration: 600 });
      flashScorePop(`+${GAME_TYPES.No_negative_marking.correct_marks}`, 'pop-gain');
    } else {
      // Deliberately gentle — no shake, no harsh red, no penalty sound
      gameSound.softDing();
    }
    return;
  }

  // Rapid_fire and default: quick snappy feedback, no confetti (keeps pace fast)
  if (isCorrect) {
    gameSound.correct();
    flashScorePop(`+${(GAME_TYPES[type] || GAME_TYPES.Rapid_fire).correct_marks}`, 'pop-gain');
  } else {
    gameSound.wrong();
  }
}

function flashScorePop(text, cls) {
  // Disabled floating point score pop animations
  /*
  const box = document.getElementById('quiz-score-box');
  if (!box) return;
  const pop = document.createElement('span');
  pop.className = `score-pop ${cls}`;
  pop.textContent = text;
  box.appendChild(pop);
  setTimeout(() => pop.remove(), 900);
  */
}

function saveAnswer(questionId, value) {
  savedAnswers[questionId] = value;
  localStorage.setItem(`answers_${attemptId}`, JSON.stringify(savedAnswers));
  renderPalette(); // Refresh dots color indicators
}

// ==========================================
// KBC Lock-in flow
// ==========================================
async function lockKbcAnswer(fromTimeout = false) {
  if (questionLocked || eliminated) return;
  questionLocked = true;

  if (questionTimerInstance) questionTimerInstance.stop();

  const lockBtn = document.getElementById('btn-lock-answer');
  if (lockBtn) lockBtn.style.display = 'none';

  const question = questions[currentQuestionIndex];
  const selectedAnswer = savedAnswers[question.question_id] || null;

  const qCard = document.getElementById('question-card-container');
  if (qCard) {
    qCard.querySelectorAll('.quiz-option-wrapper').forEach(w => w.classList.add('locked'));
  }

  if (!fromTimeout) gameSound.lockIn();
  gameSound.locking();

  const qCardEl = document.getElementById('question-card-container');
  if (qCardEl) qCardEl.classList.add('locking-tension');

  try {
    loader.show('Lock kiya jaa raha hai...');
    const res = await api.checkAnswer(attemptId, {
      question_id: question.question_id,
      answer: selectedAnswer
    });
    loader.hide();

    if (!res.success) {
      toast.error(res.message || 'Could not verify answer.');
      questionLocked = false;
      return;
    }

    const { is_correct, correct_answer } = res.data;
    if (qCardEl) qCardEl.classList.remove('locking-tension');

    // Visually reveal correct/wrong option
    if (qCard) {
      qCard.querySelectorAll('.quiz-option-wrapper').forEach(w => {
        const opt = w.getAttribute('data-option');
        if (opt === correct_answer) w.classList.add('opt-correct');
        else if (opt === selectedAnswer && !is_correct) w.classList.add('opt-wrong');
      });
    }

    if (is_correct) {
      gameSound.correct();
      // burstConfetti({ colors: ['#f5c542', '#ffe08a', '#d97706', '#ffffff'], originY: 35, count: 90 });
      showRevealOverlay(true, `+${res.data.marks || 0} points locked in!`);

      setTimeout(() => {
        hideRevealOverlay();
        if (currentQuestionIndex < questions.length - 1) {
          renderQuestion(currentQuestionIndex + 1);
        } else {
          toast.success('All questions cleared! Submitting your KBC attempt...');
          submitQuizGame(true);
        }
      }, 1400);
    } else {
      gameSound.wrong();
      showRevealOverlay(false, `Correct answer was ${correct_answer}.`);

      setTimeout(() => {
        hideRevealOverlay();
        triggerGameOver();
      }, 3000); // 3 seconds to view correct answer reveal
    }
  } catch (error) {
    loader.hide();
    questionLocked = false;
    toast.error(error.message || 'Failed to check answer.');
  }
}

function showRevealOverlay(isCorrect, subText) {
  const overlay = document.getElementById('quiz-reveal-overlay');
  const icon = document.getElementById('reveal-icon');
  const text = document.getElementById('reveal-text');
  const sub = document.getElementById('reveal-sub');
  if (!overlay) return;

  icon.className = `reveal-icon ${isCorrect ? 'icon-correct' : 'icon-wrong'}`;
  icon.innerHTML = `<i class="bi ${isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i>`;
  text.textContent = isCorrect ? 'Correct!' : 'Wrong Answer!';
  text.style.color = isCorrect ? '#2fd06b' : '#ff5c5c';
  sub.textContent = subText || '';

  overlay.classList.add('show');
}

function hideRevealOverlay() {
  const overlay = document.getElementById('quiz-reveal-overlay');
  if (overlay) overlay.classList.remove('show');
}

function triggerGameOver() {
  eliminated = true;
  if (timerInstance) timerInstance.stop();
  if (questionTimerInstance) questionTimerInstance.stop();

  gameSound.gameOver();

  const overlay = document.getElementById('quiz-gameover-overlay');
  if (overlay) overlay.classList.add('show');

  setTimeout(() => {
    submitQuizGame(true);
  }, 4500); // 4.5 seconds to view 'Wrong answer, you are out of the game!' before submission
}

// ==========================================
// Question Palette Grid renderers
// ==========================================
function renderPalette() {
  const container = document.getElementById('question-palette-grid');
  if (!container) return;

  container.innerHTML = questions.map((q, idx) => {
    let stateClass = '';
    const ans = savedAnswers[q.question_id];

    if (ans === 'skipped') {
      stateClass = 'skipped';
    } else if (ans) {
      stateClass = 'answered';
    }

    if (idx === currentQuestionIndex) {
      stateClass += ' current';
    }

    return `
      <button class="palette-btn ${stateClass}" data-index="${idx}">
        ${idx + 1}
      </button>
    `;
  }).join('');

  // Bind palette clicks to jump indices (disabled for KBC - forward only, locked)
  if (!isKbc) {
    container.querySelectorAll('.palette-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.getAttribute('data-index'));
        gameSound.advance();
        renderQuestion(idx);
      });
    });
  }
}

function updatePaletteActiveState() {
  const container = document.getElementById('question-palette-grid');
  if (!container) return;

  container.querySelectorAll('.palette-btn').forEach((btn, idx) => {
    btn.classList.remove('current');
    if (idx === currentQuestionIndex) {
      btn.classList.add('current');
    }
  });
}

// ==========================================
// Quiz Submit handlers
// ==========================================
export async function submitQuizGame(forceSubmit = false) {
  if (timerInstance) timerInstance.stop();
  if (questionTimerInstance) questionTimerInstance.stop();

  const answersPayload = Object.keys(savedAnswers)
    .filter(k => savedAnswers[k] !== 'skipped')
    .map(qId => ({
      question_id: Number(qId),
      answer: savedAnswers[qId]
    }));

  const submitFn = async () => {
    try {
      loader.show('Submitting final answers...');

      const submitBtn = document.getElementById('btn-submit-quiz');
      if (submitBtn) submitBtn.disabled = true;

      const res = await api.submitGame(attemptId, {
        answers: answersPayload
      });

      loader.hide();

      if (res.success) {
        if (!eliminated) {
          gameSound.submitted();
          burstConfetti({ count: 90, originY: 25 });
        }
        toast.success(res.message || 'Quiz submitted successfully.');

        // Clean localStorage keys cache
        localStorage.removeItem(`answers_${attemptId}`);

        setTimeout(() => {
          window.location.href = `./result.html?attempt_id=${attemptId}`;
        }, 1000);
      }
    } catch (error) {
      loader.hide();
      toast.error(error.message);
    }
  };

  if (forceSubmit) {
    await submitFn();
  } else {
    // Show confirmation modal
    import('../components/modal.js').then(({ modal }) => {
      modal.show({
        title: 'Submit Quiz',
        body: `Are you sure you want to end and submit your quiz attempt? You have answered <strong>${answersPayload.length}</strong> out of ${questions.length} questions.`,
        confirmText: 'Submit Quiz',
        cancelText: 'Continue Review',
        onConfirm: async () => {
          await submitFn();
        }
      });
    });
  }
}

// Bind Navigation buttons controls
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('question-card-container')) {
    initializeQuizRunner();

    // Previous Button click
    const prevBtn = document.getElementById('btn-prev-q');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (currentQuestionIndex > 0) {
          gameSound.advance();
          renderQuestion(currentQuestionIndex - 1);
        }
      });
    }

    // Next Button click
    const nextBtn = document.getElementById('btn-next-q');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (currentQuestionIndex < questions.length - 1) {
          gameSound.advance();
          renderQuestion(currentQuestionIndex + 1);
        }
      });
    }

    // Skip Button click
    const skipBtn = document.getElementById('btn-skip-q');
    if (skipBtn) {
      skipBtn.addEventListener('click', () => {
        const qId = questions[currentQuestionIndex].question_id;
        if (!savedAnswers[qId]) {
          saveAnswer(qId, 'skipped');
        }
        if (currentQuestionIndex < questions.length - 1) {
          gameSound.advance();
          renderQuestion(currentQuestionIndex + 1);
        } else {
          toast.warning('This is the last question. Click submit to finish.');
        }
      });
    }

    // Lock Final Answer (KBC only)
    const lockBtn = document.getElementById('btn-lock-answer');
    if (lockBtn) {
      lockBtn.addEventListener('click', () => {
        lockKbcAnswer(false);
      });
    }

    // Submit Quiz button click
    const submitBtn = document.getElementById('btn-submit-quiz');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        submitQuizGame();
      });
    }
  }
});
