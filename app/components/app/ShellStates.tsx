'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button, Panel } from '@/app/components/ui';

export function ShellLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]" aria-busy="true">
      <Panel className="min-h-48 animate-pulse" aria-hidden="true">
        <div className="space-y-3">
          <div className="h-5 w-32 rounded bg-brand-paper" />
          <div className="h-10 w-full rounded bg-brand-paper" />
          <div className="h-10 w-3/4 rounded bg-brand-paper" />
        </div>
      </Panel>
      <Panel className="min-h-48 animate-pulse" aria-hidden="true">
        <div className="space-y-3">
          <div className="h-5 w-24 rounded bg-brand-paper" />
          <div className="h-8 w-full rounded bg-brand-paper" />
          <div className="h-8 w-full rounded bg-brand-paper" />
        </div>
      </Panel>
    </div>
  );
}

export function ShellError({ requestId }: { requestId?: string }) {
  const t = useTranslations('commonUi');
  return (
    <Panel
      title={t('shellStates.errorTitle')}
      description={t('shellStates.errorDescription')}
      className="max-w-reading-max"
    >
      <div className="flex flex-col gap-3">
        <p className="text-body-default text-brand-ink-muted">
          {requestId
            ? t('shellStates.requestId', { id: requestId })
            : t('shellStates.requestIdMissing')}
        </p>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => window.location.reload()}>{t('actions.reload')}</Button>
          <Link
            href="/bantuan"
            className="inline-flex items-center text-body-default text-brand-accent underline underline-offset-4"
          >
            {t('actions.openHelp')}
          </Link>
        </div>
      </div>
    </Panel>
  );
}

export function ShellNotFound() {
  const t = useTranslations('commonUi');
  return (
    <Panel
      title={t('shellStates.notFoundTitle')}
      description={t('shellStates.notFoundDescription')}
      className="max-w-reading-max"
    >
      <div className="flex flex-wrap gap-3">
        <Link
          href="/app"
          className="inline-flex min-h-[var(--control-md)] items-center rounded-md bg-brand-accent px-4 text-body-default font-medium text-white"
        >
          {t('actions.backToDashboard')}
        </Link>
        <Link
          href="/app/riwayat"
          className="inline-flex min-h-[var(--control-md)] items-center rounded-md border border-brand-line px-4 text-body-default text-brand-ink"
        >
          {t('actions.openHistory')}
        </Link>
      </div>
    </Panel>
  );
}

export function ShellForbidden() {
  const t = useTranslations('commonUi');
  return (
    <Panel
      title={t('shellStates.forbiddenTitle')}
      description={t('shellStates.forbiddenDescription')}
      className="max-w-reading-max"
    >
      <div className="flex flex-wrap gap-3">
        <Link
          href="/app"
          className="inline-flex min-h-[var(--control-md)] items-center rounded-md bg-brand-accent px-4 text-body-default font-medium text-white"
        >
          {t('actions.backToDashboard')}
        </Link>
        <Link
          href="/bantuan"
          className="inline-flex min-h-[var(--control-md)] items-center rounded-md border border-brand-line px-4 text-body-default text-brand-ink"
        >
          {t('actions.contactHelp')}
        </Link>
      </div>
    </Panel>
  );
}

export function ShellPlaceholder({ title, description }: { title: string; description: string }) {
  const t = useTranslations('commonUi');
  return (
    <Panel title={title} description={description} className="max-w-reading-max">
      <div className="flex flex-col gap-3">
        <p className="text-body-default text-brand-ink-muted">{t('shellStates.placeholderBody')}</p>
        <Link
          href="/app"
          className="inline-flex min-h-[var(--control-md)] w-fit items-center rounded-md bg-brand-accent px-4 text-body-default font-medium text-white"
        >
          {t('actions.backToDashboard')}
        </Link>
      </div>
    </Panel>
  );
}
