import { Router } from 'express';
import { buildRepoRoutes } from '../../middleware/build-repo-routes.js';

export function createNotificationsRoutes(notificationsRepo) {
  const router = Router();
  buildRepoRoutes(router, notificationsRepo);
  return router;
}
