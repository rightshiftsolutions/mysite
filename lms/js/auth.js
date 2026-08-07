import { api } from './api.js';
import { storage } from './storage.js';
import { validation } from './validation.js';
import { loader } from '../components/loader.js';
import { toast } from '../components/toast.js';

// ==========================================
// Password Toggle Utility
// ==========================================
export function setupPasswordToggle(inputId, buttonId, iconId) {
  const passwordInput = document.getElementById(inputId);
  const toggleBtn = document.getElementById(buttonId);
  const toggleIcon = document.getElementById(iconId);

  if (!passwordInput || !toggleBtn || !toggleIcon) return;

  toggleBtn.addEventListener('click', () => {
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      toggleIcon.classList.remove('bi-eye');
      toggleIcon.classList.add('bi-eye-slash');
    } else {
      passwordInput.type = 'password';
      toggleIcon.classList.remove('bi-eye-slash');
      toggleIcon.classList.add('bi-eye');
    }
  });
}

// ==========================================
// Alert Helper
// ==========================================
function showAlert(message, type = 'danger') {
  const container = document.getElementById('alert-container');
  if (!container) return;

  const iconClass = type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill';
  container.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show border-0 shadow-sm rounded-3 py-2.5 px-3 mb-4 d-flex align-items-center gap-2" role="alert">
      <i class="bi ${iconClass} fs-5"></i>
      <div class="small">${message}</div>
      <button type="button" class="btn-close btn-close-custom" data-bs-dismiss="alert" aria-label="Close" style="padding: 1rem 1rem;"></button>
    </div>
  `;
}

function clearAlert() {
  const container = document.getElementById('alert-container');
  if (container) container.innerHTML = '';
}

// ==========================================
// User Login Handler (Student & Teacher)
// ==========================================
export async function handleUserLogin(event) {
  event.preventDefault();
  clearAlert();

  const loginIdInput = document.getElementById('login-id');
  const passwordInput = document.getElementById('password');
  const submitBtn = document.getElementById('submit-btn');

  const loginVal = loginIdInput.value.trim();
  const passwordVal = passwordInput.value;

  // Manual Validation Trigger
  let isValid = true;

  if (!loginVal) {
    validation.setInputValidity(loginIdInput, false, 'Email or Mobile number is required.');
    isValid = false;
  } else {
    validation.setInputValidity(loginIdInput, true);
  }

  if (!passwordVal) {
    validation.setInputValidity(passwordInput, false, 'Password is required.');
    isValid = false;
  } else if (!validation.isValidPassword(passwordVal)) {
    validation.setInputValidity(passwordInput, false, 'Password must be at least 8 characters.');
    isValid = false;
  } else {
    validation.setInputValidity(passwordInput, true);
  }

  if (!isValid) {
    toast.error('Please fix form validation errors.');
    return;
  }

  // API Submission
  try {
    loader.show('Authenticating...');
    submitBtn.disabled = true;

    const res = await api.login({
      login: loginVal,
      password: passwordVal
    });

    loader.hide();
    
    // Success handling
    if (res.success) {
      const { token, user } = res;
      
      // Check user approval status (specifically teachers)
      if (user.role === 'teacher' && user.approval_status !== 'approved') {
        submitBtn.disabled = false;
        if (user.approval_status === 'pending') {
          showAlert('Your registration request is pending for admin approval.', 'warning');
          toast.warning('Registration pending approval.');
        } else if (user.approval_status === 'declined') {
          showAlert('Your registration request has been declined.', 'danger');
          toast.error('Registration declined.');
        }
        return; // Stop and do not redirect
      }

      // Store credentials
      storage.saveToken(token);
      storage.saveUser(user);

      toast.success('Login successful! Redirecting...');

      // Redirect according to role
      setTimeout(() => {
        if (user.role === 'teacher') {
          window.location.href = './teacher-dashboard.html';
        } else if (user.role === 'student') {
          window.location.href = './student-dashboard.html';
        }
      }, 1000);
    }
  } catch (error) {
    loader.hide();
    submitBtn.disabled = false;
    let errorMsg = error.message;
    if (errorMsg === 'Invalid credentials.') {
      errorMsg = 'Invalid email/mobile or password.';
    }
    showAlert(errorMsg);
    toast.error(errorMsg);
  }
}

// ==========================================
// Admin Login Handler
// ==========================================
export async function handleAdminLogin(event) {
  event.preventDefault();
  clearAlert();

  const emailInput = document.getElementById('admin-email');
  const passwordInput = document.getElementById('admin-password');
  const submitBtn = document.getElementById('submit-btn');

  const emailVal = emailInput.value.trim();
  const passwordVal = passwordInput.value;

  let isValid = true;

  if (!emailVal || !validation.isValidEmail(emailVal)) {
    validation.setInputValidity(emailInput, false, 'Please enter a valid admin email.');
    isValid = false;
  } else {
    validation.setInputValidity(emailInput, true);
  }

  if (!passwordVal) {
    validation.setInputValidity(passwordInput, false, 'Password is required.');
    isValid = false;
  } else {
    validation.setInputValidity(passwordInput, true);
  }

  if (!isValid) {
    toast.error('Please correct inputs.');
    return;
  }

  try {
    loader.show('Accessing Console...');
    submitBtn.disabled = true;

    const res = await api.adminLogin({
      email: emailVal,
      password: passwordVal
    });

    loader.hide();

    if (res.success) {
      const { token, admin } = res;
      
      // Store credentials
      storage.saveToken(token);
      storage.saveUser({
        id: admin.admin_id,
        name: admin.name,
        email: admin.email,
        role: 'admin'
      });

      toast.success('Admin login successful!');

      setTimeout(() => {
        window.location.href = './admin-dashboard.html';
      }, 1000);
    }
  } catch (error) {
    loader.hide();
    submitBtn.disabled = false;
    let errorMsg = error.message;
    if (errorMsg === 'Invalid credentials.') {
      errorMsg = 'Invalid email or password.';
    }
    showAlert(errorMsg);
    toast.error(errorMsg);
  }
}

// ==========================================
// Student Registration Handler
// ==========================================
export async function handleStudentRegistration(event) {
  event.preventDefault();
  clearAlert();

  const form = event.target;
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const mobileInput = document.getElementById('mobile');
  const studentIdInput = document.getElementById('student-id');
  const streamSelect = document.getElementById('stream-id');
  const batchYearSelect = document.getElementById('batch-end-year');
  const passwordInput = document.getElementById('password');
  const confirmInput = document.getElementById('confirm-password');
  const submitBtn = document.getElementById('submit-btn');

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const mobile = mobileInput.value.trim();
  const studentId = studentIdInput.value.trim();
  const streamId = streamSelect.value;
  const batchEndYear = batchYearSelect ? batchYearSelect.value : '';
  const password = passwordInput.value;
  const confirmPassword = confirmInput.value;

  let isValid = true;

  if (!name) {
    validation.setInputValidity(nameInput, false, 'Full name is required.');
    isValid = false;
  } else {
    validation.setInputValidity(nameInput, true);
  }

  if (!email || !validation.isValidEmail(email)) {
    validation.setInputValidity(emailInput, false, 'Enter a valid email address.');
    isValid = false;
  } else {
    validation.setInputValidity(emailInput, true);
  }

  if (!mobile || !validation.isValidMobile(mobile)) {
    validation.setInputValidity(mobileInput, false, 'Enter a valid 10-digit mobile number.');
    isValid = false;
  } else {
    validation.setInputValidity(mobileInput, true);
  }

  if (!studentId || !/^[0-9]+$/.test(studentId)) {
    validation.setInputValidity(studentIdInput, false, 'Student ID must be numeric.');
    isValid = false;
  } else {
    validation.setInputValidity(studentIdInput, true);
  }

  if (!streamId) {
    validation.setInputValidity(streamSelect, false, 'Please select your stream.');
    isValid = false;
  } else {
    validation.setInputValidity(streamSelect, true);
  }

  if (!batchEndYear) {
    if (batchYearSelect) validation.setInputValidity(batchYearSelect, false, 'Please select your batch end year.');
    isValid = false;
  } else {
    if (batchYearSelect) validation.setInputValidity(batchYearSelect, true);
  }

  if (!password || !validation.isValidPassword(password)) {
    validation.setInputValidity(passwordInput, false, 'Password must be at least 8 characters.');
    isValid = false;
  } else {
    validation.setInputValidity(passwordInput, true);
  }

  if (!confirmPassword || !validation.isPasswordMatch(password, confirmPassword)) {
    validation.setInputValidity(confirmInput, false, 'Passwords do not match.');
    isValid = false;
  } else {
    validation.setInputValidity(confirmInput, true);
  }

  if (!isValid) {
    toast.error('Validation failed. Please correct form fields.');
    return;
  }

  try {
    loader.show('Registering Student Account...');
    submitBtn.disabled = true;

    const res = await api.studentRegister({
      name,
      email,
      mobile,
      password,
      stream_id: Number(streamId),
      student_id: studentId,
      batch_end_year: Number(batchEndYear)
    });

    loader.hide();

    if (res.success) {
      toast.success(res.message || 'Registration request sent. Please wait for admin approval.');
      form.reset();
      
      // Remove Bootstrap validation visual styles
      form.querySelectorAll('.form-control, .form-select').forEach(el => {
        el.classList.remove('is-valid', 'is-invalid');
      });

      // Redirect to login page after a short delay so the student
      // reads the "awaiting admin approval" message.
      setTimeout(() => {
        window.location.href = './login.html';
      }, 2500);
    }
  } catch (error) {
    loader.hide();
    submitBtn.disabled = false;
    showAlert(error.message);
  }
}

// ==========================================
// Teacher Registration Handler
// ==========================================
export async function handleTeacherRegistration(event) {
  event.preventDefault();
  clearAlert();

  const form = event.target;
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const mobileInput = document.getElementById('mobile');
  const passwordInput = document.getElementById('password');
  const confirmInput = document.getElementById('confirm-password');
  const submitBtn = document.getElementById('submit-btn');

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const mobile = mobileInput.value.trim();
  const password = passwordInput.value;
  const confirmPassword = confirmInput.value;

  let isValid = true;

  if (!name) {
    validation.setInputValidity(nameInput, false, 'Full name is required.');
    isValid = false;
  } else {
    validation.setInputValidity(nameInput, true);
  }

  if (!email || !validation.isValidEmail(email)) {
    validation.setInputValidity(emailInput, false, 'Enter a valid email address.');
    isValid = false;
  } else {
    validation.setInputValidity(emailInput, true);
  }

  if (!mobile || !validation.isValidMobile(mobile)) {
    validation.setInputValidity(mobileInput, false, 'Enter a valid 10-digit mobile number.');
    isValid = false;
  } else {
    validation.setInputValidity(mobileInput, true);
  }

  if (!password || !validation.isValidPassword(password)) {
    validation.setInputValidity(passwordInput, false, 'Password must be at least 8 characters.');
    isValid = false;
  } else {
    validation.setInputValidity(passwordInput, true);
  }

  if (!confirmPassword || !validation.isPasswordMatch(password, confirmPassword)) {
    validation.setInputValidity(confirmInput, false, 'Passwords do not match.');
    isValid = false;
  } else {
    validation.setInputValidity(confirmInput, true);
  }

  if (!isValid) {
    toast.error('Validation failed. Please correct fields.');
    return;
  }

  try {
    loader.show('Submitting Teacher Request...');
    submitBtn.disabled = true;

    const res = await api.teacherRegister({
      name,
      email,
      mobile,
      password
    });

    loader.hide();

    if (res.success) {
      showAlert(res.message || 'Registration request sent successfully. Wait for admin approval.', 'success');
      toast.success('Registration request submitted!');
      form.reset();

      form.querySelectorAll('.form-control').forEach(el => {
        el.classList.remove('is-valid', 'is-invalid');
      });

      // Redirect to login page after 2 seconds
      setTimeout(() => {
        window.location.href = './login.html';
      }, 2000);
    }
  } catch (error) {
    loader.hide();
    submitBtn.disabled = false;
    showAlert(error.message);
  }
}

// ==========================================
// Forgot Password Handler
// ==========================================
export async function handleForgotPassword(event) {
  event.preventDefault();
  clearAlert();

  const emailInput = document.getElementById('email');
  const submitBtn = document.getElementById('submit-btn');
  const emailVal = emailInput.value.trim();

  if (!emailVal || !validation.isValidEmail(emailVal)) {
    validation.setInputValidity(emailInput, false, 'Please enter a valid email address.');
    toast.error('Invalid email address.');
    return;
  }
  validation.setInputValidity(emailInput, true);

  try {
    loader.show('Sending Recovery Link...');
    submitBtn.disabled = true;

    const res = await api.forgotPassword({ email: emailVal });

    loader.hide();

    if (res.success) {
      toast.success(res.message || 'Password reset OTP sent to your email.');
      showAlert(res.message || 'Password reset OTP sent to your email.', 'success');
      
      setTimeout(() => {
        window.location.href = `./reset-password.html?email=${encodeURIComponent(emailVal)}`;
      }, 2000);
    }
  } catch (error) {
    loader.hide();
    submitBtn.disabled = false;
    showAlert(error.message);
  }
}

// ==========================================
// Reset Password Handler
// ==========================================
export async function handleResetPassword(event) {
  event.preventDefault();
  clearAlert();

  const emailInput = document.getElementById('email');
  const otpInput = document.getElementById('reset-otp');
  const passwordInput = document.getElementById('password');
  const confirmInput = document.getElementById('confirm-password');
  const submitBtn = document.getElementById('submit-btn');

  const email = emailInput.value.trim();
  const otp = otpInput.value.trim();
  const password = passwordInput.value;
  const confirmPassword = confirmInput.value;

  let isValid = true;

  if (!email || !validation.isValidEmail(email)) {
    validation.setInputValidity(emailInput, false, 'Please enter a valid email address.');
    isValid = false;
  } else {
    validation.setInputValidity(emailInput, true);
  }

  if (!otp || !/^\d{6}$/.test(otp)) {
    validation.setInputValidity(otpInput, false, 'OTP code must be exactly 6 digits.');
    isValid = false;
  } else {
    validation.setInputValidity(otpInput, true);
  }

  if (!password || !validation.isValidPassword(password)) {
    validation.setInputValidity(passwordInput, false, 'Password must be at least 8 characters.');
    isValid = false;
  } else {
    validation.setInputValidity(passwordInput, true);
  }

  if (!confirmPassword || !validation.isPasswordMatch(password, confirmPassword)) {
    validation.setInputValidity(confirmInput, false, 'Passwords do not match.');
    isValid = false;
  } else {
    validation.setInputValidity(confirmInput, true);
  }

  if (!isValid) {
    toast.error('Validation failed.');
    return;
  }

  try {
    loader.show('Saving New Password...');
    submitBtn.disabled = true;

    const res = await api.resetPassword({
      email,
      otp,
      password
    });

    loader.hide();

    if (res.success) {
      toast.success('Password reset successfully!');
      showAlert('Password reset successfully. Redirecting to login...', 'success');

      setTimeout(() => {
        window.location.href = './login.html';
      }, 2000);
    }
  } catch (error) {
    loader.hide();
    submitBtn.disabled = false;
    showAlert(error.message);
  }
}

// ==========================================
// Authentication Guards Router
// ==========================================
export function checkAuthGuard() {
  const path = window.location.pathname.toLowerCase();
  const token = storage.getToken();
  const role = storage.getRole();

  // Route protection
  if (path.includes('admin-dashboard.html')) {
    if (!token || role !== 'admin') {
      storage.logout();
      window.location.href = './admin-login.html';
    }
  } else if (path.includes('teacher-dashboard.html')) {
    if (!token || role !== 'teacher') {
      storage.logout();
      window.location.href = './login.html';
    }
  } else if (path.includes('student-dashboard.html')) {
    if (!token || role !== 'student') {
      storage.logout();
      window.location.href = './login.html';
    }
  }

  // Avoid accessing auth pages when already logged in
  const authFiles = ['login.html', 'admin-login.html', 'student-register.html', 'teacher-register.html', 'forgot-password.html', 'reset-password.html'];
  const isAuthPage = authFiles.some(file => path.includes(file));

  if (isAuthPage && token && role) {
    if (role === 'admin') {
      window.location.href = './admin-dashboard.html';
    } else if (role === 'teacher') {
      window.location.href = './teacher-dashboard.html';
    } else if (role === 'student') {
      window.location.href = './student-dashboard.html';
    }
  }
}

// Auto-run guard check on import
checkAuthGuard();
