/* ============================================================
   student.js — CHANGED FUNCTION ONLY
   Replace the existing loadActiveGame function with this one.
   Task 8: Student dashboard active challenge card redesign.
   ============================================================ */

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
