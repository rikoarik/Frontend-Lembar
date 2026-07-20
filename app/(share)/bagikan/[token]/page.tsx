import type { Metadata } from 'next';
import { use } from 'react';
import ShareViewer from './ShareViewer';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  return <ShareViewer token={token} />;
}
