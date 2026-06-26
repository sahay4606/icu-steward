import { Router } from 'express';
import { buildRepoRoutes } from '../../middleware/build-repo-routes.js';

export function createAntibioticsRoutes(antibioticsRepo) {
  const router = Router();
  buildRepoRoutes(router, antibioticsRepo);
  return router;
}
