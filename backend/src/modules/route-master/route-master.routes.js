import { Router } from 'express';
import { asyncHandler } from '../../middleware/async-handler.js';

export function createRouteMasterRoutes(supabase) {
  const router = Router();

  router.get('/', asyncHandler(async (req, res) => {
    const { data, error } = await supabase
      .from('route_master')
      .select('*')
      .eq('active', true)
      .order('route_category', { ascending: true })
      .order('route_name', { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
  }));

  router.get('/categories', asyncHandler(async (_req, res) => {
    const { data, error } = await supabase
      .from('route_master')
      .select('route_category')
      .eq('active', true)
      .not('route_category', 'is', null)
      .order('route_category', { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    const unique = [...new Set((data || []).map((r) => r.route_category).filter(Boolean))];
    res.json(unique.map((c) => ({ categoryName: c })));
  }));

  return router;
}
