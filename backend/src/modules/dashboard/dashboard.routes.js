import { Router } from 'express';
import { asyncHandler } from '../../middleware/async-handler.js';

export function createDashboardRoutes(supabase) {
  const router = Router();

  router.get('/', asyncHandler(async (req, res) => {
    const hospitalId = req.query.hospital_id;
    if (!hospitalId) return res.status(400).json({ error: 'hospital_id required' });

    const [
      { data: patients },
      { data: pendingInvestigations },
      { data: antibioticReviewsDue },
      { data: highPriorityAlerts },
      { data: recentlyAdmitted },
    ] = await Promise.all([
      supabase.from('patients').select('id,status,priority').eq('hospital_id', hospitalId),
      supabase.from('investigations').select('id').eq('hospital_id', hospitalId).eq('status', 'Pending'),
      supabase.from('antibiotics').select('id').eq('hospital_id', hospitalId).or('status.eq.Review due,status.eq.High alert'),
      supabase.from('notifications').select('id').eq('hospital_id', hospitalId).eq('acknowledged', false).order('severity', { ascending: false }),
      supabase.from('patients').select('id').eq('hospital_id', hospitalId).gte('admission_date', new Date(Date.now() - 86400000 * 2).toISOString()),
    ]);

    res.json({
      patientsRequiringAttention: patients?.filter(p => p.status !== 'Stable').length || 0,
      pendingInvestigations: pendingInvestigations?.length || 0,
      positiveCultures: 0,
      antibioticReviewDue: antibioticReviewsDue?.length || 0,
      deviceReviewDue: 0,
      highPriorityAlerts: highPriorityAlerts?.length || 0,
      recentlyAdmitted: recentlyAdmitted?.length || 0,
    });
  }));

  return router;
}
