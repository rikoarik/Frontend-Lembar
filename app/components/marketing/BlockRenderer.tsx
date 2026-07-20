import Link from 'next/link';
import type { components } from '@/src/lib/api/schema';

type MarketingBlock = components['schemas']['MarketingBlock'];
type MarketingCta = components['schemas']['MarketingCta'];
type MarketingBlockItem = components['schemas']['MarketingBlockItem'];

// --- CTA helper ---

function CtaLink({ cta }: { cta: MarketingCta }) {
  if (!cta.enabled) return null;
  const base =
    cta.variant === 'primary'
      ? 'inline-flex items-center justify-center rounded-md bg-brand-accent px-5 py-2.5 text-body-default font-medium text-white hover:bg-brand-accent-h transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2'
      : cta.variant === 'secondary'
        ? 'inline-flex items-center justify-center rounded-md border border-brand-line bg-brand-paper px-5 py-2.5 text-body-default font-medium text-brand-ink hover:bg-brand-surface transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2'
        : 'inline-flex items-center gap-1 text-body-default font-medium text-brand-accent hover:underline focus-visible:outline focus-visible:outline-2';

  const label = cta.accessibleLabel ?? cta.label;

  if (cta.external) {
    return (
      <a
        href={cta.href}
        className={base}
        aria-label={label !== cta.label ? label : undefined}
        target="_blank"
        rel="noopener noreferrer"
        data-tracking={cta.trackingKey}
      >
        {cta.label}
      </a>
    );
  }
  return (
    <Link
      href={cta.href}
      className={base}
      aria-label={label !== cta.label ? label : undefined}
      data-tracking={cta.trackingKey}
    >
      {cta.label}
    </Link>
  );
}

function CtaList({ ctas }: { ctas?: MarketingCta[] }) {
  if (!ctas?.length) return null;
  return (
    <div className="flex flex-wrap gap-3 mt-6">
      {ctas.map((c) => (
        <CtaLink key={c.id} cta={c} />
      ))}
    </div>
  );
}

// --- Theme helper ---

function themeClass(theme: MarketingBlock['theme']) {
  switch (theme) {
    case 'dark':
      return 'bg-brand-ink text-white';
    case 'accent':
      return 'bg-brand-accent text-white';
    default:
      return 'bg-brand-surface text-brand-ink';
  }
}

// --- Block sections ---

function HeroBlock({ block }: { block: MarketingBlock }) {
  return (
    <section
      data-block-type="hero"
      data-block-id={block.id}
      className={`py-24 px-margin-mobile md:px-margin-desktop ${themeClass(block.theme)}`}
    >
      <div className="max-w-container-max mx-auto">
        {block.eyebrow && (
          <p className="text-caption font-medium uppercase tracking-widest mb-4 opacity-70">
            {block.eyebrow}
          </p>
        )}
        {block.heading && (
          <h1 className="text-h1 font-bold leading-tight max-w-3xl mb-6">{block.heading}</h1>
        )}
        {block.body && (
          <p className="text-body-lead max-w-2xl opacity-80 mb-6">{block.body}</p>
        )}
        <CtaList ctas={block.ctas} />
      </div>
    </section>
  );
}

function WorkflowBlock({ block }: { block: MarketingBlock }) {
  return (
    <section
      data-block-type="workflow"
      data-block-id={block.id}
      className={`py-16 px-margin-mobile md:px-margin-desktop ${themeClass(block.theme)}`}
    >
      <div className="max-w-container-max mx-auto">
        {block.eyebrow && (
          <p className="text-caption font-medium uppercase tracking-widest mb-3 opacity-70">
            {block.eyebrow}
          </p>
        )}
        {block.heading && (
          <h2 className="text-h2 font-bold mb-4">{block.heading}</h2>
        )}
        {block.body && <p className="text-body-default opacity-80 mb-10">{block.body}</p>}
        {block.items && block.items.length > 0 && (
          <ol className="grid grid-cols-1 md:grid-cols-3 gap-6 list-none">
            {block.items.map((item, i) => (
              <li key={item.id} className="flex flex-col gap-2">
                <span className="text-caption font-medium opacity-50">0{i + 1}</span>
                <h3 className="text-body-default font-semibold">{item.title}</h3>
                {item.body && <p className="text-body-sm opacity-70">{item.body}</p>}
              </li>
            ))}
          </ol>
        )}
        <CtaList ctas={block.ctas} />
      </div>
    </section>
  );
}

function GenericItemsBlock({ block }: { block: MarketingBlock }) {
  return (
    <section
      data-block-type={block.type}
      data-block-id={block.id}
      className={`py-16 px-margin-mobile md:px-margin-desktop ${themeClass(block.theme)}`}
    >
      <div className="max-w-container-max mx-auto">
        {block.eyebrow && (
          <p className="text-caption font-medium uppercase tracking-widest mb-3 opacity-70">
            {block.eyebrow}
          </p>
        )}
        {block.heading && (
          <h2 className="text-h2 font-bold mb-4">{block.heading}</h2>
        )}
        {block.body && <p className="text-body-default opacity-80 mb-10">{block.body}</p>}
        {block.items && block.items.length > 0 && (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 list-none">
            {block.items.map((item: MarketingBlockItem) => (
              <li
                key={item.id}
                className="rounded-lg border border-brand-line bg-brand-paper p-6 flex flex-col gap-2"
              >
                <h3 className="text-body-default font-semibold">{item.title}</h3>
                {item.body && <p className="text-body-sm opacity-70">{item.body}</p>}
                {item.cta && <CtaLink cta={item.cta} />}
              </li>
            ))}
          </ul>
        )}
        <CtaList ctas={block.ctas} />
      </div>
    </section>
  );
}

function FaqBlock({ block }: { block: MarketingBlock }) {
  return (
    <section
      data-block-type="faq"
      data-block-id={block.id}
      className={`py-16 px-margin-mobile md:px-margin-desktop ${themeClass(block.theme)}`}
    >
      <div className="max-w-container-max mx-auto max-w-2xl">
        {block.eyebrow && (
          <p className="text-caption font-medium uppercase tracking-widest mb-3 opacity-70">
            {block.eyebrow}
          </p>
        )}
        {block.heading && (
          <h2 className="text-h2 font-bold mb-8">{block.heading}</h2>
        )}
        {block.items && block.items.length > 0 && (
          <dl className="divide-y divide-brand-line">
            {block.items.map((item: MarketingBlockItem) => (
              <div key={item.id} className="py-5">
                <dt className="text-body-default font-semibold mb-2">{item.title}</dt>
                {item.body && (
                  <dd className="text-body-sm opacity-70">{item.body}</dd>
                )}
              </div>
            ))}
          </dl>
        )}
        <CtaList ctas={block.ctas} />
      </div>
    </section>
  );
}

function FinalCtaBlock({ block }: { block: MarketingBlock }) {
  return (
    <section
      data-block-type="final_cta"
      data-block-id={block.id}
      className={`py-20 px-margin-mobile md:px-margin-desktop text-center ${themeClass(block.theme)}`}
    >
      <div className="max-w-container-max mx-auto">
        {block.eyebrow && (
          <p className="text-caption font-medium uppercase tracking-widest mb-3 opacity-70">
            {block.eyebrow}
          </p>
        )}
        {block.heading && (
          <h2 className="text-h2 font-bold mb-4">{block.heading}</h2>
        )}
        {block.body && <p className="text-body-default opacity-80 mb-8 max-w-xl mx-auto">{block.body}</p>}
        <CtaList ctas={block.ctas} />
      </div>
    </section>
  );
}

// --- Main renderer ---

export function BlockRenderer({ blocks }: { blocks: MarketingBlock[] }) {
  return (
    <>
      {blocks.map((block) => {
        switch (block.type) {
          case 'hero':
            return <HeroBlock key={block.id} block={block} />;
          case 'workflow':
            return <WorkflowBlock key={block.id} block={block} />;
          case 'faq':
            return <FaqBlock key={block.id} block={block} />;
          case 'final_cta':
            return <FinalCtaBlock key={block.id} block={block} />;
          case 'product_proof':
          case 'audience':
          case 'trust':
          case 'pricing':
          default:
            return <GenericItemsBlock key={block.id} block={block} />;
        }
      })}
    </>
  );
}
