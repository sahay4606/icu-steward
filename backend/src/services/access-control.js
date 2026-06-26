import { permissionsForRole } from '../config/roles.js';

export function createAccessControl(repositories) {
  return {
    repositories,
    can(role, permission) {
      return permissionsForRole(role).includes(permission) || permissionsForRole(role).includes('all.write') || permissionsForRole(role).includes('all.read');
    },
    requireTenantScope(hospitalId) {
      if (!hospitalId) {
        throw new Error('hospitalId is required for tenant-scoped operations');
      }
      return hospitalId;
    },
  };
}

