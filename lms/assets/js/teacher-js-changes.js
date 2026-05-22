/* ============================================================
   teacher.js — CHANGED / ADDED FUNCTIONS ONLY
   Apply these changes to your existing teacher.js
   ============================================================ */

/* ─────────────────────────────────────────────────────────────
   TASK 7 — showNeonToast (NEW FUNCTION — add near top of file)
   Shows a top-center toast with neon glow. auto-hides.
───────────────────────────────────────────────────────────── */
function showNeonToast(message, type = 'success', duration = 3500) {
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


/* ─────────────────────────────────────────────────────────────
   TASK 5 + TASK 6 — renderQuestions (REPLACE existing function)
   Uses neon question-preview-card; button text → "Change Questions"
───────────────────────────────────────────────────────────── */
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


/* ─────────────────────────────────────────────────────────────
   TASK 7 — Form submit handler (REPLACE the DOMContentLoaded
   block that handles createGameForm submission)
───────────────────────────────────────────────────────────── */
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


/* ─────────────────────────────────────────────────────────────
   generateQuestions — REPLACE existing function
   Adds loading state + neon toast feedback
───────────────────────────────────────────────────────────── */
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
