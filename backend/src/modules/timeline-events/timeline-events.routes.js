import { Router } from 'express';
import { buildRepoRoutes } from '../../middleware/build-repo-routes.js';

export function createTimelineEventsRoutes(timelineEventsRepo) {
  const router = Router();
  buildRepoRoutes(router, timelineEventsRepo);
  return router;
}
