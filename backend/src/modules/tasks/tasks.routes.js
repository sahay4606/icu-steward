import { Router } from 'express';
import { buildRepoRoutes } from '../../middleware/build-repo-routes.js';

export function createTasksRoutes(tasksRepo) {
  const router = Router();
  buildRepoRoutes(router, tasksRepo);
  return router;
}
