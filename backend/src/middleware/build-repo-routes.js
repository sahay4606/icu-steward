import crypto from 'crypto';
import { asyncHandler } from './async-handler.js';

export function buildRepoRoutes(router, repo) {
  router.get('/', asyncHandler(async (req, res) => {
    const result = await repo.list({ hospitalId: req.query.hospital_id, filters: req.query });
    if (result.error) return res.status(400).json({ error: result.error.message });
    res.json(result.data || result);
  }));

  router.get('/:id', asyncHandler(async (req, res) => {
    const result = await repo.getById(req.params.id);
    if (result.error) return res.status(404).json({ error: result.error.message });
    res.json(result.data || result);
  }));

  router.post('/', asyncHandler(async (req, res) => {
    if (!req.body.id) {
      req.body.id = crypto.randomUUID();
    }
    const result = await repo.insert(req.body);
    if (result.error) return res.status(400).json({ error: result.error.message });
    res.status(201).json(result.data);
  }));

  router.patch('/:id', asyncHandler(async (req, res) => {
    const result = await repo.update(req.params.id, req.body);
    if (result.error) return res.status(400).json({ error: result.error.message });
    res.json(result.data);
  }));

  router.delete('/:id', asyncHandler(async (req, res) => {
    const result = await repo.remove(req.params.id);
    if (result.error) return res.status(400).json({ error: result.error.message });
    res.status(204).end();
  }));
}
