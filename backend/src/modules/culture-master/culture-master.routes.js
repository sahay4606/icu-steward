import { Router } from 'express';
import { asyncHandler } from '../../middleware/async-handler.js';

export function createCultureMasterRoutes(supabase) {
  const router = Router();

  router.get('/', asyncHandler(async (req, res) => {
    const { data, error } = await supabase
      .from('culture_master')
      .select('*')
      .eq('active', true)
      .order('culture_name', { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
  }));

  router.get('/categories', asyncHandler(async (_req, res) => {
    const { data, error } = await supabase
      .from('culture_master')
      .select('category')
      .eq('active', true)
      .not('category', 'is', null)
      .order('category', { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    const unique = [...new Set((data || []).map((r) => r.category).filter(Boolean))];
    res.json(unique.map((c) => ({ categoryName: c })));
  }));

  return router;
}
