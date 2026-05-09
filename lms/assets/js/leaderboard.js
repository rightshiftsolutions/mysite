document.addEventListener("DOMContentLoaded", () => {
  if (!requireAuth()) return;
  loadLeaderboard();
});

async function loadLeaderboard() {
  try {
    const data = await apiRequest("/api/leaderboard");
    renderTopThree(data.topThree || []);
    renderLeaderboard(data.leaderboard || []);
  } catch (error) {
    const body = document.getElementById("leaderboardTableBody");
    if (body) {
      body.innerHTML = `
        <tr><td colspan="5" class="text-danger text-center py-4">${escapeHtml(error.message)}</td></tr>
      `;
    }
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
  const medals = ["🥇", "🥈", "🥉"];
  const messages = ["Champion zone", "Strong challenger", "Top performer"];
  const rankClass = `rank-${index + 1}`;

  return `
    <div class="col-md-4">
      <div class="card podium-card ${rankClass} text-center h-100">
        <div class="card-body">
          <div class="podium-medal">${medals[index] || "🏅"}</div>
          <div class="podium-name">${escapeHtml(student.name)}</div>
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
      <tr><td colspan="5" class="text-center text-muted py-4">No student score found yet.</td></tr>
    `;
    return;
  }

  body.innerHTML = leaderboard.map((student) => `
    <tr>
      <td class="fw-bold">#${student.rank}</td>
      <td>${escapeHtml(student.name)}</td>
      <td>${student.totalScore}</td>
      <td>${student.testsCompleted}</td>
      <td>${getLeaderboardMessage(student.rank)}</td>
    </tr>
  `).join("");
}

function getLeaderboardMessage(rank) {
  if (rank === 1) return "Leading the board 🏆";
  if (rank <= 3) return "Top three momentum 🌟";
  if (rank <= 10) return "Keep climbing 🚀";
  return "Every test improves you 💪";
}
