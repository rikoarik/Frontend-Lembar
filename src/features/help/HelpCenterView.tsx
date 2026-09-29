'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button, Panel, TextField } from '@/app/components/ui';

const HELP_TOPIC_KEYS = ['generate', 'review', 'output', 'privacy'] as const;
const REPORT_REASON_KEYS = ['quality', 'answerKey', 'privacy', 'other'] as const;
/** Backend enum values — never translated, they are the wire contract. */
const REPORT_REASON_VALUES: Record<(typeof REPORT_REASON_KEYS)[number], string> = {
  quality: 'kualitas_soal',
  answerKey: 'kunci_salah',
  privacy: 'privasi',
  other: 'lainnya',
};

export function HelpCenterView() {
  const t = useTranslations('help');
  const [assessmentId, setAssessmentId] = useState('');
  const [questionId, setQuestionId] = useState('');
  const [reason, setReason] = useState(REPORT_REASON_VALUES.quality);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');

  const onSubmitReport = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setStatus('');
    try {
      const response = await fetch('/v1/quality-reports', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId: assessmentId || undefined,
          questionId: questionId || undefined,
          reason,
          note,
        }),
      });
      const json = (await response.json()) as {
        data?: { reportId: string };
        error?: { message?: string };
      };
      if (!response.ok) {
        setStatus(json.error?.message ?? t('report.status.failed'));
      } else {
        setStatus(t('report.status.sent', { reportId: json.data?.reportId ?? '' }));
        setNote('');
      }
    } catch {
      setStatus(t('report.status.offline'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-h1 font-semibold text-brand-ink">{t('title')}</h1>
        <p className="text-body-sm text-brand-ink-muted">{t('description')}</p>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {HELP_TOPIC_KEYS.map((topic) => (
          <Panel key={topic} title={t(`topics.${topic}.title`)}>
            <p className="text-body-default text-brand-ink-muted">{t(`topics.${topic}.body`)}</p>
          </Panel>
        ))}
      </div>

      <Panel title={t('report.title')} description={t('report.description')}>
        <form className="flex flex-col gap-3" onSubmit={onSubmitReport}>
          <TextField
            label={t('report.assessmentLabel')}
            value={assessmentId}
            onChange={(e) => setAssessmentId(e.target.value)}
            placeholder={t('report.assessmentPlaceholder')}
          />
          <TextField
            label={t('report.questionLabel')}
            value={questionId}
            onChange={(e) => setQuestionId(e.target.value)}
            placeholder={t('report.questionPlaceholder')}
          />
          <label className="flex flex-col gap-1">
            <span className="text-label-semibold">{t('report.reasonLabel')}</span>
            <select
              className="min-h-[var(--control-md)] rounded-md border border-brand-line px-3"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              {REPORT_REASON_KEYS.map((key) => (
                <option key={key} value={REPORT_REASON_VALUES[key]}>
                  {t(`report.reasons.${key}`)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-label-semibold">{t('report.noteLabel')}</span>
            <textarea
              className="min-h-24 rounded-md border border-brand-line px-3 py-2"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t('report.notePlaceholder')}
              required
            />
          </label>
          {status ? (
            <p className="text-body-sm text-brand-ink-muted" role="status">
              {status}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button type="submit" loading={busy} loadingLabel={t('report.submitBusy')}>
              {t('report.submit')}
            </Button>
            <Link
              href="/bantuan"
              className="inline-flex min-h-[var(--control-md)] items-center rounded-md border border-brand-line px-4"
            >
              {t('report.publicHelp')}
            </Link>
          </div>
        </form>
      </Panel>
    </div>
  );
}
