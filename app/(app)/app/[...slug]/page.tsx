import { notFound, redirect } from 'next/navigation';
import { SHELL_REDIRECT_ROUTES } from '@/app/(app)/app/[...slug]/routes';

export default async function AppLegacyRoutePage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug = [] } = await params;
  const route = slug.join('/');
  const target = SHELL_REDIRECT_ROUTES[route as keyof typeof SHELL_REDIRECT_ROUTES];

  if (!target) notFound();
  redirect(target);
}
