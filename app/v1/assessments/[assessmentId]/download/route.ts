import { NextResponse } from 'next/server';
import { backendFetch } from '@/src/lib/api/session';
import { liveClaims } from '@/src/lib/api/liveAssessment';

function escape(value: unknown): string {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ assessmentId: string }> },
) {
  const auth = await liveClaims();
  if (!auth) {
    return NextResponse.json(
      { error: { code: 'AUTH_REQUIRED', message: 'Silakan masuk terlebih dahulu.' } },
      { status: 401 },
    );
  }
  const { assessmentId } = await context.params;
  const upstream = await backendFetch(`/v1/assessments/${encodeURIComponent(assessmentId)}/print`, {
    method: 'GET',
    token: auth.token,
    headers: { 'x-workspace-id': auth.claims.workspaceId },
  });
  const payload = (await upstream.json().catch(() => null)) as {
    data?: {
      meta?: { title?: string };
      questions?: Array<{
        sequence?: number;
        stem?: string;
        options?: Array<{ key?: string; text?: string }>;
        answer?: string;
        explanation?: string;
      }>;
    };
    error?: unknown;
  } | null;
  if (!upstream.ok || !payload?.data) {
    return NextResponse.json(payload, { status: upstream.status });
  }
  const title = escape(payload.data.meta?.title ?? 'Lembar soal');
  const questions = payload.data.questions ?? [];
  const questionHtml = questions.map((question, index) => `<section><p><strong>${index + 1}.</strong> ${escape(question.stem)}</p><ol type="A">${(question.options ?? []).map((option) => `<li>${escape(option.text)}</li>`).join('')}</ol></section>`).join('');
  const answers = questions.map((question, index) => `<li>${index + 1}. ${escape(question.answer)}</li>`).join('');
  const explanations = questions.map((question, index) => `<section><strong>${index + 1}.</strong> ${escape(question.explanation)}</section>`).join('');
  const html = `<!doctype html><html lang="id"><head><meta charset="utf-8"><title>${title}</title><style>body{font:16px/1.5 sans-serif;max-width:800px;margin:40px auto;padding:0 20px}section{margin:0 0 24px}h1,h2{page-break-after:avoid}@media print{body{margin:0}}</style></head><body><h1>${title}</h1>${questionHtml}<hr><h2>Kunci jawaban</h2><ol>${answers}</ol><hr><h2>Pembahasan</h2>${explanations}</body></html>`;
  return new NextResponse(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'content-disposition': `attachment; filename="lembar-${assessmentId}.html"`,
      'cache-control': 'private, no-store',
    },
  });
}
