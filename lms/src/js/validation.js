/**
 * Form Validation Utility for LMS Portal
 */

export const validation = {
  /**
   * Validate standard email format
   * @param {string} email 
   * @returns {boolean}
   */
  isValidEmail(email) {
    if (!email) return false;
    const trimmed = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(trimmed);
  },

  /**
   * Validate mobile number is exactly 10 numeric digits
   * @param {string} mobile 
   * @returns {boolean}
   */
  isValidMobile(mobile) {
    if (!mobile) return false;
    const trimmed = mobile.trim();
    const mobileRegex = /^[0-9]{10}$/;
    return mobileRegex.test(trimmed);
  },

  /**
   * Validate password length is at least 8 characters
   * @param {string} password 
   * @returns {boolean}
   */
  isValidPassword(password) {
    return password && password.length >= 8;
  },

  /**
   * Check if password and confirm password match
   * @param {string} password 
   * @param {string} confirmPassword 
   * @returns {boolean}
   */
  isPasswordMatch(password, confirmPassword) {
    return password === confirmPassword;
  },

  /**
   * Trim whitespace from all string values in an object
   * @param {object} obj 
   * @returns {object}
   */
  trimObjectValues(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    const trimmedObj = {};
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        trimmedObj[key] = obj[key].trim();
      } else {
        trimmedObj[key] = obj[key];
      }
    }
    return trimmedObj;
  },

  /**
   * Set dynamic Bootstrap 5 visual validity classes and message
   * @param {HTMLInputElement} inputEl 
   * @param {boolean} isValid 
   * @param {string} errorMsg 
   */
  setInputValidity(inputEl, isValid, errorMsg = '') {
    const feedbackEl = inputEl.parentNode.querySelector('.invalid-feedback');
    if (isValid) {
      inputEl.classList.remove('is-invalid');
      inputEl.classList.add('is-valid');
      if (feedbackEl) feedbackEl.textContent = '';
    } else {
      inputEl.classList.remove('is-valid');
      inputEl.classList.add('is-invalid');
      if (feedbackEl) feedbackEl.textContent = errorMsg || inputEl.validationMessage;
    }
  }
};
