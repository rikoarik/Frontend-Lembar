'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Book1,
  DocumentDownload,
  DocumentText,
  Edit2,
  Export,
  Link1,
  ShieldTick,
  TickCircle,
} from 'iconsax-react';
import Button from '../components/marketing/Button';
import { RevealSection, RevealText, RevealMedia } from '../components/marketing/Reveal';
import { Panel1Visual, Panel2Visual, Panel3Visual } from '../components/marketing/MockupPanels';
import { homeContent } from '@/src/lib/marketing/home';
import { getMarketingCta } from '@/src/lib/marketing/ctas';

const panelIcons = [DocumentText, Edit2, Export];

export default function HomePage() {
  const content = homeContent;
  const primary = getMarketingCta(content.hero.primaryCta);
  const secondary = getMarketingCta(content.hero.secondaryCta);

  const panel0Ref = useRef<HTMLDivElement>(null);
  const panel1Ref = useRef<HTMLDivElement>(null);
  const panel2Ref = useRef<HTMLDivElement>(null);
  
  const panelsRefs = [panel0Ref, panel1Ref, panel2Ref];
  const [activeStep, setActiveStep] = useState<number>(0);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px -50% 0px',
      threshold: 0,
    };

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = panelsRefs.findIndex((ref) => ref.current === entry.target);
          if (index !== -1) {
            setActiveStep(index);
          }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);

    panelsRefs.forEach((ref) => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const scrollToPanel = (index: number) => {
    const targetRef = panelsRefs[index];
    if (targetRef.current) {
      targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };


  const previewContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const previewItemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  const badgeVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: 'spring' as const, stiffness: 200, damping: 10, delay: 0.8 },
    },
  };

  return (
    <>
      <RevealSection className="hero" id="produk">
        <div className="hero__copy">
          <RevealText>
            <p className="eyebrow">{content.hero.eyebrow}</p>
          </RevealText>
          <RevealText delay={0.04}>
            <h1 className="hero__heading">{content.hero.title}</h1>
          </RevealText>
          <RevealText delay={0.08}>
            <p className="hero__sub">{content.hero.body}</p>
          </RevealText>
          <RevealText delay={0.12}>
            <div className="hero__cta">
              <Button ctaId={primary.id} href={primary.href} label={primary.label} size="lg" />
              <Button
                ctaId={secondary.id}
                href={secondary.href}
                label={secondary.label}
                variant="secondary"
                size="lg"
              />
            </div>
          </RevealText>
          <RevealText delay={0.16}>
            <p className="hero__meta">{content.hero.meta}</p>
          </RevealText>
        </div>

        <RevealMedia className="hero__preview" delay={0.08}>
          <motion.div
            className="preview"
            id="contoh-hasil"
            aria-label="Contoh kerja Generate Lembar"
            variants={previewContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="preview__topbar">
              <div className="preview__brand">
                <span className="preview__brand-mark" aria-hidden="true">
                  L
                </span>
                <span>{content.preview.title}</span>
              </div>
              <span className="status status--draft">{content.preview.draft}</span>
            </div>

            <div className="preview__settings">
              {content.preview.settings.map((setting) => (
                <span key={setting}>{setting}</span>
              ))}
            </div>

            <div className="preview__document">
              <div className="preview__doc-head">
                <div>
                  <p className="preview__doc-kicker">Lembar Soal</p>
                  <p className="preview__doc-title">{content.preview.documentTitle}</p>
                </div>
                <span>{content.preview.duration}</span>
              </div>

              {content.preview.questions.map((question) => (
                <motion.article
                  key={question.no}
                  className="question"
                  variants={previewItemVariants}
                >
                  <span className="question__index">{question.no}</span>
                  <div className="question__body">
                    <span className="question__no">Soal {question.no.replace(/^0+/, '')}</span>
                    <span className="question__text" style={{ whiteSpace: 'pre-line' }}>{question.text}</span>
                    <ul className="question__answers">
                      {question.answers.map((answer, index) => (
                        <li key={answer}>
                          <span className="question__bullet">
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span>{answer.replace(/^[A-D]\.\s*/, '')}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="question__source">{question.source}</p>
                  </div>
                  <motion.span
                    className={`badge badge--success`}
                    variants={badgeVariants}
                  >
                    {question.status}
                  </motion.span>
                </motion.article>
              ))}
            </div>

            <motion.div
              className="preview__outputs"
              aria-label="Pilihan hasil akhir"
              variants={previewItemVariants}
            >
              {content.preview.outputs.map((output, index) => (
                <span
                  key={output}
                  className={`output-chip ${index === 0 ? 'output-chip--dark' : ''}`.trim()}
                >
                  {index === 0 ? (
                    <DocumentDownload size={15} variant="Linear" aria-hidden="true" />
                  ) : null}
                  {output === 'Cetak' ? (
                    <DocumentText size={15} variant="Linear" aria-hidden="true" />
                  ) : null}
                  {output === 'Tautan' ? (
                    <Link1 size={15} variant="Linear" aria-hidden="true" />
                  ) : null}
                  {output}
                </span>
              ))}
            </motion.div>
          </motion.div>
        </RevealMedia>
      </RevealSection>

      <div className="proof" aria-labelledby="proof-heading">
        <h2 id="proof-heading" className="sr-only">
          Alur kerja lembar
        </h2>
        <div className="proof__inner">
          {content.proof.map((step, index) => (
            <button
              key={step.no}
              className={`proof__step-btn ${activeStep === index ? 'proof__step-btn--active' : ''}`}
              onClick={() => scrollToPanel(index)}
              aria-label={`Scroll ke langkah ${step.title}`}
            >
              <span className="proof__no">{step.no}</span>
              <span className="proof__title">{step.title}</span>
            </button>
          ))}
        </div>
      </div>

      <section id="cara-kerja" className="how" aria-labelledby="how-heading">
        <RevealText>
          <div className="section-heading">
            <p className="eyebrow">{content.how.eyebrow}</p>
            <h2 id="how-heading" className="section-heading__title">
              {content.how.title}
            </h2>
          </div>
        </RevealText>

        <div className="how__panels">
          {content.how.panels.map((panel, index) => {
            const Icon = panelIcons[index];
            return (
              <div
                key={panel.eyebrow}
                ref={panelsRefs[index]}
                id={`cara-kerja-step-${index + 1}`}
                style={{ scrollMarginTop: '130px' }}
              >
                <RevealSection
                  className={`editorial ${index % 2 === 1 ? 'editorial--reverse' : ''}`.trim()}
                  delay={index * 0.05}
                >
                <div className="editorial__copy">
                  <span className="icon-accent" aria-hidden="true">
                    <Icon size={24} variant="Linear" />
                  </span>
                  <p className="eyebrow">{panel.eyebrow}</p>
                  <h3 className="editorial__title">{panel.title}</h3>
                  <p className="editorial__body">{panel.body}</p>
                </div>
                <div className="editorial__visual" aria-label={panel.title}>
                  {panel.visual === 'generate' ? <Panel1Visual /> : null}
                  {panel.visual === 'review' ? <Panel2Visual /> : null}
                  {panel.visual === 'export' ? <Panel3Visual /> : null}
                </div>
              </RevealSection>
            </div>
          );
        })}
      </div>
      </section>

      <section className="trust" aria-labelledby="trust-heading">
        <div className="trust__inner">
          <div className="trust__header">
            <h2 id="trust-heading" className="trust__headline">
              {content.trust.title}
            </h2>
          </div>

          <div className="trust__grid">
            <RevealMedia className="trust-question-card" delay={0.05}>
              <div className="trust-question-card__header">
                <span className="trust-question-card__tag">Q3 · Pilihan Ganda</span>
                <span className="badge badge--success">{content.trust.specimen.status}</span>
              </div>
              <p className="trust-question-card__text">{content.trust.specimen.question}</p>
              <div className="trust-question-card__options">
                <div className="trust-option trust-option--active">
                  <span>A. Tidak adanya akar pohon penahan air</span>
                  <span className="trust-option__arrow" aria-hidden="true">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </span>
                </div>
                <div className="trust-option">
                  <span>B. Curah hujan yang rendah.</span>
                </div>
                <div className="trust-option">
                  <span>C. Jenis tanah liat yang keras.</span>
                </div>
              </div>
            </RevealMedia>

            <RevealMedia className="trust-source-card" delay={0.2}>
              <div className="trust-source-card__header">
                <span className="trust-source-card__title">Sumber Kutipan</span>
                <a href="#dokumen" className="trust-source-card__link">
                  {content.trust.link}
                </a>
              </div>
              <div className="trust-source-card__body">
                <p className="trust-source-card__quote">
                  "…erosi paling sering terjadi pada lereng yang tidak ditumbuhi habis. Tanpa adanya sistem perakaran pohon yang kuat untuk mengikat tanah dan menyerap air hujan, lapisan atas tanah sangat mudah terbawa arus air…"
                </p>
                <span className="trust-source-card__ref">- {content.trust.specimen.source}</span>
              </div>
            </RevealMedia>
          </div>
        </div>
      </section>

      <section id="harga" className="final-cta" aria-labelledby="final-cta-heading">
        <RevealText>
          <div className="final-cta__inner">
            <p className="eyebrow">{content.final.eyebrow}</p>
            <h2 id="final-cta-heading" className="final-cta__title">
              {content.final.title}
            </h2>
            <p className="final-cta__sub">{content.final.body}</p>
            <div className="final-cta__actions">
              <Button
                ctaId={content.final.cta}
                href={getMarketingCta(content.final.cta).href}
                label={getMarketingCta(content.final.cta).label}
                size="lg"
              />
              <a className="text-link" href="#untuk-sekolah">
                {content.final.schoolLink} →
              </a>
            </div>
          </div>
        </RevealText>
      </section>
    </>
  );
}
