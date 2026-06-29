import { Router } from 'express';
import crypto from 'crypto';
import { asyncHandler } from '../../middleware/async-handler.js';

export function createAntibioticCultureLinksRoutes(repos) {
  const router = Router();

  // GET /api/antibiotic-culture-links?antibiotic_id=xxx — get all linked cultures
  router.get('/', asyncHandler(async (req, res) => {
    const { antibiotic_id } = req.query;
    if (!antibiotic_id) return res.status(400).json({ error: 'antibiotic_id is required' });

    const { data: links, error: le } = await repos.antibioticCultureLinks.list({
      filters: { antibiotic_id },
    });
    if (le) return res.status(400).json({ error: le.message });

    // Enrich each link with the full culture (organisms + sensitivities)
    const enriched = await Promise.all(
      (links || []).map(async (link) => {
        const { data: culture } = await repos.cultures.getById(link.culture_id);
        if (!culture) return { ...link, culture: null };

        const { data: organisms } = await repos.cultureOrganisms.list({
          filters: { culture_id: culture.id },
          orderBy: 'created_at',
          ascending: true,
        });
        const enrichedOrgs = await Promise.all(
          (organisms || []).map(async (org) => {
            const { data: sensitivities } = await repos.cultureSensitivities.list({
              filters: { organism_id: org.id },
            });
            return { ...org, sensitivities: sensitivities || [] };
          })
        );
        return { ...link, culture: { ...culture, organisms: enrichedOrgs } };
      })
    );

    res.json(enriched);
  }));

  // POST /api/antibiotic-culture-links — link a culture to an antibiotic
  router.post('/', asyncHandler(async (req, res) => {
    const { antibiotic_id, culture_id, link_reason, linked_by } = req.body;
    if (!antibiotic_id || !culture_id) {
      return res.status(400).json({ error: 'antibiotic_id and culture_id are required' });
    }

    // Get both entities to determine hospital_id
    const [abxResult, cultureResult] = await Promise.all([
      repos.antibiotics.getById(antibiotic_id),
      repos.cultures.getById(culture_id),
    ]);
    if (abxResult.error || !abxResult.data) return res.status(404).json({ error: 'Antibiotic not found' });
    if (cultureResult.error || !cultureResult.data) return res.status(404).json({ error: 'Culture not found' });

    const link = {
      id: crypto.randomUUID(),
      antibiotic_id,
      culture_id,
      link_reason: link_reason || 'Empirical Therapy',
      linked_by: linked_by || null,
      hospital_id: abxResult.data.hospital_id,
    };
    const { data, error } = await repos.antibioticCultureLinks.insert(link);
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json(data);
  }));

  // DELETE /api/antibiotic-culture-links/:id — unlink
  router.delete('/:id', asyncHandler(async (req, res) => {
    const { data: existing, error: findErr } = await repos.antibioticCultureLinks.getById(req.params.id);
    if (findErr || !existing) return res.status(404).json({ error: 'Link not found' });

    const { error } = await repos.antibioticCultureLinks.remove(req.params.id);
    if (error) return res.status(400).json({ error: error.message });
    res.status(204).end();
  }));

  return router;
}
