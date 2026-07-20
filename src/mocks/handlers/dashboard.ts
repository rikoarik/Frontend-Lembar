import { HttpResponse, http } from 'msw';
import type { components } from '@/src/lib/api/schema';

type DashboardSummaryResponse = components['schemas']['DashboardSummaryResponse'];

const POPULATED_RESPONSE: DashboardSummaryResponse = {
  data: {
    workspace: {
      id: 'ws-1',
      type: 'personal',
      name: 'Workspace Demo',
      role: 'teacher',
      permissions: ['assessment.create', 'assessment.read'],
    },
    metrics: {
      assessments: { total: 15, draft: 8, inReview: 3, final: 4 },
      sources: { total: 5, ready: 4, processing: 1, failed: 0 },
      jobs: { total: 2, active: 1, failed: 0 },
    },
    emptyState: { isEmpty: false, message: '' },
  },
};

const EMPTY_RESPONSE: DashboardSummaryResponse = {
  data: {
    workspace: {
      id: 'ws-1',
      type: 'personal',
      name: 'Workspace Demo',
      role: 'teacher',
      permissions: [],
    },
    metrics: {
      assessments: { total: 0, draft: 0, inReview: 0, final: 0 },
      sources: { total: 0, ready: 0, processing: 0, failed: 0 },
      jobs: { total: 0, active: 0, failed: 0 },
    },
    emptyState: { isEmpty: true, message: 'Belum ada lembar. Mulai dengan membuat lembar pertama Anda.' },
  },
};

export const dashboardHandlers = [
  http.get('*/v1/dashboard/summary', ({ request }) => {
    const url = new URL(request.url);
    const scenario = url.searchParams.get('__scenario');

    if (scenario === 'empty') {
      return HttpResponse.json(EMPTY_RESPONSE, { status: 200 });
    }
    if (scenario === 'error') {
      return HttpResponse.json(
        { error: { code: 'INTERNAL_ERROR', message: 'Server error' } },
        { status: 500 },
      );
    }
    return HttpResponse.json(POPULATED_RESPONSE, { status: 200 });
  }),
];
