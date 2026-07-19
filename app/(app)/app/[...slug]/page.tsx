import { notFound } from 'next/navigation';
import { ShellPlaceholder } from '@/app/components/app/ShellStates';
import { SHELL_PLACEHOLDER_ROUTES } from '@/app/(app)/app/[...slug]/routes';

export default async function AppPlaceholderPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug = [] } = await params;
  const route = slug.join('/');
  const title = SHELL_PLACEHOLDER_ROUTES[route as keyof typeof SHELL_PLACEHOLDER_ROUTES];

  if (!title) notFound();

  return (
    <ShellPlaceholder
      title={title}
      description="Halaman ini sudah masuk navigasi shell dan menunggu implementasi fitur berikutnya."
    />
  );
}
