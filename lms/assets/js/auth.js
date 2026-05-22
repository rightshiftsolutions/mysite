function redirectByRole(user) {
  if (user.role === "TEACHER") {
    window.location.href = "teacher-dashboard.html";
    return;
  }

  window.location.href = "student-dashboard.html";
}

function bindLoginForm() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const button = form.querySelector("button[type='submit']");
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      setButtonLoading(button, true, "Logging in...");

      clearSession();

      const data = await apiRequest("/api/auth/login", {
        method: "POST",
        skipAuth: true,
        body: { email, password }
      });

      const token = data.token || data.accessToken || data.jwt;
      const user = data.user || data.profile;

      saveSession(token, user);
      redirectByRole(user);
    } catch (error) {
      showAlert("authMessage", error.message || "Login failed.", "danger");
    } finally {
      setButtonLoading(button, false);
    }
  });
}

function bindSignupForm() {
  const form = document.getElementById("signupForm");
  if (!form) return;

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const button = form.querySelector("button[type='submit']");
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const mobile = document.getElementById("mobile").value.trim();
    const batch = document.getElementById("batch").value.trim();
    const branch = document.getElementById("branch").value.trim();
    const password = document.getElementById("password").value;

    try {
      setButtonLoading(button, true, "Creating account...");

      await apiRequest("/api/auth/student-signup", {
        method: "POST",
        skipAuth: true,
       body: { name, email, mobile, batch, branch, password }
      });

      showAlert("authMessage", "Student account created. Please login now.", "success");
      form.reset();
    } catch (error) {
      showAlert("authMessage", error.message || "Signup failed.", "danger");
    } finally {
      setButtonLoading(button, false);
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  bindLoginForm();
  bindSignupForm();
});
