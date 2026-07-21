/* ==========================================================================
   auth.js — Login & Register page logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  LoanFlow.redirectIfLoggedIn();

  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      loginForm.classList.add('was-validated');
      if (!loginForm.checkValidity()) return;

      const btn = document.getElementById('loginBtn');
      btn.classList.add('is-loading'); btn.disabled = true;

      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;

      try {
        const res = await LoanFlow.api('/users/login', { method: 'POST', auth: false, body: { email, password } });
        LoanFlow.Auth.setSession(res.token, res.user);
        LoanFlow.Toast.show('success', 'Welcome back, ' + (res.user?.full_name?.split(' ')[0] || 'there') + '!');
        setTimeout(() => window.location.href = 'dashboard.html', 500);
      } catch (err) {
        LoanFlow.Toast.show('danger', err.networkError ? err.message : (err.message || 'Login failed.'));
      } finally {
        btn.classList.remove('is-loading'); btn.disabled = false;
      }
    });

    // Forgot Password Flow
    const forgotLink = document.getElementById('forgotPasswordLink');
    const forgotModalEl = document.getElementById('forgotPasswordModal');
    let forgotModal;
    if (forgotModalEl && window.bootstrap) {
      forgotModal = new bootstrap.Modal(forgotModalEl);
    }

    const step1 = document.getElementById('fpStep1');
    const step2 = document.getElementById('fpStep2');
    const step3 = document.getElementById('fpStep3');

    let fpTargetEmailStr = '';
    let verifiedOtpStr = '';

    if (forgotLink) {
      forgotLink.addEventListener('click', (e) => {
        e.preventDefault();
        const loginEmailVal = document.getElementById('loginEmail')?.value.trim() || '';
        if (document.getElementById('fpEmail')) document.getElementById('fpEmail').value = loginEmailVal;

        if (step1) step1.classList.remove('d-none');
        if (step2) step2.classList.add('d-none');
        if (step3) step3.classList.add('d-none');

        forgotModal?.show();
      });
    }

    // Step 1: Send OTP
    const sendOtpBtn = document.getElementById('fpSendOtpBtn');
    sendOtpBtn?.addEventListener('click', async () => {
      const email = document.getElementById('fpEmail')?.value.trim();
      if (!email) {
        LoanFlow.Toast.show('warning', 'Please enter your email address.');
        return;
      }

      sendOtpBtn.classList.add('is-loading'); sendOtpBtn.disabled = true;
      try {
        const res = await LoanFlow.api('/users/forgot-password', { method: 'POST', auth: false, body: { email } });
        fpTargetEmailStr = email;
        LoanFlow.Toast.show('success', res.message || 'OTP sent successfully!');

        document.getElementById('fpTargetEmail').textContent = email;

        if (step1) step1.classList.add('d-none');
        if (step2) step2.classList.remove('d-none');
      } catch (err) {
        LoanFlow.Toast.show('danger', err.message || 'Could not send OTP.');
      } finally {
        sendOtpBtn.classList.remove('is-loading'); sendOtpBtn.disabled = false;
      }
    });

    // Step 2: Verify OTP
    const verifyOtpBtn = document.getElementById('fpVerifyOtpBtn');
    verifyOtpBtn?.addEventListener('click', async () => {
      const otp = document.getElementById('fpOtp')?.value.trim();
      if (!otp || otp.length !== 6) {
        LoanFlow.Toast.show('warning', 'Please enter a valid 6-digit OTP code.');
        return;
      }

      verifyOtpBtn.classList.add('is-loading'); verifyOtpBtn.disabled = true;
      try {
        const res = await LoanFlow.api('/users/verify-otp', { method: 'POST', auth: false, body: { email: fpTargetEmailStr, otp } });
        verifiedOtpStr = otp;
        LoanFlow.Toast.show('success', 'OTP verified successfully!');

        if (step2) step2.classList.add('d-none');
        if (step3) step3.classList.remove('d-none');
      } catch (err) {
        LoanFlow.Toast.show('danger', err.message || 'Invalid or expired OTP.');
      } finally {
        verifyOtpBtn.classList.remove('is-loading'); verifyOtpBtn.disabled = false;
      }
    });

    // Step 3: Save New Password
    const resetPasswordBtn = document.getElementById('fpResetPasswordBtn');
    resetPasswordBtn?.addEventListener('click', async () => {
      const newPass = document.getElementById('fpNewPassword')?.value;
      const confirmPass = document.getElementById('fpConfirmPassword')?.value;

      if (!newPass || newPass.length < 6) {
        LoanFlow.Toast.show('warning', 'Password must be at least 6 characters long.');
        return;
      }
      if (newPass !== confirmPass) {
        LoanFlow.Toast.show('danger', 'Passwords do not match.');
        return;
      }

      resetPasswordBtn.classList.add('is-loading'); resetPasswordBtn.disabled = true;
      try {
        const res = await LoanFlow.api('/users/reset-password', {
          method: 'POST',
          auth: false,
          body: { email: fpTargetEmailStr, otp: verifiedOtpStr, new_password: newPass }
        });

        LoanFlow.Toast.show('success', res.message || 'Password reset successfully!');
        forgotModal?.hide();

        if (document.getElementById('loginEmail')) document.getElementById('loginEmail').value = fpTargetEmailStr;
        if (document.getElementById('loginPassword')) document.getElementById('loginPassword').value = '';
      } catch (err) {
        LoanFlow.Toast.show('danger', err.message || 'Could not reset password.');
      } finally {
        resetPasswordBtn.classList.remove('is-loading'); resetPasswordBtn.disabled = false;
      }
    });
  }

  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    // Support invite links: register.html?lenderId=3
    const params = new URLSearchParams(location.search);
    const lenderId = params.get('lenderId');
    const inviteBanner = document.getElementById('inviteBanner');
    if (lenderId && inviteBanner) {
      inviteBanner.classList.remove('d-none');
      inviteBanner.querySelector('.lender-id').textContent = lenderId;
    }

    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const pass = document.getElementById('regPassword').value;
      const confirm = document.getElementById('regConfirm').value;
      const confirmField = document.getElementById('regConfirm');
      confirmField.setCustomValidity(pass !== confirm ? 'Passwords do not match' : '');

      registerForm.classList.add('was-validated');
      if (!registerForm.checkValidity()) return;

      const btn = document.getElementById('registerBtn');
      btn.classList.add('is-loading'); btn.disabled = true;

      const payload = {
        full_name: document.getElementById('regName').value.trim(),
        email: document.getElementById('regEmail').value.trim(),
        mobile: document.getElementById('regMobile').value.trim(),
        password: pass
      };

      const path = lenderId ? `/users/register/${lenderId}` : '/users/register';

      try {
        await LoanFlow.api(path, { method: 'POST', auth: false, body: payload });
        LoanFlow.Toast.show('success', 'Account created! Redirecting to sign in…');
        setTimeout(() => window.location.href = 'login.html', 900);
      } catch (err) {
        LoanFlow.Toast.show('danger', err.networkError ? err.message : (err.message || 'Registration failed.'));
      } finally {
        btn.classList.remove('is-loading'); btn.disabled = false;
      }
    });

    document.getElementById('regConfirm')?.addEventListener('input', function () { this.setCustomValidity(''); });
  }
});
