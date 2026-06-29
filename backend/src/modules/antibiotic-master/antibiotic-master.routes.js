import { Router } from 'express';
import { asyncHandler } from '../../middleware/async-handler.js';

export function createAntibioticMasterRoutes(supabase) {
  const router = Router();

  router.get('/', asyncHandler(async (req, res) => {
    const { data, error } = await supabase
      .from('antibiotic_master')
      .select('*')
      .eq('active', true)
      .order('generic_name', { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
  }));

  router.get('/classes', asyncHandler(async (_req, res) => {
    const { data, error } = await supabase
      .from('antibiotic_master')
      .select('antibiotic_class')
      .eq('active', true)
      .not('antibiotic_class', 'is', null)
      .order('antibiotic_class', { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    const unique = [...new Set((data || []).map((r) => r.antibiotic_class).filter(Boolean))];
    res.json(unique.map((c) => ({ className: c })));
  }));

  return router;
}
