import { setupWorker } from 'msw/browser';
import { authHandlers } from './handlers/auth';
import { leadHandlers } from './handlers/leads';

export const worker = setupWorker(...authHandlers, ...leadHandlers);
