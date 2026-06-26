import { Router } from 'express';
import { buildRepoRoutes } from '../../middleware/build-repo-routes.js';

export function createDailyChecklistsRoutes(dailyChecklistsRepo) {
  const router = Router();
  buildRepoRoutes(router, dailyChecklistsRepo);
  return router;
}
