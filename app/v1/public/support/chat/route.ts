import { NextResponse } from 'next/server';
import { backendFetch } from '@/src/lib/api/session';

const FALLBACK = {
  data: {
    answered: false,
    message: 'Maaf, layanan chat sedang tidak tersedia.',
    whatsappUrl: 'https://wa.me/6285784255112',
  },
};

export async function POST(request: Request) {
  let message = '';
  try {
    const body = (await request.json()) as { message?: unknown };
    message = typeof body.message === 'string' ? body.message.trim() : '';
  } catch {
    return NextResponse.json({ error: { message: 'Permintaan tidak valid.' } }, { status: 400 });
  }

  if (!message || message.length > 500) {
    return NextResponse.json(
      { error: { message: 'Pesan wajib diisi dan maksimal 500 karakter.' } },
      { status: 400 },
    );
  }

  try {
    const upstream = await backendFetch('/v1/public/support/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
    const body = await upstream.json().catch(() => null);
    if (!upstream.ok || typeof body?.data?.message !== 'string') {
      return NextResponse.json(FALLBACK, { status: 502 });
    }
    return NextResponse.json(body, { status: 200 });
  } catch {
    return NextResponse.json(FALLBACK, { status: 502 });
  }
}
