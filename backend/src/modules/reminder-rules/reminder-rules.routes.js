import { Router } from 'express';
import { buildRepoRoutes } from '../../middleware/build-repo-routes.js';

export function createReminderRulesRoutes(reminderRulesRepo) {
  const router = Router();
  buildRepoRoutes(router, reminderRulesRepo);
  return router;
}
