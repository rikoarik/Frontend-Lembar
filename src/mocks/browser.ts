import { setupWorker } from 'msw/browser';
import { authHandlers } from './handlers/auth';
import { leadHandlers } from './handlers/leads';
import { catalogHandlers } from './handlers/catalog';
import { generateHandlers } from './handlers/generate';

export const worker = setupWorker(
  ...authHandlers,
  ...leadHandlers,
  ...catalogHandlers,
  ...generateHandlers,
);
