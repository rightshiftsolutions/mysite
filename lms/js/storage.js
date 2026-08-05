/**
 * Storage Utility for LMS Auth Module
 */

export const storage = {
  saveToken(token) {
    localStorage.setItem('token', token);
  },

  getToken() {
    return localStorage.getItem('token');
  },

  removeToken() {
    localStorage.removeItem('token');
  },

  saveUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
    if (user && user.role) {
      this.saveRole(user.role);
    }
  },

  getUser() {
    const userStr = localStorage.getItem('user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      console.error("Error parsing user from localStorage:", e);
      return null;
    }
  },

  removeUser() {
    localStorage.removeItem('user');
  },

  saveRole(role) {
    localStorage.setItem('role', role);
  },

  getRole() {
    return localStorage.getItem('role');
  },

  removeRole() {
    localStorage.removeItem('role');
  },

  /**
   * Clear all auth related storage and redirect to login
   */
  logout() {
    this.removeToken();
    this.removeUser();
    this.removeRole();
    
    // Determine path prefix based on where we are
    const isSubPage = window.location.pathname.includes('/pages/');
    const redirectPath = isSubPage ? './login.html' : './pages/login.html';
    
    window.location.href = redirectPath;
  }
};
