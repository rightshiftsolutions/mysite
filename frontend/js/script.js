// const BASE_URL = "http://localhost:5000";

const BASE_URL = "https://www.api.gymgurus.in";
// Show global loader
function showLoader() {
    const loader = document.getElementById("global-loader");
    if (loader) loader.classList.remove("hidden");
}

// Hide global loader
function hideLoader() {
    const loader = document.getElementById("global-loader");
    if (loader) loader.classList.add("hidden");
}

// Reusable API function
async function apiRequest(url, method = "GET", body = null) {
    const token = localStorage.getItem("token");

    const headers = {
        "Content-Type": "application/json"
    };

    if (token) {
        headers["Authorization"] = "Bearer " + token;
    }

    const options = {
        method,
        headers,
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        showLoader();
        const res = await fetch(BASE_URL + url, options);
        hideLoader();

        if (res.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "login.html";
            return null;
        }

        const data = await res.json();
        return { status: res.status, data };
    } catch (error) {
        hideLoader();
        console.error("API Error:", error);
        showAlert("Network error. Please try again later.", "danger");
        return { status: 500, data: { message: "Network error" } };
    }
}

// Protect pages (add to the top of protected pages)
function checkAuth() {
    if (!localStorage.getItem("token")) {
        window.location.href = "login.html";
    }
}

// Logout
function logout() {
    localStorage.removeItem("token");
    window.location.href = "login.html";
}

// Alert / Toast
function showAlert(message, type = "success") {
    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        container.className = "toast-container position-fixed top-0 end-0 p-3";
        container.style.zIndex = "1055";
        document.body.appendChild(container);
    }

    const toastEl = document.createElement("div");
    toastEl.className = `toast align-items-center text-bg-${type} border-0 show`;
    toastEl.setAttribute("role", "alert");
    toastEl.setAttribute("aria-live", "assertive");
    toastEl.setAttribute("aria-atomic", "true");

    toastEl.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">
          ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close" onclick="this.parentElement.parentElement.remove()"></button>
      </div>
    `;

    container.appendChild(toastEl);
    setTimeout(() => {
        toastEl.classList.remove("show");
        setTimeout(() => toastEl.remove(), 150);
    }, 3000);
}

// Format Date string
function formatDate(dateStr) {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return d.toLocaleDateString();
}

document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            logout();
        });
    }
});
