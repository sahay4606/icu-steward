import { BACKEND_TABLES } from '../config/tables.js';
import { createRepository } from '../db/repository.js';

export function createReminderRulesRepository(client) {
  return createRepository(client, BACKEND_TABLES.reminderRules);
}

