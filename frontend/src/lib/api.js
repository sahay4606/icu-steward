export function createApiClient(baseUrl = '', token = null) {
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  async function request(path, init = {}) {
    const response = await fetch(path, {
      headers: { ...headers, ...(init.headers || {}) },
      ...init,
    });
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }
    return response.json();
  }

  const endpoints = {
    dashboard: '/api/dashboard',
    patients: '/api/patients',
    investigations: '/api/investigations',
    antibiotics: '/api/antibiotics',
    devices: '/api/devices',
    tasks: '/api/tasks',
    notifications: '/api/notifications',
    users: '/api/users',
    hospitals: '/api/hospitals',
    timelineEvents: '/api/timeline-events',
    reminderRules: '/api/reminder-rules',
    dailyChecklists: '/api/daily-checklists',
    profile: '/api/profile',
    hospitalSettings: '/api/hospital-settings',
  };

  const resolve = (path) => `${baseUrl}${path}`;
  const qs = (params) => {
    const s = new URLSearchParams();
    Object.entries(params || {}).forEach(([k, v]) => { if (v !== undefined && v !== null) s.set(k, v); });
    const str = s.toString();
    return str ? `?${str}` : '';
  };

  return {
    endpoints,
    getDashboard: (hospitalId) => request(resolve(`${endpoints.dashboard}${qs({ hospital_id: hospitalId })}`)),
    getPatients: (hospitalId) => request(resolve(`${endpoints.patients}${qs({ hospital_id: hospitalId })}`)),
    getPatientById: (id) => request(resolve(`${endpoints.patients}/${id}`)),
    getInvestigations: (hospitalId) => request(resolve(`${endpoints.investigations}${qs({ hospital_id: hospitalId })}`)),
    getInvestigationById: (id) => request(resolve(`${endpoints.investigations}/${id}`)),
    getAntibiotics: (hospitalId) => request(resolve(`${endpoints.antibiotics}${qs({ hospital_id: hospitalId })}`)),
    getAntibioticById: (id) => request(resolve(`${endpoints.antibiotics}/${id}`)),
    getDevices: (hospitalId) => request(resolve(`${endpoints.devices}${qs({ hospital_id: hospitalId })}`)),
    getTasks: (hospitalId) => request(resolve(`${endpoints.tasks}${qs({ hospital_id: hospitalId })}`)),
    getNotifications: (hospitalId) => request(resolve(`${endpoints.notifications}${qs({ hospital_id: hospitalId })}`)),
    getUsers: (hospitalId) => request(resolve(`${endpoints.users}${qs({ hospital_id: hospitalId })}`)),
    getTimelineEvents: (patientId) => request(resolve(`${endpoints.timelineEvents}${qs({ patient_id: patientId })}`)),
    getReminderRules: (hospitalId) => request(resolve(`${endpoints.reminderRules}${qs({ hospital_id: hospitalId })}`)),
    getProfile: (userId) => request(resolve(`${endpoints.profile}${qs({ user_id: userId })}`)),
    getHospitalSettings: (hospitalId) => request(resolve(`${endpoints.hospitalSettings}${qs({ hospital_id: hospitalId })}`)),
    post: (path, body) => request(resolve(path), { method: 'POST', body: JSON.stringify(body) }),
    patch: (path, body) => request(resolve(path), { method: 'PATCH', body: JSON.stringify(body) }),
    delete: (path) => fetch(resolve(path), { method: 'DELETE', headers }),
  };
}
