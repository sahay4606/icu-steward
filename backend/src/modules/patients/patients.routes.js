import { Router } from 'express';
import { buildRepoRoutes } from '../../middleware/build-repo-routes.js';

export function createPatientsRoutes(patientsRepo) {
  const router = Router();
  buildRepoRoutes(router, patientsRepo);
  return router;
}
