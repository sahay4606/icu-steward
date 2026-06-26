import { asyncHandler } from './async-handler.js';

export function buildRepoRoutes(router, repo) {
  router.get('/', asyncHandler(async (req, res) => {
    const data = await repo.list({ hospitalId: req.query.hospital_id, filters: req.query });
    res.json(data.data || data);
  }));

  router.get('/:id', asyncHandler(async (req, res) => {
    const data = await repo.getById(req.params.id);
    res.json(data.data || data);
  }));

  router.post('/', asyncHandler(async (req, res) => {
    const data = await repo.insert(req.body);
    res.status(201).json(data.data || data);
  }));

  router.patch('/:id', asyncHandler(async (req, res) => {
    const data = await repo.update(req.params.id, req.body);
    res.json(data.data || data);
  }));

  router.delete('/:id', asyncHandler(async (req, res) => {
    await repo.remove(req.params.id);
    res.status(204).end();
  }));
}
