import { BACKEND_TABLES } from '../config/tables.js';
import { createRepository } from '../db/repository.js';

export function createAntibioticsRepository(client) {
  return createRepository(client, BACKEND_TABLES.antibiotics);
}

