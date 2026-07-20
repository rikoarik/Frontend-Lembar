import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const SCHOOL_SECTIONS: Record<string, string> = {
  guru: 'Guru',
  'guru/undang': 'Undang Guru',
  penggunaan: 'Penggunaan',
  pengaturan: 'Pengaturan',
  audit: 'Audit',
};

export default function SchoolPlaceholderPage({
  params,
}: {
  params: { slug?: string[] };
}) {
  const slug = params.slug ?? [];
  const section = slug.join('/');
  const label = SCHOOL_SECTIONS[section] ?? 'Admin Sekolah';

  return (
    <div className="flex flex-col gap-3 max-w-xl">
      <h1 className="text-brand-ink font-semibold text-body-xl">{label}</h1>
      <p className="text-body-sm text-brand-muted">
        Halaman ini adalah placeholder untuk admin sekolah. Tampilan ini mengelola data agregat
        sekolah, bukan workspace guru individual. Fitur penuh akan tersedia setelah kontrak
        backend sekolah selesai.
      </p>
      {!section && (
        <nav aria-label="Navigasi school admin">
          <ul className="flex flex-col gap-1 mt-2">
            {Object.entries(SCHOOL_SECTIONS).map(([key, name]) => (
              <li key={key}>
                <a
                  href={`/school/${key}`}
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
