#!/usr/bin/env node

const userAgent = process.env.npm_config_user_agent || '';

if (userAgent && !userAgent.startsWith('yarn/1.')) {
  console.error('ICU Steward uses Yarn v1 only. Run installs with `yarn`.');
  process.exit(1);
}

process.exit(0);
