import { notFound } from 'next/navigation';
import { ShellPlaceholder } from '@/app/components/app/ShellStates';

const SHELL_PLACEHOLDER_ROUTES = new Map([
  ['riwayat', 'Riwayat'],
  ['bank-soal', 'Bank Soal'],
  ['template', 'Template'],
  ['generate', 'Generate lembar'],
  ['profil', 'Profil'],
  ['plan', 'Paket & kuota'],
]);

export default async function AppPlaceholderPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug = [] } = await params;
  const route = slug.join('/');
  const title = SHELL_PLACEHOLDER_ROUTES.get(route);

  if (!title) notFound();

  return (
    <ShellPlaceholder
      title={title}
      description="Halaman ini sudah masuk navigasi shell dan menunggu implementasi fitur berikutnya."
    />
  );
}
