import { api } from './api.js';
import { loader } from './loader.js';
import { toast } from './toast.js';
import { storage } from './storage.js';
import { validation } from './validation.js';

// ==========================================
// Admin Profile Loader
// ==========================================
export async function loadAdminProfile() {
  const profileCard = document.getElementById('profile-card');
  if (!profileCard) return;

  try {
    loader.show('Loading profile...');
    const res = await api.getAdminProfile();
    loader.hide();

    if (res.success && res.data) {
      const admin = res.data;
      const badgeColor = admin.status === 'active' ? 'success' : 'danger';
      
      profileCard.innerHTML = `
        <div class="row align-items-center g-4">
          <div class="col-md-4 text-center">
            <div class="bg-light rounded-circle d-inline-flex align-items-center justify-content-center border" style="width: 120px; height: 120px;">
              <i class="bi bi-person-workspace text-secondary" style="font-size: 4rem;"></i>
            </div>
            <h3 class="fw-bold mt-3 mb-0">${admin.name}</h3>
            <span class="badge bg-primary rounded-pill mt-2 px-3">${admin.role.toUpperCase()}</span>
          </div>
          <div class="col-md-8 border-start-md">
            <div class="p-2">
              <h5 class="fw-bold mb-4">Account Information</h5>
              <div class="row g-3">
                <div class="col-sm-6">
                  <div class="text-muted small">ADMIN ID</div>
                  <div class="fw-semibold text-dark">${admin.admin_id}</div>
                </div>
                <div class="col-sm-6">
                  <div class="text-muted small">ACCOUNT STATUS</div>
                  <div><span class="badge bg-${badgeColor} rounded-pill px-3">${admin.status.toUpperCase()}</span></div>
                </div>
                <div class="col-sm-12">
                  <div class="text-muted small">EMAIL ADDRESS</div>
                  <div class="fw-semibold text-dark">${admin.email}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }
  } catch (error) {
    loader.hide();
    toast.error('Failed to load admin profile data.');
  }
}

// ==========================================
// Teacher Profile Loader
// ==========================================
export async function loadTeacherProfile() {
  const card = document.getElementById('teacher-profile-card');
  if (!card) return;

  try {
    loader.show('Loading teacher profile...');
    const res = await api.getTeacherProfile();
    loader.hide();

    if (res.success && res.data) {
      const user = res.data;
      const badgeColor = user.approval_status === 'approved' ? 'success' : 
                         user.approval_status === 'pending' ? 'warning' : 'danger';

      const joinDateStr = new Date(user.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      card.innerHTML = `
        <div class="row align-items-center g-4">
          <div class="col-md-4 text-center">
            <div class="profile-avatar-box">
              <i class="bi bi-person-video3 profile-avatar-icon"></i>
            </div>
            <h3 class="fw-bold mt-2 mb-0">${user.name}</h3>
            <span class="badge bg-primary rounded-pill mt-2 px-3">${user.role.toUpperCase()}</span>
          </div>
          <div class="col-md-8">
            <div class="p-2">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <h5 class="fw-bold mb-0">Teacher Specifications</h5>
                <a href="./edit-profile.html" class="btn btn-sm btn-primary rounded-pill px-3">
                  <i class="bi bi-pencil-square me-1"></i>Edit Profile
                </a>
              </div>
              <div class="row g-3">
                <div class="col-sm-6">
                  <div class="profile-info-label">TEACHER ID</div>
                  <div class="profile-info-value">${user.id}</div>
                </div>
                <div class="col-sm-6">
                  <div class="profile-info-label">APPROVAL STATUS</div>
                  <div><span class="badge bg-${badgeColor} rounded-pill px-3 py-1 text-uppercase">${user.approval_status}</span></div>
                </div>
                <div class="col-sm-6">
                  <div class="profile-info-label">EMAIL ADDRESS</div>
                  <div class="profile-info-value">${user.email}</div>
                </div>
                <div class="col-sm-6">
                  <div class="profile-info-label">MOBILE NUMBER</div>
                  <div class="profile-info-value">${user.mobile}</div>
                </div>
                <div class="col-sm-6">
                  <div class="profile-info-label">JOINING DATE</div>
                  <div class="profile-info-value">${joinDateStr}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }
  } catch (error) {
    loader.hide();
    toast.error('Failed to retrieve teacher profile.');
    card.innerHTML = `<div class="alert alert-danger border-0">${error.message}</div>`;
  }
}

// ==========================================
// Student Profile Loader
// ==========================================
export async function loadStudentProfile() {
  const card = document.getElementById('student-profile-card');
  if (!card) return;

  try {
    loader.show('Loading student profile...');
    const res = await api.getStudentProfile();
    loader.hide();

    if (res.success && res.data) {
      const user = res.data;
      const badgeColor = user.approval_status === 'approved' ? 'success' : 'warning';
      
      const regDateStr = new Date(user.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      card.innerHTML = `
        <div class="row align-items-center g-4">
          <div class="col-md-4 text-center">
            <div class="profile-avatar-box">
              <i class="bi bi-mortarboard profile-avatar-icon text-primary"></i>
            </div>
            <h3 class="fw-bold mt-2 mb-0">${user.name}</h3>
            <span class="badge bg-primary rounded-pill mt-2 px-3">${user.role.toUpperCase()}</span>
          </div>
          <div class="col-md-8">
            <div class="p-2">
              <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <h5 class="fw-bold mb-0">Student Specifications</h5>
                <div class="d-flex gap-2 flex-wrap">
                  <a href="./edit-profile.html" class="btn btn-sm btn-primary rounded-pill px-3">
                    <i class="bi bi-pencil-square me-1"></i>Edit Profile
                  </a>
                  <a href="./change-password.html" class="btn btn-sm btn-outline-secondary rounded-pill px-3">
                    <i class="bi bi-key me-1"></i>Change Password
                  </a>
                  <button type="button" class="btn btn-sm btn-outline-danger rounded-pill px-3" id="delete-account-btn">
                    <i class="bi bi-trash3 me-1"></i>Delete Account
                  </button>
                </div>
              </div>
              <div class="row g-3">
                <div class="col-sm-6">
                  <div class="profile-info-label">ROLL NUMBER</div>
                  <div class="profile-info-value">${user.student_id || 'N/A'}</div>
                </div>
                <div class="col-sm-6">
                  <div class="profile-info-label">ACADEMIC STREAM</div>
                  <div class="profile-info-value"><span class="badge bg-light text-secondary border rounded-pill px-2.5 py-1">${user.stream_name || 'N/A'}</span></div>
                </div>
                <div class="col-sm-6">
                  <div class="profile-info-label">BATCH END YEAR</div>
                  <div class="profile-info-value">${user.batch_end_year || 'N/A'}</div>
                </div>
                <div class="col-sm-6">
                  <div class="profile-info-label">APPROVAL STATUS</div>
                  <div><span class="badge bg-${badgeColor} rounded-pill px-3 py-1 text-uppercase">${user.approval_status}</span></div>
                </div>
                <div class="col-sm-6">
                  <div class="profile-info-label">EMAIL ADDRESS</div>
                  <div class="profile-info-value">${user.email || '-'}</div>
                </div>
                <div class="col-sm-6">
                  <div class="profile-info-label">MOBILE NUMBER</div>
                  <div class="profile-info-value">${user.mobile}</div>
                </div>
                <div class="col-sm-6">
                  <div class="profile-info-label">REGISTRATION DATE</div>
                  <div class="profile-info-value">${regDateStr}</div>
                </div>
                <div class="col-sm-6">
                  <div class="profile-info-label">SYSTEM ID</div>
                  <div class="profile-info-value">${user.id}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      // Bind Delete Account button
      const deleteBtn = document.getElementById('delete-account-btn');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
          import('../components/modal.js').then(({ modal }) => {
            modal.show({
              title: 'Delete Account',
              body: `
                <p class="text-danger small mb-3"><i class="bi bi-exclamation-triangle-fill"></i> Warning: This will permanently delete your student account and all your attendance, game history, and scores. This action cannot be undone.</p>
                <div class="mb-3 text-start">
                  <label for="delete-password-input" class="form-label small fw-semibold text-secondary">Confirm Your Password</label>
                  <input type="password" class="form-control" id="delete-password-input" placeholder="Enter your current password">
                </div>
              `,
              confirmText: 'Delete Permanently',
              cancelText: 'Cancel',
              onConfirm: async () => {
                const passwordInput = document.getElementById('delete-password-input');
                const password = passwordInput ? passwordInput.value : '';

                if (!password) {
                  toast.error('Password is required to delete account.');
                  return;
                }

                try {
                  loader.show('Deleting account...');
                  const res = await api.deleteStudentAccount(password);
                  loader.hide();

                  if (res.success) {
                    toast.success('Account successfully deleted.');
                    storage.logout();
                    setTimeout(() => {
                      window.location.href = './login.html';
                    }, 1500);
                  }
                } catch (err) {
                  loader.hide();
                  toast.error(err.message || 'Failed to delete account.');
                }
              }
            });
          });
        });
      }
    }
  } catch (error) {
    loader.hide();
    toast.error('Failed to retrieve student profile.');
    card.innerHTML = `<div class="alert alert-danger border-0">${error.message}</div>`;
  }
}

// ==========================================
// Profile Editing Setup
// ==========================================
export async function setupEditProfileForm() {
  const form = document.getElementById('teacher-edit-form');
  if (!form) return;

  const role = storage.getRole();
  const streamSelect = document.getElementById('stream-id');
  const courseSelect = document.getElementById('course-id');

  // Hide select options for student role
  if (role === 'student') {
    if (streamSelect) streamSelect.parentNode.style.display = 'none';
    if (courseSelect) courseSelect.parentNode.style.display = 'none';
  }

  try {
    loader.show('Loading details...');
    
    if (role === 'teacher') {
      const [profileRes, streamsRes, coursesRes] = await Promise.all([
        api.getTeacherProfile(),
        api.getTeacherSelfStreams().catch(() => ({ success: false, data: [] })),
        api.getTeacherSelfCourses().catch(() => ({ success: false, data: [] }))
      ]);
      loader.hide();

      if (profileRes.success && profileRes.data) {
        const user = profileRes.data;
        document.getElementById('name').value = user.name || '';
        document.getElementById('email').value = user.email || '';
        document.getElementById('mobile').value = user.mobile || '';

        if (streamsRes.success && streamsRes.data.length > 0) {
          streamSelect.innerHTML = '<option value="" disabled>Select Stream</option>' + 
            streamsRes.data.map(s => `<option value="${s.stream_id}">${s.stream_name}</option>`).join('');
        }
        
        if (coursesRes.success && coursesRes.data.length > 0) {
          courseSelect.innerHTML = '<option value="" disabled>Select Main Course</option>' +
            coursesRes.data.map(c => `<option value="${c.course_id}">${c.course_name}</option>`).join('');
        }

        if (user.stream_id) streamSelect.value = user.stream_id;
        if (user.course_id) courseSelect.value = user.course_id;
      }
    } else if (role === 'student') {
      const profileRes = await api.getStudentProfile();
      loader.hide();

      if (profileRes.success && profileRes.data) {
        const user = profileRes.data;
        document.getElementById('name').value = user.name || '';
        document.getElementById('email').value = user.email || '';
        document.getElementById('mobile').value = user.mobile || '';
      }
    }
  } catch (error) {
    loader.hide();
    toast.error('Failed to load profile update details.');
  }
}

export async function handleProfileUpdate(event) {
  event.preventDefault();
  const role = storage.getRole();
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const mobileInput = document.getElementById('mobile');
  const streamSelect = document.getElementById('stream-id');
  const courseSelect = document.getElementById('course-id');
  const submitBtn = document.getElementById('submit-btn');

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const mobile = mobileInput.value.trim();

  let isValid = true;

  if (!name) {
    validation.setInputValidity(nameInput, false, 'Name is required.');
    isValid = false;
  } else {
    validation.setInputValidity(nameInput, true);
  }

  if (!email || !validation.isValidEmail(email)) {
    validation.setInputValidity(emailInput, false, 'Enter a valid email.');
    isValid = false;
  } else {
    validation.setInputValidity(emailInput, true);
  }

  if (!mobile || !validation.isValidMobile(mobile)) {
    validation.setInputValidity(mobileInput, false, 'Mobile must be exactly 10 digits.');
    isValid = false;
  } else {
    validation.setInputValidity(mobileInput, true);
  }

  if (!isValid) return;

  const payload = { name, email, mobile };

  if (role === 'teacher') {
    const stream_id = streamSelect.value;
    const course_id = courseSelect.value;
    if (stream_id) payload.stream_id = Number(stream_id);
    if (course_id) payload.course_id = Number(course_id);
  }

  try {
    loader.show('Updating profile info...');
    submitBtn.disabled = true;

    const res = role === 'student' ? await api.updateStudentProfile(payload) : await api.updateTeacherProfile(payload);
    loader.hide();

    if (res.success) {
      toast.success('Profile updated successfully.');
      
      const localUser = storage.getUser() || {};
      localUser.name = name;
      localUser.email = email;
      localUser.mobile = mobile;
      storage.saveUser(localUser);

      setTimeout(() => {
        window.location.href = role === 'student' ? './student-profile.html' : './teacher-profile.html';
      }, 1000);
    }
  } catch (error) {
    loader.hide();
    submitBtn.disabled = false;
    toast.error(error.message);
  }
}

// ==========================================
// Change Password Flow
// ==========================================
export async function handlePasswordChange(event) {
  event.preventDefault();
  const role = storage.getRole();
  const oldPassInput = document.getElementById('old-password');
  const newPassInput = document.getElementById('new-password');
  const confirmInput = document.getElementById('confirm-password');
  const submitBtn = document.getElementById('submit-btn');

  const old_password = oldPassInput.value;
  const new_password = newPassInput.value;
  const confirm = confirmInput.value;

  let isValid = true;

  if (!old_password) {
    validation.setInputValidity(oldPassInput, false, 'Old password is required.');
    isValid = false;
  } else {
    validation.setInputValidity(oldPassInput, true);
  }

  if (!new_password || !validation.isValidPassword(new_password)) {
    validation.setInputValidity(newPassInput, false, 'New password must be at least 8 characters.');
    isValid = false;
  } else {
    validation.setInputValidity(newPassInput, true);
  }

  if (!confirm || !validation.isPasswordMatch(new_password, confirm)) {
    validation.setInputValidity(confirmInput, false, 'Passwords do not match.');
    isValid = false;
  } else {
    validation.setInputValidity(confirmInput, true);
  }

  if (!isValid) return;

  try {
    loader.show('Changing password...');
    submitBtn.disabled = true;

    const res = await api.changePassword({ old_password, new_password });
    loader.hide();

    if (res.success) {
      toast.success('Password changed successfully.');
      setTimeout(() => {
        window.location.href = role === 'student' ? './student-profile.html' : './teacher-profile.html';
      }, 1000);
    }
  } catch (error) {
    loader.hide();
    submitBtn.disabled = false;
    toast.error(error.message);
  }
}

// Auto controller mappings
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('profile-card')) {
    loadAdminProfile();
  }
  if (document.getElementById('teacher-profile-card')) {
    loadTeacherProfile();
  }
  if (document.getElementById('student-profile-card')) {
    loadStudentProfile();
  }
  if (document.getElementById('teacher-edit-form')) {
    setupEditProfileForm();
    document.getElementById('teacher-edit-form').addEventListener('submit', handleProfileUpdate);
  }
  if (document.getElementById('change-password-form')) {
    document.getElementById('change-password-form').addEventListener('submit', handlePasswordChange);
  }
});
