/* ==========================================================================
   invitations.js — Direct borrower / user registration logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  LoanFlow.requireAuth();
  LoanFlow.initLayout('Invitations');

  const registerForm = document.getElementById('registerForm');
  if (!registerForm) return;

  const confirmField = document.getElementById('regConfirm');
  if (confirmField) {
    confirmField.addEventListener('input', function () {
      this.setCustomValidity('');
    });
  }

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const pass = document.getElementById('regPassword').value;
    const confirm = document.getElementById('regConfirm').value;

    if (confirmField) {
      confirmField.setCustomValidity(pass !== confirm ? 'Passwords do not match' : '');
    }

    registerForm.classList.add('was-validated');
    if (!registerForm.checkValidity()) return;

    const btn = document.getElementById('registerBtn');
    if (btn) {
      btn.classList.add('is-loading');
      btn.disabled = true;
    }

    const payload = {
      full_name: document.getElementById('regName').value.trim(),
      email: document.getElementById('regEmail').value.trim(),
      mobile: document.getElementById('regMobile').value.trim(),
      password: pass
    };

    try {
      const res = await LoanFlow.api('/users/register', { method: 'POST', body: payload });
      LoanFlow.Toast.show('success', res.message || 'Borrower registered successfully.');
      registerForm.reset();
      registerForm.classList.remove('was-validated');
    } catch (err) {
      LoanFlow.Toast.show('danger', err.networkError ? err.message : (err.message || 'Registration failed.'));
    } finally {
      if (btn) {
        btn.classList.remove('is-loading');
        btn.disabled = false;
      }
    }
  });
});
