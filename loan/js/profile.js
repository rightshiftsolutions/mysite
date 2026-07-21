/* ==========================================================================
   profile.js
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('profileForm');
  if (!form) return;

  LoanFlow.requireAuth();
  LoanFlow.initLayout('Profile');
  const { fmt } = LoanFlow;

  await loadProfile();

  async function loadProfile() {
    try {
      const res = await LoanFlow.api('/users');
      const u = res.data || {};
      LoanFlow.Auth.updateUser(u);
      document.getElementById('pFullName').value = u.full_name || '';
      document.getElementById('pEmail').value = u.email || '';
      document.getElementById('pMobile').value = u.mobile || '';
      document.getElementById('pStatus').value = u.status || 'active';
      document.getElementById('profileAvatar').textContent = fmt.initials(u.full_name);
      document.getElementById('profileNameHeader').textContent = u.full_name || '—';
      document.getElementById('profileMemberSince').textContent = 'Member since ' + fmt.date(u.created_at);
    } catch (err) {
      LoanFlow.Toast.show('danger', err.message || 'Could not load profile.');
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    form.classList.add('was-validated');
    if (!form.checkValidity()) return;

    const btn = document.getElementById('saveProfileBtn');
    btn.classList.add('is-loading'); btn.disabled = true;

    const payload = {
      full_name: document.getElementById('pFullName').value.trim(),
      email: document.getElementById('pEmail').value.trim(),
      mobile: document.getElementById('pMobile').value.trim(),
      status: document.getElementById('pStatus').value
    };

    try {
      await LoanFlow.api('/users', { method: 'PUT', body: payload });
      LoanFlow.Toast.show('success', 'Profile updated successfully.');
      await loadProfile();
    } catch (err) {
      LoanFlow.Toast.show('danger', err.message || 'Could not update profile.');
    } finally {
      btn.classList.remove('is-loading'); btn.disabled = false;
    }
  });

  document.getElementById('deleteAccountBtn')?.addEventListener('click', async () => {
    if (!confirm('This will permanently delete your account. Continue?')) return;
    try {
      await LoanFlow.api('/users', { method: 'DELETE' });
      LoanFlow.Toast.show('success', 'Account deleted.');
      setTimeout(() => LoanFlow.Auth.logout(), 800);
    } catch (err) {
      LoanFlow.Toast.show('danger', err.message || 'Could not delete account.');
    }
  });
});
