export function createAuditLogService(repositories) {
  return {
    repositories,
    async record(action, payload = {}) {
      return repositories.auditLogs.insert({
        action,
        payload,
      });
    },
  };
}

