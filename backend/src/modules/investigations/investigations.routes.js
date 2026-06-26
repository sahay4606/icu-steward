import { Router } from 'express';
import { buildRepoRoutes } from '../../middleware/build-repo-routes.js';

export function createInvestigationsRoutes(investigationsRepo) {
  const router = Router();
  buildRepoRoutes(router, investigationsRepo);
  return router;
}
