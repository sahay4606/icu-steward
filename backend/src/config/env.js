export const BACKEND_ENV_KEYS = {
  supabaseUrl: 'SUPABASE_URL',
  supabaseAnonKey: 'SUPABASE_ANON_KEY',
  supabaseServiceRoleKey: 'SUPABASE_SERVICE_ROLE_KEY',
  jwtSecret: 'JWT_SECRET',
  appEnv: 'APP_ENV',
};

export function readBackendEnv(env = process.env) {
  return {
    supabaseUrl: env[BACKEND_ENV_KEYS.supabaseUrl] || '',
    supabaseAnonKey: env[BACKEND_ENV_KEYS.supabaseAnonKey] || '',
    supabaseServiceRoleKey: env[BACKEND_ENV_KEYS.supabaseServiceRoleKey] || '',
    jwtSecret: env[BACKEND_ENV_KEYS.jwtSecret] || 'icu-steward-dev-secret',
    appEnv: env[BACKEND_ENV_KEYS.appEnv] || 'development',
  };
}

