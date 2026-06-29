import { Router } from 'express';
import crypto from 'crypto';
import { asyncHandler } from '../../middleware/async-handler.js';
import { buildRepoRoutes } from '../../middleware/build-repo-routes.js';

export function createCulturesRoutes(repos) {
  const router = Router();

  // Standard CRUD
  buildRepoRoutes(router, repos.cultures);

  // GET /api/cultures/:id/full — full culture with organisms + sensitivities
  router.get('/:id/full', asyncHandler(async (req, res) => {
    const { data: culture, error: ce } = await repos.cultures.getById(req.params.id);
    if (ce || !culture) return res.status(404).json({ error: ce?.message || 'Not found' });

    const { data: organisms } = await repos.cultureOrganisms.list({
      filters: { culture_id: culture.id },
      orderBy: 'created_at',
      ascending: true,
    });

    const enriched = await Promise.all(
      (organisms || []).map(async (org) => {
        const { data: sensitivities } = await repos.cultureSensitivities.list({
          filters: { organism_id: org.id },
        });
        return { ...org, sensitivities: sensitivities || [] };
      })
    );

    res.json({ ...culture, organisms: enriched });
  }));

  // POST /api/cultures/:id/organisms — add organism to culture
  router.post('/:id/organisms', asyncHandler(async (req, res) => {
    const { data: culture, error: ce } = await repos.cultures.getById(req.params.id);
    if (ce || !culture) return res.status(404).json({ error: ce?.message || 'Culture not found' });

    const payload = {
      id: req.body.id || crypto.randomUUID(),
      culture_id: culture.id,
      organism_name: req.body.organism_name,
      colony_count: req.body.colony_count || null,
      resistance_marker: req.body.resistance_marker || null,
      hospital_id: culture.hospital_id,
    };
    const { data, error } = await repos.cultureOrganisms.insert(payload);
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json(data);
  }));

  // POST /api/cultures/organisms/:organismId/sensitivities — add sensitivity
  router.post('/organisms/:organismId/sensitivities', asyncHandler(async (req, res) => {
    const { data: org, error: oe } = await repos.cultureOrganisms.getById(req.params.organismId);
    if (oe || !org) return res.status(404).json({ error: oe?.message || 'Organism not found' });

    const { data: culture } = await repos.cultures.getById(org.culture_id);

    const payload = {
      id: req.body.id || crypto.randomUUID(),
      organism_id: org.id,
      antibiotic: req.body.antibiotic,
      mic: req.body.mic || null,
      susceptibility: req.body.susceptibility || 'Not Tested',
      hospital_id: culture?.hospital_id || org.hospital_id,
    };
    const { data, error } = await repos.cultureSensitivities.insert(payload);
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json(data);
  }));

  return router;
}
