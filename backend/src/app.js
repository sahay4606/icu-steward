import express from 'express';
import cors from 'cors';
import { createSupabaseClient } from './db/client.js';
import { createBackend } from './db/backend.js';
import { errorHandler } from './middleware/error-handler.js';
import { createAuthRoutes } from './modules/auth/auth.routes.js';
import { createDashboardRoutes } from './modules/dashboard/dashboard.routes.js';
import { createProfileRoutes } from './modules/profile/profile.routes.js';
import { createHospitalSettingsRoutes } from './modules/hospital-settings/hospital-settings.routes.js';
import { createPatientsRoutes } from './modules/patients/patients.routes.js';
import { createInvestigationsRoutes } from './modules/investigations/investigations.routes.js';
import { createAntibioticsRoutes } from './modules/antibiotics/antibiotics.routes.js';
import { createDevicesRoutes } from './modules/devices/devices.routes.js';
import { createTasksRoutes } from './modules/tasks/tasks.routes.js';
import { createNotificationsRoutes } from './modules/notifications/notifications.routes.js';
import { createUsersRoutes } from './modules/users/users.routes.js';
import { createHospitalsRoutes } from './modules/hospitals/hospitals.routes.js';
import { createTimelineEventsRoutes } from './modules/timeline-events/timeline-events.routes.js';
import { createReminderRulesRoutes } from './modules/reminder-rules/reminder-rules.routes.js';
import { createDailyChecklistsRoutes } from './modules/daily-checklists/daily-checklists.routes.js';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const supabase = createSupabaseClient();
  if (!supabase) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
    process.exit(1);
  }

  const backend = createBackend(supabase);
  const { repositories } = backend;

  app.use('/api/auth', createAuthRoutes(supabase));
  app.use('/api/dashboard', createDashboardRoutes(supabase));
  app.use('/api/profile', createProfileRoutes(supabase));
  app.use('/api/hospital-settings', createHospitalSettingsRoutes(supabase));
  app.use('/api/patients', createPatientsRoutes(repositories.patients));
  app.use('/api/investigations', createInvestigationsRoutes(repositories.investigations));
  app.use('/api/antibiotics', createAntibioticsRoutes(repositories.antibiotics));
  app.use('/api/devices', createDevicesRoutes(repositories.devices));
  app.use('/api/tasks', createTasksRoutes(repositories.tasks));
  app.use('/api/notifications', createNotificationsRoutes(repositories.notifications));
  app.use('/api/users', createUsersRoutes(repositories.users));
  app.use('/api/hospitals', createHospitalsRoutes(repositories.hospitals));
  app.use('/api/timeline-events', createTimelineEventsRoutes(repositories.timelineEvents));
  app.use('/api/reminder-rules', createReminderRulesRoutes(repositories.reminderRules));
  app.use('/api/daily-checklists', createDailyChecklistsRoutes(repositories.dailyChecklists));

  app.use(errorHandler);

  return { app, supabase, backend };
}
