import { Router } from 'express';
import { asyncHandler } from '../../middleware/async-handler.js';

export function createDashboardRoutes(supabase) {
  const router = Router();

  router.get('/', asyncHandler(async (req, res) => {
    const hospitalId = req.query.hospital_id;
    if (!hospitalId) return res.status(400).json({ error: 'hospital_id required' });

    const [
      { data: hospital },
      { data: patients },
      { data: pendingInvestigations },
      { data: positiveCultures },
      { data: antibioticReviewsDue },
      { data: activeDevices },
      { data: highPriorityAlerts },
      { data: recentlyAdmitted },
    ] = await Promise.all([
      supabase.from('hospitals').select('icu_beds,beds').eq('id', hospitalId).single(),
      supabase.from('patients').select('id,status,priority').eq('hospital_id', hospitalId),
      supabase.from('investigations').select('id').eq('hospital_id', hospitalId).eq('status', 'Pending'),
      supabase.from('cultures').select('id').eq('hospital_id', hospitalId).in('status', ['Final Growth', 'Sensitivity Complete']),
      supabase.from('antibiotics').select('id').eq('hospital_id', hospitalId).in('action', ['Review due', 'Escalate']),
      supabase.from('devices').select('id').eq('hospital_id', hospitalId).neq('status', 'Removed'),
      supabase.from('notifications').select('id').eq('hospital_id', hospitalId).eq('acknowledged', false),
      supabase.from('patients').select('id').eq('hospital_id', hospitalId).gte('admission_date', new Date(Date.now() - 86400000 * 2).toISOString()),
    ]);

    const patientList = patients || [];
    const totalBeds = hospital?.icu_beds || hospital?.beds || 30;

    res.json({
      occupiedBeds: patientList.length,
      totalBeds,
      requiresAttention: patientList.filter(p => p.status === 'Requires attention').length,
      underReview: patientList.filter(p => p.status === 'Under review').length,
      stable: patientList.filter(p => p.status === 'Stable').length,
      pendingInvestigations: pendingInvestigations?.length || 0,
      positiveCultures: positiveCultures?.length || 0,
      antibioticReviewDue: antibioticReviewsDue?.length || 0,
      deviceReviewDue: activeDevices?.length || 0,
      highPriorityAlerts: highPriorityAlerts?.length || 0,
      recentlyAdmitted: recentlyAdmitted?.length || 0,
    });
  }));

  return router;
}
