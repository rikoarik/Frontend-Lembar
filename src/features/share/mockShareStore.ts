export type ShareLink = {
  token: string;
  assessmentId: string;
  title: string;
  status: 'active' | 'revoked' | 'expired';
  createdAt: string;
  expiresAt: string;
  packageLabels: string[];
};

const shares = new Map<string, ShareLink>();

function seed() {
  if (shares.size > 0) return;
  shares.set('bagikan-demo-ipas', {
    token: 'bagikan-demo-ipas',
    assessmentId: 'asm_ipas_02',
    title: 'Kuis perubahan wujud benda',
    status: 'active',
    createdAt: '2026-07-21T08:00:00.000Z',
    expiresAt: '2026-08-21T08:00:00.000Z',
    packageLabels: ['Lembar siswa', 'Kunci jawaban', 'Pembahasan'],
  });
  shares.set('revoked-test', {
    token: 'revoked-test',
    assessmentId: 'asm_ipas_02',
    title: 'Kuis perubahan wujud benda',
    status: 'revoked',
    createdAt: '2026-07-10T08:00:00.000Z',
    expiresAt: '2026-08-10T08:00:00.000Z',
    packageLabels: ['Lembar siswa'],
  });
  shares.set('expired-test', {
    token: 'expired-test',
    assessmentId: 'asm_ipas_02',
    title: 'Kuis perubahan wujud benda',
    status: 'expired',
    createdAt: '2026-06-01T08:00:00.000Z',
    expiresAt: '2026-06-30T08:00:00.000Z',
    packageLabels: ['Lembar siswa'],
  });
}

export function listShares(assessmentId?: string): ShareLink[] {
  seed();
  return Array.from(shares.values()).filter((s) =>
    assessmentId ? s.assessmentId === assessmentId : true,
  );
}

export function getShare(token: string): ShareLink | null {
  seed();
  return shares.get(token) ?? null;
}

export function createShare(input: {
  assessmentId: string;
  title: string;
  daysValid?: number;
}): ShareLink {
  seed();
  const token = `share_${Math.random().toString(36).slice(2, 10)}`;
  const createdAt = new Date().toISOString();
  const days = input.daysValid ?? 30;
  const expires = new Date();
  expires.setUTCDate(expires.getUTCDate() + days);
  const link: ShareLink = {
    token,
    assessmentId: input.assessmentId,
    title: input.title,
    status: 'active',
    createdAt,
    expiresAt: expires.toISOString(),
    packageLabels: ['Lembar siswa', 'Kunci jawaban', 'Pembahasan'],
  };
  shares.set(token, link);
  return link;
}

export function revokeShare(token: string): ShareLink | null {
  seed();
  const current = shares.get(token);
  if (!current) return null;
  const next = { ...current, status: 'revoked' as const };
  shares.set(token, next);
  return next;
}

export function __resetShareStore() {
  shares.clear();
  seed();
}
