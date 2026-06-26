import { Router } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { asyncHandler } from '../../middleware/async-handler.js';
import { createAuthMiddleware } from '../../middleware/auth-middleware.js';
import { readBackendEnv } from '../../config/env.js';

function signToken(user) {
  const { jwtSecret } = readBackendEnv();
  return jwt.sign(
    { id: user.id, email: user.email, hospital_id: user.hospital_id, role: user.role },
    jwtSecret,
    { expiresIn: '7d' },
  );
}

function stripSensitive(user) {
  const { password_hash, ...safe } = user;
  return safe;
}

export function createAuthRoutes(supabase) {
  const router = Router();
  const auth = createAuthMiddleware();

  router.post('/signup', asyncHandler(async (req, res) => {
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
    const safe = stripSensitive(data);
    const token = signToken(data);
    res.status(201).json({ user: safe, token });
  }));

  router.post('/login', asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    const { data, error } = await supabase.from('users').select('*').eq('email', email).maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    if (!data || data.password_hash !== hash) return res.status(401).json({ error: 'Invalid email or password' });
    const safe = stripSensitive(data);
    const token = signToken(data);
    res.json({ user: safe, token });
  }));

  router.get('/me', auth, asyncHandler(async (req, res) => {
    const { data, error } = await supabase.from('users').select('*').eq('id', req.user.id).maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'User not found' });
    res.json(stripSensitive(data));
  }));

  return router;
}
