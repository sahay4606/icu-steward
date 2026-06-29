import { Router } from 'express';
import { asyncHandler } from '../../middleware/async-handler.js';

export function createHospitalSettingsRoutes(supabase) {
  const router = Router();

  router.get('/', asyncHandler(async (req, res) => {
    const hospitalId = req.query.hospital_id;
    if (!hospitalId) return res.status(400).json({ error: 'hospital_id required' });
    const { data } = await supabase.from('hospitals').select('*').eq('id', hospitalId).single();
    res.json(data);
  }));

  router.patch('/', asyncHandler(async (req, res) => {
    const hospitalId = req.query.hospital_id || req.body.hospital_id;
    if (!hospitalId) return res.status(400).json({ error: 'hospital_id required' });
    const allowed = ['icu_beds', 'name', 'city', 'beds', 'plan', 'sync_status'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'No valid fields to update' });
    updates.updated_at = new Date().toISOString();
    const { data, error } = await supabase.from('hospitals').update(updates).eq('id', hospitalId).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  }));

  return router;
}
