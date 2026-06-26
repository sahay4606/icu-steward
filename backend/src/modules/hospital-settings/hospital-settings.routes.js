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

  return router;
}
