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
      const body = await response.text().catch(() => '');
      throw new Error(`Request failed: ${response.status}${body ? ` - ${body}` : ''}`);
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
    cultures: '/api/cultures',
    antibioticCultureLinks: '/api/antibiotic-culture-links',
    cultureMaster: '/api/culture-master',
    routeMaster: '/api/route-master',
    antibioticMaster: '/api/antibiotic-master',
    investigationMaster: '/api/investigation-master',
    deviceMaster: '/api/device-master',
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
    updateHospitalSettings: (hospitalId, body) => request(resolve(`${endpoints.hospitalSettings}${qs({ hospital_id: hospitalId })}`), { method: 'PATCH', body: JSON.stringify(body) }),
    getCultures: (hospitalId) => request(resolve(`${endpoints.cultures}${qs({ hospital_id: hospitalId })}`)),
    getCultureFull: (id) => request(resolve(`${endpoints.cultures}/${id}/full`)),
    getLinkedCultures: (antibioticId) => request(resolve(`${endpoints.antibioticCultureLinks}${qs({ antibiotic_id: antibioticId })}`)),
    linkCulture: (antibioticId, cultureId, reason, linkedBy) => request(resolve(endpoints.antibioticCultureLinks), { method: 'POST', body: JSON.stringify({ antibiotic_id: antibioticId, culture_id: cultureId, link_reason: reason, linked_by: linkedBy }) }),
    unlinkCulture: async (linkId) => {
      const response = await fetch(resolve(`${endpoints.antibioticCultureLinks}/${linkId}`), { method: 'DELETE', headers });
      if (!response.ok) { const body = await response.text().catch(() => ''); throw new Error(`Request failed: ${response.status}${body ? ` - ${body}` : ''}`); }
      return response;
    },
    post: (path, body) => request(resolve(path), { method: 'POST', body: JSON.stringify(body) }),
    getCultureMaster: () => request(resolve(`${endpoints.cultureMaster}`)),
    getCultureMasterCategories: () => request(resolve(`${endpoints.cultureMaster}/categories`)),
    getRouteMaster: () => request(resolve(`${endpoints.routeMaster}`)),
    getRouteMasterCategories: () => request(resolve(`${endpoints.routeMaster}/categories`)),
    getAntibioticMaster: () => request(resolve(`${endpoints.antibioticMaster}`)),
    getInvestigationMaster: () => request(resolve(`${endpoints.investigationMaster}`)),
    getInvestigationMasterCategories: () => request(resolve(`${endpoints.investigationMaster}/categories`)),
    getDeviceMaster: () => request(resolve(`${endpoints.deviceMaster}`)),
    getDeviceMasterCategories: () => request(resolve(`${endpoints.deviceMaster}/categories`)),
    patch: (path, body) => request(resolve(path), { method: 'PATCH', body: JSON.stringify(body) }),
    delete: async (path) => {
      const response = await fetch(resolve(path), { method: 'DELETE', headers });
      if (!response.ok) {
        const body = await response.text().catch(() => '');
        throw new Error(`Request failed: ${response.status}${body ? ` - ${body}` : ''}`);
      }
      return response;
    },
  };
}

