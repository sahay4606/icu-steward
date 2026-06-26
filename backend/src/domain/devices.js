import { BACKEND_TABLES } from '../config/tables.js';
import { createRepository } from '../db/repository.js';

export function createDevicesRepository(client) {
  return createRepository(client, BACKEND_TABLES.devices);
}

