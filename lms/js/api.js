import { storage } from './storage.js';

const BASE_URL = 'https://lms.gymgurus.in'
// const BASE_URL = 'http://localhost:5000'
function handle401() {
  storage.logout();
  const page = window.location.pathname.toLowerCase().split('/').pop();
  const adminPages = ['admin-dashboard.html', 'admin-profile.html', 'admin-list.html', 'admin-create.html', 'admin-edit.html', 'teacher-requests.html', 'student-requests.html', 'streams.html', 'stream-create.html', 'stream-edit.html', 'teacher-stream-details.html', 'teacher-streams.html'];
  const isAdminPath = adminPages.includes(page) || page.startsWith('admin-');
  window.location.href = isAdminPath ? './admin-login.html' : './login.html';
}

/**
 * Handle HTTP Response and map standard errors
 */
async function handleResponse(response) {
  let data;
  const isLoginRequest = response.url && (response.url.includes('/login') || response.url.includes('/api/user/login') || response.url.includes('/api/admin/login'));
  try {
    data = await response.json();
  } catch (e) {
    if (response.status === 401) {
      if (!isLoginRequest) {
        handle401();
      }
      throw new Error('Session expired. Please log in again.');
    }
    if (response.status === 403) throw new Error('Forbidden Access');
    if (response.status === 404) throw new Error('Resource Not Found');
    if (response.status >= 500) throw new Error('Something went wrong');
    throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
  }

  if (!response.ok || (data && data.success === false)) {
    const errorMsg = data && data.message ? data.message : '';
    if (response.status === 401) {
      if (!isLoginRequest) {
        handle401();
      }
      throw new Error(errorMsg || 'Session expired. Please log in again.');
    }
    if (response.status === 403) throw new Error(errorMsg || 'Forbidden Access');
    if (response.status === 404) throw new Error(errorMsg || 'Resource Not Found');
    if (response.status === 422) throw new Error(errorMsg || 'Validation Error');
    if (response.status >= 500) throw new Error(errorMsg || 'Something went wrong');
    throw new Error(errorMsg || 'An unknown error occurred.');
  }

  return data;
}

/**
 * Fetch wrapper that adds proper headers and authorization
 */
async function request(endpoint, method = 'GET', body = null) {
  const url = `${BASE_URL}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json'
  };

  const token = storage.getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    return await handleResponse(response);
  } catch (error) {
    console.error(`Fetch failed for ${endpoint}:`, error.message);
    throw error;
  }
}

// Local Storage Fallback Database for Admins (due to missing list API in backend)
function getLocalAdmins() {
  let list = [];
  try {
    const str = localStorage.getItem('admins_fallback');
    list = str ? JSON.parse(str) : [];
  } catch (e) {
    list = [];
  }

  // Seed with current logged-in admin if empty
  if (list.length === 0) {
    const current = storage.getUser();
    if (current && current.role === 'admin') {
      list.push({
        admin_id: current.id || 1,
        name: current.name || 'John Admin',
        email: current.email || 'john@gmail.com',
        role: 'admin',
        status: 'active'
      });
      localStorage.setItem('admins_fallback', JSON.stringify(list));
    }
  }
  return list;
}

function saveLocalAdmins(list) {
  localStorage.setItem('admins_fallback', JSON.stringify(list));
}

export const api = {
  // Public log-ins
  login(data) {
    return request('/api/user/login', 'POST', data);
  },

  adminLogin(data) {
    return request('/api/admin/login', 'POST', data);
  },

  forgotPassword(data) {
    return request('/api/user/forgot-password', 'POST', data);
  },

  resetPassword(data) {
    return request('/api/user/reset-password', 'POST', data);
  },

  // Student public registrations
  studentRegister(data) {
    return request('/api/user/student/register', 'POST', data);
  },

  // Teacher registration requests
  teacherRegister(data) {
    return request('/api/user/teacher/register', 'POST', data);
  },

  // ==========================================
  // Admin Management Endpoints
  // ==========================================

  getAdminProfile() {
    return request('/api/admin/profile', 'GET');
  },

  /**
   * Helper to retrieve all admins
   * Falls back to localStorage if endpoint doesn't exist
   */
  async getAdmins() {
    try {
      // In a real application, there would be a GET /api/admin/ route
      // We will perform a probe request to Profile just to confirm authentication is active
      await this.getAdminProfile();

      // Return local fallback list
      return {
        success: true,
        data: getLocalAdmins()
      };
    } catch (e) {
      throw e;
    }
  },

  async createAdmin(data) {
    // Open Route as defined in backend/routes/admin.routes.js
    const result = await request('/api/admin/create', 'POST', data);

    // Add to fallback storage list
    if (result.success) {
      const list = getLocalAdmins();
      list.push({
        admin_id: result.admin_id || Date.now(),
        name: data.name,
        email: data.email,
        role: data.role || 'admin',
        status: 'active'
      });
      saveLocalAdmins(list);
    }
    return result;
  },

  async updateAdmin(id, data) {
    const result = await request(`/api/admin/update/${id}`, 'PUT', data);

    // Update local storage entry
    if (result.success) {
      const list = getLocalAdmins();
      const index = list.findIndex(a => String(a.admin_id) === String(id));
      if (index !== -1) {
        list[index].name = data.name || list[index].name;
        list[index].email = data.email || list[index].email;
        list[index].role = data.role || list[index].role;
        list[index].status = data.status || list[index].status;
        saveLocalAdmins(list);
      }
    }
    return result;
  },

  async deleteAdmin(id) {
    const result = await request(`/api/admin/delete/${id}`, 'DELETE');

    // Remove local storage entry
    if (result.success) {
      const list = getLocalAdmins();
      const updatedList = list.filter(a => String(a.admin_id) !== String(id));
      saveLocalAdmins(updatedList);
    }
    return result;
  },

  // ==========================================
  // Teacher Requests Endpoints
  // ==========================================

  getTeacherRequests() {
    return request('/api/admin/teacher-requests', 'GET');
  },

  updateTeacherStatus(id, approval_status) {
    return request(`/api/admin/teacher-status/${id}`, 'PUT', { approval_status });
  },

  // ==========================================
  // Student Requests Endpoints
  // ==========================================

  getStudentRequests() {
    return request('/api/admin/student-requests', 'GET');
  },

  updateStudentStatus(id, approval_status) {
    return request(`/api/admin/student-status/${id}`, 'PUT', { approval_status });
  },

  approveAllStudentRequests() {
    return request('/api/admin/student-status/approve-all', 'PUT');
  },

  // ==========================================
  // Stream Management Endpoints
  // ==========================================

  getStreams() {
    return request('/api/stream/', 'GET');
  },

  getPublicStreams() {
    return request('/api/stream/public', 'GET');
  },

  createStream(data) {
    return request('/api/stream/create', 'POST', data);
  },

  updateStream(id, data) {
    return request(`/api/stream/${id}`, 'PUT', data);
  },

  deleteStream(id) {
    return request(`/api/stream/${id}`, 'DELETE');
  },

  // ==========================================
  // Teacher Streams Assignment Endpoints
  // ==========================================

  getTeacherStreams() {
    return request('/api/teacher-stream/', 'GET');
  },

  getTeacherStreamDetails(teacher_id) {
    return request(`/api/teacher-stream/${teacher_id}`, 'GET');
  },

  // ==========================================
  // Teacher Console Specific Endpoints
  // ==========================================

  getTeacherProfile() {
    return request('/api/user/profile', 'GET');
  },

  updateTeacherProfile(data) {
    return request('/api/user/update-profile', 'PUT', data);
  },

  changePassword(data) {
    return request('/api/user/change-password', 'PUT', data);
  },

  getStudents(queryParams = {}) {
    const params = new URLSearchParams();
    if (queryParams.search) params.append('search', queryParams.search);
    if (queryParams.stream_id) params.append('stream_id', queryParams.stream_id);
    if (queryParams.course_id) params.append('course_id', queryParams.course_id);

    const queryString = params.toString();
    const endpoint = `/api/user/students${queryString ? `?${queryString}` : ''}`;
    return request(endpoint, 'GET');
  },

  // Mapped self-assigned teacher resources
  getTeacherSelfStreams() {
    return request('/api/teacher-stream/my-streams', 'GET');
  },

  getTeacherSelfCourses() {
    return request('/api/course/my-courses', 'GET');
  },

  getAttendancePending() {
    return request('/api/attendance/pending', 'GET');
  },

  getPendingAttendance() {
    return request('/api/attendance/pending', 'GET');
  },

  updateAttendance(attendance_id, data) {
    return request(`/api/attendance/${attendance_id}`, 'PUT', data);
  },

  approveAllAttendance() {
    return request('/api/attendance/approve-all', 'PUT');
  },

  getCourseStreams(course_id) {
    return request(`/api/attendance/course/${course_id}/streams`, 'GET');
  },

  getCourseAttendance(course_id, queryParams = {}) {
    const params = new URLSearchParams();
    if (queryParams.stream_id) params.append('stream_id', queryParams.stream_id);
    if (queryParams.date) params.append('date', queryParams.date);
    if (queryParams.status) params.append('status', queryParams.status);

    const queryString = params.toString();
    const endpoint = `/api/attendance/course/${course_id}${queryString ? `?${queryString}` : ''}`;
    return request(endpoint, 'GET');
  },

  getAttendanceReport(course_id, queryParams = {}) {
    const params = new URLSearchParams();
    if (queryParams.stream_id) params.append('stream_id', queryParams.stream_id);
    if (queryParams.date) params.append('date', queryParams.date);

    const queryString = params.toString();
    const endpoint = `/api/attendance/report/${course_id}${queryString ? `?${queryString}` : ''}`;
    return request(endpoint, 'GET');
  },

  // Downloads the Attendance Report PDF for a given course + date.
  // Triggers a browser file download since the endpoint streams
  // a PDF binary (not JSON), so it can't go through the normal
  // request() JSON helper.
  async downloadAttendanceReportPdf(course_id, date) {
    const token = storage.getToken();
    const url = `${BASE_URL}/api/attendance/report/${course_id}/pdf?date=${encodeURIComponent(date)}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });

    if (!response.ok) {
      let message = 'Failed to generate attendance report PDF.';
      try {
        const errJson = await response.json();
        if (errJson && errJson.message) message = errJson.message;
      } catch (e) { /* response wasn't JSON, keep default message */ }
      throw new Error(message);
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);

    const disposition = response.headers.get('Content-Disposition') || '';
    const match = disposition.match(/filename="?([^"]+)"?/);
    const fileName = match ? match[1] : `Attendance_Report_${course_id}_${date}.pdf`;

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  },

  getGames(queryParams = {}) {
    const params = new URLSearchParams();
    if (queryParams.page) params.append('page', queryParams.page);
    if (queryParams.limit) params.append('limit', queryParams.limit);
    if (queryParams.search) params.append('search', queryParams.search);
    if (queryParams.status) params.append('status', queryParams.status);
    if (queryParams.course_id) params.append('course_id', queryParams.course_id);
    if (queryParams.stream_id) params.append('stream_id', queryParams.stream_id);
    if (queryParams.unit_name) params.append('unit_name', queryParams.unit_name);

    const queryString = params.toString();
    return request(`/api/games/${queryString ? `?${queryString}` : ''}`, 'GET');
  },

  getTeacherGames() {
    return this.getGames();
  },

  getGameDetails(id) {
    return request(`/api/games/${id}`, 'GET');
  },

  createGame(data) {
    return request('/api/games/', 'POST', data);
  },

  updateGame(id, data) {
    return request(`/api/games/${id}`, 'PUT', data);
  },

  updateGameStatus(id, status) {
    return request(`/api/games/${id}/status`, 'PATCH', { status });
  },

  deleteGame(id) {
    return request(`/api/games/${id}`, 'DELETE');
  },

  // ==========================================
  // Teacher Stream & Course Management Endpoints
  // ==========================================

  assignTeacherStream(data) {
    return request('/api/teacher-stream/assign', 'POST', data);
  },

  getMyStreams() {
    return request('/api/teacher-stream/my-streams', 'GET');
  },

  deleteTeacherStream(id) {
    return request(`/api/teacher-stream/${id}`, 'DELETE');
  },

  createCourse(data) {
    return request('/api/course/create', 'POST', data);
  },

  getMyCourses() {
    return request('/api/course/my-courses', 'GET');
  },

  getCourseDetails(id) {
    return request(`/api/course/${id}`, 'GET');
  },

  getStudentsByCourseAndBatch(id, batch) {
    return request(`/api/course/${id}/students-by-batch?batch=${batch}`, 'GET');
  },

  awardCoursePoints(id, studentId, points) {
    return request(`/api/course/${id}/award-points`, 'POST', { student_id: studentId, points });
  },

  updateCourse(id, data) {
    return request(`/api/course/${id}`, 'PUT', data);
  },

  deleteCourse(id) {
    return request(`/api/course/${id}`, 'DELETE');
  },

  removeStudentsFromCourse(id) {
    return request(`/api/course/${id}/students`, 'DELETE');
  },

  // ==========================================
  // Student Panel Specific Endpoints
  // ==========================================

  getStudentProfile() {
    return request('/api/user/profile', 'GET');
  },

  updateStudentProfile(data) {
    return request('/api/user/update-profile', 'PUT', data);
  },

  getStudentCourses() {
    return request('/api/user/my-courses', 'GET');
  },

  markAttendance(data) {
    return request('/api/attendance/', 'POST', data);
  },

  getAttendanceHistory() {
    return request('/api/attendance/my', 'GET');
  },

  // ==========================================
  // Student Game & Quiz Console Endpoints
  // ==========================================

  getStudentGames(queryParams = {}) {
    const params = new URLSearchParams();
    if (queryParams.page) params.append('page', queryParams.page);
    if (queryParams.limit) params.append('limit', queryParams.limit);
    if (queryParams.search) params.append('search', queryParams.search);

    const queryString = params.toString();
    const endpoint = `/api/student/games${queryString ? `?${queryString}` : ''}`;
    return request(endpoint, 'GET');
  },

  startGame(id) {
    return request(`/api/student/games/${id}/start`, 'POST');
  },

  getQuestions(attempt_id) {
    return request(`/api/student/attempts/${attempt_id}/questions`, 'GET');
  },

  submitGame(attempt_id, data) {
    return request(`/api/student/attempts/${attempt_id}/submit`, 'POST', data);
  },

  checkAnswer(attempt_id, data) {
    return request(`/api/student/attempts/${attempt_id}/check-answer`, 'POST', data);
  },

  getResult(attempt_id) {
    return request(`/api/student/attempts/${attempt_id}/result`, 'GET');
  },

  getStudentLeaderboard(course_id, queryParams = {}) {
    const params = new URLSearchParams();
    if (queryParams.page) params.append('page', queryParams.page);
    if (queryParams.limit) params.append('limit', queryParams.limit);

    const queryString = params.toString();
    const endpoint = `/api/student/courses/${course_id}/leaderboard${queryString ? `?${queryString}` : ''}`;
    return request(endpoint, 'GET');
  },

  getAttemptsHistory() {
    return request('/api/student/attempts/history', 'GET');
  },

  deleteStudentAccount(password) {
    return request('/api/student/account', 'DELETE', { password });
  },

  getLeaderboard(course_id, queryParams = {}) {
    const params = new URLSearchParams();
    if (queryParams.page) params.append('page', queryParams.page);
    if (queryParams.limit) params.append('limit', queryParams.limit);

    const queryString = params.toString();
    const endpoint = `/api/games/courses/${course_id}/leaderboard${queryString ? `?${queryString}` : ''}`;
    return request(endpoint, 'GET');
  },

  getApprovedTeachers() {
    return request('/api/admin/teachers', 'GET');
  },

  adminAssignStream(data) {
    return request('/api/teacher-stream/admin/assign', 'POST', data);
  },

  updateTeacherStreamStatus(id, status) {
    return request(`/api/teacher-stream/status/${id}`, 'PUT', { status });
  }
};
export default api;
