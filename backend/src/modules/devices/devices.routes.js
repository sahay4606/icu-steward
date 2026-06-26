import { Router } from 'express';
import { buildRepoRoutes } from '../../middleware/build-repo-routes.js';

export function createDevicesRoutes(devicesRepo) {
  const router = Router();
  buildRepoRoutes(router, devicesRepo);
  return router;
}
