import { Router } from 'express';
import { buildRepoRoutes } from '../../middleware/build-repo-routes.js';

export function createHospitalsRoutes(hospitalsRepo) {
  const router = Router();
  buildRepoRoutes(router, hospitalsRepo);
  return router;
}
