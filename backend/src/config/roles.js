export const BACKEND_ROLES = {
  admin: 'admin',
  doctor: 'doctor',
  nurse: 'nurse',
  pharmacist: 'pharmacist',
  consultant: 'consultant',
  resident: 'resident',
};

export const ROLE_PERMISSIONS = {
  admin: ['tenants.manage', 'users.manage', 'settings.manage', 'all.read', 'all.write'],
  doctor: ['patients.read', 'patients.write', 'investigations.read', 'investigations.write', 'antibiotics.read', 'antibiotics.write', 'tasks.read', 'tasks.write', 'notifications.read'],
  nurse: ['patients.read', 'patients.write', 'investigations.read', 'tasks.read', 'tasks.write', 'notifications.read', 'notifications.write'],
  pharmacist: ['patients.read', 'antibiotics.read', 'antibiotics.write', 'notifications.read'],
  consultant: ['patients.read', 'patients.write', 'investigations.read', 'investigations.write', 'antibiotics.read', 'antibiotics.write', 'tasks.read', 'notifications.read'],
  resident: ['patients.read', 'investigations.read', 'tasks.read', 'tasks.write', 'notifications.read'],
};

export function permissionsForRole(role) {
  return ROLE_PERMISSIONS[role] || [];
}

