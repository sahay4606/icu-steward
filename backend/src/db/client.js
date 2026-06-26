import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
import 'dotenv/config';

import { readBackendEnv } from '../config/env.js';

export function createSupabaseClient(env = process.env) {
  const { supabaseUrl, supabaseServiceRoleKey } = readBackendEnv(env);

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    realtime: { transport: ws },
  });
}
