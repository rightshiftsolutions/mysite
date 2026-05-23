// const API_BASE_URL = (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL ? window.APP_CONFIG.API_BASE_URL : "http://localhost:5000").replace(/\/$/, "");
const API_BASE_URL="http://localhost:5000";

const TOKEN_STORAGE_KEY = "lms_token";
const USER_STORAGE_KEY = "lms_user";
const LEGACY_TOKEN_KEYS = ["lms_token", "token", "authToken", "accessToken"];

function isUsableToken(value) {
  if (!value || typeof value !== "string") return false;

  const token = value.trim();

  if (!token || token === "undefined" || token === "null" || token === "[object Object]") {
    return false;
  }

  return token.length > 20;
}

function getAuthToken() {
  for (const key of LEGACY_TOKEN_KEYS) {
    const token = localStorage.getItem(key);
    if (isUsableToken(token)) {
      return token.trim();
    }
  }

  return null;
}

async function apiRequest(path, options = {}) {
  const token = options.skipAuth ? null : getAuthToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let body = options.body;
  if (body && typeof body === "object" && !(body instanceof FormData)) {
    body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data.message || `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.data = data;

    if (response.status === 401 && !options.skipAuth) {
      clearSession();
      sessionStorage.setItem("auth_error_message", message);
    }

    throw error;
  }

  return data;
}

async function apiFetch(path, options = {}) {
  return apiRequest(path, options);
}

function showAlert(targetId, message, type = "success", autoDismissMs = 5000) {
  const target = document.getElementById(targetId);
  if (!target) return;

  target.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${escapeHtml(message)}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;

  // Auto-dismiss after delay with smooth Bootstrap fade-out
  if (autoDismissMs > 0) {
    const alertEl = target.querySelector('.alert');
    if (alertEl) {
      setTimeout(() => {
        alertEl.classList.remove('show');
        alertEl.addEventListener('transitionend', () => {
          if (alertEl.parentNode) alertEl.remove();
        }, { once: true });
        // Fallback cleanup if transitionend doesn't fire
        setTimeout(() => { if (alertEl.parentNode) alertEl.remove(); }, 500);
      }, autoDismissMs);
    }
  }
}

function setButtonLoading(button, isLoadingOrText, loadingText = "Please wait...") {
  if (!button) return function noop() {};

  // Supports both styles:
  // setButtonLoading(button, true, "Loading..."); setButtonLoading(button, false)
  // const reset = setButtonLoading(button, "Loading..."); reset();
  if (typeof isLoadingOrText === "boolean") {
    if (isLoadingOrText) {
      button.dataset.originalText = button.innerHTML;
      button.disabled = true;
      button.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>${loadingText}`;
    } else {
      button.disabled = false;
      button.innerHTML = button.dataset.originalText || button.innerHTML;
    }
    return function reset() {
      setButtonLoading(button, false);
    };
  }

  const text = isLoadingOrText || loadingText;
  button.dataset.originalText = button.innerHTML;
  button.disabled = true;
  button.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>${text}`;

  return function reset() {
    button.disabled = false;
    button.innerHTML = button.dataset.originalText || button.innerHTML;
  };
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function statusBadge(status) {
  const map = {
    STARTED: "success",
    INACTIVE: "secondary",
    COMPLETED: "dark",
    SUBMITTED: "primary"
  };
  const color = map[status] || "secondary";
  return `<span class="badge text-bg-${color}">${escapeHtml(status)}</span>`;
}

function gameTypeLabel(gameType) {
  const map = {
    RAPID_FIRE: "Rapid Fire",
    BONUS_POINTS: "Bonus Points",
    NEGATIVE_MARKING: "Negative Marking",
    NO_NEGATIVE_MARKING: "No Negative Marking",
    SHADOWMIND: "KBC"
  };
  return map[gameType] || gameType;
}

function getGameUiConfig(gameType) {
  const map = {
    RAPID_FIRE: {
      heroClass: "rapid-fire",
      icon: "⚡",
      title: "Rapid Fire Mode",
      tagline: "Move fast, stay sharp, and answer with confidence.",
      timerSeconds: 90,
      questionMessage: "Speed round active. Keep your momentum!"
    },
    BONUS_POINTS: {
      heroClass: "bonus-points",
      icon: "🌟",
      title: "Bonus Points Mode",
      tagline: "Every strong answer helps you climb higher.",
      timerSeconds: 0,
      questionMessage: "Build your confidence question by question."
    },
    NEGATIVE_MARKING: {
      heroClass: "negative-marking",
      icon: "🎯",
      title: "Challenge Mode",
      tagline: "Think carefully. Accuracy matters in this round.",
      timerSeconds: 0,
      questionMessage: "Choose carefully. Skipping doubtful questions can be smart."
    },
    NO_NEGATIVE_MARKING: {
      heroClass: "no-negative-marking",
      icon: "🚀",
      title: "Practice Power Mode",
      tagline: "Attempt freely and keep learning as you go.",
      timerSeconds: 0,
      questionMessage: "No pressure. Every attempt improves your learning."
    },
    SHADOWMIND: {
  heroClass: "kbc",
  icon: "⚡",
  title: "KBC Arena",
  tagline: "Enter the ultimate quiz arena.",
  timerSeconds: 30,
  questionMessage: "Think fast and answer carefully."
}
  };
  return map[gameType] || map.NO_NEGATIVE_MARKING;
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_STORAGE_KEY));
  } catch {
    return null;
  }
}

function saveSession(token, user) {
  if (!isUsableToken(token)) {
    throw new Error("Login response did not contain a valid token.");
  }

  clearSession();
  localStorage.setItem(TOKEN_STORAGE_KEY, token.trim());
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user || {}));
}

function clearSession() {
  LEGACY_TOKEN_KEYS.forEach((key) => localStorage.removeItem(key));
  localStorage.removeItem(USER_STORAGE_KEY);
  sessionStorage.removeItem("currentGame");
  sessionStorage.removeItem("lastResult");
}

function isLoggedIn() {
  return Boolean(getAuthToken());
}

function requireAuth(allowedRoles) {
  if (!isLoggedIn()) {
    window.location.href = "login.html";
    return null;
  }

  const user = getCurrentUser();
  const roles = Array.isArray(allowedRoles) ? allowedRoles : allowedRoles ? [allowedRoles] : [];

  if (roles.length && (!user || !roles.includes(user.role))) {
    goDashboard();
    return null;
  }

  return user || true;
}

function requireRole(role) {
  return requireAuth(role);
}

function logout() {
  clearSession();
  window.location.href = "login.html";
}

function goDashboard() {
  const user = getCurrentUser();

  if (user && user.role === "TEACHER") {
    window.location.href = "teacher-dashboard.html";
    return;
  }

  if (user && user.role === "STUDENT") {
    window.location.href = "student-dashboard.html";
    return;
  }

  window.location.href = "login.html";
}

function renderCurrentUserLabels() {
  const user = getCurrentUser();
  document.querySelectorAll("[data-current-user]").forEach((el) => {
    el.textContent = user ? (user.name || user.email) : "";
  });
}

document.addEventListener("DOMContentLoaded", renderCurrentUserLabels);
