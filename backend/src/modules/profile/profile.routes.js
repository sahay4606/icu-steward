import { Router } from 'express';
import { asyncHandler } from '../../middleware/async-handler.js';

export function createProfileRoutes(supabase) {
  const router = Router();

  router.get('/', asyncHandler(async (req, res) => {
    const userId = req.query.user_id;
    if (!userId) return res.status(400).json({ error: 'user_id required' });
    const { data } = await supabase.from('users').select('*, hospitals(*)').eq('id', userId).single();
    res.json(data);
  }));

  return router;
}
