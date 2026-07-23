import { NextResponse } from 'next/server';
import {
  createShare,
  getShare,
  listShares,
  revokeShare,
} from '@/src/features/share/mockShareStore';
import { isMockApiMode, mockFail, mockNotFound, mockOk } from '@/src/lib/mock-api/preview';

export async function GET(request: Request) {
  if (!isMockApiMode()) return mockNotFound();
  const url = new URL(request.url);
  const assessmentId = url.searchParams.get('assessmentId') ?? undefined;
  return mockOk(listShares(assessmentId));
}

export async function POST(request: Request) {
  if (!isMockApiMode()) return mockNotFound();
  let body: { assessmentId?: string; title?: string; daysValid?: number } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return mockFail('VALIDATION_FAILED', 'Periksa kembali isian formulir.', 400);
  }
  if (!body.assessmentId || !body.title) {
    return mockFail('VALIDATION_FAILED', 'assessmentId dan title wajib.', 400);
  }
  return mockOk(createShare({
    assessmentId: body.assessmentId,
    title: body.title,
    daysValid: body.daysValid,
  }), { status: 201 });
}
