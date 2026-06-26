import { daysBetween } from '../lib/format';

export const filters = {
  patientStatus: ['All', 'Requires attention', 'Stable', 'Under review'],
  investigationStatus: ['All', 'Pending', 'Received', 'Reviewed', 'Closed'],
  antibioticAction: ['All', 'Continue', 'Escalate', 'De-escalate', 'Stop'],
};

export function getPatientRiskScore(patient) {
  let score = 0;
  if (patient?.priority === 'High') score += 3;
  if (patient?.status !== 'Stable') score += 2;
  score += (patient?.pendingInvestigations?.length || 0);
  score += (patient?.currentAntibiotics?.length || 0) > 1 ? 1 : 0;
  return score;
}

export function getOpenChecklistCount(checklist) {
  if (!checklist) return 0;
  return Object.values(checklist).filter((value) => !value).length;
}
