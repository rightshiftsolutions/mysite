/**
 * Teacher Module Helpers
 */

export const teacherHelpers = {
  /**
   * Toggle visibility of password fields
   * @param {string} inputId 
   * @param {string} buttonId 
   * @param {string} iconId 
   */
  setupPasswordToggle(inputId, buttonId, iconId) {
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
};
export default teacherHelpers;
