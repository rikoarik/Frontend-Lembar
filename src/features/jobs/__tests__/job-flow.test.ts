import { describe, expect, it, beforeEach } from 'vitest';
import { setupServer } from 'msw/node';
import { generateHandlers, __resetMockJobs } from '@/src/mocks/handlers/generate';
import { generateService } from '@/src/services/generate/generateService';
import { jobService } from '@/src/services/jobs/jobService';

const server = setupServer(...generateHandlers);

describe('F3-04 mock generate job flow', () => {
  beforeEach(() => {
    __resetMockJobs();
    server.resetHandlers();
  });

  it('submit returns jobId and same idempotency key reuses job', async () => {
    server.listen({ onUnhandledRequest: 'error' });
    try {
      const values = {
        sourceMode: 'katalog' as const,
        curriculumVersionId: 'kurmer-1',
        gradeId: 'g-5',
        subjectId: 's-4',
        materialIds: ['m-10'],
        sourceId: '',
        assessmentType: 'practice' as const,
        difficulty: 'medium' as const,
        questionCount: 10,
        reviewMode: 'quick' as const,
        teacherFocus: '',
        exampleQuestion: '',
      };

      const first = await generateService.submitConfiguration(values, 'ws_demo', 'idem-1');
      expect(first.ok).toBe(true);
      if (!first.ok) return;
      expect(first.value.jobId).toMatch(/^job_/);

      const second = await generateService.submitConfiguration(values, 'ws_demo', 'idem-1');
      expect(second.ok).toBe(true);
      if (!second.ok) return;
      expect(second.value.jobId).toBe(first.value.jobId);

      const job = await jobService.getJob(first.value.jobId);
      expect(job.ok).toBe(true);
      if (!job.ok) return;
      expect(['queued', 'running', 'succeeded']).toContain(job.value.status);
    } finally {
      server.close();
    }
  });

  it('cancel transitions active job to cancelled', async () => {
    server.listen({ onUnhandledRequest: 'error' });
    try {
      const values = {
        sourceMode: 'katalog' as const,
        curriculumVersionId: 'kurmer-1',
        gradeId: 'g-5',
        subjectId: 's-4',
        materialIds: ['m-10'],
        sourceId: '',
        assessmentType: 'practice' as const,
        difficulty: 'medium' as const,
        questionCount: 10,
        reviewMode: 'detail' as const,
        teacherFocus: '',
        exampleQuestion: '',
      };
      const submitted = await generateService.submitConfiguration(values, 'ws_demo', 'idem-cancel');
      expect(submitted.ok).toBe(true);
      if (!submitted.ok) return;

      const cancelled = await jobService.cancelJob(submitted.value.jobId);
      expect(cancelled.ok).toBe(true);
      if (!cancelled.ok) return;
      expect(cancelled.value.status).toBe('cancelled');
      expect(cancelled.value.canCancel).toBe(false);
    } finally {
      server.close();
    }
  });
});
