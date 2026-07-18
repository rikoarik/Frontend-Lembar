import { Book1, People, ReceiptItem, ShieldTick } from 'iconsax-react';
import Button from '../../components/marketing/Button';
import { RevealSection, RevealText, RevealMedia } from '../../components/marketing/Reveal';
import { schoolContent } from '@/src/lib/marketing/school';
import { getMarketingCta } from '@/src/lib/marketing/ctas';

const featureIcon = {
  people: People,
  bank: Book1,
  template: ReceiptItem,
  audit: ShieldTick,
} as const;

export default function SchoolPage() {
  const content = schoolContent;
  const heroCta = getMarketingCta(content.hero.cta);
  const finalCta = getMarketingCta(content.final.cta);

  return (
    <>
      <RevealSection className="school-hero">
        <div className="school-hero__copy">
          <RevealText>
            <h1 className="school-hero__title">{content.hero.title}</h1>
          </RevealText>
          <RevealText delay={0.05}>
            <p className="school-hero__body">{content.hero.body}</p>
          </RevealText>
          <RevealText delay={0.1}>
            <div className="school-hero__cta">
              <Button ctaId={heroCta.id} href={heroCta.href} label={heroCta.label} />
            </div>
          </RevealText>
        </div>

        <RevealMedia className="school-hero__visual" delay={0.08}>
          <div className="dashboard">
            <div className="dashboard__head">
              <div className="dashboard__brand">
                <span className="dashboard__brand-mark" aria-hidden="true">
                  L
                </span>
                <div>
                  <span className="dashboard__eyebrow">{content.dashboard.eyebrow}</span>
                  <span className="dashboard__school">{content.dashboard.school}</span>
                </div>
              </div>
              <span className="dashboard__active">{content.dashboard.active}</span>
            </div>
            <div className="dashboard__metrics">
              <div className="metric">
                <span className="metric__label">{content.dashboard.quotaLabel}</span>
                <div className="metric__bar">
                  <div className="metric__bar-fill" />
                </div>
                <span className="metric__value">{content.dashboard.quota}</span>
              </div>
              <div className="metric">
                <span className="metric__label">{content.dashboard.bankLabel}</span>
                <span className="metric__big">
                  <strong>1,248</strong>
                  <span>{content.dashboard.bank.replace(/^1,248\s/, '')}</span>
                </span>
              </div>
            </div>
            <div className="dashboard__activity">
              <span className="metric__label">{content.dashboard.activityLabel}</span>
              <ul>
                {content.dashboard.activities.map((activity) => (
                  <li key={activity}>
                    <span>{activity.split(' · ')[0]}</span>
                    <span className="dashboard__activity-time">{activity.split(' · ')[1]}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </RevealMedia>
      </RevealSection>

      <RevealSection className="school-features" aria-labelledby="school-features-heading">
        <RevealText>
          <div className="section-heading section-heading--center">
            <p className="eyebrow">{content.features.eyebrow}</p>
            <h2 id="school-features-heading" className="section-heading__title">
              {content.features.title}
            </h2>
          </div>
        </RevealText>
        <div className="school-features__grid">
          {content.features.items.map((feature, index) => {
            const Icon = featureIcon[feature.icon];
            return (
              <RevealSection key={feature.title} className="school-feature" delay={index * 0.04}>
                <span className="school-feature__icon" aria-hidden="true">
                  <Icon size={20} variant="Linear" />
                </span>
                <h3 className="school-feature__title">{feature.title}</h3>
                <p className="school-feature__body">{feature.body}</p>
              </RevealSection>
            );
          })}
        </div>
      </RevealSection>

      <section className="school-insight" aria-labelledby="school-insight-heading">
        <div className="school-insight__grid">
          <RevealMedia className="school-insight__panel">
            <span className="eyebrow">{content.insight.eyebrow}</span>
            <h3 id="school-insight-heading" className="school-insight__title">
              {content.insight.title}
            </h3>
            <div className="school-insight__bars">
              {content.insight.subjects.map((subject, index) => (
                <div
                  key={subject}
                  className="school-insight__bar"
                  data-variant={index % 3}
                  style={{ '--bar-height': `${60 + ((index * 18) % 40)}%` } as React.CSSProperties}
                >
                  <span>{subject}</span>
                </div>
              ))}
            </div>
          </RevealMedia>

          <RevealText className="school-insight__security" delay={0.05}>
            <h3 className="school-insight__security-title">{content.insight.securityTitle}</h3>
            <p className="school-insight__security-body">{content.insight.securityBody}</p>
            <div className="school-insight__security-meta">
              <ShieldTick size={16} variant="Linear" aria-hidden="true" />
              <span>{content.insight.securityMeta}</span>
            </div>
          </RevealText>
        </div>
      </section>

      <RevealSection className="school-pilot" aria-labelledby="school-pilot-heading">
        <RevealText>
          <div className="section-heading section-heading--center">
            <h2 id="school-pilot-heading" className="section-heading__title">
              {content.pilot.title}
            </h2>
          </div>
        </RevealText>
        <ol className="school-pilot__steps">
          {content.pilot.steps.map((step, index) => (
            <li key={step.no} className="school-pilot__step">
              <RevealSection delay={index * 0.05}>
                <span className="school-pilot__no">{step.no}</span>
                <div>
                  <h3 className="school-pilot__step-title">{step.title}</h3>
                  <p className="school-pilot__step-body">{step.body}</p>
                </div>
              </RevealSection>
            </li>
          ))}
        </ol>
      </RevealSection>

      <RevealSection className="school-final" aria-labelledby="school-final-heading">
        <div className="school-final__inner">
          <div>
            <h2 id="school-final-heading" className="school-final__title">
              {content.final.title}
            </h2>
            <p className="school-final__body">{content.final.body}</p>
          </div>
          <Button ctaId={finalCta.id} href={finalCta.href} label={finalCta.label} />
        </div>
      </RevealSection>
    </>
  );
}
