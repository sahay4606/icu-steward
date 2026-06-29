import { Router } from 'express';
import { asyncHandler } from '../../middleware/async-handler.js';

export function createAntibioticCultureMappingRoutes(supabase) {
  const router = Router();

  router.get('/', asyncHandler(async (req, res) => {
    const { antibiotic_name, culture_type } = req.query;

    let query = supabase
      .from('antibiotic_culture_mapping')
      .select('*')
      .eq('recommended', true);

    if (antibiotic_name) {
      query = query.eq('antibiotic_generic_name', antibiotic_name);
    }
    if (culture_type) {
      query = query.eq('culture_type', culture_type);
    }

    const { data, error } = await query.order('priority', { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
  }));

  return router;
}
