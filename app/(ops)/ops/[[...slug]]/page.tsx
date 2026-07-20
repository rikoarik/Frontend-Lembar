import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const OPS_SECTIONS: Record<string, string> = {
  accounts: 'Akun',
  schools: 'Sekolah',
  catalog: 'Katalog',
  prompts: 'Prompt',
  jobs: 'Jobs',
  quality: 'Quality',
  audit: 'Audit',
  billing: 'Billing',
  flags: 'Feature Flags',
};

export default function OpsPlaceholderPage({
  params,
}: {
  params: { slug?: string[] };
}) {
  const slug = params.slug ?? [];
  const section = slug[0] ?? '';
  const label = OPS_SECTIONS[section] ?? 'Operasional';

  return (
    <div className="flex flex-col gap-3 max-w-xl">
      <h1 className="text-brand-ink font-semibold text-body-xl">{label}</h1>
      <p className="text-body-sm text-brand-muted">
        Halaman ini adalah placeholder platform-only untuk superadmin. Fitur penuh akan tersedia
        setelah kontrak backend ops selesai.
      </p>
      {!section && (
        <nav aria-label="Navigasi ops">
          <ul className="flex flex-col gap-1 mt-2">
            {Object.entries(OPS_SECTIONS).map(([key, name]) => (
              <li key={key}>
                <a
                  href={`/ops/${key}`}
                  className="text-body-sm text-brand-accent hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent rounded"
                >
                  {name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
