'use client';

import { useState, useEffect, useRef } from 'react';
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
          <div className="preview" id="contoh-hasil" aria-label="Contoh kerja Generate Lembar">
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
                <article key={question.no} className="question">
                  <span className="question__index">{question.no}</span>
                  <div className="question__body">
                    <span className="question__no">Soal {question.no.replace(/^0+/, '')}</span>
                    <span className="question__text">{question.text}</span>
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
                  <span
                    className={`badge ${
                      question.status === 'Siap' ? 'badge--success' : 'badge--warning'
                    }`}
                  >
                    {question.status}
                  </span>
                </article>
              ))}
            </div>

            <div className="preview__outputs" aria-label="Pilihan hasil akhir">
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
            </div>
          </div>
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
                  {panel.visual === 'generate' ? (
                    <div className="generate-panel">
                      <div className="generate-panel__row">
                        <span>Kelas</span>
                        <strong>V (SD)</strong>
                      </div>
                      <div className="generate-panel__row">
                        <span>Mata pelajaran</span>
                        <strong>Matematika</strong>
                      </div>
                      <div className="generate-panel__row">
                        <span>Materi</span>
                        <strong>Pecahan senilai</strong>
                      </div>
                      <div className="generate-panel__row">
                        <span>Jenis lembar</span>
                        <strong>Pilihan ganda · 20</strong>
                      </div>
                      <span className="generate-panel__button">Buat draft</span>
                    </div>
                  ) : null}
                  {panel.visual === 'review' ? (
                    <div className="review-panel">
                      <div className="review-panel__rail" />
                      <div>
                        <p className="review-panel__label">Soal 08 · Perlu ditinjau</p>
                        <p className="review-panel__question">
                          Pecahan yang senilai dengan 3/6 adalah …
                        </p>
                        <p className="review-panel__source">Rujukan · Buku Siswa hlm. 44–45</p>
                      </div>
                    </div>
                  ) : null}
                  {panel.visual === 'export' ? (
                    <div className="export-panel">
                      <span>
                        <DocumentDownload size={22} variant="Linear" />
                        PDF A4
                      </span>
                      <span>
                        <DocumentText size={22} variant="Linear" />
                        Cetak
                      </span>
                      <span>
                        <Link1 size={22} variant="Linear" />
                        Tautan
                      </span>
                    </div>
                  ) : null}
                </div>
              </RevealSection>
            </div>
          );
        })}
      </div>
      </section>

      <section className="trust" aria-labelledby="trust-heading">
        <div className="trust__inner">
          <RevealText className="trust__copy">
            <span className="trust__icon" aria-hidden="true">
              <ShieldTick size={28} variant="Linear" />
            </span>
            <p className="eyebrow eyebrow--dark">{content.trust.eyebrow}</p>
            <h2 id="trust-heading" className="trust__headline">
              {content.trust.title}
            </h2>
            <p className="trust__body">{content.trust.body}</p>
            <a className="trust__link" href="#dokumen">
              {content.trust.link} →
            </a>
          </RevealText>

          <RevealMedia className="trust__specimen" delay={0.06}>
            <div className="trust__specimen-head">
              <span>{content.trust.specimen.no}</span>
              <span className="status status--ready">{content.trust.specimen.status}</span>
            </div>
            <p className="trust__question">{content.trust.specimen.question}</p>
            <p className="trust__answer">{content.trust.specimen.answer}</p>
            <div className="trust__reason">
              <TickCircle size={18} variant="Linear" aria-hidden="true" />
              <div>
                <span className="trust__reason-title">Alasan</span>
                <span className="trust__reason-body">{content.trust.specimen.reason}</span>
              </div>
            </div>
            <div className="trust__reason">
              <Book1 size={18} variant="Linear" aria-hidden="true" />
              <div>
                <span className="trust__reason-title">Sumber</span>
                <span className="trust__reason-body">{content.trust.specimen.source}</span>
              </div>
            </div>
          </RevealMedia>
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
