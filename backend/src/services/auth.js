import { permissionsForRole } from '../config/roles.js';

export function createAuthService(client, repositories) {
  return {
    client,
    repositories,
    getCurrentUser: async () => {
      if (!client) return null;
      const { data } = await client.auth.getUser();
      return data?.user || null;
    },
    getCurrentSession: async () => {
      if (!client) return null;
      const { data } = await client.auth.getSession();
      return data?.session || null;
    },
    resolvePermissions: (role) => permissionsForRole(role),
  };
}

