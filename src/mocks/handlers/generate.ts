import { HttpResponse, delay, http } from 'msw';

export const generateHandlers = [
  http.post(/\/v1\/generate\/submit/, async () => {
    await delay(300);

    return HttpResponse.json(
      { data: { status: 'accepted', compositionId: 'comp-demo-01' } },
      { status: 200 },
    );
  }),
];
