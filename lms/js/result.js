import { api } from './api.js';
import { loader } from './loader.js';
import { toast } from './toast.js';
import { gameSound } from './gameSound.js';
import { burstConfetti } from './confetti.js';
import { storage } from './storage.js';

function medalFor(rank) {
  if (rank === 1) return { icon: 'bi-trophy-fill', color: '#f5c542', label: 'Champion' };
  if (rank === 2) return { icon: 'bi-award-fill', color: '#c0c0c0', label: 'Runner-up' };
  if (rank === 3) return { icon: 'bi-award-fill', color: '#cd7f32', label: '3rd Place' };
  return null;
}

// ==========================================
// Fetch and Load Quiz Result Details
// ==========================================
export async function loadQuizResult() {
  const container = document.getElementById('result-card-container');
  if (!container) return;

  const urlParams = new URLSearchParams(window.location.search);
  const attemptId = urlParams.get('attempt_id');

  if (!attemptId) {
    toast.error('No attempt ID specified.');
    window.location.href = storage.getRole() === 'teacher' ? './teacher-dashboard.html' : './student-dashboard.html';
    return;
  }

  try {
    loader.show('Loading results report...');
    const res = await api.getResult(attemptId);
    loader.hide();

    if (res.success && res.data) {
      const data = res.data;
      
      const totalQuestions = data.score + data.wrong_answers + data.unanswered;
      const percentage = totalQuestions > 0 ? Math.round((data.score / totalQuestions) * 100) : 0;
      
      const subTimeStr = new Date(data.submitted_at).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const medal = medalFor(Number(data.rank));

      container.innerHTML = `
        <div class="result-card-custom text-center bg-white rounded-4 border p-5">
          ${medal ? `
            <div class="result-medal-banner" style="--medal-color: ${medal.color};">
              <i class="bi ${medal.icon}"></i>
              <span>${medal.label}!</span>
            </div>
          ` : ''}

          <!-- Conic circular progress graph -->
          <div class="result-circular-progress" id="result-circular" style="--progress-value: 0;">
            <div class="result-circular-text" id="result-percentage-text">0%</div>
          </div>

          <h2 class="fw-bold mb-2 text-slate-800">${data.game_name}</h2>
          <p class="text-secondary small mb-4">${data.course_name} • ${data.stream_name}</p>

          <h5 class="fw-bold border-bottom pb-2 mb-4 text-slate-800 text-start">Performance Card</h5>
          
          <div class="row g-3 mb-4 text-start">
            <div class="col-md-6">
              <div class="performance-stat-item shadow-premium">
                <div>
                  <div class="text-muted small">Leaderboard Rank</div>
                  <div class="fw-bold text-dark fs-5"><i class="bi bi-award-fill text-warning me-1.5"></i>Rank #${data.rank}</div>
                </div>
              </div>
            </div>

            <div class="col-md-6">
              <div class="performance-stat-item shadow-premium">
                <div>
                  <div class="text-muted small">Score Gained</div>
                  <div class="fw-bold text-dark fs-5"><i class="bi bi-activity text-primary me-1.5"></i><span id="result-score-text">0</span> Points</div>
                </div>
              </div>
            </div>

            <div class="col-md-4">
              <div class="performance-stat-item shadow-premium border-success-subtle">
                <div>
                  <div class="text-success small">Correct Answers</div>
                  <div class="fw-bold text-success fs-5"><i class="bi bi-check-circle-fill me-1.5"></i>${data.correct_answers || data.score}</div>
                </div>
              </div>
            </div>

            <div class="col-md-4">
              <div class="performance-stat-item shadow-premium border-danger-subtle">
                <div>
                  <div class="text-danger small">Wrong Answers</div>
                  <div class="fw-bold text-danger fs-5"><i class="bi bi-x-circle-fill me-1.5"></i>${data.wrong_answers || 0}</div>
                </div>
              </div>
            </div>

            <div class="col-md-4">
              <div class="performance-stat-item shadow-premium border-warning-subtle">
                <div>
                  <div class="text-warning small">Unanswered Qs</div>
                  <div class="fw-bold text-warning fs-5"><i class="bi bi-exclamation-triangle-fill me-1.5"></i>${data.unanswered || 0}</div>
                </div>
              </div>
            </div>

            <div class="col-12 mt-3 text-center">
              <span class="text-muted small"><i class="bi bi-clock me-1"></i>Submitted on ${subTimeStr}</span>
            </div>
          </div>

          ${data.questions && data.questions.length > 0 ? `
            <h5 class="fw-bold border-bottom pb-2 mt-5 mb-4 text-slate-800 text-start">Question Review</h5>
            <div class="text-start mb-5">
              ${data.questions.map((q, idx) => {
                const isSkipped = q.selected_answer === null;
                const isCorrect = q.is_correct;
                
                let badgeClass = 'bg-danger-subtle text-danger';
                let badgeText = 'Wrong';
                let iconClass = 'bi-x-circle-fill';
                
                if (isCorrect) {
                  badgeClass = 'bg-success-subtle text-success';
                  badgeText = 'Correct';
                  iconClass = 'bi-check-circle-fill';
                } else if (isSkipped) {
                  badgeClass = 'bg-warning-subtle text-warning';
                  badgeText = 'Skipped';
                  iconClass = 'bi-exclamation-circle-fill';
                }

                return `
                  <div class="card border rounded-3 p-3 mb-3 shadow-sm">
                    <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
                      <span class="fw-bold text-dark">Q${idx + 1}. ${q.question}</span>
                      <span class="badge ${badgeClass} rounded-pill px-2 py-1 fw-semibold small d-inline-flex align-items-center gap-1">
                        <i class="bi ${iconClass}"></i> ${badgeText}
                      </span>
                    </div>
                    
                    <div class="d-grid gap-2 ps-2">
                      ${q.options.map((opt, oIdx) => {
                        const optLabel = String.fromCharCode(65 + oIdx);
                        const isSelected = q.selected_answer === optLabel;
                        const isCorrectOpt = q.correct_answer === optLabel;
                        
                        let optClass = 'border-light-subtle bg-light text-slate-700';
                        let optIcon = '';
                        
                        if (isCorrectOpt) {
                          optClass = 'border-success bg-success-subtle text-success-emphasis fw-semibold';
                          optIcon = '<i class="bi bi-check-lg ms-auto fs-5 text-success"></i>';
                        } else if (isSelected && !isCorrect) {
                          optClass = 'border-danger bg-danger-subtle text-danger-emphasis fw-semibold';
                          optIcon = '<i class="bi bi-x-lg ms-auto fs-5 text-danger"></i>';
                        } else if (isSelected) {
                          optClass = 'border-success bg-success-subtle text-success-emphasis fw-semibold';
                          optIcon = '<i class="bi bi-check-lg ms-auto fs-5 text-success"></i>';
                        }

                        return `
                          <div class="p-2 rounded-3 border d-flex align-items-center gap-2 small ${optClass}" style="transition: none;">
                            <span class="fw-bold">${optLabel}.</span>
                            <span>${opt}</span>
                            ${optIcon}
                          </div>
                        `;
                      }).join('')}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          ` : ''}

          <!-- Bottom controls buttons -->
          <div class="d-flex gap-2 justify-content-center pt-2">
            <a href="${storage.getRole() === 'teacher' ? './teacher-dashboard.html' : './student-dashboard.html'}" class="btn btn-primary rounded-pill px-4">
              <i class="bi bi-arrow-left me-1"></i>Back to Dashboard
            </a>
            ${data.course_id ? `
              <a href="${storage.getRole() === 'teacher' ? `./teacher-dashboard.html?course_id=${data.course_id}` : `./leaderboard.html?course_id=${data.course_id}`}" class="btn btn-outline-secondary rounded-pill px-4">
                <i class="bi bi-trophy-fill me-1"></i>View Leaderboard
              </a>
            ` : ''}
          </div>
        </div>
      `;

      animateResultReveal(percentage, data.score, Number(data.rank));
    }
  } catch (error) {
    loader.hide();
    toast.error('Failed to load result details.');
    container.innerHTML = `<div class="alert alert-danger border-0">${error.message}</div>`;
  }
}

// ==========================================
// Leaderboard-style animated reveal
// ==========================================
function animateResultReveal(percentage, score, rank) {
  const ring = document.getElementById('result-circular');
  const pctText = document.getElementById('result-percentage-text');
  const scoreText = document.getElementById('result-score-text');
  if (!ring || !pctText || !scoreText) return;

  const duration = 900;
  const steps = 40;
  let i = 0;

  const timer = setInterval(() => {
    i++;
    const progress = Math.min(i / steps, 1);
    const currentPct = Math.round(percentage * progress);
    const currentScore = Math.round(score * progress);

    ring.style.setProperty('--progress-value', currentPct);
    pctText.textContent = `${currentPct}%`;
    scoreText.textContent = currentScore;

    if (progress >= 1) clearInterval(timer);
  }, duration / steps);

  // Game-show style celebration for a strong finish
  if (rank <= 3 || percentage >= 70) {
    setTimeout(() => {
      gameSound.celebration();
      burstConfetti({ count: rank === 1 ? 120 : 80, originY: 20 });
    }, 300);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('result-card-container')) {
    loadQuizResult();
  }
});
