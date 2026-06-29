import { Router } from 'express';
import { asyncHandler } from '../../middleware/async-handler.js';

export function createDeviceMasterRoutes(supabase) {
  const router = Router();

  router.get('/', asyncHandler(async (req, res) => {
    const { data, error } = await supabase
      .from('device_master')
      .select('*')
      .eq('active', true)
      .order('device_category')
      .order('device_name');
    if (error) return res.status(400).json({ error: error.message });
    res.json(data || []);
  }));

  router.get('/categories', asyncHandler(async (req, res) => {
    const { data, error } = await supabase
      .from('device_master')
      .select('device_category')
      .eq('active', true);
    if (error) return res.status(400).json({ error: error.message });
    const categories = [...new Set((data || []).map((r) => r.device_category).filter(Boolean))].sort();
    res.json(categories);
  }));

  return router;
}
