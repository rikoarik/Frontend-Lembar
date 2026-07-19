'use client';

import { ShellError } from '@/app/components/app/ShellStates';

export default function AppError() {
  return <ShellError requestId="demo-shell-request" />;
}
