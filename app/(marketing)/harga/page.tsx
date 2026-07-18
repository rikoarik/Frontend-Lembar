import { ArrowRight, TickCircle } from 'iconsax-react';
import Button from '../../components/marketing/Button';
import { RevealSection, RevealText } from '../../components/marketing/Reveal';
import { pricingContent, type PricingPlan } from '@/src/lib/marketing/pricing';
import { getMarketingCta } from '@/src/lib/marketing/ctas';

function PlanCard({ plan }: { plan: PricingPlan }) {
  const cta = getMarketingCta(plan.cta);
  return (
    <RevealSection
      className={`plan ${plan.popular ? 'plan--popular' : ''}`.trim()}
      delay={plan.popular ? 0.05 : 0}
    >
      {plan.popular ? <span className="plan__ribbon">{plan.popular}</span> : null}
      <h3 className="plan__name">{plan.name}</h3>
      <p className="plan__description">{plan.description}</p>
      <div className="plan__price">
        <span
          className={`plan__price-value ${plan.popular ? 'plan__price-value--accent' : ''}`.trim()}
        >
          {plan.price}
        </span>
        <span className="plan__price-cadence">{plan.cadence}</span>
      </div>
      <ul className="plan__features">
        {plan.features.map((feature) => (
          <li key={feature}>
            <TickCircle size={20} variant="Linear" aria-hidden="true" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Button
        ctaId={cta.id}
        href={cta.href}
        label={cta.label}
        variant={plan.popular ? 'primary' : 'secondary'}
        className="plan__cta"
      />
    </RevealSection>
  );
}

export default function PricingPage() {
  const content = pricingContent;
  const finalPrimary = getMarketingCta(content.final.primaryCta);
  const finalSecondary = getMarketingCta(content.final.secondaryCta);

  return (
    <>
      <RevealSection className="pricing-hero">
        <span className="pricing-hero__badge">{content.hero.badge}</span>
        <h1 className="pricing-hero__title">{content.hero.title}</h1>
        <p className="pricing-hero__body">{content.hero.body}</p>
      </RevealSection>

      <section className="pricing-grid" aria-label="Paket harga">
        <div className="pricing-grid__inner">
          {content.plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
        <RevealText className="pricing-grid__transparency">
          <div className="transparency">
            <span className="transparency__title">{content.transparency.title}</span>
            <p className="transparency__body">{content.transparency.body}</p>
          </div>
        </RevealText>
      </section>

      <section className="pricing-faq" aria-labelledby="pricing-faq-heading">
        <div className="pricing-faq__grid">
          <RevealText className="pricing-faq__intro">
            <h2 id="pricing-faq-heading" className="pricing-faq__title">
              {content.faq.title}
            </h2>
            <p className="pricing-faq__body">{content.faq.body}</p>
            <a className="pricing-faq__link" href="#bantuan">
              {content.faq.link}
              <ArrowRight size={16} variant="Linear" aria-hidden="true" />
            </a>
          </RevealText>
          <div className="pricing-faq__list">
            {content.faq.items.map((item, index) => (
              <RevealSection key={item.question} className="pricing-faq__item" delay={index * 0.05}>
                <h3 className="pricing-faq__question">{item.question}</h3>
                <p className="pricing-faq__answer">{item.answer}</p>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      <RevealSection className="pricing-final" aria-labelledby="pricing-final-heading">
        <div className="pricing-final__inner">
          <h2 id="pricing-final-heading" className="pricing-final__title">
            {content.final.title}
          </h2>
          <div className="pricing-final__actions">
            <Button ctaId={finalPrimary.id} href={finalPrimary.href} label={finalPrimary.label} />
            <Button
              ctaId={finalSecondary.id}
              href={finalSecondary.href}
              label={finalSecondary.label}
              variant="secondary"
            />
          </div>
        </div>
      </RevealSection>
    </>
  );
}
