import { BACKEND_TABLES } from '../config/tables.js';
import { createRepository } from '../db/repository.js';

export function createUsersRepository(client) {
  return createRepository(client, BACKEND_TABLES.users);
}

