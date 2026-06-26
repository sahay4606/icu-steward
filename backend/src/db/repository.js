import { BACKEND_TABLES } from '../config/tables.js';

function assertClient(client, tableName) {
  if (!client) {
    throw new Error(`Supabase client is required for ${tableName}`);
  }
}

export function createRepository(client, tableName, { tenantKey = 'hospital_id' } = {}) {
  const table = () => {
    assertClient(client, tableName);
    return client.from(tableName);
  };

  return {
    list: async ({ hospitalId, filters = {}, orderBy = 'created_at', ascending = false } = {}) => {
      let query = table().select('*');
      if (hospitalId) query = query.eq(tenantKey, hospitalId);
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query = query.eq(key, value);
        }
      });
      return query.order(orderBy, { ascending });
    },
    getById: async (id) => table().select('*').eq('id', id).single(),
    insert: async (payload) => table().insert(payload).select().single(),
    update: async (id, payload) => table().update(payload).eq('id', id).select().single(),
    remove: async (id) => table().delete().eq('id', id),
  };
}

export function createDomainRepositories(client) {
  return {
    hospitals: createRepository(client, BACKEND_TABLES.hospitals, { tenantKey: 'id' }),
    users: createRepository(client, BACKEND_TABLES.users),
    patients: createRepository(client, BACKEND_TABLES.patients),
    investigations: createRepository(client, BACKEND_TABLES.investigations),
    antibiotics: createRepository(client, BACKEND_TABLES.antibiotics),
    devices: createRepository(client, BACKEND_TABLES.devices),
    tasks: createRepository(client, BACKEND_TABLES.tasks),
    notifications: createRepository(client, BACKEND_TABLES.notifications),
    timelineEvents: createRepository(client, BACKEND_TABLES.timelineEvents),
    reminderRules: createRepository(client, BACKEND_TABLES.reminderRules),
    dailyChecklists: createRepository(client, BACKEND_TABLES.dailyChecklists),
    auditLogs: createRepository(client, BACKEND_TABLES.auditLogs),
    sessions: createRepository(client, BACKEND_TABLES.sessions),
    roleAssignments: createRepository(client, BACKEND_TABLES.roleAssignments),
  };
}
