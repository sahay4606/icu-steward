import crypto from 'crypto';
import express from 'express';
import cors from 'cors';
import { createSupabaseClient } from './lib/supabase.js';
import { createBackend } from './lib/backend.js';

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const supabase = createSupabaseClient();
if (!supabase) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const backend = createBackend(supabase);
const { repositories } = backend;

function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

function buildRepoRoutes(prefix, repo) {
  app.get(`/api/${prefix}`, asyncHandler(async (req, res) => {
    const data = await repo.list({ hospitalId: req.query.hospital_id, filters: req.query });
    res.json(data.data || data);
  }));

  app.get(`/api/${prefix}/:id`, asyncHandler(async (req, res) => {
    const data = await repo.getById(req.params.id);
    res.json(data.data || data);
  }));

  app.post(`/api/${prefix}`, asyncHandler(async (req, res) => {
    const data = await repo.insert(req.body);
    res.status(201).json(data.data || data);
  }));

  app.patch(`/api/${prefix}/:id`, asyncHandler(async (req, res) => {
    const data = await repo.update(req.params.id, req.body);
    res.json(data.data || data);
  }));

  app.delete(`/api/${prefix}/:id`, asyncHandler(async (req, res) => {
    await repo.remove(req.params.id);
    res.status(204).end();
  }));
}

buildRepoRoutes('patients', repositories.patients);
buildRepoRoutes('investigations', repositories.investigations);
buildRepoRoutes('antibiotics', repositories.antibiotics);
buildRepoRoutes('devices', repositories.devices);
buildRepoRoutes('tasks', repositories.tasks);
buildRepoRoutes('notifications', repositories.notifications);
buildRepoRoutes('users', repositories.users);
buildRepoRoutes('hospitals', repositories.hospitals);
buildRepoRoutes('timeline-events', repositories.timelineEvents);
buildRepoRoutes('reminder-rules', repositories.reminderRules);
buildRepoRoutes('daily-checklists', repositories.dailyChecklists);

app.post('/api/auth/signup', asyncHandler(async (req, res) => {
  const { name, email, password, hospitalId } = req.body;
  if (!name || !email || !password || !hospitalId) {
    return res.status(400).json({ error: 'name, email, password, and hospitalId are required' });
  }
  const { data: existing } = await supabase.from('users').select('id').eq('email', email).maybeSingle();
  if (existing) return res.status(409).json({ error: 'Email already registered' });
  const hash = crypto.createHash('sha256').update(password).digest('hex');
  const id = `u-${crypto.randomUUID().slice(0, 8)}`;
  const { data, error } = await supabase.from('users').insert({
    id, hospital_id: hospitalId, name, email, password_hash: hash, role: 'Senior Resident', unit: 'ICU', status: 'Active',
  }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  const { password_hash, ...safe } = data;
  res.status(201).json(safe);
}));

app.post('/api/auth/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  const hash = crypto.createHash('sha256').update(password).digest('hex');
  const { data, error } = await supabase.from('users').select('*').eq('email', email).maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data || data.password_hash !== hash) return res.status(401).json({ error: 'Invalid email or password' });
  const { password_hash, ...safe } = data;
  res.json(safe);
}));

app.get('/api/auth/me', asyncHandler(async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });
  const { data, error } = await supabase.from('users').select('*').eq('id', userId).maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'User not found' });
  const { password_hash, ...safe } = data;
  res.json(safe);
}));

app.get('/api/dashboard', asyncHandler(async (req, res) => {
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

app.get('/api/profile', asyncHandler(async (req, res) => {
  const userId = req.query.user_id;
  if (!userId) return res.status(400).json({ error: 'user_id required' });
  const { data } = await supabase.from('users').select('*, hospitals(*)').eq('id', userId).single();
  res.json(data);
}));

app.get('/api/hospital-settings', asyncHandler(async (req, res) => {
  const hospitalId = req.query.hospital_id;
  if (!hospitalId) return res.status(400).json({ error: 'hospital_id required' });
  const { data } = await supabase.from('hospitals').select('*').eq('id', hospitalId).single();
  res.json(data);
}));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

app.listen(port, () => {
  console.log(`ICU Steward API running on http://localhost:${port}`);
});
