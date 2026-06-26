export function createNotificationRouter(repositories) {
  return {
    repositories,
    async notifyDoctor({ hospitalId, patientId, title, detail, severity = 'warning', sourceUserId, assignedDoctorId }) {
      return repositories.notifications.insert({
        hospital_id: hospitalId,
        patient_id: patientId,
        title,
        detail,
        severity,
        source_user_id: sourceUserId || null,
        assigned_doctor_id: assignedDoctorId || null,
        acknowledged: false,
        channel: 'in_app',
      });
    },
  };
}

