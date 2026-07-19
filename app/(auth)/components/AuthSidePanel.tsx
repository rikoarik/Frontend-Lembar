import Link from 'next/link';
import Logo from '@/app/components/marketing/Logo';

type AuthSidePanelProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  proofs?: readonly string[];
};

const DEFAULT_PROOFS = [
  'Konten Anda tetap privat secara default.',
  'Sistem membantu membuat draft — guru tetap meninjau dan memfinalkan.',
] as const;

export default function AuthSidePanel({
  eyebrow = 'Ruang kerja guru',
  title,
  description,
  proofs = DEFAULT_PROOFS,
}: AuthSidePanelProps) {
  return (
    <aside className="hidden min-h-screen flex-col bg-ink px-unit-12 py-unit-8 text-white lg:flex">
      <Link
        href="/"
        aria-label="lembar — kembali ke beranda"
        className="flex w-fit items-center gap-unit-3 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-fixed"
      >
        <Logo variant="mark" alt="" width={32} height={32} priority />
        <span className="font-h3 text-h3 font-semibold text-white">lembar</span>
      </Link>

      <div className="my-auto flex max-w-[32rem] flex-col gap-unit-6 py-unit-16">
        <p className="font-label-semibold text-label-semibold text-on-primary/70">{eyebrow}</p>
        <h2 className="text-balance font-h1 text-h1 leading-tight text-white">{title}</h2>
        {description ? (
          <p className="max-w-[58ch] text-pretty font-body-lead text-body-lead text-on-primary/80">
            {description}
          </p>
        ) : null}
      </div>

      <div className="max-w-[32rem] border-t border-white/20 pt-unit-6">
        <ul className="flex flex-col gap-unit-4" aria-label="Komitmen lembar">
          {proofs.map((proof) => (
            <li key={proof} className="flex items-start gap-unit-3">
              <span
                aria-hidden="true"
                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-fixed-dim"
              />
              <span className="font-body-sm text-body-sm leading-relaxed text-on-primary/80">
                {proof}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
