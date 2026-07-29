'use client';

import { ShellError } from '@/app/components/app/ShellStates';

export default function AppError({ error }: { error: Error & { digest?: string } }) {
  return <ShellError requestId={error.digest} />;
}
