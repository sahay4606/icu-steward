import { Router } from 'express';
import { buildRepoRoutes } from '../../middleware/build-repo-routes.js';

export function createUsersRoutes(usersRepo) {
  const router = Router();
  buildRepoRoutes(router, usersRepo);
  return router;
}
