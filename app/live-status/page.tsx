/**
 * Live project status page.
 *
 * Reads a JSON snapshot written by the agent at
 *   /home/hermes/Workspace/Deliverables/lembar-live-status.json
 * and renders it as a simple progress dashboard. No authentication
 * is required — this is the cheapest possible transparency for the
 * owner during the demo push.
 *
 * Ponytail: a real-time SSE feed would be nicer; an admin refresh
 * button covers the immediate need without touching infra.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import Link from 'next/link';

type StatusItem = {
  label: string;
  status: 'done' | 'in_progress' | 'pending';
  percent: number;
};

type StatusDoc = {
  updatedAt: string;
  phase: string;
  headline: string;
  overallPercent: number;
  currentTask: string;
  items: StatusItem[];
  latestBackendCommits: string[];
  latestFrontendCommits: string[];
  services: { lembarApi: string; lembarFrontend: string; lembarWorker: string };
  notes: string[];
};

const STATUS_PATH = path.join(
  process.env.HOME || '/home/hermes',
  'Workspace',
  'Deliverables',
  'lembar-live-status.json',
);

async function loadStatus(): Promise<StatusDoc | null> {
  try {
    const raw = await fs.readFile(STATUS_PATH, 'utf8');
    return JSON.parse(raw) as StatusDoc;
  } catch {
    return null;
  }
}

const tone: Record<StatusItem['status'], string> = {
  done: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  in_progress: 'bg-amber-100 text-amber-700 ring-amber-200',
  pending: 'bg-neutral-100 text-neutral-600 ring-neutral-200',
};

const label: Record<StatusItem['status'], string> = {
  done: 'Selesai',
  in_progress: 'Lagi jalan',
  pending: 'Antrian',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function LiveStatusPage() {
  const doc = await loadStatus();

  if (!doc) {
    return (
      <main className="mx-auto flex max-w-2xl flex-col gap-3 p-6">
        <h1 className="text-2xl font-semibold text-neutral-900">Lembar Live Status</h1>
        <p className="text-sm text-neutral-600">
          Belum ada snapshot status. Pesan ini akan hilang otomatis begitu saya commit perubahan
          pertama ke <code>lembar-live-status.json</code>.
        </p>
        <Link href="/" className="text-sm text-emerald-700 underline">
          Kembali ke beranda
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-6 text-neutral-900">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Lembar — Live Status</h1>
        <p className="text-sm text-neutral-600">
          Diperbarui setiap ada progres signifikan. Dibaca langsung dari{' '}
          <code>lembar-live-status.json</code>. Refresh manual bisa dengan tombol di bawah.
        </p>
        <p className="text-xs text-neutral-500">
          Snapshot: <code>{doc.updatedAt}</code>
        </p>
      </header>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs uppercase tracking-wide text-neutral-500">Status total</span>
          <span className="text-2xl font-bold text-emerald-700">{doc.overallPercent}%</span>
        </div>
        <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-neutral-100">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${doc.overallPercent}%` }}
            aria-label={`Overall progress ${doc.overallPercent}%`}
          />
        </div>
        <p className="mt-3 text-sm">
          <strong>{doc.phase}</strong> — {doc.headline}
        </p>
        <p className="mt-1 text-sm text-neutral-600">
          Lagi fokus: <strong>{doc.currentTask}</strong>
        </p>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-base font-semibold">Item kerja</h2>
        <ul className="flex flex-col gap-3">
          {doc.items.map((item) => (
            <li key={item.label} className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-neutral-900">{item.label}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${tone[item.status]}`}
                >
                  {label[item.status]}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                <div
                  className={`h-full rounded-full ${
                    item.status === 'done'
                      ? 'bg-emerald-500'
                      : item.status === 'in_progress'
                        ? 'bg-amber-500'
                        : 'bg-neutral-300'
                  }`}
                  style={{ width: `${item.percent}%` }}
                  aria-label={`${item.label} ${item.percent}%`}
                />
              </div>
              <span className="text-xs text-neutral-500">{item.percent}%</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="mb-2 text-base font-semibold">Backend origin/dev</h2>
          <ul className="flex flex-col gap-1 font-mono text-xs text-neutral-700">
            {doc.latestBackendCommits.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="mb-2 text-base font-semibold">Frontend origin/dev</h2>
          <ul className="flex flex-col gap-1 font-mono text-xs text-neutral-700">
            {doc.latestFrontendCommits.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <h2 className="mb-2 text-base font-semibold">Services</h2>
        <ul className="flex flex-col gap-1 text-sm">
          <li>
            <strong>lembar-api:</strong> {doc.services.lembarApi}
          </li>
          <li>
            <strong>lembar-frontend:</strong> {doc.services.lembarFrontend}
          </li>
          <li>
            <strong>lembar-worker:</strong> {doc.services.lembarWorker}
          </li>
        </ul>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <h2 className="mb-2 text-base font-semibold">Catatan</h2>
        <ul className="list-disc pl-5 text-sm text-neutral-700">
          {doc.notes.map((n, i) => (
            <li key={i}>{n}</li>
          ))}
        </ul>
      </section>

      <form className="flex gap-3">
        <button
          type="submit"
          formAction="/live-status"
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-100"
        >
          Refresh
        </button>
      </form>
    </main>
  );
}
