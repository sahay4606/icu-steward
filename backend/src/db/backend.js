import { createDomainRepositories } from './repository.js';
import { createAuthService } from '../services/auth.js';
import { createAccessControl } from '../services/access-control.js';
import { createNotificationRouter } from '../services/notification-router.js';
import { createAuditLogService } from '../services/audit-log.js';

export function createBackend(client) {
  const repositories = createDomainRepositories(client);

  return {
    repositories,
    auth: createAuthService(client, repositories),
    accessControl: createAccessControl(repositories),
    notifications: createNotificationRouter(repositories),
    auditLog: createAuditLogService(repositories),
  };
}
